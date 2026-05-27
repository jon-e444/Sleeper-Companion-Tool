'use client';
import { useState } from 'react';
import { useLeague } from '@/hooks/useLeague';
import { SectionHeader, AIContentLoader, Spinner } from '@/components/ui';
import { PERSONAS } from '@/lib/personas';

type Category = 'all' | 'insider' | 'analytics' | 'hottake';

export default function MediaPage() {
  const { standings, currentWeek, isLoading, error } = useLeague();
  const [cat, setCat] = useState<Category>('all');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>;
  if (error) return <div style={{ color:'#f87171', padding:20 }}>Error: {error}</div>;

  const top = standings[0], bot = standings[standings.length - 1];
  const unlucky = [...standings].sort((a,b) => b.luckScore - a.luckScore)[0];

  const newsItems = [
    { p:'anchor', cat:'insider' as Category, hl:`${top?.name} Extends Lead With Dominant Week ${currentWeek}`, sn:`At ${top?.wins}-${top?.losses} with ${top?.pf.toFixed(1)} total PF, ${top?.name} has separated from the field.` },
    { p:'hottak', cat:'hottake' as Category, hl:`I'll Say It: ${bot?.name} Is The Biggest Fraud In League History`, sn:`${bot?.wins}-${bot?.losses} is not a record. It's a crisis. I have receipts.` },
    ...(unlucky ? [{ p:'analyst', cat:'analytics' as Category, hl:`Statistical Anomaly: ${unlucky.name} Has The Points But Not The Wins`, sn:`${unlucky.pf.toFixed(1)} PF with only ${unlucky.wins} wins. Luck score: +${unlucky.luckScore}. Regression incoming.` }] : []),
    { p:'reporter', cat:'insider' as Category, hl:`SOURCES: Trade Talks Heating Up Ahead Of Deadline`, sn:`Multiple league sources tell FIN that at least two significant deals are under serious discussion.` },
    { p:'chaos', cat:'hottake' as Category, hl:`Chaos Report: This League Is Two Bad Beats From Complete Implosion`, sn:`Three teams are mathematically alive for the final playoff spot. FIN is here for all of it.` },
    { p:'exjock', cat:'insider' as Category, hl:`Big Ray's Film Room: Two Teams Are Playing Not To Lose`, sn:`I looked at the tape. You can see it in the lineups. No killer instinct. And it'll cost them.` },
    { p:'analyst', cat:'analytics' as Category, hl:`Expected Wins Model Shows Major Outliers In Week ${currentWeek}`, sn:`Three teams have records more than 2 games above or below expectation. Someone's due for regression.` },
  ];

  const filtered = cat === 'all' ? newsItems : newsItems.filter(i => i.cat === cat);
  const tabStyle = (t: Category) => ({
    fontFamily:'var(--font-display)', fontSize:11, fontWeight:700, padding:'5px 10px',
    background: cat === t ? 'var(--espn-red)' : 'var(--surface-2)',
    border:`1px solid ${cat===t?'var(--espn-red)':'var(--border)'}`,
    color: cat === t ? '#fff' : 'var(--muted)', cursor:'pointer', borderRadius:4,
  } as React.CSSProperties);

  return (
    <div>
      <SectionHeader title="Media Feed" badge="BREAKING" />
      <div style={{ display:'flex', gap:4, marginBottom:14, flexWrap:'wrap' }}>
        {(['all','insider','analytics','hottake'] as Category[]).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setCat(t)}>{t.toUpperCase()}</button>
        ))}
      </div>
      {filtered.map((item, i) => {
        const persona = PERSONAS[item.p];
        return (
          <div key={i} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)', display:'flex', gap:10 }}>
            <div className={persona.colorClass} style={{ width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
              {persona.icon}
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--muted)', fontWeight:600 }}>
                <span style={{ color:'var(--espn-gold)' }}>{persona.name}</span> · {persona.role}
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, lineHeight:1.3, color:'#fff' }}>{item.hl}</div>
              <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.5, marginTop:2 }}>{item.sn}</div>
            </div>
          </div>
        );
      })}
      <div style={{ marginTop:16 }}>
        <SectionHeader title="Generate Team Story" />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {standings.slice(0,6).map(t => (
            <button key={t.roster_id} onClick={() => setSelectedTeam(t.name)}
              style={{ background:'var(--surface-2)', border:`1px solid ${selectedTeam===t.name?'var(--espn-red)':'var(--border)'}`, color:'var(--text)', fontSize:11, padding:'5px 9px', borderRadius:4, cursor:'pointer' }}>
              {t.name}
            </button>
          ))}
        </div>
        {selectedTeam && (
          <AIContentLoader key={selectedTeam} type="teamStory" params={{ teamName: selectedTeam, personaId: 'reporter' }} label="TEAM STORY" personaName="Adrian Vazquez" />
        )}
      </div>
    </div>
  );
}
