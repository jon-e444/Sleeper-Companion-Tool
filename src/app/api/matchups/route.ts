import { NextResponse } from 'next/server';
import { sleeper } from '@/lib/sleeper';
import { buildStandings, detectStorylines } from '@/lib/standings';
import type { MatchupPair } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = process.env.SLEEPER_LEAGUE_ID!;
    const [league, users, rosters] = await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getUsers(leagueId),
      sleeper.getRosters(leagueId),
    ]);
    const week = parseInt(searchParams.get('week') ?? String(league.settings?.leg ?? 1));
    const rawMatchups = await sleeper.getMatchups(leagueId, week);
    const standings = buildStandings(rosters, users);
    const rosterMap = new Map(standings.map(s => [s.roster_id, s]));
    const groups = new Map<number, typeof rawMatchups>();
    rawMatchups.forEach(m => {
      if (!groups.has(m.matchup_id)) groups.set(m.matchup_id, []);
      groups.get(m.matchup_id)!.push(m);
    });
    const pairs: MatchupPair[] = [];
    groups.forEach((members, matchup_id) => {
      if (members.length !== 2) return;
      const [a, b] = members;
      const ta = rosterMap.get(a.roster_id);
      const tb = rosterMap.get(b.roster_id);
      if (!ta || !tb) return;
      const scoreA = a.points ?? 0;
      const scoreB = b.points ?? 0;
      pairs.push({
        matchup_id, teamA: ta, teamB: tb,
        scoreA, scoreB,
        projA: scoreA > 0 ? scoreA * 1.12 : ta.avgPpg * 1.05,
        projB: scoreB > 0 ? scoreB * 1.12 : tb.avgPpg * 1.05,
        tags: detectStorylines(ta, tb),
        isLive: scoreA > 0 || scoreB > 0,
      });
    });
    return NextResponse.json({ matchups: pairs, week });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
