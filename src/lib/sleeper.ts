import type {
  SleeperLeague, SleeperUser, SleeperRoster,
  SleeperMatchup, SleeperTransaction
} from '@/types';

const BASE = 'https://api.sleeper.app/v1';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 300 }, // cache 5 min
  });
  if (!res.ok) throw new Error(`Sleeper API ${res.status}: ${path}`);
  return res.json();
}

export const sleeper = {
  getLeague: (id: string) => get<SleeperLeague>(`/league/${id}`),
  getUsers:  (id: string) => get<SleeperUser[]>(`/league/${id}/users`),
  getRosters:(id: string) => get<SleeperRoster[]>(`/league/${id}/rosters`),
  getMatchups:(id: string, week: number) =>
    get<SleeperMatchup[]>(`/league/${id}/matchups/${week}`),
  getTransactions:(id: string, week: number) =>
    get<SleeperTransaction[]>(`/league/${id}/transactions/${week}`),
  getPlayoffBracket:(id: string) =>
    get<unknown>(`/league/${id}/winners_bracket`),
};
