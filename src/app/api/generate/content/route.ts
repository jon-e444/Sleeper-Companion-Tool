import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai';
import { cache } from '@/lib/cache';
import { PERSONAS } from '@/lib/personas';
import {
  leagueContext, topStoryPrompt, matchupRecapPrompt,
  powerRankingsPrompt, tradeReportPrompt, franchiseProfilePrompt,
  analyticsReportPrompt, debatePrompt,
} from '@/lib/prompts';
import { sleeper } from '@/lib/sleeper';
import { buildStandings, detectStorylines } from '@/lib/standings';
import type { MatchupPair } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, params = {} } = body as { type: string; params: Record<string, unknown> };

    const leagueId = process.env.SLEEPER_LEAGUE_ID!;
    const season = process.env.SLEEPER_SEASON ?? '2024';

    // Check cache
    const cacheKey = `${type}:${JSON.stringify(params)}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) return NextResponse.json({ content: cached, cached: true });

    // Load league data
    const [league, users, rosters] = await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getUsers(leagueId),
      sleeper.getRosters(leagueId),
    ]);
    const week = league.settings?.leg ?? 1;
    const standings = buildStandings(rosters, users);
    const ctx = leagueContext(league.name, season, week, standings);

    let prompt = '';
    let system = '';

    switch (type) {
      case 'topStory': {
        // load matchups for featured game
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
        prompt = topStoryPrompt(ctx, week, standings[0], pairs[0]);
        system = PERSONAS.anchor.systemPrompt;
        break;
      }
      case 'matchupRecap': {
        const mp = params.matchup as MatchupPair;
        if (!mp) throw new Error('matchup param required');
        prompt = matchupRecapPrompt(ctx, week, mp);
        system = PERSONAS.anchor.systemPrompt;
        break;
      }
      case 'powerRankings': {
        prompt = powerRankingsPrompt(ctx, standings);
        system = PERSONAS.hottak.systemPrompt;
        break;
      }
      case 'tradeReport': {
        prompt = tradeReportPrompt(ctx, standings);
        system = PERSONAS.reporter.systemPrompt;
        break;
      }
      case 'analytics': {
        prompt = analyticsReportPrompt(ctx, standings);
        system = PERSONAS.analyst.systemPrompt;
        break;
      }
      case 'franchise': {
        const teamName = params.teamName as string;
        const team = standings.find(s => s.name === teamName);
        if (!team) throw new Error('Team not found: ' + teamName);
        prompt = franchiseProfilePrompt(ctx, team);
        break;
      }
      case 'personaTake': {
        const personaId = params.personaId as string;
        const persona = PERSONAS[personaId];
        if (!persona) throw new Error('Unknown persona: ' + personaId);
        const targetTeam = standings[Math.floor(Math.random() * Math.min(6, standings.length))];
        prompt = `${ctx}\nAs ${persona.name}, give your Week ${week} take on ${targetTeam.name}(${targetTeam.wins}-${targetTeam.losses},${targetTeam.pf.toFixed(1)}PF). 1 short paragraph. Stay fully in character. Use your catchphrase naturally.`;
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
        prompt = `${ctx}\nWrite a short news piece about ${team.name}(${team.manager}, ${team.wins}-${team.losses}, ${team.pf.toFixed(1)}PF, rank:#${team.rank}). Pick one angle: dynasty/fraud/playoff urgency/trade rumors/manager spotlight. 2 dramatic paragraphs.`;
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
