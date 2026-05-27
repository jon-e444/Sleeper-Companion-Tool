'use client';
import { useLeague } from '@/hooks/useLeague';
import { SectionHeader, AIContentLoader, Spinner } from '@/components/ui';
import { PERSONAS } from '@/lib/personas';

export default function DebatePage() {
  const { standings, isLoading, error } = useLeague();
  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>;
  if (error) return <div style={{ color:'#f87171', padding:20 }}>Error: {error}</div>;

  const top = standings[0];
  const bot = standings[standings.length - 1];

  const debates = [
    { topic: `Is ${top?.name ?? 'the leader'} a legitimate title contender or the biggest fraud in league history?`, aId:'hottak', bId:'analyst' },
    { topic: `Should ${bot?.name ?? 'last place'} be officially declared a tanking operation?`, aId:'chaos', bId:'anchor' },
    { topic: `Who's the most dangerous team entering the playoff stretch?`, aId:'exjock', bId:'hottak' },
  ];

  return (
    <div>
      <SectionHeader title="First Take: Fantasy Edition" badge="DEBATE" />
      {debates.map((d, i) => (
        <div key={i} style={{ marginBottom:20 }}>
          <div style={{ background:'var(--espn-red)', color:'#fff', fontFamily:'var(--font-display)', fontSize:14, fontWeight:800, padding:'10px 14px', letterSpacing:'0.5px', textTransform:'uppercase', borderRadius:'6px 6px 0 0' }}>
            {d.topic}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', border:'1px solid var(--border)', borderTop:'none', borderRadius:'0 0 6px 6px', overflow:'hidden' }}>
            <div style={{ padding:13, background:'rgba(239,68,68,0.07)', borderRight:'1px solid var(--border)' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:'var(--espn-gold)', marginBottom:5 }}>{PERSONAS[d.aId]?.name}</div>
              <AIContentLoader type="debate" params={{ topic: d.topic, personaId: d.aId, side: 'for' }} label={`${PERSONAS[d.aId]?.name} — FOR`} />
            </div>
            <div style={{ padding:13, background:'rgba(59,130,246,0.07)' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:'var(--espn-gold)', marginBottom:5 }}>{PERSONAS[d.bId]?.name}</div>
              <AIContentLoader type="debate" params={{ topic: d.topic, personaId: d.bId, side: 'against' }} label={`${PERSONAS[d.bId]?.name} — AGAINST`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
