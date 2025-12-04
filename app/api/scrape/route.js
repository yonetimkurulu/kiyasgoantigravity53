import { NextResponse } from 'next/server';
import { scrapeGsmArena } from '@/lib/scraper';
import { saveToSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Statik olmasını engelle

async function handleScrape(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parametresi gerekli.' }, { status: 400 });
    }

    try {
        // 1. GSM Arena'dan veriyi çek
        const data = await scrapeGsmArena(url);

        // 2. Veritabanına kaydet
        const saved = await saveToSupabase(data);

        // 3. Başarılı yanıt dön
        return NextResponse.json({
            success: true,
            message: 'Veri başarıyla çekildi ve kaydedildi.',
            saved,
            data
        });

    } catch (error) {
        console.error("Scrape API Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function GET(request) {
    return handleScrape(request);
}

export async function POST(request) {
    // POST isteği gelirse body'den URL almayı dene, yoksa query'den
    try {
        const body = await request.json();
        if (body.url) {
            // Mock request object for handleScrape if needed, or just extract logic
            // For simplicity, let's just reuse the logic but we need to adapt it since handleScrape expects a request with URL
            // Let's just create a new URL with the query param
            const newUrl = new URL(request.url);
            newUrl.searchParams.set('url', body.url);
            return handleScrape(new Request(newUrl, request));
        }
    } catch (e) {
        // Body json değilse devam et
    }
    return handleScrape(request);
}
