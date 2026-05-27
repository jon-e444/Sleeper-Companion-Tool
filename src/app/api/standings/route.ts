import { NextResponse } from 'next/server';
import { sleeper } from '@/lib/sleeper';
import { buildStandings } from '@/lib/standings';

export async function GET() {
  try {
    const leagueId = process.env.SLEEPER_LEAGUE_ID!;
    const [users, rosters] = await Promise.all([
      sleeper.getUsers(leagueId),
      sleeper.getRosters(leagueId),
    ]);
    return NextResponse.json({ standings: buildStandings(rosters, users) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
