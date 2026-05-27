import { sleeper } from '@/lib/sleeper';
import { buildStandings } from '@/lib/standings';

async function getTickerData() {
  try {
    const leagueId = process.env.SLEEPER_LEAGUE_ID!;
    const [league, users, rosters] = await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getUsers(leagueId),
      sleeper.getRosters(leagueId),
    ]);
    const standings = buildStandings(rosters, users);
    const week = league.settings?.leg ?? 1;
    return { league, standings, week };
  } catch {
    return null;
  }
}

export async function TopBar() {
  const data = await getTickerData();
  const items = data
    ? [
        ...data.standings.slice(0, 6).map(t => `${t.name.toUpperCase()} ${t.wins}-${t.losses}`),
        `${data.league.name.toUpperCase()} · WEEK ${data.week}`,
      ]
    : ['FANTASY INSIDER NETWORK', 'SLEEPER · AI COVERAGE', 'LIVE STANDINGS'];

  const doubled = [...items, ...items];

  return (
    <div style={{
      background: 'var(--espn-red)', padding: '6px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
    }}>
      <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-1px', whiteSpace: 'nowrap' }}>
        ⚡ FIN
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <style>{`
          @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .ticker { display: flex; gap: 32px; animation: tickerScroll 50s linear infinite; white-space: nowrap; }
          .ticker-item { color: rgba(255,255,255,0.85); }
          .ticker-sep { color: rgba(255,255,255,0.3); margin: 0 8px; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="ticker">
          {doubled.map((item, i) => (
            <span key={i} className="ticker-item">
              {item}<span className="ticker-sep">|</span>
            </span>
          ))}
        </div>
      </div>
      {data && (
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
          WEEK {data.week}
        </span>
      )}
    </div>
  );
}
