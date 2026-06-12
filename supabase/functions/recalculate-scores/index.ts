// ============================================================
//  WC2026 — Supabase Edge Function: recalculate-scores
//  Deploy: supabase functions deploy recalculate-scores
//
//  This function runs with the service_role key so it can
//  bypass RLS and write to the scores table.
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Scoring constants (mirror of client-side scoring.js)
const EXACT_PTS   = { round3: 7, round4: 7, round5: 7, round6: 7, round7: 7, round8: 10 };
const RESULT_PTS  = { round3: 5, round4: 5, round5: 5, round6: 5, round7: 5, round8: 7  };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Check auth — must be called by an authenticated admin
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // Create admin client with service_role key
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // Verify the requesting user is an admin
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles").select("is_admin").eq("id", user.id).single();

  if (!profile?.is_admin) {
    return new Response(JSON.stringify({ error: "Admin only" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // Get optional userId filter from body
  let targetUserId: string | null = null;
  try {
    const body = await req.json();
    targetUserId = body?.userId || null;
  } catch (_) {}

  try {
    // 1. Fetch all match results (max 104 matches; explicit limit guards PostgREST default cap)
    const { data: matchResults } = await supabaseAdmin
      .from("match_results").select("*").limit(200);

    const resultMap: Record<number, any> = {};
    (matchResults || []).forEach((r: any) => { resultMap[r.match_id] = r; });

    console.log(`[recalculate-scores] match_results fetched: ${matchResults?.length ?? 0}`);

    // 2. Fetch all predictions via pagination — PostgREST max-rows caps any single
    //    request at 1000 rows regardless of .limit(); paginate to get everything.
    const PAGE_SIZE = 1000;
    const allPredictions: any[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      let q = supabaseAdmin
        .from("predictions")
        .select("*")
        .range(from, from + PAGE_SIZE - 1);
      if (targetUserId) q = q.eq("user_id", targetUserId);
      const { data: page, error: pageErr } = await q;
      if (pageErr) throw pageErr;
      if (!page || page.length === 0) break;
      allPredictions.push(...page);
      if (page.length < PAGE_SIZE) break;
    }

    console.log(`[recalculate-scores] predictions fetched: ${allPredictions.length}${targetUserId ? ` (filtered to user ${targetUserId})` : ""}`);

    // 3. Group predictions by user indexed by matchId, and build match→round map from existing data
    const userPreds: Record<string, Record<string, Record<number, any>>> = {};
    const matchRoundMap: Record<number, string> = {};
    (allPredictions || []).forEach((p: any) => {
      if (!p.question_key.startsWith("m")) return;
      const matchId = parseInt(p.question_key.slice(1));
      if (isNaN(matchId)) return;
      if (!matchRoundMap[matchId]) matchRoundMap[matchId] = p.round;
      if (!userPreds[p.user_id]) userPreds[p.user_id] = {};
      if (!userPreds[p.user_id][p.round]) userPreds[p.user_id][p.round] = {};
      userPreds[p.user_id][p.round][matchId] = p;
    });

    // Fetch all profiles so zero-prediction players still get a scores row
    const allProfiles: any[] = [];
    if (!targetUserId) {
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data: page, error: pageErr } = await supabaseAdmin
          .from("profiles").select("id").range(from, from + PAGE_SIZE - 1);
        if (pageErr) throw pageErr;
        if (!page || page.length === 0) break;
        allProfiles.push(...page);
        if (page.length < PAGE_SIZE) break;
      }
    } else {
      allProfiles.push({ id: targetUserId });
    }

    const allUserIds = new Set<string>([
      ...Object.keys(userPreds),
      ...allProfiles.map((p: any) => p.id),
    ]);

    console.log(`[recalculate-scores] users to score: ${allUserIds.size} (${Object.keys(userPreds).length} with predictions, ${allProfiles.length} profiles fetched)`);

    // Pre-index matches-with-results by round
    const matchesByRound: Record<string, number[]> = {};
    for (const [matchIdStr, result] of Object.entries(resultMap)) {
      const matchId = parseInt(matchIdStr);
      const round = matchRoundMap[matchId];
      if (!round) continue;
      if (result.home_score === null || result.away_score === null) continue;
      if (!matchesByRound[round]) matchesByRound[round] = [];
      matchesByRound[round].push(matchId);
    }

    // 4. Calculate scores per user; default 4-4 for any match with a result but no prediction
    const scoreUpdates: any[] = [];
    let totalDefaultFills = 0;

    for (const userId of allUserIds) {
      const roundPreds = userPreds[userId] || {};
      const scores: Record<string, number> = {
        round1: 0, round2: 0, round3: 0, round4: 0,
        round5: 0, round6: 0, round7: 0, round8: 0
      };

      for (const round of ["round3", "round4", "round5", "round6", "round7", "round8"]) {
        const exactP         = EXACT_PTS[round as keyof typeof EXACT_PTS];
        const resultP        = RESULT_PTS[round as keyof typeof RESULT_PTS];
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
            // No submitted prediction — treat as 4-4 (rare scoreline, almost never earns points)
            predH = 4; predA = 4;
            totalDefaultFills++;
          }

          if (predH === actH && predA === actA) {
            pts += exactP;
          } else if (Math.sign(predH - predA) === Math.sign(actH - actA)) {
            pts += resultP;
          }
        }
        scores[round] = pts;
      }

      // Preserve existing r1/r2 scores
      const { data: existingScore } = await supabaseAdmin
        .from("scores").select("round1_points,round2_points").eq("user_id", userId).single();

      scores.round1 = existingScore?.round1_points || 0;
      scores.round2 = existingScore?.round2_points || 0;

      const total = Object.values(scores).reduce((a, b) => a + b, 0);

      scoreUpdates.push({
        user_id:       userId,
        round1_points: scores.round1,
        round2_points: scores.round2,
        round3_points: scores.round3,
        round4_points: scores.round4,
        round5_points: scores.round5,
        round6_points: scores.round6,
        round7_points: scores.round7,
        round8_points: scores.round8,
        total_points:  total,
        updated_at:    new Date().toISOString()
      });
    }

    console.log(`[recalculate-scores] default 4-4 fills: ${totalDefaultFills}`);

    console.log(`[recalculate-scores] score rows to write: ${scoreUpdates.length}`);

    // 5. Upsert all score rows
    if (scoreUpdates.length > 0) {
      const { error } = await supabaseAdmin
        .from("scores")
        .upsert(scoreUpdates, { onConflict: "user_id" });

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        version: "v3-default-fill",
        matchResultsLoaded: matchResults?.length ?? 0,
        predictionsLoaded: allPredictions?.length ?? 0,
        usersUpdated: scoreUpdates.length,
        defaultFills: totalDefaultFills,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
