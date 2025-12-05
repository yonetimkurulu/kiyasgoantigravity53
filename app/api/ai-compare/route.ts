import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-1e81320545394848bd958290597c3164";

export async function POST(request: Request) {
    let productId;
    try {
        const body = await request.json();
        const { productId: id } = body;
        productId = id;

        // 1. Fetch Data using Supabase
        let productData = null;

        // Try to find a phone that resembles the ID
        // iphone-15-pro -> match name ilike %iPhone%15%Pro%
        const searchTerm = productId ? productId.replace(/-/g, '%') : '';

        const { data: phone, error } = await supabase
            .from('phones')
            .select('*')
            // Flexible match: "Samsung S24 Ultra" vs "Samsung Galaxy S24 Ultra"
            // If ID is samsung-s24-ultra, searchTerm is samsung%s24%ultra
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
                priceHistory: [
                    { price: 78000 }, { price: 76000 }, { price: 75000 }
                ]
            };

            // Only use mock if it matches our demo ID to avoid confusing results
            if (productId === 'iphone-15-pro') {
                productData = mockProduct;
            }
        }

        if (!productData) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 2. Prepare Context for AI
        const currentPrices = productData.prices.map(p => `${p.seller.name}: ${p.price} TL`).join(', ');
        const lowestPrice = Math.min(...productData.prices.map(p => Number(p.price)));
        const historyAvg = productData.priceHistory.length > 0
            ? productData.priceHistory.reduce((acc, curr) => acc + Number(curr.price), 0) / productData.priceHistory.length
            : lowestPrice;

        const prompt = `
      Sen uzman bir alışveriş asistanısın.
      Ürün: ${productData.name}
      Şu anki Fiyatlar: ${currentPrices}
      En Düşük Fiyat: ${lowestPrice} TL
      Son 30 Gün Ortalaması: ${historyAvg.toFixed(2)} TL
      
      Bu verileri analiz et ve JSON formatında şu çıktıyı ver:
      {
        "recommendation": "Al" veya "Bekle",
        "score": 1-10 arası puan,
        "reason": "Kısa ve net bir açıklama (maksimum 2 cümle)."
      }
      Sadece JSON döndür.
    `;

        if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.includes('YOUR_DEEPSEEK')) {
            throw new Error("Misconfigured API Key");
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Sen bir JSON yanıt makinesisin. Sadece geçerli JSON döndürürsün." },
                    { role: "user", content: prompt }
                ],
                // response_format: { type: "json_object" } 
            })
        });

        if (!response.ok) throw new Error(`Deepseek API Error: ${response.status}`);
        const data = await response.json();
        let content = data.choices[0].message.content;

        // Basic cleanup 
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return NextResponse.json(JSON.parse(content));

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
