import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
    let productId;
    try {
        const body = await request.json();
        const { productId: id } = body;
        productId = id;

        // --- CACHE CHECK ---
        const cacheKey = `PRICE_ANALYSIS:${productId}`;
        if (productId) {
            const { data: cached } = await supabaseAdmin
                .from('product_summaries')
                .select('*')
                .eq('product_name', cacheKey)
                .single();

            if (cached && cached.content) {
                // Check if cache is fresh (e.g., less than 24 hours old)
                const cacheTime = new Date(cached.created_at).getTime();
                const now = new Date().getTime();
                const oneDay = 24 * 60 * 60 * 1000;

                if ((now - cacheTime) < oneDay) {
                    console.log(`Cache HIT for ${cacheKey}`);
                    return NextResponse.json(cached.content);
                } else {
                    console.log(`Cache ESTALE for ${cacheKey} (older than 24h)`);
                    // Optionally delete old cache here, or just overwrite later
                }
            }
        }

        // 1. Fetch Data using Supabase
        let productData = null;

        // Try to find a phone that resembles the ID
        const searchTerm = productId ? productId.replace(/-/g, '%') : '';

        const { data: phone, error } = await supabase
            .from('phones')
            .select('*')
            .ilike('name', `%${searchTerm}%`)
            .limit(1)
            .single() as any;

        if (phone) {
            productData = {
                name: phone.name,
                prices: [{ seller: { name: "Epey/Pazar" }, price: parseFloat(phone.price.replace(/[^0-9.]/g, '')) || 50000 }],
                priceHistory: []
            };
        }

        // Demo fallback if no real data found
        if (!productData) {
            const mockProduct = {
                name: "iPhone 15 Pro",
                prices: [
                    { seller: { name: "Trendyol" }, price: 75000 },
                    { seller: { name: "Amazon" }, price: 75250 },
                ],
                // Generate 6 months of mock history
                priceHistory: [
                    { month: 'Tem', price: 79500 },
                    { month: 'Ağu', price: 78000 },
                    { month: 'Eyl', price: 77500 },
                    { month: 'Eki', price: 76000 },
                    { month: 'Kas', price: 75500 },
                    { month: 'Ara', price: 75000 }
                ]
            };

            // Only use mock if it matches our demo ID to avoid confusing results
            // Relaxing check for demo purposes if "iphone" is in ID
            if (productId && (productId === 'iphone-15-pro' || productId.includes('iphone'))) {
                productData = mockProduct;
            } else {
                // Generic History for other products
                productData = {
                    name: productId ? productId.replace(/-/g, ' ') : "Ürün",
                    prices: [{ seller: { name: "Pazar" }, price: 10000 }],
                    priceHistory: [
                        { month: 'Tem', price: 10500 },
                        { month: 'Ağu', price: 10400 },
                        { month: 'Eyl', price: 10200 },
                        { month: 'Eki', price: 10100 },
                        { month: 'Kas', price: 10000 },
                        { month: 'Ara', price: 10000 }
                    ]
                };
            }
        }

        if (!productData) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 2. Prepare Context for AI
        const currentPrices = productData.prices.map((p: any) => `${p.seller.name}: ${p.price} TL`).join(', ');
        const lowestPrice = Math.min(...productData.prices.map((p: any) => Number(p.price)));
        const historyAvg = productData.priceHistory.length > 0
            ? productData.priceHistory.reduce((acc: any, curr: any) => acc + Number(curr.price), 0) / productData.priceHistory.length
            : lowestPrice;

        // Serialize history for AI
        const historyStr = productData.priceHistory.map((h: any) => `${h.month}: ${h.price}TL`).join(', ');

        const prompt = `
      Sen uzman bir alışveriş asistanısın.
      Ürün: ${productData.name}
      Şu anki Fiyatlar: ${currentPrices}
      En Düşük Fiyat: ${lowestPrice} TL
      Fiyat Geçmişi (Son 6 Ay): ${historyStr}
      Son 30 Gün Ortalaması: ${historyAvg.toFixed(2)} TL
      
      Bu verileri analiz et ve JSON formatında şu çıktıyı ver:
      {
        "recommendation": "Al" veya "Bekle",
        "score": 1-10 arası puan,
        "reason": "Kısa ve net bir açıklama (maksimum 2 cümle).",
        "trend": "artış" veya "azalış" veya "sabit",
        "trend_desc": "Fiyat trendini anlatan tek cümle (örn: 'Son 6 ayda %10 değer kaybetti').",
        "forecast": "Gelecek öngörüsü (örn: 'Önümüzdeki ay sabit kalması bekleniyor')."
      }
      Sadece JSON döndür.
    `;


        if (!OPENAI_API_KEY) {
            throw new Error("Misconfigured API Key");
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Sen bir JSON yanıt makinesisin. Sadece geçerli JSON döndürürsün." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`OpenAI API Error: ${response.status}`);
        const data = await response.json();
        let content = data.choices[0].message.content;

        // Basic cleanup 
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonContent = JSON.parse(content);

        // --- CACHE SAVE ---
        if (productId) {
            // Check if update or insert needed? 
            // Upsert based on product_name (if unique constraint exists on product_name, upsert works. 
            // The provided SQL didn't specify unique constraint but index. 
            // Wait, SQL: `create index ...` it didn't say UNIQUE. 
            // If duplicate rows, `.single()` might fail or return one.
            // Better to delete old one first if exists, or use upsert if constraint.
            // Since we don't have UNIQUE constraint on `product_name` in the SQL I gave:
            // "create table ... product_name text not null ..."
            // I should delete potential duplicates or just handle it.
            // Safe approach: check if we found `cached` earlier (even if stale), update it.
            // Or just insert new one? No, table will grow.
            // Let's try to delete by key before inserting to keep 1 entry per key.

            await supabaseAdmin
                .from('product_summaries')
                .delete()
                .eq('product_name', cacheKey);

            await supabaseAdmin
                .from('product_summaries')
                .insert({
                    product_name: cacheKey,
                    content: jsonContent
                });
        }

        return NextResponse.json({
            ...jsonContent,
            priceHistory: productData.priceHistory || []
        });

    } catch (error) {
        // FALLBACK FOR DEMO: If AI fails
        if (productId === 'iphone-15-pro') {
            return NextResponse.json({
                recommendation: "Al",
                score: 9,
                reason: "Demo Modu: Fiyat son 30 günün en düşük seviyesinde."
            });
        }
        console.error('AI Compare error:', error);
        return NextResponse.json(
            { error: 'AI service unavailable' },
            { status: 500 }
        );
    }
}
