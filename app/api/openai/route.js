import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt, type, productName, messages } = body;

        // Validasyon: Prompt ve messages yoksa ve type summary değilse hata
        if (!prompt && (!messages || messages.length === 0) && type !== 'summary') {
            return NextResponse.json({ error: 'Boş mesaj gönderildi.' }, { status: 400 });
        }

        if (!OPENAI_API_KEY) {
            return NextResponse.json({ result: "⚠️ API Anahtarı eksik! .env.local dosyasını kontrol edin." });
        }

        let systemContent = "Sen KıyasGO adında sadece alışveriş, ürün inceleme, fiyat karşılaştırma ve teknoloji konularında uzmanlaşmış bir asistansın. Alışveriş dışındaki konulara (siyaset, tarih, din, futbol, genel sohbet vb.) cevap verme. Kullanıcı konu dışı bir şey sorarsa 'Ben sadece alışveriş asistanıyım, ürünler hakkında yardımcı olabilirim.' diyerek konuyu kapat. Cevapların Türkçe, samimi ve kısa olsun.";

        let apiMessages = [];

        if (type === 'summary' && productName) {
            systemContent = "Sen deneyimli bir teknoloji editörü ve ürün analiz uzmanısın. Görevin verilen ürün için internetteki/veritabanındaki genel kanıyı, en belirgin artıları ve eksileri analiz edip JSON formatında sunmaktır. Duygusal analiz yap. Çıktın SADECE ve SADECE şu JSON şemasında olmalı, markdown yok, sadece raw JSON: { \"sentiment\": \"Ürün hakkında 1-2 cümlelik özet kanı (Türkçe)\", \"pros\": [\"artı 1\", \"artı 2\", \"artı 3\"], \"cons\": [\"eksi 1\", \"eksi 2\", \"eksi 3\"] }. Objektif ol.";
            apiMessages = [
                { role: "system", content: systemContent },
                { role: "user", content: `Analiz edilecek ürün: ${productName}` }
            ];
        } else {
            // Normal Chat
            apiMessages = messages || [
                { role: "system", content: systemContent },
                { role: "user", content: prompt }
            ];
            // Ensure system prompt is first if passed messages doesn't have it (or we force it)
            if (apiMessages.length > 0 && apiMessages[0].role !== 'system') {
                apiMessages.unshift({ role: "system", content: systemContent });
            }
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: apiMessages,
                stream: false,
                temperature: type === 'summary' ? 0.3 : 0.7,
                response_format: type === 'summary' ? { type: 'json_object' } : undefined
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error:", errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "Üzgünüm, şu an cevap veremiyorum.";

        return NextResponse.json({ result: text, text: text });

    } catch (error) {
        console.error("API Hatası:", error);
        return NextResponse.json({ result: "Sunucu hatası veya API erişim sorunu oluştu." });
    }
}
