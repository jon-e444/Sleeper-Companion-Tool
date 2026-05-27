'use client';
import type { MatchupPair } from '@/types';
import { TeamAvatar, StorylineTags } from '@/components/ui';

export function MatchupCard({ mp }: { mp: MatchupPair }) {
  const aWins = mp.scoreA > mp.scoreB;
  const hasScores = mp.scoreA > 0 || mp.scoreB > 0;
  const scoreColor = (winning: boolean) => hasScores ? (winning ? '#fff' : 'var(--muted)') : 'var(--espn-gold)';
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ background: 'var(--surface-3)', padding: '7px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: 'var(--muted)' }}>
        <span>MATCHUP #{mp.matchup_id}</span>
        {hasScores ? <span style={{ color: '#cc0000' }}>● LIVE</span> : <span style={{ color: 'var(--espn-gold)' }}>PROJECTED</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: 14, gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamAvatar team={mp.teamA} size={32} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>{mp.teamA.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{mp.teamA.wins}-{mp.teamA.losses} · #{mp.teamA.rank}</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: scoreColor(aWins) }}>{mp.scoreA.toFixed(1)}</div>
          <div style={{ color: 'var(--muted)', fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 900 }}>—</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: scoreColor(!aWins) }}>{mp.scoreB.toFixed(1)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>{mp.teamB.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{mp.teamB.wins}-{mp.teamB.losses} · #{mp.teamB.rank}</div>
          </div>
          <TeamAvatar team={mp.teamB} size={32} />
        </div>
      </div>
      {mp.tags.length > 0 && <div style={{ padding: '7px 14px', borderTop: '1px solid var(--border)' }}><StorylineTags tags={mp.tags} /></div>}
    </div>
  );
}
