import { sleeper } from '@/lib/sleeper';
import { buildStandings } from '@/lib/standings';
import { SectionHeader, AIContentLoader, TeamAvatar } from '@/components/ui';

export default async function StandingsPage() {
  const id = process.env.SLEEPER_LEAGUE_ID!;
  const [users, rosters] = await Promise.all([sleeper.getUsers(id), sleeper.getRosters(id)]);
  const standings = buildStandings(rosters, users);
  const cutoff = Math.floor(standings.length / 2);

  return (
    <div>
      <SectionHeader title="League Standings" />
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['TEAM','W-L','PF','PA','DIFF','PPG','LUCK'].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.7px', color: 'var(--muted)', padding: '7px 10px', textAlign: h === 'TEAM' ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((t, i) => (
              <tr key={t.roster_id} style={{ borderTop: i === cutoff ? '2px solid var(--espn-gold)' : undefined, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '9px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TeamAvatar team={t} size={28} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12 }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{t.manager}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right', padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>{t.wins}-{t.losses}</td>
                <td style={{ textAlign: 'right', padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--espn-gold)' }}>{t.pf.toFixed(1)}</td>
                <td style={{ textAlign: 'right', padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{t.pa.toFixed(1)}</td>
                <td style={{ textAlign: 'right', padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: (t.pf - t.pa) > 0 ? '#22c55e' : '#ef4444' }}>
                  {(t.pf - t.pa) > 0 ? '+' : ''}{(t.pf - t.pa).toFixed(1)}
                </td>
                <td style={{ textAlign: 'right', padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{t.avgPpg.toFixed(1)}</td>
                <td style={{ textAlign: 'right', padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: t.luckScore < 0 ? '#22c55e' : t.luckScore > 0 ? '#ef4444' : 'var(--muted)' }}>
                  {t.luckScore > 0 ? '+' : ''}{t.luckScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 18 }}>— Gold line = playoff cutoff · Luck = actual wins minus expected wins</div>
      <SectionHeader title="Standings Analysis" badge="AI" badgeColor="gold" />
      <AIContentLoader type="standings" label="DR. KEVIN PARK — ANALYTICS" personaName="Dr. Kevin Park" />
    </div>
  );
}
