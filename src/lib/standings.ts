import type {
  SleeperRoster, SleeperUser, TeamStanding
} from '@/types';

const COLORS: [string, string][] = [
  ['#cc0000', '#fff'], ['#001f5b', '#f5a623'], ['#166534', '#4ade80'],
  ['#581c87', '#c084fc'], ['#7c2d12', '#fb923c'], ['#0c4a6e', '#38bdf8'],
  ['#831843', '#f9a8d4'], ['#365314', '#a3e635'], ['#1e1b4b', '#818cf8'],
  ['#134e4a', '#5eead4'], ['#422006', '#fde68a'], ['#1c1917', '#a8a29e'],
];

export function buildStandings(
  rosters: SleeperRoster[],
  users: SleeperUser[]
): TeamStanding[] {
  const userMap = new Map(users.map(u => [u.user_id, u]));

  const standings: TeamStanding[] = rosters.map((r, i) => {
    const user = userMap.get(r.owner_id);
    const name = user?.metadata?.team_name || user?.display_name || `Team ${i + 1}`;
    const manager = user?.display_name || 'Unknown';
    const w = r.settings?.wins ?? 0;
    const l = r.settings?.losses ?? 0;
    const ti = r.settings?.ties ?? 0;
    const pf = (r.settings?.fpts ?? 0) + (r.settings?.fpts_decimal ?? 0) / 100;
    const pa = (r.settings?.fpts_against ?? 0) + (r.settings?.fpts_against_decimal ?? 0) / 100;
    const games = w + l + ti;
    const avgPpg = games > 0 ? pf / games : 0;
    const expWins = games > 0 ? Math.round((pf / (pf + pa)) * games) : 0;
    const luckScore = w - expWins;

    return {
      roster_id: r.roster_id,
      owner_id: r.owner_id,
      name,
      manager,
      wins: w, losses: l, ties: ti,
      pf, pa,
      rank: 0,
      colors: COLORS[i % COLORS.length],
      initials: name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(),
      streak: w > l ? `W${w}` : `L${l}`,
      playoffOdds: 0,
      luckScore,
      avgPpg,
    };
  });

  standings.sort((a, b) => (b.wins - a.wins) || (b.pf - a.pf));
  standings.forEach((t, i) => {
    t.rank = i + 1;
    t.playoffOdds = calcPlayoffOdds(t, standings.length);
  });

  return standings;
}

function calcPlayoffOdds(team: TeamStanding, total: number): number {
  const playoffSpots = Math.floor(total / 2);
  const base = team.rank <= playoffSpots ? 80 : 20;
  const winPct = (team.wins + team.ties * 0.5) / Math.max(1, team.wins + team.losses + team.ties);
  const odds = base - (team.rank - 1) * 6 + winPct * 15;
  return Math.max(2, Math.min(98, Math.round(odds)));
}

export function detectStorylines(
  ta: TeamStanding,
  tb: TeamStanding
): import('@/types').StorylineTag[] {
  const tags: import('@/types').StorylineTag[] = [];
  if (Math.abs(ta.rank - tb.rank) >= 4) tags.push('upset');
  if (ta.wins >= 7 || tb.wins >= 7) tags.push('dynasty');
  if ((ta.losses >= 5 && ta.pf > 900) || (tb.losses >= 5 && tb.pf > 900)) tags.push('collapse');
  if (ta.wins <= 2 && (ta.wins + ta.losses) >= 5) tags.push('fraud');
  if (tb.wins <= 2 && (tb.wins + tb.losses) >= 5) tags.push('fraud');
  return tags.slice(0, 2);
}
