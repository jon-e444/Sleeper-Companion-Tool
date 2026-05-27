'use client';
import { useMatchups } from '@/hooks/useLeague';
import { SectionHeader, AIContentLoader, Spinner } from '@/components/ui';
import { MatchupCard } from '@/components/pages/MatchupCard';
import type { MatchupPair } from '@/types';

export default function MatchupsPage() {
  const { matchups, week, isLoading, error } = useMatchups();
  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding: 60 }}><Spinner size={32} /></div>;
  if (error) return <div style={{ color: '#f87171', padding: 20 }}>Error: {error}</div>;
  return (
    <div>
      <SectionHeader title={`Week ${week} Matchups`} badge="FULL COVERAGE" />
      {matchups.map((mp: MatchupPair) => <MatchupCard key={mp.matchup_id} mp={mp} />)}
      <SectionHeader title="SportsCenter Recaps" badge="AI" badgeColor="gold" />
      {matchups.map((mp: MatchupPair) => (
        <AIContentLoader key={mp.matchup_id} type="matchupRecap" params={{ matchup: mp }} label={`RECAP — ${mp.teamA.name} vs ${mp.teamB.name}`} personaName="Michelle Carter" />
      ))}
    </div>
  );
}
