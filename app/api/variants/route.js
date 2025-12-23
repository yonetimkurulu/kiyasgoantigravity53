
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.length < 3) {
        return NextResponse.json({ success: false, error: 'Query too short' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('id, name, slug, image, price') // Removed store1_price as it triggers "column does not exist"
            .ilike('name', `%${query}%`)
            .limit(50);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
