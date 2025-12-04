
import { NextResponse } from 'next/server';
import { scrapeGsmArena } from '@/lib/scraper';
import { saveToSupabase } from '@/lib/supabase';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parametresi gerekli.' }, { status: 400 });
    }

    try {
        // 1. GSM Arena'dan veriyi çek
        const data = await scrapeGsmArena(url);

        // 2. Veritabanına kaydet
        await saveToSupabase(data);

        // 3. Başarılı yanıt dön
        return NextResponse.json({
            success: true,
            message: 'Veri başarıyla çekildi ve kaydedildi.',
            data
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
