'use client';
import { useState } from 'react';
import { useLeague } from '@/hooks/useLeague';
import { SectionHeader, AIContentLoader, TeamAvatar, Spinner } from '@/components/ui';

export default function FranchisePage() {
  const { standings, league, isLoading, error } = useLeague();
  const [selected, setSelected] = useState<string | null>(null);

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>;
  if (error) return <div style={{ color:'#f87171', padding:20 }}>Error: {error}</div>;

  const selectedTeam = standings.find(t => t.name === selected);

  return (
    <div>
      <SectionHeader title="Franchise Directory" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:24 }}>
        {standings.map(t => (
          <div key={t.roster_id} onClick={() => setSelected(t.name)}
            style={{ background:'linear-gradient(135deg,#001f5b,#1f2d42)', border:`1px solid ${selected===t.name?'rgba(245,166,35,0.5)':'var(--border)'}`, borderRadius:8, padding:14, cursor:'pointer', transition:'border-color .15s' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <TeamAvatar team={t} size={42} />
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:800, lineHeight:1.1 }}>{t.name}</div>
                <div style={{ fontSize:10, color:'var(--muted)' }}>{t.manager}</div>
              </div>
            </div>
            {[['Record', `${t.wins}-${t.losses}`],['Points For', t.pf.toFixed(1)],['Rank', `#${t.rank}`],['Playoffs', `${t.playoffOdds}%`]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                <span style={{ color:'var(--muted)' }}>{l}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedTeam && (
        <div>
          <div style={{ background:'linear-gradient(135deg,#001f5b,#1f2d42)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
              <TeamAvatar team={selectedTeam} size={60} />
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:900 }}>{selectedTeam.name}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>Managed by {selectedTeam.manager}</div>
                <div style={{ fontSize:11, color:'var(--espn-gold)', fontWeight:600, marginTop:3 }}>{league?.name}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
              {[['Record',`${selectedTeam.wins}-${selectedTeam.losses}`],['Points For',selectedTeam.pf.toFixed(1)],['Points Against',selectedTeam.pa.toFixed(1)],['Rank',`#${selectedTeam.rank}`],['PPG',selectedTeam.avgPpg.toFixed(1)],['Luck',`${selectedTeam.luckScore>0?'+':''}${selectedTeam.luckScore}`]].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.5px' }}>{l}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <SectionHeader title="Franchise Profile" badge="AI" badgeColor="gold" />
          <AIContentLoader key={selectedTeam.name} type="franchise" params={{ teamName: selectedTeam.name }} label="FIN FRANCHISE PROFILE" />
        </div>
      )}
    </div>
  );
}
