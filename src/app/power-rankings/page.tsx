import { sleeper } from '@/lib/sleeper';
import { buildStandings } from '@/lib/standings';
import { SectionHeader, AIContentLoader, TeamAvatar } from '@/components/ui';

export default async function PowerRankingsPage() {
  const id = process.env.SLEEPER_LEAGUE_ID!;
  const league = await sleeper.getLeague(id);
  const [users, rosters] = await Promise.all([sleeper.getUsers(id), sleeper.getRosters(id)]);
  const standings = buildStandings(rosters, users);
  const week = league.settings?.leg ?? 1;

  return (
    <div>
      <SectionHeader title="Power Rankings" badge={`WEEK ${week}`} />
      {standings.map((t, i) => (
        <div key={t.roster_id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', display: 'grid', gridTemplateColumns: '24px 36px 1fr auto auto', alignItems: 'center', gap: 10, marginBottom: 7 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 900, color: i < 3 ? 'var(--espn-gold)' : 'var(--muted)', textAlign: 'center' }}>{i+1}</div>
          <TeamAvatar team={t} size={34} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.wins}-{t.losses} · {t.manager}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>
            <div style={{ color: t.luckScore < 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{t.luckScore > 0 ? '+' : ''}{t.luckScore} luck</div>
            <div>{t.playoffOdds}% playoffs</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>{t.avgPpg.toFixed(1)}</div>
        </div>
      ))}
      <SectionHeader title="Power Rankings Analysis" badge="AI" badgeColor="gold" />
      <AIContentLoader type="powerRankings" label="SKIP MORALES — HOT TAKES" personaName="Skip Morales" />
    </div>
  );
}
