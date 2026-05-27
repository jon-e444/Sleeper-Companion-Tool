// ─── Sleeper API Types ───────────────────────────────────────────────────────

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: string;
  sport: string;
  settings: {
    num_teams: number;
    playoff_week_start: number;
    leg: number; // current week
    playoff_teams: number;
  };
  scoring_settings: Record<string, number>;
  roster_positions: string[];
}

export interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string | null;
  metadata: { team_name?: string };
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  league_id: string;
  players: string[];
  starters: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
  };
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  players: string[];
  starters: string[];
  players_points: Record<string, number>;
}

export interface SleeperTransaction {
  transaction_id: string;
  type: 'trade' | 'waiver' | 'free_agent';
  status: string;
  roster_ids: number[];
  adds: Record<string, number> | null;
  drops: Record<string, number> | null;
  draft_picks: unknown[];
  created: number;
  waiver_budget: unknown[];
  settings: Record<string, unknown> | null;
}

// ─── App Types ───────────────────────────────────────────────────────────────

export interface TeamStanding {
  roster_id: number;
  owner_id: string;
  name: string;
  manager: string;
  wins: number;
  losses: number;
  ties: number;
  pf: number;
  pa: number;
  rank: number;
  colors: [string, string];
  initials: string;
  streak: string;
  playoffOdds: number;
  luckScore: number;
  avgPpg: number;
}

export interface MatchupPair {
  matchup_id: number;
  teamA: TeamStanding;
  teamB: TeamStanding;
  scoreA: number;
  scoreB: number;
  projA: number;
  projB: number;
  tags: StorylineTag[];
  isLive: boolean;
}

export type StorylineTag =
  | 'upset' | 'dynasty' | 'collapse' | 'fraud' | 'revenge'
  | 'destiny' | 'hot-streak' | 'bad-beat' | 'rivalry';

export interface PersonaKey {
  id: string;
  name: string;
  role: string;
  icon: string;
  colorClass: string;
  catchphrase: string;
  systemPrompt: string;
}

// ─── AI Content Cache ────────────────────────────────────────────────────────

export interface WeeklyContent {
  week: number;
  season: string;
  leagueId: string;
  generatedAt: string;
  topStory?: string;
  matchupRecaps?: Record<number, string>;
  powerRankingsAnalysis?: string;
  standingsInsight?: string;
  podcastScript?: string;
  debateSegments?: DebateSegment[];
  personaTakes?: Record<string, string>;
  tradeReport?: string;
  analyticsReport?: string;
  breakingNews?: string[];
  awards?: WeeklyAward[];
}

export interface DebateSegment {
  topic: string;
  personaA: string;
  personaB: string;
  argA: string;
  argB: string;
}

export interface WeeklyAward {
  emoji: string;
  label: string;
  winner: string;
  reason: string;
}

export interface LeagueData {
  league: SleeperLeague;
  users: SleeperUser[];
  rosters: SleeperRoster[];
  standings: TeamStanding[];
  currentWeek: number;
  matchups: MatchupPair[];
  transactions: SleeperTransaction[];
}
