import { sleeper } from '@/lib/sleeper';
import { buildStandings, detectStorylines } from '@/lib/standings';
import { SectionHeader, StatCard, AIContentLoader } from '@/components/ui';
import { MatchupCard } from '@/components/pages/MatchupCard';
import type { MatchupPair } from '@/types';

async function getData() {
  const id = process.env.SLEEPER_LEAGUE_ID!;
  const [league, users, rosters] = await Promise.all([
    sleeper.getLeague(id), sleeper.getUsers(id), sleeper.getRosters(id),
  ]);
  const week = league.settings?.leg ?? 1;
  const standings = buildStandings(rosters, users);
  let matchups: MatchupPair[] = [];
  try {
    const raw = await sleeper.getMatchups(id, week);
    const groups = new Map<number, typeof raw>();
    raw.forEach(m => { if (!groups.has(m.matchup_id)) groups.set(m.matchup_id, []); groups.get(m.matchup_id)!.push(m); });
    const rMap = new Map(standings.map(s => [s.roster_id, s]));
    groups.forEach((members, mid) => {
      if (members.length !== 2) return;
      const [a, b] = members;
      const ta = rMap.get(a.roster_id), tb = rMap.get(b.roster_id);
      if (!ta || !tb) return;
      matchups.push({ matchup_id: mid, teamA: ta, teamB: tb, scoreA: a.points ?? 0, scoreB: b.points ?? 0, projA: ta.avgPpg, projB: tb.avgPpg, tags: detectStorylines(ta, tb), isLive: (a.points ?? 0) > 0 });
    });
  } catch {}
  return { league, standings, week, matchups };
}

export default async function DashboardPage() {
  const { league, standings, week, matchups } = await getData();
  const top = standings[0], bot = standings[standings.length - 1];
  return (
    <div>
      <SectionHeader title={`Week ${week} Dashboard`} badge="LIVE" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 18 }}>
        <StatCard label="League Leader" value={top?.name ?? '—'} sub={`${top?.wins}-${top?.losses} · ${top?.pf.toFixed(1)} PF`} />
        <StatCard label="Current Week" value={String(week)} sub={`of ${league.settings?.playoff_week_start ?? 14} reg. season`} variant="warn" />
        <StatCard label="On Hot Seat" value={bot?.name ?? '—'} sub={`${bot?.wins}-${bot?.losses} record`} variant="bad" />
      </div>
      <SectionHeader title="Featured Matchups" />
      {matchups.slice(0, 3).map(mp => <MatchupCard key={mp.matchup_id} mp={mp} />)}
      <SectionHeader title="Top Story" badge="AI" badgeColor="gold" />
      <AIContentLoader type="topStory" label="FIN ANALYSIS" personaName="Michelle Carter" />
    </div>
  );
}
