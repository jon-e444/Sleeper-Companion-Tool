# ⚡ Fantasy Insider Network (FIN)

ESPN-style fantasy football media engine — AI personas, live Sleeper data, weekly narratives, podcast scripts, debates, analytics, and full broadcast coverage of your fantasy league.

---

## Quick Start (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-...      # from console.anthropic.com
SLEEPER_LEAGUE_ID=123456789012345678    # from your Sleeper league URL
SLEEPER_SEASON=2024                     # your current season year
```

**Finding your League ID:**
Open Sleeper → Your League → look at the URL:
`https://sleeper.com/leagues/`**`123456789012345678`**`/team`
Copy the number.

**Getting an Anthropic API key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. API Keys → Create Key → copy it

### 3. Run it
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Page | What it does |
|------|-------------|
| `/dashboard` | Week overview, top matchups, AI top story |
| `/matchups` | All matchups with SportsCenter recaps |
| `/standings` | Full standings table with luck scores + analytics |
| `/power-rankings` | Rankings with Skip Morales hot takes |
| `/media` | Filterable news feed, generate team stories |
| `/personas` | All 6 AI personalities with live takes |
| `/podcast` | Full 5-minute episode script |
| `/debate` | First Take-style debate segments |
| `/analytics` | Luck index, efficiency, hot seat |
| `/trades` | Trade log, waiver wire, insider report |
| `/franchise` | Team profile pages with full AI write-ups |

---

## AI Personas

| Persona | Role | Personality |
|---------|------|-------------|
| Michelle Carter | Lead Anchor | Authoritative, serious, sharp |
| Skip Morales | Hot Take Host | Overreacting, bold, always certain |
| Dr. Kevin Park | Analytics Expert | Condescending, data-driven, loves expected wins |
| Adrian Vazquez | Insider Reporter | Dramatic, "sources tell FIN", scoop-hungry |
| Big Ray Thompson | Ex-Player Analyst | Gut-feel, locker room language, skeptical of analytics |
| Lila Okonkwo | Chaos Agent | Contrarian, loves upsets, hates dynasties |

---

## Weekly Automation (Optional)

Generate all content for the week in one shot by calling the `/api/generate/weekly` endpoint.
Set up a cron job to run every Tuesday morning after Monday Night Football:

```bash
# Using cron or a service like Vercel Cron, EasyCron, etc.
curl -X POST https://your-domain.com/api/generate/weekly \
  -H "x-cron-secret: your-cron-secret"
```

This generates and caches: top story, power rankings analysis, podcast script, trade report, analytics report, all 6 persona takes, and debate segments — all at once.

---

## Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```

When prompted, add your environment variables in the Vercel dashboard under Settings → Environment Variables. Once set, you never touch the API key again.

---

## Cost Estimate

Each page view that triggers AI generation costs approximately:
- Simple takes / recaps: ~$0.01–0.02
- Podcast script (full episode): ~$0.05–0.10
- Full weekly batch generate: ~$0.30–0.50

A typical week of normal usage: **under $1.00**

The in-memory cache prevents re-generating the same content within a session (6-hour TTL by default). The weekly batch endpoint further reduces costs by pre-generating everything at once on Tuesday.

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages (server + client)
│   ├── api/
│   │   ├── league/         # Sleeper league data
│   │   ├── matchups/       # Matchup pairs with storyline tags
│   │   ├── standings/      # Built standings with analytics
│   │   ├── transactions/   # Trades + waiver moves
│   │   └── generate/
│   │       ├── content/    # Per-request AI generation (POST)
│   │       └── weekly/     # Full-week batch generation + cache (POST/GET)
│   ├── dashboard/
│   ├── matchups/
│   ├── standings/
│   ├── power-rankings/
│   ├── media/
│   ├── personas/
│   ├── podcast/
│   ├── debate/
│   ├── analytics/
│   ├── trades/
│   └── franchise/
├── components/
│   ├── ui/                 # Shared: TeamAvatar, AIBox, StatCard, etc.
│   ├── layout/             # TopBar (server), NavBar (client), Sidebar (server)
│   └── pages/              # MatchupCard, etc.
├── hooks/
│   └── useLeague.ts        # SWR hooks for client-side data fetching
├── lib/
│   ├── ai.ts               # Anthropic SDK wrapper (server-only)
│   ├── cache.ts            # In-memory content cache
│   ├── personas.ts         # 6 persona configs + system prompts
│   ├── prompts.ts          # All AI prompt templates
│   ├── sleeper.ts          # Sleeper API client
│   └── standings.ts        # Standings builder + analytics
└── types/
    └── index.ts            # All TypeScript types
```

## Extending

- **Add a persona**: Add an entry to `src/lib/personas.ts`
- **Add a storyline tag**: Add to the `StorylineTag` type and `detectStorylines()` in `standings.ts`
- **Add a content type**: Add a case to the `switch` in `api/generate/content/route.ts` and a prompt template in `prompts.ts`
- **Persist history**: Swap the in-memory cache in `lib/cache.ts` for Supabase/PostgreSQL calls
- **Add TTS**: Pipe the podcast script from `/api/generate/weekly` into ElevenLabs or Cartesia
