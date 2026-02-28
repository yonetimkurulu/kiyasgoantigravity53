import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const parseLimit = (raw) => {
    const parsed = Number.parseInt(String(raw || '20'), 10);
    if (!Number.isFinite(parsed)) return 20;
    return Math.max(1, Math.min(parsed, 100));
};

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const limit = parseLimit(url.searchParams.get('limit'));
        const category = (url.searchParams.get('category') || '').trim() || null;

        const { data, error } = await supabaseAdmin.rpc('get_top_favorited_products', {
            p_limit: limit,
            p_category: category,
        });

        if (error) {
            return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            ok: true,
            items: Array.isArray(data) ? data : [],
            meta: { limit, category },
        });
    } catch (err) {
        return NextResponse.json({ ok: false, error: err?.message || 'Unexpected error' }, { status: 500 });
    }
}