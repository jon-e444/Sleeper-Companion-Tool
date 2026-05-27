import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai';
import { cache } from '@/lib/cache';
import { PERSONAS } from '@/lib/personas';
import {
  leagueContext, topStoryPrompt, matchupRecapPrompt,
  powerRankingsPrompt, tradeReportPrompt, franchiseProfilePrompt,
  analyticsReportPrompt, debatePrompt, historyPagePrompt,
} from '@/lib/prompts';
import { sleeper } from '@/lib/sleeper';
import { buildStandings, detectStorylines } from '@/lib/standings';
import { buildLeagueHistory } from '@/lib/history';
import { cache as appCache } from '@/lib/cache';
import type { MatchupPair } from '@/types';

async function getHistory(leagueId: string) {
  const key = `history:${leagueId}`;
  const cached = appCache.get(key);
  if (cached) return cached as Awaited<ReturnType<typeof buildLeagueHistory>>;
  try {
    const h = await buildLeagueHistory(leagueId);
    appCache.set(key, h, 1000 * 60 * 60 * 24);
    return h;
  } catch { return null; }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, params = {} } = body as { type: string; params: Record<string, unknown> };

    const leagueId = process.env.SLEEPER_LEAGUE_ID!;
    const season = process.env.SLEEPER_SEASON ?? '2024';

    // Check content cache
    const cacheKey = `${type}:${JSON.stringify(params)}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) return NextResponse.json({ content: cached, cached: true });

    // Load league data + history in parallel
    const [[league, users, rosters], history] = await Promise.all([
      Promise.all([sleeper.getLeague(leagueId), sleeper.getUsers(leagueId), sleeper.getRosters(leagueId)]),
      getHistory(leagueId),
    ]);

    const week = league.settings?.leg ?? 1;
    const standings = buildStandings(rosters, users);
    const ctx = leagueContext(league.name, season, week, standings, history ?? undefined);

    let prompt = '';
    let system = '';

    switch (type) {
      case 'topStory': {
        let pairs: MatchupPair[] = [];
        try {
          const raw = await sleeper.getMatchups(leagueId, week);
          const groups = new Map<number, typeof raw>();
          raw.forEach(m => { if (!groups.has(m.matchup_id)) groups.set(m.matchup_id, []); groups.get(m.matchup_id)!.push(m); });
          const rosterMap = new Map(standings.map(s => [s.roster_id, s]));
          groups.forEach((members, mid) => {
            if (members.length !== 2) return;
            const [a, b] = members;
            const ta = rosterMap.get(a.roster_id), tb = rosterMap.get(b.roster_id);
            if (!ta || !tb) return;
            pairs.push({ matchup_id: mid, teamA: ta, teamB: tb, scoreA: a.points ?? 0, scoreB: b.points ?? 0, projA: ta.avgPpg, projB: tb.avgPpg, tags: detectStorylines(ta, tb), isLive: (a.points ?? 0) > 0 });
          });
        } catch {}
        prompt = topStoryPrompt(ctx, week, standings[0], pairs[0], history ?? undefined);
        system = PERSONAS.anchor.systemPrompt;
        break;
      }
      case 'matchupRecap': {
        const mp = params.matchup as MatchupPair;
        if (!mp) throw new Error('matchup param required');
        prompt = matchupRecapPrompt(ctx, week, mp, history ?? undefined);
        system = PERSONAS.anchor.systemPrompt;
        break;
      }
      case 'powerRankings': {
        prompt = powerRankingsPrompt(ctx, standings, history ?? undefined);
        system = PERSONAS.hottak.systemPrompt;
        break;
      }
      case 'tradeReport': {
        prompt = tradeReportPrompt(ctx, standings, history ?? undefined);
        system = PERSONAS.reporter.systemPrompt;
        break;
      }
      case 'analytics': {
        prompt = analyticsReportPrompt(ctx, standings, history ?? undefined);
        system = PERSONAS.analyst.systemPrompt;
        break;
      }
      case 'standings': {
        prompt = analyticsReportPrompt(ctx, standings, history ?? undefined);
        system = PERSONAS.analyst.systemPrompt;
        break;
      }
      case 'franchise': {
        const teamName = params.teamName as string;
        const team = standings.find(s => s.name === teamName);
        if (!team) throw new Error('Team not found: ' + teamName);
        prompt = franchiseProfilePrompt(ctx, team, history ?? undefined);
        break;
      }
      case 'historyPage': {
        if (!history) throw new Error('No history available');
        prompt = historyPagePrompt(ctx, history);
        system = PERSONAS.anchor.systemPrompt;
        break;
      }
      case 'personaTake': {
        const personaId = params.personaId as string;
        const persona = PERSONAS[personaId];
        if (!persona) throw new Error('Unknown persona: ' + personaId);
        const targetTeam = standings[Math.floor(Math.random() * Math.min(6, standings.length))];
        const franchise = history?.franchises.find(f => f.managerName === targetTeam.manager);
        const histBit = franchise ? ` Their all-time record is ${franchise.allTimeWins}W-${franchise.allTimeLosses}L with ${franchise.championships} title(s).` : '';
        prompt = `${ctx}\nAs ${persona.name}, give your Week ${week} take on ${targetTeam.name}(${targetTeam.wins}-${targetTeam.losses},${targetTeam.pf.toFixed(1)}PF).${histBit} 1 short paragraph. Stay fully in character. Use your catchphrase naturally. Reference history if relevant.`;
        system = persona.systemPrompt;
        break;
      }
      case 'debate': {
        const { topic, personaId, side } = params as { topic: string; personaId: string; side: 'for' | 'against' };
        const persona = PERSONAS[personaId];
        if (!persona) throw new Error('Unknown persona');
        prompt = debatePrompt(ctx, topic, persona.name, side);
        system = persona.systemPrompt;
        break;
      }
      case 'teamStory': {
        const teamName = params.teamName as string;
        const personaId = (params.personaId as string) ?? 'anchor';
        const persona = PERSONAS[personaId] ?? PERSONAS.anchor;
        const team = standings.find(s => s.name === teamName);
        if (!team) throw new Error('Team not found: ' + teamName);
        prompt = franchiseProfilePrompt(ctx, team, history ?? undefined);
        system = persona.systemPrompt;
        break;
      }
      default:
        throw new Error('Unknown content type: ' + type);
    }

    const content = await generateContent(prompt, system, 1000);
    cache.set(cacheKey, content);
    return NextResponse.json({ content, cached: false });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[generate/content]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
