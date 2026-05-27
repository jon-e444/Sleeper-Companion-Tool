'use client';
import { useLeague } from '@/hooks/useLeague';
import { SectionHeader, AIContentLoader, Spinner } from '@/components/ui';

export default function PodcastPage() {
  const { league, currentWeek, isLoading } = useLeague();
  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>;
  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#001f5b,#1a2233)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:14 }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:19, fontWeight:800, marginBottom:3 }}>Fantasy Insider Network Podcast</div>
        <div style={{ fontSize:11, color:'var(--espn-gold)', fontWeight:600, marginBottom:14 }}>EP. {currentWeek} · WEEK {currentWeek} · {league?.name ?? 'Your League'}</div>
        <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
          Full AI-generated episode script below. Each segment is written in the distinct voice of each FIN personality.
          Copy the script into your TTS tool or podcast software to generate audio.
        </div>
      </div>
      <SectionHeader title="Episode Script" badge="AI" badgeColor="gold" />
      <AIContentLoader type="podcast" label={`WEEK ${currentWeek} EPISODE SCRIPT`} />
    </div>
  );
}
