# 🧠 KıyasGO AI Agent Architecture - Gap Analysis

ChatGPT'nin çizdiği ideal diagram vs şu anki KıyasGO durumu:

---

## 📊 Karşılaştırma Tablosu

| Bileşen | ChatGPT Diyagramı | KıyasGO Şu An | Durum |
|---------|------------------|---------------|-------|
| **AI Gateway API** | Tek giriş noktası | ✅ `/api/openai` + `/api/ai-compare` | ⚠️ 2 ayrı endpoint |
| **Agent Orchestration** | Router + Memory + Tool Manager | ❌ Yok | 🔴 Eksik |
| **Tavsiye Agent** | Bütçe + kategori → ürün öneri | ✅ openai/route.js'te var | 🟢 Kısmen var |
| **Karşılaştırma Agent** | Teknik + fiyat + senaryo kıyaslama | ✅ ai-compare/route.ts | 🟢 Aktif |
| **Fiyat Agent** | Trend analizi + alarm | ⚠️ Trend var, alarm yok | 🟡 Geliştirilmeli |
| **İçerik/SEO Agent** | Programatik içerik üretimi | ❌ Yok | 🔴 Eksik |
| **RAG Layer** | Vector DB + embeddings | ❌ Yok | 🔴 Eksik |
| **Tool & Data Layer** | Ürün DB + Fiyat Geçmişi + Dış API | ⚠️ Supabase var, dış API scraping | 🟡 Kısmen var |
| **AgentOps/Observability** | Prompt logs + A/B test | ❌ Yok | 🔴 Eksik |

---

## 🟢 ŞU AN VAROLANLAR

### 1. Tavsiye Agent (openai/route.js)
```
Kullanıcı: "30 bine laptop öner"
→ GPT-4o-mini → 3-5 ürün önerisi + gerekçe
```
- ✅ Bütçe anlama
- ✅ Kategori anlama  
- ✅ Öneri formatı (ürün + fiyat + artı/eksi)
- ⚠️ RAG yok - semantic retrieval eksik
- ✅ Gerçek envanter tablosundan (products) öneri veriyor
- ✅ Marka + özellik + bütçe skorlaması eklendi

### 2. Karşılaştırma Agent (ai-compare/route.ts)
```
Ürün ID → Supabase'den fiyat çek → Trend analizi → Al/Bekle önerisi
```
- ✅ Fiyat geçmişi analizi
- ✅ Trend tespiti (artış/azalış/sabit)
- ✅ Gelecek tahmini
- ✅ 24 saat cache
- ❌ Gerçek fiyat geçmişi eksik (mock data)

### 3. Data Layer (Supabase + Prisma)
```
phones         → Telefon listesi
product_summaries → AI cache
favorites      → Kullanıcı favorileri
profiles       → Kullanıcı profilleri
```
- ✅ RLS güvenlik
- ✅ Temel CRUD
- ❌ Price history tablosu boş/mock
- ❌ Seller entegrasyonu yok

---

## 🔴 EKSİK OLANLAR

### 1. Agent Orchestration Layer
**Ne yapması gerekiyor:**
```
Kullanıcı mesajı → Router → Hangi agent?
                        ├─ Tavsiye mi? → Tavsiye Agent
                        ├─ Fiyat soru? → Fiyat Agent  
                        └─ Karşılaştır? → Karşılaştırma Agent
```
**Şu an:** Her endpoint ayrı, koordinasyon yok.

### 2. RAG Layer (Vector DB)
**Ne yapması gerekiyor:**
```
Ürün açıklamaları + teknik özellikler → Embeddings → Vector DB
Kullanıcı sorusu → Semantic search → İlgili ürünler
```
**Neden kritik:** LLM'in güncel ürün bilgisi yok. RAG ile kendi katalog bilgini beslersin.

**Önerilen:** Supabase pg_vector extension

### 3. İçerik/SEO Agent
**Ne yapması gerekiyor:**
```
Kategori + ürünler → Otomatik SEO içerik üretimi
→ "En İyi 10 Gaming Laptop 2025" sayfaları
→ Karşılaştırma tabloları
→ Schema.org uyumlu JSON-LD
```

### 4. AgentOps / Observability
**Ne yapması gerekiyor:**
```
Her AI çağrısı loglanmalı:
- Prompt
- Çekilen veriler
- Üretilen yanıt
- Kullanıcı etkileşimi (tıklama, satın alma)
```
**Amaç:** Yanlış önerileri bul, başarılı önerileri çoğalt, A/B test.

---

## 📍 YATIRIMIN EN İYİ YERİ

| Öncelik | Bileşen | Neden? | Zorluk |
|---------|---------|--------|--------|
| **1** | RAG Layer | LLM + gerçek ürün verisi = doğru öneri | Orta |
| **2** | Agent Router | Tek endpoint, akıllı yönlendirme | Kolay |
| **3** | Fiyat Alarm | Kullanıcı bağlılığı ↑ | Kolay |
| **4** | AgentOps | Önerilerin doğruluğunu ölç | Orta |
| **5** | SEO Agent | Organik trafik ↑ | Zor |

---

## 🛠️ MVP AKSIYON PLANI

### Hafta 1-2: RAG Temeli
```sql
-- Supabase'te vector extension aç
CREATE EXTENSION IF NOT EXISTS vector;

-- Ürün embeddings tablosu
CREATE TABLE product_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id INTEGER REFERENCES phones(id),
  content TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Hafta 3: Agent Router
```javascript
// /api/ai-gateway/route.js
export async function POST(req) {
  const { message } = await req.json();
  
  // Intent detection
  const intent = await detectIntent(message);
  
  switch(intent) {
    case 'recommendation': return callTavsiyeAgent(message);
    case 'comparison': return callKarsilastirmaAgent(message);
    case 'price_alert': return callFiyatAgent(message);
    default: return callChatAgent(message);
  }
}
```

### Hafta 4: Observability
```javascript
// Her AI çağrısını logla
await supabase.from('agent_logs').insert({
  agent_type: 'recommendation',
  user_id: userId,
  input_message: message,
  rag_context: retrievedProducts,
  ai_response: response,
  timestamp: new Date()
});
```

---

## 📌 ÖZET

| Kategori | Durum |
|----------|-------|
| **Temel AI** | ✅ Çalışıyor |
| **Agent Çeşitliliği** | 🟡 2/4 agent var |
| **Orchestration** | 🔴 Yok |
| **RAG** | 🔴 Yok |
| **Observability** | 🔴 Yok |
| **Genel Olgunluk** | 🟡 MVP seviyesi |

**ChatGPT'nin diyagramına göre:**
- Temel yapıtaşları mevcut
- Ama akıllı yönlendirme (orchestration) ve gerçek veriye dayalı öneri (RAG) eksik
- Bu ikisi eklendiğinde "agent-first" sisteme dönüşürsün
