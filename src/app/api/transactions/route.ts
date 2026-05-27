import { NextResponse } from 'next/server';
import { sleeper } from '@/lib/sleeper';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = process.env.SLEEPER_LEAGUE_ID!;
    const league = await sleeper.getLeague(leagueId);
    const week = parseInt(searchParams.get('week') ?? String(league.settings?.leg ?? 1));
    const transactions = await sleeper.getTransactions(leagueId, week);
    return NextResponse.json({ transactions, week });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
