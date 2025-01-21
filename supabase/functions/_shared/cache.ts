import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL') ?? '',
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN') ?? '',
});

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Additional time to serve stale data while revalidating
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 60, // 1 minute default TTL
  staleWhileRevalidate: 30, // 30 seconds stale-while-revalidate
};

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config: CacheConfig = DEFAULT_CONFIG
): Promise<T> {
  const { ttl = 60, staleWhileRevalidate = 30 } = config;
  
  try {
    // Try to get data from cache
    const cached = await redis.get<{ data: T; timestamp: number }>(key);

    const now = Date.now();
    
    // If we have cached data
    if (cached) {
      const age = (now - cached.timestamp) / 1000; // Convert to seconds
      
      // If data is fresh, return it
      if (age < ttl) {
        return cached.data;
      }
      
      // If data is stale but within stale-while-revalidate window
      if (age < ttl + staleWhileRevalidate) {
        // Revalidate in background
        revalidateData(key, fetchFn, config).catch(console.error);
        // Return stale data
        return cached.data;
      }
    }

    // If we get here, either:
    // 1. No cached data exists
    // 2. Cached data is too old (beyond stale-while-revalidate window)
    return await revalidateData(key, fetchFn, config);
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    // On cache error, fall back to fetching fresh data
    return await fetchFn();
  }
}

async function revalidateData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  const data = await fetchFn();
  
  try {
    await redis.set(
      key,
      { data, timestamp: Date.now() },
      { ex: config.ttl! + config.staleWhileRevalidate! }
    );
  } catch (error) {
    console.error(`Failed to cache data for key ${key}:`, error);
  }
  
  return data;
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Failed to invalidate cache for key ${key}:`, error);
  }
}

export function buildCacheKey(...parts: string[]): string {
  return parts.join(':');
} 