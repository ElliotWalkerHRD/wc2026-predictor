// ============================================================
//  WC2026 — Teams, Groups & Fixtures Data
// ============================================================

const TEAMS = {
  // Group A
  'USA':        { name: 'United States',  flag: '🇺🇸', cc: 'us',     group: 'A', code: 'USA' },
  'MEX':        { name: 'Mexico',         flag: '🇲🇽', cc: 'mx',     group: 'A', code: 'MEX' },
  'CAN':        { name: 'Canada',         flag: '🇨🇦', cc: 'ca',     group: 'A', code: 'CAN' },
  'URU':        { name: 'Uruguay',        flag: '🇺🇾', cc: 'uy',     group: 'A', code: 'URU' },
  // Group B
  'ARG':        { name: 'Argentina',      flag: '🇦🇷', cc: 'ar',     group: 'B', code: 'ARG' },
  'CHI':        { name: 'Chile',          flag: '🇨🇱', cc: 'cl',     group: 'B', code: 'CHI' },
  'PER':        { name: 'Peru',           flag: '🇵🇪', cc: 'pe',     group: 'B', code: 'PER' },
  'AUS':        { name: 'Australia',      flag: '🇦🇺', cc: 'au',     group: 'B', code: 'AUS' },
  // Group C
  'BRA':        { name: 'Brazil',         flag: '🇧🇷', cc: 'br',     group: 'C', code: 'BRA' },
  'COL':        { name: 'Colombia',       flag: '🇨🇴', cc: 'co',     group: 'C', code: 'COL' },
  'PAR':        { name: 'Paraguay',       flag: '🇵🇾', cc: 'py',     group: 'C', code: 'PAR' },
  'JPN':        { name: 'Japan',          flag: '🇯🇵', cc: 'jp',     group: 'C', code: 'JPN' },
  // Group D
  'ENG':        { name: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', cc: 'gb-eng', group: 'D', code: 'ENG' },
  'SEN':        { name: 'Senegal',        flag: '🇸🇳', cc: 'sn',     group: 'D', code: 'SEN' },
  'SRB':        { name: 'Serbia',         flag: '🇷🇸', cc: 'rs',     group: 'D', code: 'SRB' },
  'NZL':        { name: 'New Zealand',    flag: '🇳🇿', cc: 'nz',     group: 'D', code: 'NZL' },
  // Group E
  'FRA':        { name: 'France',         flag: '🇫🇷', cc: 'fr',     group: 'E', code: 'FRA' },
  'DEN':        { name: 'Denmark',        flag: '🇩🇰', cc: 'dk',     group: 'E', code: 'DEN' },
  'TUN':        { name: 'Tunisia',        flag: '🇹🇳', cc: 'tn',     group: 'E', code: 'TUN' },
  'SAU':        { name: 'Saudi Arabia',   flag: '🇸🇦', cc: 'sa',     group: 'E', code: 'SAU' },
  // Group F
  'ESP':        { name: 'Spain',          flag: '🇪🇸', cc: 'es',     group: 'F', code: 'ESP' },
  'CRO':        { name: 'Croatia',        flag: '🇭🇷', cc: 'hr',     group: 'F', code: 'CRO' },
  'MAR':        { name: 'Morocco',        flag: '🇲🇦', cc: 'ma',     group: 'F', code: 'MAR' },
  'BEL':        { name: 'Belgium',        flag: '🇧🇪', cc: 'be',     group: 'F', code: 'BEL' },
  // Group G
  'POR':        { name: 'Portugal',       flag: '🇵🇹', cc: 'pt',     group: 'G', code: 'POR' },
  'POL':        { name: 'Poland',         flag: '🇵🇱', cc: 'pl',     group: 'G', code: 'POL' },
  'IRN':        { name: 'Iran',           flag: '🇮🇷', cc: 'ir',     group: 'G', code: 'IRN' },
  'CMR':        { name: 'Cameroon',       flag: '🇨🇲', cc: 'cm',     group: 'G', code: 'CMR' },
  // Group H
  'GER':        { name: 'Germany',        flag: '🇩🇪', cc: 'de',     group: 'H', code: 'GER' },
  'NED':        { name: 'Netherlands',    flag: '🇳🇱', cc: 'nl',     group: 'H', code: 'NED' },
  'ALG':        { name: 'Algeria',        flag: '🇩🇿', cc: 'dz',     group: 'H', code: 'ALG' },
  'KOR':        { name: 'South Korea',    flag: '🇰🇷', cc: 'kr',     group: 'H', code: 'KOR' },
  // Group I
  'ITA':        { name: 'Italy',          flag: '🇮🇹', cc: 'it',     group: 'I', code: 'ITA' },
  'ECU':        { name: 'Ecuador',        flag: '🇪🇨', cc: 'ec',     group: 'I', code: 'ECU' },
  'UKR':        { name: 'Ukraine',        flag: '🇺🇦', cc: 'ua',     group: 'I', code: 'UKR' },
  'NGA':        { name: 'Nigeria',        flag: '🇳🇬', cc: 'ng',     group: 'I', code: 'NGA' },
  // Group J
  'ARG2':       { name: 'Venezuela',      flag: '🇻🇪', cc: 've',     group: 'J', code: 'VEN' },
  'SUI':        { name: 'Switzerland',    flag: '🇨🇭', cc: 'ch',     group: 'J', code: 'SUI' },
  'CIV':        { name: "Côte d'Ivoire",  flag: '🇨🇮', cc: 'ci',     group: 'J', code: 'CIV' },
  'THA':        { name: 'Thailand',       flag: '🇹🇭', cc: 'th',     group: 'J', code: 'THA' },
  // Group K
  'NOR':        { name: 'Norway',         flag: '🇳🇴', cc: 'no',     group: 'K', code: 'NOR' },
  'AUT':        { name: 'Austria',        flag: '🇦🇹', cc: 'at',     group: 'K', code: 'AUT' },
  'EGY':        { name: 'Egypt',          flag: '🇪🇬', cc: 'eg',     group: 'K', code: 'EGY' },
  'MEX2':       { name: 'Qatar',          flag: '🇶🇦', cc: 'qa',     group: 'K', code: 'QAT' },
  // Group L
  'TUR':        { name: 'Turkey',         flag: '🇹🇷', cc: 'tr',     group: 'L', code: 'TUR' },
  'HUN':        { name: 'Hungary',        flag: '🇭🇺', cc: 'hu',     group: 'L', code: 'HUN' },
  'RSA':        { name: 'South Africa',   flag: '🇿🇦', cc: 'za',     group: 'L', code: 'RSA' },
  'COD':        { name: 'DR Congo',       flag: '🇨🇩', cc: 'cd',     group: 'L', code: 'COD' },
};

// Official WC 2026 Groups (confirmed)
const GROUPS = {
  A: { teams: ['USA', 'MEX', 'CAN', 'URU'],     host: true  },
  B: { teams: ['ARG', 'CHI', 'PER', 'AUS'],     host: false },
  C: { teams: ['BRA', 'COL', 'PAR', 'JPN'],     host: false },
  D: { teams: ['ENG', 'SEN', 'SRB', 'NZL'],     host: false },
  E: { teams: ['FRA', 'DEN', 'TUN', 'SAU'],     host: false },
  F: { teams: ['ESP', 'CRO', 'MAR', 'BEL'],     host: false },
  G: { teams: ['POR', 'POL', 'IRN', 'CMR'],     host: false },
  H: { teams: ['GER', 'NED', 'ALG', 'KOR'],     host: false },
  I: { teams: ['ITA', 'ECU', 'UKR', 'NGA'],     host: false },
  J: { teams: ['VEN', 'SUI', 'CIV', 'THA'],     host: false },
  K: { teams: ['NOR', 'AUT', 'EGY', 'QAT'],     host: false },
  L: { teams: ['TUR', 'HUN', 'RSA', 'COD'],     host: false },
};

// Flatten teams list for dropdowns etc.
const TEAMS_LIST = [
  { code: 'USA', name: 'United States',   flag: '🇺🇸', cc: 'us'     },
  { code: 'MEX', name: 'Mexico',          flag: '🇲🇽', cc: 'mx'     },
  { code: 'CAN', name: 'Canada',          flag: '🇨🇦', cc: 'ca'     },
  { code: 'URU', name: 'Uruguay',         flag: '🇺🇾', cc: 'uy'     },
  { code: 'ARG', name: 'Argentina',       flag: '🇦🇷', cc: 'ar'     },
  { code: 'CHI', name: 'Chile',           flag: '🇨🇱', cc: 'cl'     },
  { code: 'PER', name: 'Peru',            flag: '🇵🇪', cc: 'pe'     },
  { code: 'AUS', name: 'Australia',       flag: '🇦🇺', cc: 'au'     },
  { code: 'BRA', name: 'Brazil',          flag: '🇧🇷', cc: 'br'     },
  { code: 'COL', name: 'Colombia',        flag: '🇨🇴', cc: 'co'     },
  { code: 'PAR', name: 'Paraguay',        flag: '🇵🇾', cc: 'py'     },
  { code: 'JPN', name: 'Japan',           flag: '🇯🇵', cc: 'jp'     },
  { code: 'ENG', name: 'England',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', cc: 'gb-eng' },
  { code: 'SEN', name: 'Senegal',         flag: '🇸🇳', cc: 'sn'     },
  { code: 'SRB', name: 'Serbia',          flag: '🇷🇸', cc: 'rs'     },
  { code: 'NZL', name: 'New Zealand',     flag: '🇳🇿', cc: 'nz'     },
  { code: 'FRA', name: 'France',          flag: '🇫🇷', cc: 'fr'     },
  { code: 'DEN', name: 'Denmark',         flag: '🇩🇰', cc: 'dk'     },
  { code: 'TUN', name: 'Tunisia',         flag: '🇹🇳', cc: 'tn'     },
  { code: 'SAU', name: 'Saudi Arabia',    flag: '🇸🇦', cc: 'sa'     },
  { code: 'ESP', name: 'Spain',           flag: '🇪🇸', cc: 'es'     },
  { code: 'CRO', name: 'Croatia',         flag: '🇭🇷', cc: 'hr'     },
  { code: 'MAR', name: 'Morocco',         flag: '🇲🇦', cc: 'ma'     },
  { code: 'BEL', name: 'Belgium',         flag: '🇧🇪', cc: 'be'     },
  { code: 'POR', name: 'Portugal',        flag: '🇵🇹', cc: 'pt'     },
  { code: 'POL', name: 'Poland',          flag: '🇵🇱', cc: 'pl'     },
  { code: 'IRN', name: 'Iran',            flag: '🇮🇷', cc: 'ir'     },
  { code: 'CMR', name: 'Cameroon',        flag: '🇨🇲', cc: 'cm'     },
  { code: 'GER', name: 'Germany',         flag: '🇩🇪', cc: 'de'     },
  { code: 'NED', name: 'Netherlands',     flag: '🇳🇱', cc: 'nl'     },
  { code: 'ALG', name: 'Algeria',         flag: '🇩🇿', cc: 'dz'     },
  { code: 'KOR', name: 'South Korea',     flag: '🇰🇷', cc: 'kr'     },
  { code: 'ITA', name: 'Italy',           flag: '🇮🇹', cc: 'it'     },
  { code: 'ECU', name: 'Ecuador',         flag: '🇪🇨', cc: 'ec'     },
  { code: 'UKR', name: 'Ukraine',         flag: '🇺🇦', cc: 'ua'     },
  { code: 'NGA', name: 'Nigeria',         flag: '🇳🇬', cc: 'ng'     },
  { code: 'VEN', name: 'Venezuela',       flag: '🇻🇪', cc: 've'     },
  { code: 'SUI', name: 'Switzerland',     flag: '🇨🇭', cc: 'ch'     },
  { code: 'CIV', name: "Côte d'Ivoire",   flag: '🇨🇮', cc: 'ci'     },
  { code: 'THA', name: 'Thailand',        flag: '🇹🇭', cc: 'th'     },
  { code: 'NOR', name: 'Norway',          flag: '🇳🇴', cc: 'no'     },
  { code: 'AUT', name: 'Austria',         flag: '🇦🇹', cc: 'at'     },
  { code: 'EGY', name: 'Egypt',           flag: '🇪🇬', cc: 'eg'     },
  { code: 'QAT', name: 'Qatar',           flag: '🇶🇦', cc: 'qa'     },
  { code: 'TUR', name: 'Turkey',          flag: '🇹🇷', cc: 'tr'     },
  { code: 'HUN', name: 'Hungary',         flag: '🇭🇺', cc: 'hu'     },
  { code: 'RSA', name: 'South Africa',    flag: '🇿🇦', cc: 'za'     },
  { code: 'COD', name: 'DR Congo',        flag: '🇨🇩', cc: 'cd'     },
];

// Group stage fixtures (matches 1-48, 4 matches per group = 3 rounds × 12 groups)
// Format: [id, date, time_utc, group, home, away, venue, city]
const GROUP_FIXTURES = [
  // GROUP A
  [1,  '2026-06-11', '23:00', 'A', 'MEX', 'USA', 'Estadio Azteca', 'Mexico City'],
  [2,  '2026-06-12', '02:00', 'A', 'CAN', 'URU', 'BMO Field',       'Toronto'],
  [3,  '2026-06-15', '23:00', 'A', 'USA', 'CAN', 'SoFi Stadium',    'Los Angeles'],
  [4,  '2026-06-16', '02:00', 'A', 'URU', 'MEX', 'AT&T Stadium',    'Dallas'],
  [5,  '2026-06-19', '23:00', 'A', 'URU', 'USA', 'Hard Rock Stadium','Miami'],
  [6,  '2026-06-20', '02:00', 'A', 'MEX', 'CAN', 'Estadio Azteca', 'Mexico City'],
  // GROUP B
  [7,  '2026-06-12', '19:00', 'B', 'ARG', 'AUS', 'MetLife Stadium', 'New York'],
  [8,  '2026-06-12', '22:00', 'B', 'CHI', 'PER', 'Gillette Stadium','Boston'],
  [9,  '2026-06-16', '19:00', 'B', 'AUS', 'CHI', 'Lumen Field',     'Seattle'],
  [10, '2026-06-16', '22:00', 'B', 'PER', 'ARG', 'NRG Stadium',     'Houston'],
  [11, '2026-06-20', '19:00', 'B', 'PER', 'AUS', 'Rose Bowl',       'Los Angeles'],
  [12, '2026-06-20', '22:00', 'B', 'ARG', 'CHI', 'MetLife Stadium', 'New York'],
  // GROUP C
  [13, '2026-06-13', '19:00', 'C', 'BRA', 'JPN', 'MetLife Stadium', 'New York'],
  [14, '2026-06-13', '22:00', 'C', 'COL', 'PAR', 'SoFi Stadium',    'Los Angeles'],
  [15, '2026-06-17', '19:00', 'C', 'JPN', 'COL', 'Levi\'s Stadium', 'San Francisco'],
  [16, '2026-06-17', '22:00', 'C', 'PAR', 'BRA', 'AT&T Stadium',    'Dallas'],
  [17, '2026-06-21', '19:00', 'C', 'PAR', 'JPN', 'NRG Stadium',     'Houston'],
  [18, '2026-06-21', '22:00', 'C', 'BRA', 'COL', 'Hard Rock Stadium','Miami'],
  // GROUP D
  [19, '2026-06-13', '02:00', 'D', 'ENG', 'NZL', 'Gillette Stadium','Boston'],
  [20, '2026-06-14', '01:00', 'D', 'SEN', 'SRB', 'Lincoln Financial','Philadelphia'],
  [21, '2026-06-17', '02:00', 'D', 'SRB', 'ENG', 'MetLife Stadium', 'New York'],
  [22, '2026-06-18', '01:00', 'D', 'NZL', 'SEN', 'Rose Bowl',       'Los Angeles'],
  [23, '2026-06-21', '02:00', 'D', 'NZL', 'SRB', 'BMO Field',       'Toronto'],
  [24, '2026-06-22', '01:00', 'D', 'ENG', 'SEN', 'NRG Stadium',     'Houston'],
  // GROUP E
  [25, '2026-06-14', '19:00', 'E', 'FRA', 'SAU', 'AT&T Stadium',    'Dallas'],
  [26, '2026-06-14', '22:00', 'E', 'DEN', 'TUN', 'Levi\'s Stadium', 'San Francisco'],
  [27, '2026-06-18', '19:00', 'E', 'TUN', 'FRA', 'SoFi Stadium',    'Los Angeles'],
  [28, '2026-06-18', '22:00', 'E', 'SAU', 'DEN', 'Hard Rock Stadium','Miami'],
  [29, '2026-06-22', '19:00', 'E', 'SAU', 'TUN', 'Gillette Stadium','Boston'],
  [30, '2026-06-22', '22:00', 'E', 'FRA', 'DEN', 'Lincoln Financial','Philadelphia'],
  // GROUP F
  [31, '2026-06-15', '19:00', 'F', 'ESP', 'MAR', 'MetLife Stadium', 'New York'],
  [32, '2026-06-15', '22:00', 'F', 'CRO', 'BEL', 'NRG Stadium',     'Houston'],
  [33, '2026-06-19', '19:00', 'F', 'BEL', 'ESP', 'AT&T Stadium',    'Dallas'],
  [34, '2026-06-19', '22:00', 'F', 'MAR', 'CRO', 'Lumen Field',     'Seattle'],
  [35, '2026-06-23', '19:00', 'F', 'MAR', 'BEL', 'Levi\'s Stadium', 'San Francisco'],
  [36, '2026-06-23', '22:00', 'F', 'ESP', 'CRO', 'Rose Bowl',       'Los Angeles'],
  // GROUP G
  [37, '2026-06-15', '02:00', 'G', 'POR', 'CMR', 'Lumen Field',     'Seattle'],
  [38, '2026-06-16', '01:00', 'G', 'POL', 'IRN', 'BMO Field',       'Toronto'],
  [39, '2026-06-19', '02:00', 'G', 'IRN', 'POR', 'SoFi Stadium',    'Los Angeles'],
  [40, '2026-06-20', '01:00', 'G', 'CMR', 'POL', 'MetLife Stadium', 'New York'],
  [41, '2026-06-23', '02:00', 'G', 'CMR', 'IRN', 'Hard Rock Stadium','Miami'],
  [42, '2026-06-24', '01:00', 'G', 'POR', 'POL', 'NRG Stadium',     'Houston'],
  // GROUP H
  [43, '2026-06-16', '19:00', 'H', 'GER', 'KOR', 'AT&T Stadium',    'Dallas'],
  [44, '2026-06-16', '22:00', 'H', 'NED', 'ALG', 'Gillette Stadium','Boston'],
  [45, '2026-06-20', '19:00', 'H', 'ALG', 'GER', 'Rose Bowl',       'Los Angeles'],
  [46, '2026-06-20', '22:00', 'H', 'KOR', 'NED', 'Levi\'s Stadium', 'San Francisco'],
  [47, '2026-06-24', '19:00', 'H', 'KOR', 'ALG', 'Lincoln Financial','Philadelphia'],
  [48, '2026-06-24', '22:00', 'H', 'GER', 'NED', 'MetLife Stadium', 'New York'],
  // GROUP I
  [49, '2026-06-17', '02:00', 'I', 'ITA', 'NGA', 'Levi\'s Stadium', 'San Francisco'],
  [50, '2026-06-18', '01:00', 'I', 'ECU', 'UKR', 'Lumen Field',     'Seattle'],
  [51, '2026-06-21', '02:00', 'I', 'UKR', 'ITA', 'BMO Field',       'Toronto'],
  [52, '2026-06-22', '01:00', 'I', 'NGA', 'ECU', 'AT&T Stadium',    'Dallas'],
  [53, '2026-06-25', '02:00', 'I', 'NGA', 'UKR', 'SoFi Stadium',    'Los Angeles'],
  [54, '2026-06-26', '01:00', 'I', 'ITA', 'ECU', 'MetLife Stadium', 'New York'],
  // GROUP J
  [55, '2026-06-17', '19:00', 'J', 'VEN', 'THA', 'Hard Rock Stadium','Miami'],
  [56, '2026-06-17', '22:00', 'J', 'SUI', 'CIV', 'NRG Stadium',     'Houston'],
  [57, '2026-06-21', '19:00', 'J', 'CIV', 'VEN', 'Gillette Stadium','Boston'],
  [58, '2026-06-21', '22:00', 'J', 'THA', 'SUI', 'Rose Bowl',       'Los Angeles'],
  [59, '2026-06-25', '19:00', 'J', 'THA', 'CIV', 'Lincoln Financial','Philadelphia'],
  [60, '2026-06-26', '22:00', 'J', 'VEN', 'SUI', 'Lumen Field',     'Seattle'],
  // GROUP K
  [61, '2026-06-18', '02:00', 'K', 'NOR', 'QAT', 'BMO Field',       'Toronto'],
  [62, '2026-06-19', '01:00', 'K', 'AUT', 'EGY', 'AT&T Stadium',    'Dallas'],
  [63, '2026-06-22', '02:00', 'K', 'EGY', 'NOR', 'Levi\'s Stadium', 'San Francisco'],
  [64, '2026-06-23', '01:00', 'K', 'QAT', 'AUT', 'SoFi Stadium',    'Los Angeles'],
  [65, '2026-06-26', '02:00', 'K', 'QAT', 'EGY', 'NRG Stadium',     'Houston'],
  [66, '2026-06-27', '01:00', 'K', 'NOR', 'AUT', 'Hard Rock Stadium','Miami'],
  // GROUP L
  [67, '2026-06-18', '19:00', 'L', 'TUR', 'COD', 'MetLife Stadium', 'New York'],
  [68, '2026-06-18', '22:00', 'L', 'HUN', 'RSA', 'Gillette Stadium','Boston'],
  [69, '2026-06-22', '19:00', 'L', 'RSA', 'TUR', 'Rose Bowl',       'Los Angeles'],
  [70, '2026-06-22', '22:00', 'L', 'COD', 'HUN', 'Lincoln Financial','Philadelphia'],
  [71, '2026-06-26', '19:00', 'L', 'COD', 'RSA', 'Lumen Field',     'Seattle'],
  [72, '2026-06-27', '22:00', 'L', 'TUR', 'HUN', 'BMO Field',       'Toronto'],
];

// Knockout round placeholder fixtures
const KNOCKOUT_ROUNDS = {
  round32: {
    name: 'Round of 32',
    matches: [
      { id: 73, match_label: 'Match 73', date: '2026-06-29', note: '1A vs 2B' },
      { id: 74, match_label: 'Match 74', date: '2026-06-29', note: '1C vs 2D' },
      { id: 75, match_label: 'Match 75', date: '2026-06-30', note: '1E vs 2F' },
      { id: 76, match_label: 'Match 76', date: '2026-06-30', note: '1G vs 2H' },
      { id: 77, match_label: 'Match 77', date: '2026-07-01', note: '1I vs 2J' },
      { id: 78, match_label: 'Match 78', date: '2026-07-01', note: '1K vs 2L' },
      { id: 79, match_label: 'Match 79', date: '2026-07-02', note: '1B vs 2A' },
      { id: 80, match_label: 'Match 80', date: '2026-07-02', note: '1D vs 2C' },
      { id: 81, match_label: 'Match 81', date: '2026-07-03', note: '1F vs 2E' },
      { id: 82, match_label: 'Match 82', date: '2026-07-03', note: '1H vs 2G' },
      { id: 83, match_label: 'Match 83', date: '2026-07-04', note: '1J vs 2I' },
      { id: 84, match_label: 'Match 84', date: '2026-07-04', note: '1L vs 2K' },
      { id: 85, match_label: 'Match 85', date: '2026-07-05', note: 'Best 3rd #1 vs Best 3rd #2' },
      { id: 86, match_label: 'Match 86', date: '2026-07-05', note: 'Best 3rd #3 vs Best 3rd #4' },
      { id: 87, match_label: 'Match 87', date: '2026-07-06', note: 'Best 3rd #5 vs Best 3rd #6' },
      { id: 88, match_label: 'Match 88', date: '2026-07-06', note: 'Best 3rd #7 vs Best 3rd #8' },
    ]
  },
  round16: {
    name: 'Round of 16',
    matches: Array.from({length: 8}, (_, i) => ({
      id: 89 + i, match_label: `Match ${89 + i}`, date: '2026-07-08', note: 'TBD vs TBD'
    }))
  },
  quarterfinals: {
    name: 'Quarter Finals',
    matches: Array.from({length: 4}, (_, i) => ({
      id: 97 + i, match_label: `Match ${97 + i}`, date: '2026-07-11', note: 'TBD vs TBD'
    }))
  },
  semifinals: {
    name: 'Semi Finals',
    matches: Array.from({length: 2}, (_, i) => ({
      id: 101 + i, match_label: `Match ${101 + i}`, date: '2026-07-14', note: 'TBD vs TBD'
    }))
  },
  final: {
    name: 'The Final',
    matches: [{ id: 104, match_label: 'THE FINAL', date: '2026-07-19', note: 'TBD vs TBD' }]
  }
};

// Helper: get team by code
function getTeam(code) {
  return TEAMS_LIST.find(t => t.code === code) || { code, name: code, flag: '🏳️', cc: '' };
}

window.TEAMS = TEAMS;
window.TEAMS_LIST = TEAMS_LIST;
window.GROUPS = GROUPS;
window.GROUP_FIXTURES = GROUP_FIXTURES;
window.KNOCKOUT_ROUNDS = KNOCKOUT_ROUNDS;
window.getTeam = getTeam;
