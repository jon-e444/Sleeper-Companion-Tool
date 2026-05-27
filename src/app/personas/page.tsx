'use client';
import { useState } from 'react';
import { PERSONA_LIST } from '@/lib/personas';
import { SectionHeader, AIContentLoader } from '@/components/ui';

export default function PersonasPage() {
  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});
  const refresh = (id: string) => setRefreshKeys(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  return (
    <div>
      <SectionHeader title="FIN Media Personalities" />
      {PERSONA_LIST.map(p => (
        <div key={p.id} style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, marginBottom:14, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'var(--surface-3)', borderBottom:'1px solid var(--border)' }}>
            <div className={`persona-${p.colorClass.replace('persona-','')}`} style={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, flexShrink:0 }}>
              {p.icon}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:800, color:'#fff' }}>{p.name}</div>
              <div style={{ fontSize:10, color:'var(--muted)', fontWeight:600 }}>{p.role}</div>
              <div style={{ fontSize:10, color:'var(--espn-gold)', fontStyle:'italic' }}>{p.catchphrase}</div>
            </div>
            <button onClick={() => refresh(p.id)} style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)', fontSize:11, padding:'5px 10px', borderRadius:4, cursor:'pointer' }}>
              ↻ Refresh
            </button>
          </div>
          <div style={{ padding:'12px 14px' }}>
            <AIContentLoader
              key={refreshKeys[p.id] ?? 0}
              type="personaTake"
              params={{ personaId: p.id }}
              label={p.name}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
