// Simple in-memory cache for AI content (per-process, resets on server restart)
// For production, swap this for Redis or a DB-backed cache

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const cache = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
    return entry.value;
  },
  set<T>(key: string, value: T, ttlMs = 1000 * 60 * 60 * 6): void { // 6h default
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },
  has(key: string): boolean {
    return cache.get(key) !== null;
  },
  cacheKey(parts: (string | number)[]): string {
    return parts.join(':');
  },
};
