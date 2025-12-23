/**
 * Simple in-memory rate limiter for API routes
 * For production at scale, use Redis or Upstash
 */

const rateLimit = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimit.entries()) {
        if (now > record.resetTime) {
            rateLimit.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Check if request is within rate limit
 * @param {string} ip - Client IP address
 * @param {number} limit - Max requests per window (default: 30)
 * @param {number} windowMs - Time window in ms (default: 60000 = 1 min)
 * @returns {{ allowed: boolean, remaining: number, retryAfter?: number }}
 */
export function checkRateLimit(ip, limit = 30, windowMs = 60000) {
    const now = Date.now();
    const key = ip;

    if (!rateLimit.has(key)) {
        rateLimit.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: limit - 1 };
    }

    const record = rateLimit.get(key);

    // Window expired, reset
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
        return { allowed: true, remaining: limit - 1 };
    }

    // Over limit
    if (record.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
        };
    }

    // Increment and allow
    record.count++;
    return { allowed: true, remaining: limit - record.count };
}

export default checkRateLimit;
