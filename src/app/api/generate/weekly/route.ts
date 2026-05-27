import { NextResponse } from 'next/server';
import { generateBatch } from '@/lib/ai';
import { cache } from '@/lib/cache';
import { PERSONAS } from '@/lib/personas';
import {
  leagueContext, topStoryPrompt, powerRankingsPrompt,
  podcastScriptPrompt, tradeReportPrompt, analyticsReportPrompt,
} from '@/lib/prompts';
import { sleeper } from '@/lib/sleeper';
import { buildStandings, detectStorylines } from '@/lib/standings';
import type { MatchupPair, WeeklyContent } from '@/types';

// This endpoint generates ALL weekly content in one shot.
// Call it via cron (e.g. every Tuesday morning) or manually.
// Protected by CRON_SECRET header.

export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leagueId = process.env.SLEEPER_LEAGUE_ID!;
    const season = process.env.SLEEPER_SEASON ?? '2024';

    const [league, users, rosters] = await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getUsers(leagueId),
      sleeper.getRosters(leagueId),
    ]);
    const week = league.settings?.leg ?? 1;
    const standings = buildStandings(rosters, users);
    const ctx = leagueContext(league.name, season, week, standings);

    // Load matchups
    let matchups: MatchupPair[] = [];
    try {
      const raw = await sleeper.getMatchups(leagueId, week);
      const groups = new Map<number, typeof raw>();
      raw.forEach(m => { if (!groups.has(m.matchup_id)) groups.set(m.matchup_id, []); groups.get(m.matchup_id)!.push(m); });
      const rMap = new Map(standings.map(s => [s.roster_id, s]));
      groups.forEach((members, mid) => {
        if (members.length !== 2) return;
        const [a, b] = members;
        const ta = rMap.get(a.roster_id), tb = rMap.get(b.roster_id);
        if (!ta || !tb) return;
        matchups.push({ matchup_id: mid, teamA: ta, teamB: tb, scoreA: a.points ?? 0, scoreB: b.points ?? 0, projA: ta.avgPpg, projB: tb.avgPpg, tags: detectStorylines(ta, tb), isLive: false });
      });
    } catch {}

    // Build all prompts
    const items = [
      { key: 'topStory', prompt: topStoryPrompt(ctx, week, standings[0], matchups[0]), system: PERSONAS.anchor.systemPrompt },
      { key: 'powerRankings', prompt: powerRankingsPrompt(ctx, standings), system: PERSONAS.hottak.systemPrompt },
      { key: 'podcast', prompt: podcastScriptPrompt(ctx, week, standings, matchups), maxTokens: 2000 },
      { key: 'tradeReport', prompt: tradeReportPrompt(ctx, standings), system: PERSONAS.reporter.systemPrompt },
      { key: 'analytics', prompt: analyticsReportPrompt(ctx, standings), system: PERSONAS.analyst.systemPrompt },
      // Persona takes
      ...Object.values(PERSONAS).map(p => ({
        key: `persona_${p.id}`,
        prompt: `${ctx}\nAs ${p.name}, give your Week ${week} take on ${standings[0]?.name}. 1 short paragraph. In character.`,
        system: p.systemPrompt,
        maxTokens: 300,
      })),
      // Debates
      { key: 'debate_0_a', prompt: `${ctx}\nDebate: "Is ${standings[0]?.name} a legitimate title contender?"\nAs ${PERSONAS.hottak.name}, argue FOR in 3-4 sentences. In character.`, system: PERSONAS.hottak.systemPrompt, maxTokens: 300 },
      { key: 'debate_0_b', prompt: `${ctx}\nDebate: "Is ${standings[0]?.name} a legitimate title contender?"\nAs ${PERSONAS.analyst.name}, argue AGAINST in 3-4 sentences. In character.`, system: PERSONAS.analyst.systemPrompt, maxTokens: 300 },
    ];

    const results = await generateBatch(items);

    const content: WeeklyContent = {
      week, season, leagueId,
      generatedAt: new Date().toISOString(),
      topStory: results.topStory,
      powerRankingsAnalysis: results.powerRankings,
      podcastScript: results.podcast,
      tradeReport: results.tradeReport,
      analyticsReport: results.analytics,
      personaTakes: Object.fromEntries(
        Object.entries(results)
          .filter(([k]) => k.startsWith('persona_'))
          .map(([k, v]) => [k.replace('persona_', ''), v])
      ),
      debateSegments: [{
        topic: `Is ${standings[0]?.name} a legitimate title contender?`,
        personaA: PERSONAS.hottak.name,
        personaB: PERSONAS.analyst.name,
        argA: results.debate_0_a,
        argB: results.debate_0_b,
      }],
    };

    // Cache for 7 days
    cache.set(`weekly:${leagueId}:${season}:${week}`, content, 1000 * 60 * 60 * 24 * 7);

    return NextResponse.json({ success: true, week, generatedAt: content.generatedAt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET returns cached content if available
export async function GET() {
  const leagueId = process.env.SLEEPER_LEAGUE_ID!;
  const season = process.env.SLEEPER_SEASON ?? '2024';
  try {
    const league = await sleeper.getLeague(leagueId);
    const week = league.settings?.leg ?? 1;
    const cached = cache.get<WeeklyContent>(`weekly:${leagueId}:${season}:${week}`);
    if (cached) return NextResponse.json({ content: cached, cached: true });
    return NextResponse.json({ content: null, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
