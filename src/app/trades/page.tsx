import { sleeper } from '@/lib/sleeper';
import { buildStandings } from '@/lib/standings';
import { SectionHeader, AIContentLoader } from '@/components/ui';

export default async function TradesPage() {
  const id = process.env.SLEEPER_LEAGUE_ID!;
  const league = await sleeper.getLeague(id);
  const week = league.settings?.leg ?? 1;
  const [users, rosters, transactions] = await Promise.all([
    sleeper.getUsers(id), sleeper.getRosters(id), sleeper.getTransactions(id, week),
  ]);
  const standings = buildStandings(rosters, users);
  const rMap = new Map(standings.map(s => [s.roster_id, s]));
  const trades = transactions.filter(t => t.type === 'trade');
  const waivers = transactions.filter(t => t.type === 'waiver' || t.type === 'free_agent');

  return (
    <div>
      <SectionHeader title="Trade Tracker" badge={`WEEK ${week}`} />
      {trades.length > 0 ? trades.map(t => {
        const t1 = rMap.get(t.roster_ids?.[0]);
        const t2 = rMap.get(t.roster_ids?.[1]);
        const adds1 = Object.entries(t.adds ?? {}).filter(([,v]) => v === t.roster_ids?.[0]).map(([k]) => k);
        const adds2 = Object.entries(t.adds ?? {}).filter(([,v]) => v === t.roster_ids?.[1]).map(([k]) => k);
        return (
          <div key={t.transaction_id} style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:7, marginBottom:10, overflow:'hidden' }}>
            <div style={{ background:'var(--surface-3)', padding:'7px 12px', fontFamily:'var(--font-display)', fontSize:11, fontWeight:700, letterSpacing:'0.5px', color:'var(--muted)', display:'flex', justifyContent:'space-between' }}>
              <span>TRADE</span><span>{new Date(t.created).toLocaleDateString()}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 32px 1fr' }}>
              <div style={{ padding:'10px 12px', borderRight:'1px solid var(--border)' }}>
                <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', color:'var(--muted)', marginBottom:4 }}>Receives</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, marginBottom:4 }}>{t1?.name ?? `Roster ${t.roster_ids?.[0]}`}</div>
                {adds1.map(p => <div key={p} style={{ fontSize:11, color:'var(--text)', padding:'2px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{p.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>)}
                {adds1.length === 0 && <div style={{ fontSize:11, color:'var(--muted)' }}>Draft pick(s)</div>}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'var(--espn-gold)', fontSize:16 }}>⇄</div>
              <div style={{ padding:'10px 12px' }}>
                <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', color:'var(--muted)', marginBottom:4 }}>Receives</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, marginBottom:4 }}>{t2?.name ?? `Roster ${t.roster_ids?.[1]}`}</div>
                {adds2.map(p => <div key={p} style={{ fontSize:11, color:'var(--text)', padding:'2px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{p.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>)}
                {adds2.length === 0 && <div style={{ fontSize:11, color:'var(--muted)' }}>Draft pick(s)</div>}
              </div>
            </div>
          </div>
        );
      }) : (
        <div style={{ color:'var(--muted)', fontSize:13, padding:'8px 0', marginBottom:14 }}>No trades recorded for Week {week}. The deadline looms.</div>
      )}

      <SectionHeader title="Waiver Moves" />
      {waivers.length > 0 ? waivers.map(w => (
        <div key={w.transaction_id} style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:5, padding:'9px 12px', marginBottom:7, fontSize:12 }}>
          <span style={{ color:'#22c55e', fontWeight:600 }}>ADD</span>{' '}
          {Object.keys(w.adds ?? {}).join(', ') || 'Unknown'}
          {w.drops && Object.keys(w.drops).length > 0 && (
            <span style={{ color:'var(--muted)' }}> · dropped {Object.keys(w.drops).join(', ')}</span>
          )}
        </div>
      )) : <div style={{ color:'var(--muted)', fontSize:12, padding:'6px 0' }}>No waiver moves this week.</div>}

      <div style={{ marginTop:14 }}>
        <SectionHeader title="Trade Deadline Report" badge="AI" badgeColor="gold" />
        <AIContentLoader type="tradeReport" label="ADRIAN VAZQUEZ — INSIDER" personaName="Adrian Vazquez" />
      </div>
    </div>
  );
}
