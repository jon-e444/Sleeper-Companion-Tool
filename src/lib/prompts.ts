import type { TeamStanding, MatchupPair } from '@/types';

export function leagueContext(
  leagueName: string,
  season: string,
  week: number,
  standings: TeamStanding[]
): string {
  const top3 = standings.slice(0, 3).map(t => `${t.name}(${t.wins}-${t.losses},${t.pf.toFixed(1)}PF)`).join(', ');
  const bot2 = standings.slice(-2).map(t => `${t.name}(${t.wins}-${t.losses},${t.pf.toFixed(1)}PF)`).join(', ');
  return `League:"${leagueName}" Season:${season} Week:${week} Teams:${standings.length} Leaders:${top3} Bottom:${bot2}`;
}

export function teamContext(t: TeamStanding): string {
  return `${t.name}(manager:${t.manager}, ${t.wins}-${t.losses}, ${t.pf.toFixed(1)}PF, ${t.pa.toFixed(1)}PA, rank:#${t.rank}, luck:${t.luckScore > 0 ? '+' : ''}${t.luckScore}, avgPPG:${t.avgPpg.toFixed(1)})`;
}

export function topStoryPrompt(ctx: string, week: number, top: TeamStanding, matchup: MatchupPair | undefined): string {
  return `${ctx}

Write a 3-paragraph Week ${week} top story as Michelle Carter.
P1: The biggest single storyline — ${teamContext(top)}'s dominance or a challenge to it.
P2: Breakdown of ${matchup ? `${matchup.teamA.name} vs ${matchup.teamB.name}` : 'the marquee matchup'} and what's at stake.
P3: Playoff picture — who's in, who's on the bubble, who's done.
Be specific to the real team names and records. Treat fantasy like real sports.`;
}

export function matchupRecapPrompt(ctx: string, week: number, mp: MatchupPair): string {
  return `${ctx}

Write a 2-paragraph SportsCenter-style matchup recap.
${teamContext(mp.teamA)} vs ${teamContext(mp.teamB)}
Week ${week} score: ${mp.scoreA.toFixed(1)} — ${mp.scoreB.toFixed(1)}
P1: How this game unfolded, who won and why, key moments.
P2: What this result means — playoff implications, momentum, records.
Dramatic. Specific. Treat it like a critical NFL game.`;
}

export function powerRankingsPrompt(ctx: string, standings: TeamStanding[]): string {
  const top = standings.slice(0, 3).map(teamContext).join('\n');
  const bot = standings.slice(-3).map(teamContext).join('\n');
  return `${ctx}

As Skip Morales, write weekly power rankings commentary — 3 short punchy paragraphs:
1. One OVERRATED top team (and why they'll collapse)
2. One UNDERRATED bottom team (sleeper pick)
3. Your championship guarantee AND your guaranteed playoff choke
Top teams:\n${top}\nBottom teams:\n${bot}
Be controversial. Reference their real records. Sound certain.`;
}

export function podcastScriptPrompt(ctx: string, week: number, standings: TeamStanding[], matchups: MatchupPair[]): string {
  const top = standings.slice(0, 2).map(t => `${t.name}(${t.wins}-${t.losses})`).join(', ');
  const bot = standings.slice(-2).map(t => `${t.name}(${t.wins}-${t.losses})`).join(', ');
  const featuredMatchup = matchups[0];
  return `${ctx}

Write a complete 5-minute podcast episode script for "Fantasy Insider Network" Week ${week}.
Hosts: Michelle Carter (anchor), Skip Morales (hot takes), Dr. Kevin Park (analytics), Adrian Vazquez (reporter).

Use these exact segment labels on their own line:
[COLD OPEN]
[OPENING HEADLINES]
[BIGGEST STORY]
[MATCHUP BREAKDOWN]
[FRAUD WATCH]
[TRADE RUMORS]
[PLAYOFF IMPLICATIONS]
[DEBATE]
[PREDICTIONS]
[SIGN OFF]

Featured matchup: ${featuredMatchup ? `${featuredMatchup.teamA.name} vs ${featuredMatchup.teamB.name}` : 'TBD'}
Top teams: ${top}
Struggling: ${bot}

Write full dialogue. Each host speaks in their distinct voice. Specific to real team names.
Make it entertaining — arguments, laughs, drama, strong takes.`;
}

export function debatePrompt(ctx: string, topic: string, personaName: string, side: 'for' | 'against'): string {
  return `${ctx}

Debate topic: "${topic}"
As ${personaName}, argue ${side === 'for' ? 'FOR this position' : 'AGAINST this position'} in 3-4 sentences.
Stay fully in character. Reference specific team names, records, or stats from the league.
Be direct. No hedging.`;
}

export function tradeReportPrompt(ctx: string, standings: TeamStanding[]): string {
  const buyers = standings.slice(0, 3).map(t => t.name).join(', ');
  const sellers = standings.slice(-3).map(t => t.name).join(', ');
  return `${ctx}

As Adrian Vazquez, write a 3-paragraph trade deadline report:
P1: Invent 2 specific plausible trades between teams in this league (use their real names). Include the players/picks involved.
P2: Buyers (${buyers}) vs sellers (${sellers}) — who needs to move and why.
P3: Your blockbuster rumor — one dream deal that sources say "has been discussed".
Use "league sources tell FIN" style. Be dramatic. Be specific.`;
}

export function franchiseProfilePrompt(ctx: string, team: TeamStanding): string {
  return `${ctx}

Write a full ESPN/Athletic-style franchise profile for ${team.name} (managed by ${team.manager}).
Stats: ${teamContext(team)}

Structure (4 paragraphs):
P1: Current season narrative — are they a contender, dynasty, fraud, rebuilder, or cursed franchise?
P2: Their biggest storyline this season — the defining moment or ongoing crisis.
P3: Playoff odds and the exact scenario they need. What must happen in the remaining weeks.
P4: Bold prediction for how their season ends. Championship window open or closing?

Write with genuine sports journalism quality. Specific. Vivid. No generic filler.`;
}

export function analyticsReportPrompt(ctx: string, standings: TeamStanding[]): string {
  const sorted = [...standings].sort((a, b) => b.luckScore - a.luckScore);
  const unlucky = sorted[0];
  const lucky = sorted[sorted.length - 1];
  return `${ctx}

As Dr. Kevin Park, write a 3-paragraph weekly analytics report:
P1: The most UNLUCKY team — ${teamContext(unlucky)}. Why their record doesn't reflect their true quality.
P2: The most LUCKY/overperforming team — ${teamContext(lucky)}. The regression that is coming.
P3: One bold statistical prediction for the rest of the season, backed by the numbers.
Use actual numbers. Reference luck scores, PPG, efficiency. Be analytical but readable.`;
}
