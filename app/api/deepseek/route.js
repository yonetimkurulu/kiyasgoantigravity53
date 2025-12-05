import { NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-1e81320545394848bd958290597c3164";

export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt } = body;

        // Safety check
        if (!prompt) {
            return NextResponse.json({ error: 'Boş mesaj gönderildi.' }, { status: 400 });
        }

        if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.includes('YOUR_DEEPSEEK')) {
            return NextResponse.json({ result: "⚠️ API Anahtarı eksik! .env.local dosyasına DEEPSEEK_API_KEY eklemeyi unutma." });
        }

        // Call Deepseek API (OpenAI Compatible)
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Sen KıyasGO adında sadece alışveriş, ürün inceleme, fiyat karşılaştırma ve teknoloji konularında uzmanlaşmış bir asistansın. Alışveriş dışındaki konulara (siyaset, tarih, din, futbol, genel sohbet vb.) cevap verme. Kullanıcı konu dışı bir şey sorarsa 'Ben sadece alışveriş asistanıyım, ürünler hakkında yardımcı olabilirim.' diyerek konuyu kapat. Cevapların Türkçe, samimi ve kısa olsun." },
                    { role: "user", content: prompt }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Deepseek API Error:", errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "Üzgünüm, şu an cevap veremiyorum.";

        return NextResponse.json({ result: text });

    } catch (error) {
        console.error("API Hatası:", error);
        return NextResponse.json({ result: "Sunucu hatası veya API erişim sorunu oluştu." });
    }
}
