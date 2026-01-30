import { Redis } from "@upstash/redis";

// Redis client - sadece env varsa aktif
let redis = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

// Cache TTL: 5 dakika
const SEARCH_CACHE_TTL = 300;

/**
 * Normalize search query for consistent caching
 * "iPhone 15" and "iphone  15" -> same cache key
 */
function normalizeQuery(query) {
    return query
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}

/**
 * Get cached search results
 * @param {string} query - Search query
 * @returns {Promise<Array|null>} Cached results or null
 */
export async function getCachedSearch(query) {
    if (!redis) return null;

    try {
        const cacheKey = `search:${normalizeQuery(query)}`;
        const cached = await redis.get(cacheKey);
        return cached;
    } catch (error) {
        console.warn('Redis cache get error:', error);
        return null;
    }
}

/**
 * Cache search results
 * @param {string} query - Search query
 * @param {Array} results - Search results to cache
 */
export async function setCachedSearch(query, results) {
    if (!redis) return;

    try {
        const cacheKey = `search:${normalizeQuery(query)}`;
        await redis.set(cacheKey, results, { ex: SEARCH_CACHE_TTL });
    } catch (error) {
        console.warn('Redis cache set error:', error);
    }
}

/**
 * Generic cache get
 */
export async function getCache(key) {
    if (!redis) return null;
    try {
        return await redis.get(key);
    } catch (error) {
        console.warn('Redis get error:', error);
        return null;
    }
}

/**
 * Generic cache set with optional TTL
 */
export async function setCache(key, value, ttlSeconds = 300) {
    if (!redis) return;
    try {
        await redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
        console.warn('Redis set error:', error);
    }
}

export { redis };
