// ============================================================
//  WC2026 Prediction Game — Configuration
//  Fill in your keys before deploying
// ============================================================

const CONFIG = {
  // --- Supabase ---
  SUPABASE_URL: 'YOUR_SUPABASE_URL',          // e.g. https://abcxyz.supabase.co
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY', // public anon key from Supabase dashboard

  // --- Football Data API (football-data.org) ---
  FOOTBALL_API_KEY: 'YOUR_FOOTBALL_DATA_API_KEY', // free key from football-data.org
  FOOTBALL_API_BASE: 'https://api.football-data.org/v4',
  WC2026_COMPETITION_ID: 2000, // FIFA World Cup competition ID on football-data.org

  // --- App Settings ---
  ADMIN_EMAIL: 'YOUR_ADMIN_EMAIL@example.com', // your email — gets admin privileges
  APP_NAME: 'WC2026 Predictor',
  APP_URL: 'https://YOUR_GITHUB_USERNAME.github.io/wc2026-predictor', // your GitHub Pages URL

  // --- Round lock times (ISO 8601 UTC) ---
  // Set these to just before each round's first kickoff
  ROUND_LOCKS: {
    round1: '2026-06-11T14:00:00Z', // Pre-tournament — locks when tournament starts
    round2: '2026-06-11T14:00:00Z', // Group stage predictions lock at same time
    round3: '2026-06-11T14:00:00Z', // Score predictions lock at tournament start
    round4: '2026-06-29T14:00:00Z', // Round of 32 — locks before first R32 game
    round5: '2026-07-04T14:00:00Z', // Round of 16
    round6: '2026-07-11T14:00:00Z', // Quarter finals
    round7: '2026-07-14T14:00:00Z', // Semi finals
    round8: '2026-07-18T14:00:00Z', // Final
  }
};

// Scoring rules reference
const SCORING = {
  round1: {
    winner: 20,
    winner_runner_up: 10,   // picked winner but they were runner-up
    runner_up: 10,
    runner_up_winner: 5,    // picked runner-up but they won
    semi_finalist_correct: 10,
    semi_finalist_finalist: 5, // picked semi-finalist but they reached final
    top_scorer_name: 10,
    top_scorer_goals_exact: 10,
    golden_boot_name: 10,
    golden_boot_goals_exact: 10,
    group_goals_exact: 5,
    group_goals_within3: 3,
    most_goals_group: 5,
    red_cards_exact: 5,
    total_goals_exact: 10,
    total_goals_within3: 5,
  },
  round2: {
    group_winner_correct: 10,
    group_winner_top2: 5,    // picked winner but they were runner-up
    group_runnerup_correct: 10,
    group_runnerup_top2: 5,  // picked runner-up but they were group winner
    bonus_all6_winners: 10,
    bonus_5_winners: 5,
    bonus_all12_qualifiers: 10,
    bonus_10or11_qualifiers: 5,
  },
  round3: { exact_score: 7, correct_result: 5 },
  round4: { exact_score: 7, correct_result: 5 },
  round5: { exact_score: 7, correct_result: 5 },
  round6: { exact_score: 7, correct_result: 5 },
  round7: { exact_score: 7, correct_result: 5 },
  round8: { exact_score: 10, correct_result: 7 }, // Final
};

window.CONFIG = CONFIG;
window.SCORING = SCORING;
