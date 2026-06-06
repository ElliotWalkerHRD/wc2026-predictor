// ============================================================
//  WC2026 — Supabase Client & Auth
// ============================================================

// Supabase is loaded via CDN in each HTML page
// Initialize client once CONFIG is available
let supabaseClient = null;

function initSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!window.CONFIG) throw new Error('CONFIG not loaded');
  supabaseClient = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
  );
  window._supabase = supabaseClient;
  return supabaseClient;
}

// ---- Auth helpers ----

async function signUp(email, password, displayName) {
  const sb = initSupabase();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const sb = initSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const sb = initSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

async function getSession() {
  const sb = initSupabase();
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function getCurrentUser() {
  const sb = initSupabase();
  const { data } = await sb.auth.getUser();
  return data.user;
}

function onAuthChange(callback) {
  const sb = initSupabase();
  return sb.auth.onAuthStateChange(callback);
}

// ---- Profile helpers ----

async function getProfile(userId) {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function upsertProfile(userId, updates) {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getProfiles(userIds) {
  if (!userIds.length) return [];
  const sb = initSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('id, display_name, avatar_color, avatar_url')
    .in('id', userIds);
  if (error) throw error;
  return data || [];
}

async function getAllProfiles() {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('id, display_name, avatar_color, avatar_url');
  if (error) throw error;
  return data || [];
}

async function isAdmin(userId) {
  const profile = await getProfile(userId);
  return profile?.is_admin === true;
}

// ---- Predictions ----

async function savePrediction(userId, round, questionKey, value) {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('predictions')
    .upsert({
      user_id: userId,
      round,
      question_key: questionKey,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,round,question_key' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getUserPredictions(userId, round = null) {
  const sb = initSupabase();
  let query = sb.from('predictions').select('*').eq('user_id', userId);
  if (round) query = query.eq('round', round);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getAllPredictions(round = null) {
  const sb = initSupabase();
  let query = sb.from('predictions').select('*, profiles(display_name, avatar_color)');
  if (round) query = query.eq('round', round);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ---- Scores ----

async function getScores() {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('scores')
    .select('*, profiles(display_name, avatar_color, avatar_url)')
    .order('total_points', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getUserScore(userId) {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ---- Match Results ----

async function getMatchResults() {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('match_results')
    .select('*')
    .order('match_id', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function upsertMatchResult(matchId, homeScore, awayScore, status = 'FINISHED') {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('match_results')
    .upsert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      status,
      updated_at: new Date().toISOString()
    }, { onConflict: 'match_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- Invite Codes ----

async function validateInviteCode(code) {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single();
  if (error) return false;
  return data !== null;
}

async function getInviteCodes() {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function createInviteCode(label) {
  const sb = initSupabase();
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data, error } = await sb
    .from('invite_codes')
    .insert({ code, label, active: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- Leagues ----

async function getMyLeagues(userId) {
  const sb = initSupabase();
  const { data: memberships, error } = await sb
    .from('league_members')
    .select('league_id, leagues(id, name, join_code, owner_id, is_global, created_at)')
    .eq('user_id', userId);
  if (error) throw error;
  if (!memberships?.length) return [];

  const leagueIds = memberships.map(m => m.league_id);
  const { data: allMembers } = await sb
    .from('league_members')
    .select('league_id')
    .in('league_id', leagueIds);

  const countMap = {};
  (allMembers || []).forEach(r => {
    countMap[r.league_id] = (countMap[r.league_id] || 0) + 1;
  });

  return memberships
    .map(m => m.leagues)
    .filter(Boolean)
    .map(l => ({ ...l, member_count: countMap[l.id] || 1 }));
}

async function createLeague(userId, name) {
  const sb = initSupabase();
  const join_code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data: league, error: leagueErr } = await sb
    .from('leagues')
    .insert({ name: name.trim(), join_code, owner_id: userId, is_global: false })
    .select()
    .single();
  if (leagueErr) throw leagueErr;
  const { error: memberErr } = await sb
    .from('league_members')
    .insert({ league_id: league.id, user_id: userId });
  if (memberErr) throw memberErr;
  return league;
}

async function joinLeague(userId, joinCode) {
  const sb = initSupabase();
  const { data: league, error: lookupErr } = await sb
    .from('leagues')
    .select('*')
    .eq('join_code', joinCode.trim().toUpperCase())
    .single();
  if (lookupErr || !league) throw new Error('No league found with that code. Double-check and try again.');
  const { error } = await sb
    .from('league_members')
    .upsert({ league_id: league.id, user_id: userId }, { onConflict: 'league_id,user_id', ignoreDuplicates: true });
  if (error) throw error;
  return league;
}

async function leaveLeague(userId, leagueId) {
  const sb = initSupabase();
  const { error } = await sb
    .from('league_members')
    .delete()
    .eq('user_id', userId)
    .eq('league_id', leagueId);
  if (error) throw error;
}

async function getLeagueMemberIds(leagueId) {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('league_members')
    .select('user_id')
    .eq('league_id', leagueId);
  if (error) throw error;
  return (data || []).map(r => r.user_id);
}

async function validateLeagueCode(code) {
  const sb = initSupabase();
  const { data, error } = await sb
    .from('leagues')
    .select('id, name')
    .eq('join_code', code.trim().toUpperCase())
    .single();
  if (error) return null;
  return data; // { id, name } or null if not found
}

// ---- Storage ----

async function uploadAvatar(userId, file) {
  const sb = initSupabase();
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${userId}/avatar.${ext}`;
  const { error } = await sb.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = sb.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

async function removeAvatar(userId) {
  const sb = initSupabase();
  // Try common extensions; ignore errors if file doesn't exist
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  await Promise.allSettled(exts.map(ext =>
    sb.storage.from('avatars').remove([`${userId}/avatar.${ext}`])
  ));
}

// ---- Real-time subscriptions ----

function subscribeToLeaderboard(callback) {
  const sb = initSupabase();
  return sb
    .channel('leaderboard-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, callback)
    .subscribe();
}

function subscribeToMatchResults(callback) {
  const sb = initSupabase();
  return sb
    .channel('match-results-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results' }, callback)
    .subscribe();
}

// ---- Scoring Engine ----

async function recalculateScores(userId = null) {
  const sb = initSupabase();
  // Call a Supabase Edge Function to recalculate
  const { data, error } = await sb.functions.invoke('recalculate-scores', {
    body: { userId }
  });
  if (error) throw error;
  return data;
}

// ---- Round lock check ----

function isRoundLocked(round) {
  const lockTime = CONFIG.ROUND_LOCKS[round];
  if (!lockTime) return false;
  return new Date() >= new Date(lockTime);
}

function getRoundLockDate(round) {
  return CONFIG.ROUND_LOCKS[round] ? new Date(CONFIG.ROUND_LOCKS[round]) : null;
}

// Export to global
window.DB = {
  signUp, signIn, signOut, getSession, getCurrentUser, onAuthChange,
  getProfile, upsertProfile, getProfiles, getAllProfiles, isAdmin,
  savePrediction, getUserPredictions, getAllPredictions,
  getScores, getUserScore,
  getMatchResults, upsertMatchResult,
  validateInviteCode, getInviteCodes, createInviteCode,
  subscribeToLeaderboard, subscribeToMatchResults,
  recalculateScores, isRoundLocked, getRoundLockDate,
  getMyLeagues, createLeague, joinLeague, leaveLeague, getLeagueMemberIds, validateLeagueCode,
  uploadAvatar, removeAvatar,
  initSupabase
};
