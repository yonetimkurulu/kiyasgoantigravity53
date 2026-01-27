import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request) {
    try {
        // Rate limiting handled by middleware (Upstash)

        const body = await request.json();
        const { prompt, type, productName, messages } = body;

        // Validasyon: Prompt ve messages yoksa ve type summary/comparison değilse hata
        if (!prompt && (!messages || messages.length === 0) && type !== 'summary' && type !== 'comparison') {
            return NextResponse.json({ error: 'Boş mesaj gönderildi.' }, { status: 400 });
        }

        if (!OPENAI_API_KEY) {
            return NextResponse.json({ result: "⚠️ API Anahtarı eksik! .env.local dosyasını kontrol edin." });
        }

        // --- CACHE CHECK (Summary ve Comparison için) ---
        // Ürün özetleri ve karşılaştırmalar ağırdır, önbellekten çekelim.
        if ((type === 'summary' || type === 'comparison') && productName) {
            const { data: cached } = await supabaseAdmin
                .from('product_summaries')
                .select('content')
                .eq('product_name', productName)
                .single();

            if (cached && cached.content) {
                // Cache HIT! Hızlı dönüş
                console.log(`Cache HIT for ${productName} (Type: ${type})`);
                return NextResponse.json(cached.content);
            }
        }

        let systemContent = `Sen KıyasGO'nun samimi ve akıllı alışveriş asistanısın! 🛒

**KİŞİLİĞİN:**
- Türk arkadaş gibi samimi konuş (abi, hacı gibi değil ama samimi)
- Emoji kullan ama abartma (mesaj başına 2-3 tane)
- Kısa ve öz ol, roman yazma

**ÜRÜN ÖNERİSİ KURALLARI:**
Kullanıcı bütçe + kategori verirse (örn: "30 bine oyun laptopu"):

1. **Bütçeye uygun 3-5 ürün öner** - gerçek, güncel modeller
2. Her ürün için şu formatı kullan:

**🎯 [Ürün Adı]** - ~XX.XXX ₺
✅ Neden iyi: (1 cümle)
⚠️ Dikkat: (1 cümle)

3. Sonunda kısa bir özet yaz: "Senin için en mantıklısı X çünkü..."

**GİZLİ FORMAT (sadece öneri varsa):**
Mesajın EN SONUNA şunu ekle:
$$SUGGESTIONS$$["Ürün 1", "Ürün 2", "Ürün 3"]

**YASAKLAR:**
- Alışveriş dışı konulara cevap verme (siyaset, din, futbol vb.)
- Kaynak/link ekleme
- Çok uzun açıklamalar
        `;


        let apiMessages = [];

        if (type === 'summary' && productName) {
            systemContent = "Sen deneyimli bir teknoloji editörü ve ürün analiz uzmanısın. Görevin verilen ürün için internetteki/veritabanındaki genel kanıyı, en belirgin artıları ve eksileri analiz edip JSON formatında sunmaktır. Duygusal analiz yap. Çıktın SADECE ve SADECE şu JSON şemasında olmalı, markdown yok, sadece raw JSON: { \"sentiment\": \"Ürün hakkında 1-2 cümlelik özet kanı (Türkçe)\", \"pros\": [\"artı 1\", \"artı 2\", \"artı 3\"], \"cons\": [\"eksi 1\", \"eksi 2\", \"eksi 3\"] }. Objektif ol.";
            apiMessages = [
                { role: "system", content: systemContent },
                { role: "user", content: `Analiz edilecek ürün: ${productName}` }
            ];
        } else if (type === 'comparison') {
            // Comparison için prompt zaten client'dan detaylı geliyor
            systemContent = "Sen uzman bir ürün karşılaştırma asistanısın. Sadece JSON formatında çıktı verirsin.";
            apiMessages = [
                { role: "system", content: systemContent },
                { role: "user", content: prompt }
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
                temperature: (type === 'summary' || type === 'comparison') ? 0.3 : 0.7,
                response_format: (type === 'summary' || type === 'comparison') ? { type: 'json_object' } : undefined
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error:", errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "Üzgünüm, şu an cevap veremiyorum.";

        // --- CACHE SAVE (Summary ve Comparison için) ---
        if ((type === 'summary' || type === 'comparison') && productName) {
            try {
                // OpenAI structured sends JSON string, we parse it to store as JSONB
                const contentJson = JSON.parse(text);

                // Construct standard response object to cache
                const responseObj = { result: text, text: text, ...contentJson };

                const { error: insertError } = await supabaseAdmin
                    .from('product_summaries')
                    .insert({
                        product_name: productName,
                        content: responseObj
                    });

                if (insertError) {
                    console.error("Cache Insert Error:", insertError);
                } else {
                    console.log(`Cache SAVED for ${productName}`);
                }

                return NextResponse.json(responseObj);

            } catch (e) {
                console.error("Cache save parse failed:", e);
                // Return anyway even if cache fails
                return NextResponse.json({ result: text, text: text });
            }
        }

        return NextResponse.json({ result: text, text: text });

    } catch (error) {
        console.error("API Hatası:", error);
        return NextResponse.json({ result: "Sunucu hatası veya API erişim sorunu oluştu." });
    }
}
