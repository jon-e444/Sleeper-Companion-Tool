import { NextResponse } from 'next/server';
import { sleeper } from '@/lib/sleeper';
import { buildStandings } from '@/lib/standings';

export async function GET() {
  try {
    const leagueId = process.env.SLEEPER_LEAGUE_ID!;
    const season = process.env.SLEEPER_SEASON ?? '2024';
    const [league, users, rosters] = await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getUsers(leagueId),
      sleeper.getRosters(leagueId),
    ]);
    const currentWeek = league.settings?.leg ?? 1;
    const standings = buildStandings(rosters, users);
    return NextResponse.json({ league, users, rosters, standings, currentWeek, season });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
