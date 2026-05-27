'use client';
import { useState } from 'react';
import { useLeague } from '@/hooks/useLeague';
import { SectionHeader, AIContentLoader, TeamAvatar, Spinner } from '@/components/ui';

type Tab = 'luck' | 'efficiency' | 'hotseat';

export default function AnalyticsPage() {
  const { standings, isLoading, error } = useLeague();
  const [tab, setTab] = useState<Tab>('luck');

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>;
  if (error) return <div style={{ color:'#f87171', padding:20 }}>Error: {error}</div>;

  const tabStyle = (t: Tab) => ({
    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, padding: '5px 10px',
    background: tab === t ? 'var(--espn-red)' : 'var(--surface-2)',
    border: `1px solid ${tab === t ? 'var(--espn-red)' : 'var(--border)'}`,
    color: tab === t ? '#fff' : 'var(--muted)', cursor: 'pointer', borderRadius: 4,
  } as React.CSSProperties);

  return (
    <div>
      <SectionHeader title="Advanced Analytics" />
      <div style={{ display:'flex', gap:4, marginBottom:14, flexWrap:'wrap' }}>
        {(['luck','efficiency','hotseat'] as Tab[]).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t === 'luck' ? 'LUCK INDEX' : t === 'efficiency' ? 'EFFICIENCY' : 'HOT SEAT'}
          </button>
        ))}
      </div>

      {tab === 'luck' && (
        <div>
          <p style={{ fontSize:11, color:'var(--muted)', marginBottom:12 }}>Luck Index = actual wins minus expected wins based on points for vs against. Positive = lucky, negative = unlucky.</p>
          {standings.map(t => {
            const bar = Math.min(100, Math.abs(t.luckScore) * 25 + 50);
            const col = t.luckScore < 0 ? '#22c55e' : '#ef4444';
            return (
              <div key={t.roster_id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                <TeamAvatar team={t} size={28} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:12, marginBottom:3 }}>{t.name}</div>
                  <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${bar}%`, background:col, borderRadius:3 }} />
                  </div>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600, color:col, minWidth:32, textAlign:'right' }}>{t.luckScore > 0 ? '+' : ''}{t.luckScore}</div>
                <div style={{ fontSize:10, color:'var(--muted)', minWidth:60, textAlign:'right' }}>{t.luckScore < -1 ? '🍀 Lucky' : t.luckScore > 1 ? '💀 Unlucky' : '⚖️ Fair'}</div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'efficiency' && (
        <div>
          {standings.map(t => {
            const pct = Math.min(100, (t.avgPpg / 160) * 100);
            return (
              <div key={t.roster_id} style={{ padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:12, fontWeight:600 }}>{t.name}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--espn-gold)' }}>{t.avgPpg.toFixed(1)} ppg</span>
                </div>
                <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:'#3b82f6', borderRadius:3 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'hotseat' && (
        <div>
          {[...standings].reverse().slice(0, 6).map((t, i) => (
            <div key={t.roster_id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:14 }}>{['🔥🔥🔥','🔥🔥🔥','🔥🔥','🔥🔥','🔥','🔥'][i]}</span>
              <TeamAvatar team={t} size={30} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700 }}>{t.manager}</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>{t.name} · {t.wins}-{t.losses} · {t.pf.toFixed(1)} PF</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop:20 }}>
        <SectionHeader title="Analytics Deep Dive" badge="AI" badgeColor="gold" />
        <AIContentLoader type="analytics" label="DR. KEVIN PARK" personaName="Dr. Kevin Park" />
      </div>
    </div>
  );
}
