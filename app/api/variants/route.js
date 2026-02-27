
import { supabaseAdmin } from '@/lib/supabase';
import { getCachedSearch, setCachedSearch } from '@/lib/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const sanitizeSearchQuery = (value = '') => String(value)
    .toLowerCase()
    .replace(/[^a-z0-9ğüşiöç\s-]/gi, ' ')
    .replace(/[%_\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = sanitizeSearchQuery(searchParams.get('query') || '');

    if (!query || query.length < 3) {
        return NextResponse.json({ success: false, error: 'Query too short' }, { status: 400 });
    }

    try {
        // 1. Check Redis cache first (fast ~10ms)
        const cacheKey = `variants:${query}`;
        const cachedData = await getCachedSearch(cacheKey);
        if (cachedData) {
            return NextResponse.json({
                success: true,
                data: cachedData,
                cached: true // Debug flag
            });
        }

        // 2. Cache miss - query Supabase (~200ms)
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('id, name, slug, image, price')
            .ilike('name', `%${query}%`)
            .limit(50);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // 3. Cache the results for next time (5 min TTL)
        if (data && data.length > 0) {
            await setCachedSearch(cacheKey, data);
        }

        return NextResponse.json({
            success: true,
            data,
            cached: false // Debug flag
        });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
