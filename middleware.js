import { updateSession } from './app/utils/supabase/middleware'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// Rate limiters - sadece Upstash env varsa aktif
let aiLimiter = null;
let authLimiter = null;
let generalLimiter = null;
const localHits = new Map();
const SUSPICIOUS_BOT_UA = /(sqlmap|nikto|nmap|masscan|acunetix|dirbuster|gobuster|python-requests|curl\/[0-9]|wget\/[0-9])/i;

const getClientIp = (request) => request.ip ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

function localLimit(ip, path, max = 25, windowMs = 60_000) {
    const key = `${ip}:${path}`;
    const now = Date.now();
    const current = localHits.get(key);

    if (!current || now > current.resetAt) {
        localHits.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true, remaining: max - 1 };
    }

    current.count += 1;
    const ok = current.count <= max;
    return { ok, remaining: Math.max(0, max - current.count) };
}

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // AI endpointleri için sıkı limit
    aiLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 istek/dakika
        prefix: "rl:ai",
    });

    // Auth için brute-force koruması
    authLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 istek/dakika
        prefix: "rl:auth",
    });

    // Genel API limiti
    generalLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 istek/dakika
        prefix: "rl:general",
    });
}

export async function middleware(request) {
    const path = request.nextUrl.pathname;
    const ip = getClientIp(request);
    const ua = request.headers.get("user-agent") || "";

    if ((path.startsWith("/api/openai") || path.startsWith("/api/ai-compare")) && SUSPICIOUS_BOT_UA.test(ua)) {
        return new NextResponse(
            JSON.stringify({ error: "Şüpheli istemci engellendi." }),
            { status: 403, headers: { "Content-Type": "application/json" } }
        );
    }

    // Rate limiting kontrolü (sadece API ve auth için)
    if (aiLimiter && (path.startsWith("/api/") || path === "/giris-yap")) {
        let limiter = generalLimiter;

        // AI endpointleri için sıkı limit
        if (path.startsWith("/api/openai") || path.startsWith("/api/ai-compare")) {
            limiter = aiLimiter;
        }
        // Auth için brute-force koruması
        else if (path === "/giris-yap" && request.method === "POST") {
            limiter = authLimiter;
        }

        try {
            const { success, remaining } = await limiter.limit(ip);

            if (!success) {
                return new NextResponse(
                    JSON.stringify({ error: "Çok fazla istek. Lütfen bir dakika bekleyin." }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "Retry-After": "60",
                            "X-RateLimit-Remaining": remaining.toString()
                        }
                    }
                );
            }
        } catch (error) {
            // Upstash erişimi yoksa local limiter ile fail-safe uygula
            console.error("Rate limit error:", error);
            const local = localLimit(ip, path, path.startsWith('/api/openai') || path.startsWith('/api/ai-compare') ? 12 : 40);
            if (!local.ok) {
                return new NextResponse(
                    JSON.stringify({ error: "Çok fazla istek. Lütfen biraz bekleyin." }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "Retry-After": "60",
                            "X-RateLimit-Remaining": local.remaining.toString()
                        }
                    }
                );
            }
        }
    } else if (path.startsWith('/api/')) {
        const local = localLimit(ip, path, path.startsWith('/api/openai') || path.startsWith('/api/ai-compare') ? 12 : 50);
        if (!local.ok) {
            return new NextResponse(
                JSON.stringify({ error: "Çok fazla istek. Lütfen biraz bekleyin." }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": "60",
                        "X-RateLimit-Remaining": local.remaining.toString()
                    }
                }
            );
        }
    }

    // Supabase session güncelleme
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)',
    ],
}
