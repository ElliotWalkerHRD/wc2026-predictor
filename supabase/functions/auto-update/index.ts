// ============================================================
//  WC2026 — Supabase Edge Function: auto-update
//
//  Called every 10 minutes by pg_cron via pg_net.
//  1. Check kill-switch (settings.auto_update_enabled)
//  2. Fetch latest results from football-data.org
//  3. Recalculate all player scores (4-4 default for no-prediction)
//  4. Log run to automation_logs
//
//  Auth: requires Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
//  (pg_cron supplies this; admins can also call manually for testing)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---- Scoring constants (mirror scoring.js) ----
const EXACT_PTS:  Record<string, number> = { round3:7, round4:7, round5:7, round6:7, round7:7, round8:10 };
const RESULT_PTS: Record<string, number> = { round3:5, round4:5, round5:5, round6:5, round7:5, round8:7  };

// ---- Elo constants (mirror elo-update/index.ts) ----
const WC_K     = 60;
const ELO_BASE = 1500;

function eloGdMult(gd: number): number {
  if (gd <= 1) return 1.00;
  if (gd === 2) return 1.50;
  return Math.min(2.00, 1.75 + (gd - 3) * 0.10);
}

// ---- Group fixture map (mirrors fetch-results/data.js) ----
const GROUP_FIXTURES: [number, string, string, string][] = [
  [1,"A","MEX","RSA"],[2,"A","KOR","CZE"],[3,"B","CAN","BIH"],[4,"D","USA","PAR"],
  [5,"C","HAI","SCO"],[6,"D","AUS","TUR"],[7,"C","BRA","MAR"],[8,"B","QAT","SUI"],
  [9,"E","CIV","ECU"],[10,"E","GER","CUW"],[11,"F","NED","JPN"],[12,"F","SWE","TUN"],
  [13,"H","KSA","URU"],[14,"H","ESP","CPV"],[15,"G","IRN","NZL"],[16,"G","BEL","EGY"],
  [17,"I","FRA","SEN"],[18,"I","IRQ","NOR"],[19,"J","ARG","ALG"],[20,"J","AUT","JOR"],
  [21,"L","GHA","PAN"],[22,"L","ENG","CRO"],[23,"K","POR","COD"],[24,"K","UZB","COL"],
  [25,"A","CZE","RSA"],[26,"B","SUI","BIH"],[27,"B","CAN","QAT"],[28,"A","MEX","KOR"],
  [29,"C","BRA","HAI"],[30,"C","SCO","MAR"],[31,"D","TUR","PAR"],[32,"D","USA","AUS"],
  [33,"E","GER","CIV"],[34,"E","ECU","CUW"],[35,"F","NED","SWE"],[36,"F","TUN","JPN"],
  [37,"H","URU","CPV"],[38,"H","ESP","KSA"],[39,"G","BEL","IRN"],[40,"G","NZL","EGY"],
  [41,"I","NOR","SEN"],[42,"I","FRA","IRQ"],[43,"J","ARG","AUT"],[44,"J","JOR","ALG"],
  [45,"L","ENG","GHA"],[46,"L","PAN","CRO"],[47,"K","POR","UZB"],[48,"K","COL","COD"],
  [49,"C","SCO","BRA"],[50,"C","MAR","HAI"],[51,"B","SUI","CAN"],[52,"B","BIH","QAT"],
  [53,"A","CZE","MEX"],[54,"A","RSA","KOR"],[55,"E","CUW","CIV"],[56,"E","ECU","GER"],
  [57,"F","JPN","SWE"],[58,"F","TUN","NED"],[59,"D","TUR","USA"],[60,"D","PAR","AUS"],
  [61,"I","NOR","FRA"],[62,"I","SEN","IRQ"],[63,"G","EGY","IRN"],[64,"G","NZL","BEL"],
  [65,"H","CPV","KSA"],[66,"H","URU","ESP"],[67,"L","PAN","ENG"],[68,"L","CRO","GHA"],
  [69,"J","ALG","AUT"],[70,"J","JOR","ARG"],[71,"K","COL","POR"],[72,"K","COD","UZB"],
];

const KNOCKOUT_IDS: Record<string, number[]> = {
  ROUND_OF_32:    [73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88],
  ROUND_OF_16:    [89,90,91,92,93,94,95,96],
  QUARTER_FINALS: [97,98,99,100],
  SEMI_FINALS:    [101,102],
  THIRD_PLACE:    [103],
  FINAL:          [104],
};

// match_id → [homeCode, awayCode] for Elo updates (derived from GROUP_FIXTURES)
const ELO_MATCH_TEAMS = new Map<number, [string, string]>(
  GROUP_FIXTURES.map(([id, , h, a]) => [id, [h, a]])
);

// Hardcoded match→round map so uncontested matches still get 4-4 default
const MATCH_ROUND_MAP: Record<number, string> = {};
for (const [id] of GROUP_FIXTURES) MATCH_ROUND_MAP[id] = "round3";
for (const id of KNOCKOUT_IDS.ROUND_OF_32)    MATCH_ROUND_MAP[id] = "round4";
for (const id of KNOCKOUT_IDS.ROUND_OF_16)    MATCH_ROUND_MAP[id] = "round5";
for (const id of KNOCKOUT_IDS.QUARTER_FINALS) MATCH_ROUND_MAP[id] = "round6";
for (const id of KNOCKOUT_IDS.SEMI_FINALS)    MATCH_ROUND_MAP[id] = "round7";
MATCH_ROUND_MAP[103] = "round8";
MATCH_ROUND_MAP[104] = "round8";

const TLA_ALIAS: Record<string, string> = { CUR: "CUW", URY: "URU" };
const norm = (tla: string | null | undefined): string | null => {
  if (!tla) return null;
  const u = tla.toUpperCase();
  return TLA_ALIAS[u] ?? u;
};

// ---- Write a log row ----
async function writeLog(sb: any, entry: {
  status: string;
  results_updated?: number;
  players_rescored?: number;
  default_fills?: number;
  error_message?: string;
  duration_ms?: number;
  triggered_by?: string;
}) {
  try {
    await sb.from("automation_logs").insert({
      status:          entry.status,
      results_updated: entry.results_updated ?? 0,
      players_rescored:entry.players_rescored ?? 0,
      default_fills:   entry.default_fills ?? 0,
      error_message:   entry.error_message ?? null,
      duration_ms:     entry.duration_ms ?? 0,
      triggered_by:    entry.triggered_by ?? "cron",
    });
  } catch (e) {
    console.error("[auto-update] failed to write log:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startMs = Date.now();

  // ---- Auth: require service_role JWT (gateway validates signature; we check the role claim) ----
  let isServiceRole = false;
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/, "");
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    isServiceRole = payload.role === "service_role";
  } catch { /* malformed JWT */ }
  if (!isServiceRole) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // ---- Kill-switch check ----
  try {
    const { data: setting } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "auto_update_enabled")
      .single();

    if (setting?.value === "false") {
      await writeLog(supabaseAdmin, { status: "skipped_disabled", duration_ms: Date.now() - startMs });
      return new Response(
        JSON.stringify({ skipped: true, reason: "auto_update_enabled is false" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e: any) {
    console.error("[auto-update] kill-switch check failed:", e.message);
    // Fail open — if we can't read the setting, proceed
  }

  // ---- Step 1: Fetch results from football-data.org ----
  let resultsUpdated = 0;
  let fetchError: string | null = null;

  try {
    const apiKey = Deno.env.get("FOOTBALL_API_KEY");
    if (!apiKey) throw new Error("FOOTBALL_API_KEY secret not set");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    let apiRes: Response;
    try {
      apiRes = await fetch(
        "https://api.football-data.org/v4/competitions/2000/matches",
        { headers: { "X-Auth-Token": apiKey }, signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }
    if (!apiRes.ok) {
      const text = await apiRes.text();
      throw new Error(`football-data.org ${apiRes.status}: ${text.slice(0, 200)}`);
    }

    const body = await apiRes.json();
    const apiMatches: any[] = body.matches ?? [];

    const groupLookup = new Map<string, number>();
    for (const [id, group, home, away] of GROUP_FIXTURES) {
      groupLookup.set(`${group}:${home}:${away}`, id);
      groupLookup.set(`${group}:${away}:${home}`, id);
    }

    const apiByStage = new Map<string, any[]>();
    for (const m of apiMatches) {
      if (!apiByStage.has(m.stage)) apiByStage.set(m.stage, []);
      apiByStage.get(m.stage)!.push(m);
    }
    for (const arr of apiByStage.values()) arr.sort((a, b) => a.id - b.id);

    const upserts: any[] = [];
    for (const match of apiMatches) {
      if (match.score?.fullTime?.home == null) continue;
      const stage: string = match.stage;
      let ourId: number | null = null;

      if (stage === "GROUP_STAGE") {
        const g = (match.group ?? "").replace("GROUP_", "");
        const h = norm(match.homeTeam?.tla);
        const a = norm(match.awayTeam?.tla);
        if (g && h && a) ourId = groupLookup.get(`${g}:${h}:${a}`) ?? null;
      } else if (KNOCKOUT_IDS[stage]) {
        const bucket = apiByStage.get(stage) ?? [];
        const pos    = bucket.findIndex((m: any) => m.id === match.id);
        const ourIds = KNOCKOUT_IDS[stage];
        if (pos >= 0 && pos < ourIds.length) ourId = ourIds[pos];
      }
      if (ourId == null) continue;

      upserts.push({
        match_id:   ourId,
        home_score: match.score.fullTime.home,
        away_score: match.score.fullTime.away,
        status:     match.status,
        updated_at: new Date().toISOString(),
      });
    }

    if (upserts.length > 0) {
      const { error } = await supabaseAdmin
        .from("match_results")
        .upsert(upserts, { onConflict: "match_id" });
      if (error) throw error;
    }
    resultsUpdated = upserts.length;
    console.log(`[auto-update] fetch: ${resultsUpdated} results upserted`);
  } catch (e: any) {
    fetchError = e.message;
    console.error("[auto-update] fetch error:", fetchError);
    await writeLog(supabaseAdmin, {
      status: "error",
      error_message: `fetch-results: ${fetchError}`,
      duration_ms: Date.now() - startMs,
    });
    return new Response(JSON.stringify({ error: fetchError }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---- Step 2: Recalculate scores ----
  let playersRescored = 0;
  let defaultFills = 0;

  try {
    const PAGE_SIZE = 1000;

    const { data: matchResults } = await supabaseAdmin
      .from("match_results").select("*").limit(200);
    const resultMap: Record<number, any> = {};
    (matchResults || []).forEach((r: any) => { resultMap[r.match_id] = r; });

    const allPredictions: any[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data: page, error: pageErr } = await supabaseAdmin
        .from("predictions").select("*").range(from, from + PAGE_SIZE - 1);
      if (pageErr) throw pageErr;
      if (!page || page.length === 0) break;
      allPredictions.push(...page);
      if (page.length < PAGE_SIZE) break;
    }

    const userPreds: Record<string, Record<string, Record<number, any>>> = {};
    const userR2Preds: Record<string, Record<string, string>> = {};
    for (const p of allPredictions) {
      if (p.question_key.startsWith("2.")) {
        let val: string | null = null;
        try { val = JSON.parse(p.value); } catch { val = p.value; }
        if (!val) continue;
        const subKey = p.question_key.slice(2); // "w.A", "r.A", etc.
        if (!userR2Preds[p.user_id]) userR2Preds[p.user_id] = {};
        userR2Preds[p.user_id][subKey] = val;
        continue;
      }
      if (!p.question_key.startsWith("m")) continue;
      const matchId = parseInt(p.question_key.slice(1));
      if (isNaN(matchId)) continue;
      if (!userPreds[p.user_id]) userPreds[p.user_id] = {};
      if (!userPreds[p.user_id][p.round]) userPreds[p.user_id][p.round] = {};
      userPreds[p.user_id][p.round][matchId] = p;
    }

    const allProfiles: any[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data: page, error: pageErr } = await supabaseAdmin
        .from("profiles").select("id").range(from, from + PAGE_SIZE - 1);
      if (pageErr) throw pageErr;
      if (!page || page.length === 0) break;
      allProfiles.push(...page);
      if (page.length < PAGE_SIZE) break;
    }

    const allUserIds = new Set<string>([
      ...Object.keys(userPreds),
      ...allProfiles.map((p: any) => p.id),
    ]);

    // Pre-index matches-with-results by round (uses hardcoded map — no blind spots)
    const matchesByRound: Record<string, number[]> = {};
    for (const [matchIdStr, result] of Object.entries(resultMap)) {
      const matchId = parseInt(matchIdStr);
      const round = MATCH_ROUND_MAP[matchId];
      if (!round) continue;
      if (result.home_score === null || result.away_score === null) continue;
      if (result.status !== 'FINISHED') continue; // only score completed matches
      if (!matchesByRound[round]) matchesByRound[round] = [];
      matchesByRound[round].push(matchId);
    }

    // Derive Round 2 group standings from finished matches
    const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
    const groupStandings: Record<string, { winner: string; runnerUp: string } | null> = {};
    for (const group of GROUPS) {
      const gFixtures = GROUP_FIXTURES.filter(([,g]) => g === group);
      const allFinished = gFixtures.every(([id]) => resultMap[id]?.status === 'FINISHED');
      if (!allFinished) { groupStandings[group] = null; continue; }
      const teams: Record<string, { pts: number; gd: number; gf: number }> = {};
      for (const [id, , home, away] of gFixtures) {
        const r = resultMap[id];
        if (!teams[home]) teams[home] = { pts: 0, gd: 0, gf: 0 };
        if (!teams[away]) teams[away] = { pts: 0, gd: 0, gf: 0 };
        const hg = r.home_score, ag = r.away_score;
        teams[home].gf += hg; teams[home].gd += (hg - ag);
        teams[away].gf += ag; teams[away].gd += (ag - hg);
        if (hg > ag) { teams[home].pts += 3; }
        else if (hg === ag) { teams[home].pts += 1; teams[away].pts += 1; }
        else { teams[away].pts += 3; }
      }
      const sorted = Object.entries(teams).sort(([,a], [,b]) =>
        b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
      );
      groupStandings[group] = { winner: sorted[0][0], runnerUp: sorted[1][0] };
    }
    const allGroupsComplete = GROUPS.every(g => groupStandings[g] !== null);

    // Fetch all existing scores in one query (avoids N+1 per user)
    const { data: existingScores } = await supabaseAdmin
      .from("scores").select("user_id, round1_points");
    const existingScoreMap: Record<string, any> = {};
    (existingScores || []).forEach((s: any) => { existingScoreMap[s.user_id] = s; });

    const scoreUpdates: any[] = [];
    for (const userId of allUserIds) {
      const roundPreds = userPreds[userId] || {};
      const scores: Record<string, number> = {
        round1: 0, round2: 0, round3: 0, round4: 0,
        round5: 0, round6: 0, round7: 0, round8: 0,
      };

      for (const round of ["round3","round4","round5","round6","round7","round8"]) {
        const exactP  = EXACT_PTS[round];
        const resultP = RESULT_PTS[round];
        const submittedPreds = roundPreds[round] || {};
        let pts = 0;

        for (const matchId of (matchesByRound[round] || [])) {
          const result = resultMap[matchId];
          const actH = result.home_score, actA = result.away_score;
          let predH: number, predA: number;

          if (submittedPreds[matchId]) {
            let val: any;
            try { val = JSON.parse(submittedPreds[matchId].value); } catch { continue; }
            predH = parseInt(val.home);
            predA = parseInt(val.away);
            if (isNaN(predH) || isNaN(predA)) continue;
          } else {
            predH = 4; predA = 4;
            defaultFills++;
          }

          if (predH === actH && predA === actA) {
            pts += exactP;
          } else if (Math.sign(predH - predA) === Math.sign(actH - actA)) {
            pts += resultP;
          }
        }
        scores[round] = pts;
      }

      const existing = existingScoreMap[userId];
      scores.round1 = existing?.round1_points || 0;

      // Round 2: Group Winners & Runners-Up
      {
        const r2 = userR2Preds[userId] || {};
        let pts = 0, correctWinners = 0, correctQualifiers = 0;
        for (const group of GROUPS) {
          const standing = groupStandings[group];
          if (!standing) continue;
          const { winner, runnerUp } = standing;
          const predW = r2[`w.${group}`] ?? null;
          const predR = r2[`r.${group}`] ?? null;
          if (predW) {
            if (predW === winner) { pts += 10; correctWinners++; correctQualifiers++; }
            else if (predW === runnerUp) { pts += 5; correctQualifiers++; }
          }
          if (predR) {
            if (predR === runnerUp) { pts += 10; correctQualifiers++; }
            else if (predR === winner) { pts += 5; correctQualifiers++; }
          }
        }
        if (allGroupsComplete) {
          if (correctWinners === 12) pts += 10;
          else if (correctWinners >= 10) pts += 5;
          if (correctQualifiers >= 24) pts += 10;
          else if (correctQualifiers >= 20) pts += 5;
        }
        scores.round2 = pts;
      }

      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      scoreUpdates.push({
        user_id:        userId,
        round1_points:  scores.round1,
        round2_points:  scores.round2,
        round3_points:  scores.round3,
        round4_points:  scores.round4,
        round5_points:  scores.round5,
        round6_points:  scores.round6,
        round7_points:  scores.round7,
        round8_points:  scores.round8,
        total_points:   total,
        updated_at:     new Date().toISOString(),
      });
    }

    if (scoreUpdates.length > 0) {
      const { error } = await supabaseAdmin
        .from("scores")
        .upsert(scoreUpdates, { onConflict: "user_id" });
      if (error) throw error;
    }
    playersRescored = scoreUpdates.length;
    console.log(`[auto-update] scores: ${playersRescored} users, ${defaultFills} 4-4 defaults`);
  } catch (e: any) {
    const scoreError = e.message;
    console.error("[auto-update] score error:", scoreError);
    await writeLog(supabaseAdmin, {
      status: "error",
      results_updated: resultsUpdated,
      error_message: `recalculate-scores: ${scoreError}`,
      duration_ms: Date.now() - startMs,
    });
    return new Response(JSON.stringify({ error: scoreError }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---- Step 3: Update Elo ratings ----
  // Non-fatal: errors are logged but never surface to the caller.
  // Idempotency: elo_processed_matches tracks which match_ids have been applied,
  // so running every 2 minutes never double-counts a match.
  let eloMatchesApplied = 0;
  try {
    // Load current ratings
    const { data: eloRows, error: eloLoadErr } = await supabaseAdmin
      .from("team_elo").select("team_code, rating, games_used");
    if (eloLoadErr) throw eloLoadErr;

    const eloRatings: Record<string, { rating: number; games: number }> = {};
    for (const row of (eloRows ?? [])) {
      eloRatings[row.team_code] = { rating: Number(row.rating), games: row.games_used };
    }

    // Idempotency: skip any match_id already recorded in elo_processed_matches
    const { data: processed } = await supabaseAdmin
      .from("elo_processed_matches").select("match_id");
    const processedIds = new Set<number>((processed ?? []).map((r: any) => r.match_id));

    // Find group stage matches that are FINISHED and not yet applied
    const groupIds = GROUP_FIXTURES.map(([id]) => id);
    const { data: finishedMatches, error: matchErr } = await supabaseAdmin
      .from("match_results")
      .select("match_id, home_score, away_score, status")
      .in("match_id", groupIds)
      .eq("status", "FINISHED");
    if (matchErr) throw matchErr;

    const newMatches = (finishedMatches ?? []).filter((r: any) => !processedIds.has(r.match_id));

    const eloUpserts:        any[] = [];
    const processedInserts:  any[] = [];

    for (const match of newMatches) {
      const teams = ELO_MATCH_TEAMS.get(match.match_id);
      if (!teams) continue;

      const [hCode, aCode] = teams;
      const rH = eloRatings[hCode] ?? { rating: ELO_BASE, games: 0 };
      const rA = eloRatings[aCode] ?? { rating: ELO_BASE, games: 0 };

      // Neutral venue — no home advantage at WC2026 (US/CAN/MEX)
      const dr    = rH.rating - rA.rating;
      const eH    = 1 / (1 + Math.pow(10, -dr / 400));
      const hg    = match.home_score as number;
      const ag    = match.away_score as number;
      const W     = hg > ag ? 1 : hg === ag ? 0.5 : 0;
      const delta = WC_K * eloGdMult(Math.abs(hg - ag)) * (W - eH);

      eloRatings[hCode] = { rating: rH.rating + delta, games: rH.games + 1 };
      eloRatings[aCode] = { rating: rA.rating - delta, games: rA.games + 1 };

      processedInserts.push({
        match_id:   match.match_id,
        home_team:  hCode,
        away_team:  aCode,
        home_score: hg,
        away_score: ag,
        home_delta: Math.round(delta * 100) / 100,
        away_delta: Math.round(-delta * 100) / 100,
      });
    }

    if (processedInserts.length > 0) {
      const changedCodes = new Set<string>(
        processedInserts.flatMap((p: any) => [p.home_team, p.away_team])
      );
      const now = new Date().toISOString();
      for (const code of changedCodes) {
        const r = eloRatings[code];
        eloUpserts.push({
          team_code:    code,
          rating:       Math.round(r.rating * 100) / 100,
          games_used:   r.games,
          last_updated: now,
        });
      }

      const { error: eloUpErr } = await supabaseAdmin
        .from("team_elo").upsert(eloUpserts, { onConflict: "team_code" });
      if (eloUpErr) throw eloUpErr;

      const { error: eloInsErr } = await supabaseAdmin
        .from("elo_processed_matches").insert(processedInserts);
      if (eloInsErr) throw eloInsErr;

      eloMatchesApplied = processedInserts.length;
    }

    console.log(`[auto-update] elo: ${eloMatchesApplied} new matches applied`);
  } catch (e: any) {
    // Non-fatal — results and scores are already written; Elo will catch up next run
    console.error("[auto-update] elo update error (non-fatal):", e.message);
  }

  // ---- Log success ----
  const durationMs = Date.now() - startMs;
  await writeLog(supabaseAdmin, {
    status: "success",
    results_updated: resultsUpdated,
    players_rescored: playersRescored,
    default_fills: defaultFills,
    duration_ms: durationMs,
  });

  return new Response(
    JSON.stringify({
      success: true,
      results_updated: resultsUpdated,
      players_rescored: playersRescored,
      default_fills: defaultFills,
      elo_matches_applied: eloMatchesApplied,
      duration_ms: durationMs,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
