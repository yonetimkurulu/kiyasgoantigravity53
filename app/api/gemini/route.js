import { NextResponse } from 'next/server';

// API Anahtarını Vercel'den çeker
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request) {
  try {
    // Frontend'den gelen mesajı al
    const body = await request.json();
    const { prompt } = body;

    // Güvenlik kontrolleri
    if (!prompt) {
      return NextResponse.json({ error: 'Boş mesaj gönderildi.' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ result: "⚠️ API Anahtarı eksik! Vercel ayarlarından GEMINI_API_KEY eklemeyi unutma." });
    }

    // Google Gemini API'ye bağlan
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Sen KıyasGO adında yardımsever, samimi bir alışveriş asistanısın. Kullanıcıya ürünler, fiyatlar ve karşılaştırmalar konusunda kısa ve net cevaplar ver. Kullanıcı sorusu: ${prompt}` }]
        }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Üzgünüm, şu an bağlantıda bir sorun var.";

    // Cevabı Frontend'e gönder
    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}