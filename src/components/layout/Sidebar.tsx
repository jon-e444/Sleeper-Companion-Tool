import { sleeper } from '@/lib/sleeper';
import { buildStandings } from '@/lib/standings';
import { TeamAvatar } from '@/components/ui';

async function getData() {
  try {
    const id = process.env.SLEEPER_LEAGUE_ID!;
    const [league, users, rosters] = await Promise.all([
      sleeper.getLeague(id), sleeper.getUsers(id), sleeper.getRosters(id),
    ]);
    return { league, standings: buildStandings(rosters, users), week: league.settings?.leg ?? 1 };
  } catch { return null; }
}

export async function Sidebar() {
  const data = await getData();

  if (!data) return (
    <aside style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', padding: '40px 16px', textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🏈</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>Configure SLEEPER_LEAGUE_ID<br />in .env.local</div>
    </aside>
  );

  const { standings, week } = data;
  const top = standings[0], bot = standings[standings.length - 1];
  const cutoff = Math.floor(standings.length / 2);

  const awards = [
    { e: '🏆', label: 'League Leader', name: top?.name ?? '—', stat: `${top?.wins}-${top?.losses} · ${top?.pf.toFixed(1)} PF` },
    { e: '💀', label: 'On Hot Seat', name: bot?.name ?? '—', stat: `${bot?.wins}-${bot?.losses} record` },
    { e: '🍀', label: 'Luckiest', name: standings.slice().sort((a,b) => a.luckScore - b.luckScore)[0]?.name ?? '—', stat: 'Overperforming record' },
    { e: '⚡', label: 'Highest Scorer', name: standings.slice().sort((a,b) => b.avgPpg - a.avgPpg)[0]?.name ?? '—', stat: `${standings.slice().sort((a,b) => b.avgPpg - a.avgPpg)[0]?.avgPpg.toFixed(1)} avg PPG` },
  ];

  return (
    <aside style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', overflowY: 'auto' }}>
      {/* Awards */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: '12px 14px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
          Week {week} Awards
        </div>
        {awards.map(a => (
          <div key={a.label} style={{ background: 'var(--surface-3)', borderRadius: 5, padding: '8px 10px', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{a.e}</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{a.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{a.name}</div>
              <div style={{ fontSize: 10, color: 'var(--espn-gold)' }}>{a.stat}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Top 3 */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: '12px 14px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
          Top 3
        </div>
        {standings.slice(0, 3).map((t, i) => (
          <div key={t.roster_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: ['#f5a623','#a8b0bc','#cd7f32'][i], width: 18 }}>{i+1}</span>
            <TeamAvatar team={t} size={28} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 11 }}>{t.name}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{t.wins}-{t.losses} · {t.pf.toFixed(0)}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Playoff Odds */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: '12px 14px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
          Playoff Race
        </div>
        {standings.map((t, i) => {
          const col = t.playoffOdds >= 65 ? '#22c55e' : t.playoffOdds >= 35 ? '#f59e0b' : '#ef4444';
          return (
            <div key={t.roster_id} style={{ marginBottom: 8 }}>
              {i === cutoff && <div style={{ borderTop: '2px solid var(--espn-gold)', marginBottom: 8 }} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{t.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: col, flexShrink: 0 }}>{t.playoffOdds}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${t.playoffOdds}%`, background: col, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </section>

      {/* Hot Seat */}
      <section style={{ padding: '12px 14px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
          🔥 Hot Seat
        </div>
        {[...standings].reverse().slice(0, 4).map((t, i) => (
          <div key={t.roster_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11 }}>{['🔥🔥🔥','🔥🔥🔥','🔥🔥','🔥'][i]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{t.manager}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name} · {t.wins}-{t.losses}</div>
            </div>
          </div>
        ))}
      </section>
    </aside>
  );
}
