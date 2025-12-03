import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    let productId;
    try {
        const body = await request.json();
        productId = body.productId;

        // 1. Fetch Data
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                prices: { include: { seller: true } },
                priceHistory: { orderBy: { date: 'desc' }, take: 30 },
            },
        });

        if (!product) {
            // FALLBACK FOR DEMO: If DB is empty, use mock data
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

            // If the requested ID matches our demo ID, use mock data
            if (productId === 'iphone-15-pro') {
                const currentPrices = mockProduct.prices.map(p => `${p.seller.name}: ${p.price} TL`).join(', ');
                const lowestPrice = 75000;
                const historyAvg = 76333;

                const prompt = `
          Sen uzman bir alışveriş asistanısın.
          Ürün: ${mockProduct.name}
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

                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const jsonStr = text.replace(/```json|```/g, '').trim();
                return NextResponse.json(JSON.parse(jsonStr));
            }

            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 2. Prepare Context for AI
        const currentPrices = product.prices.map(p => `${p.seller.name}: ${p.price} TL`).join(', ');
        const lowestPrice = Math.min(...product.prices.map(p => Number(p.price)));
        const historyAvg = product.priceHistory.reduce((acc, curr) => acc + Number(curr.price), 0) / (product.priceHistory.length || 1);

        const prompt = `
      Sen uzman bir alışveriş asistanısın.
      Ürün: ${product.name}
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

        // 3. Call Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Parse JSON (Basic cleanup)
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);

    } catch (error) {
        // FALLBACK FOR DEMO: If AI fails (e.g. no key), return fake response for demo product
        if (productId === 'iphone-15-pro') {
            return NextResponse.json({
                recommendation: "Al",
                score: 9,
                reason: "Demo Modu: Fiyat son 30 günün en düşük seviyesinde. (API Key eksik olabilir)"
            });
        }
        console.error('AI Compare error:', error);
        return NextResponse.json(
            { error: 'AI service unavailable' },
            { status: 500 }
        );
    }
}
