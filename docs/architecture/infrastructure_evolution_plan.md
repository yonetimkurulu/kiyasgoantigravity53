# 🚀 KıyasGO Altyapı Evrim Planı

**Hedef:** MVP'den çıkarak tam bağımsız, ölçeklenebilir, AI-native bir platforma dönüşmek.

---

## 📍 Mevcut Durum (MVP)

| Bileşen | Şu An | Sorun |
|---------|-------|-------|
| **Database** | Supabase (Free) | Fiyat geçmişi için yetersiz, 500MB limit |
| **Auth** | Supabase Auth | ✅ Çalışıyor |
| **LLM** | OpenAI GPT-4o-mini | $$$, veri 3rd party'de |
| **Hosting** | Vercel (Free) | Serverless limitleri |
| **Search** | Supabase ilike | Yavaş, 10K+ ürün sonrası sorun |
| **Cache** | Upstash Redis | ✅ Çalışıyor |
| **DNS** | Vercel default | ✅ Çalışıyor |

---

## 🎯 Hedef Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (DNS + CDN + WAF)             │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    VERCEL / COOLIFY                          │
│              (Next.js App + API Routes)                      │
└──────┬──────────────┬──────────────┬──────────────┬─────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌────────┐  ┌──────────────┐
│ Typesense│  │ PostgreSQL   │  │ Redis  │  │ LLM Gateway  │
│ (Search) │  │ (Ana DB)     │  │(Cache) │  │(Multi-model) │
└──────────┘  └──────────────┘  └────────┘  └──────────────┘
                    │                              │
                    ▼                              ▼
            ┌──────────────┐              ┌──────────────┐
            │ TimescaleDB  │              │ Groq / Ollama│
            │(Fiyat Hist.) │              │(Llama 3.3)   │
            └──────────────┘              └──────────────┘
```

---

## 🗓️ Fazlar

### 📘 Faz 1: LLM Abstraction (Hafta 1-2)
**Amaç:** OpenAI bağımlılığını kır, multi-provider desteği ekle.

| Görev | Dosya | Açıklama |
|-------|-------|----------|
| LLM Client | `lib/llm.js` | OpenAI, Groq, Ollama destekli unified client |
| Provider Config | `.env` | `LLM_PROVIDER=groq` şeklinde değiştirilebilir |
| Test | - | Groq Llama 3.3 ile test |

**Maliyet:** $0 (sadece kod)

---

### 📘 Faz 1.5: Product Intelligence Engine (Hafta 2-3)
**Amaç:** Ham ürün verisini karar sinyaline dönüştür.

> [!NOTE]
> Detaylar için bkz: [product_intelligence_engine.md](file:///C:/Users/ENSARPC/.gemini/antigravity/brain/c710e1b6-ab57-4150-b78d-f00a7d48ef0b/product_intelligence_engine.md)

| Görev | Dosya | Açıklama |
|-------|-------|----------|
| Normalization Service | `lib/pie/normalization.js` | Spec parsing & variant resolution |
| Usage Inference | `lib/pie/usage-inference.js` | Hangi kullanıcıya uygun? |
| Decision Synthesis | `lib/pie/decision-synthesis.js` | who_should_buy / avoid |
| PIE DB Table | `product_intelligence` | Output storage |

---

### 📘 Faz 1.6: Commerce Signal Engine (Hafta 3-4)
**Amaç:** Canlı pazar verilerinden proprietary sinyaller üret.

> [!NOTE]
> Detaylar için bkz: [commerce_signal_engine.md](file:///C:/Users/ENSARPC/.gemini/antigravity/brain/c710e1b6-ab57-4150-b78d-f00a7d48ef0b/commerce_signal_engine.md)

| Sinyal | Açıklama |
|--------|----------|
| Fake Discount | Sahte indirim tespiti |
| Store Reliability | Satıcı güvenilirlik skoru |
| Delivery Performance | Teslimat performansı |
| Price Volatility | Fiyat oynaklığı |
| Lifecycle Stage | Ürün yaşam döngüsü |
| Supply Risk | Tedarik riski |

---

### 📘 Faz 1.7: AI-Consumable API (Hafta 4-5)
**Amaç:** AI sistemlerinin KıyasGO verilerini tüketebileceği API katmanı.

> [!NOTE]
> Detaylar için bkz: [ai_consumable_api.md](file:///C:/Users/ENSARPC/.gemini/antigravity/brain/c710e1b6-ab57-4150-b78d-f00a7d48ef0b/ai_consumable_api.md)

| Endpoint | Açıklama |
|----------|----------|
| `/api/v1/ai/products/{id}` | Ürün zekası |
| `/api/v1/ai/compare` | Karşılaştırma |
| `/api/v1/ai/best-for/{context}` | Bütçe+senaryo önerisi |
| `/api/v1/ai/signals/{id}` | Ticaret sinyalleri |

**Hedef:** ChatGPT, Gemini, Claude, Perplexity gibi AI'lar KıyasGO'yu cite etsin.

---

### 📘 Faz 2: Agent Infrastructure (Hafta 5-6)
**Amaç:** AI Agent altyapısını kur.

| Görev | Dosya | Açıklama |
|-------|-------|----------|
| AI Gateway | `/api/ai-gateway/route.js` | Tek giriş noktası |
| Intent Router | `lib/agents/router.js` | Hangi agent çağrılacak? |
| Agent Logs | `agent_logs` tablosu | Observability |
| Base Agent | `lib/agents/base.js` | Agent soyutlama |

**SQL:**
```sql
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  user_id UUID,
  input_message TEXT,
  context JSONB,
  response TEXT,
  latency_ms INTEGER,
  tokens_used INTEGER,
  success BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 📘 Faz 3: Database Migration (Hafta 3-4)
**Amaç:** Supabase'den çık, self-hosted PostgreSQL'e geç.

**Seçenekler:**

| Seçenek | Artı | Eksi | Maliyet |
|---------|------|------|---------|
| **Neon** | Serverless, branching | Yeni, bazı limitler | $19+/ay |
| **PlanetScale** | Branching, scale | MySQL (PostgreSQL değil) | $29+/ay |
| **Railway** | Kolay, PostgreSQL | Scale limitli | $5+/ay |
| **Hetzner + Manual** | Tam kontrol, ucuz | Bakım senin | VPS $5 + setup |

**Önerim:** Railway veya Neon ile başla, sonra Hetzner VPS'e taşı.

**Migration Steps:**
1. Yeni DB kur (Railway/Neon)
2. `DATABASE_URL` değiştir
3. Prisma migrate
4. Supabase verilerini export/import
5. Auth ayrı kalsın (Supabase Auth devam)

---

### 📘 Faz 4: Fiyat Geçmişi DB (Hafta 4-5)
**Amaç:** Time-series data için ayrı optimized DB.

**Neden ayrı?**
- Ana DB'yi yormamak
- Zaman bazlı sorgular çok hızlı
- Retention politikası (3 ay sonra sil)

| Seçenek | Açıklama | Maliyet |
|---------|----------|---------|
| **TimescaleDB** | PostgreSQL extension, time-series | Self-host veya $30+/ay |
| **InfluxDB** | Dedicated time-series | Self-host veya $20+/ay |
| **ClickHouse** | Analytics heavy | Self-host |

**Schema:**
```sql
CREATE TABLE price_history (
  time TIMESTAMPTZ NOT NULL,
  product_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'TRY'
);

SELECT create_hypertable('price_history', 'time');
```

---

### 📘 Faz 5: Search Engine (Hafta 5-6)
**Amaç:** Supabase ilike → proper search engine.

| Seçenek | Artı | Eksi | Maliyet |
|---------|------|------|---------|
| **Typesense** | Kolay, hızlı, Türkçe iyi | Yeni | $30+/ay cloud |
| **Meilisearch** | Kolay, açık kaynak | Scaling zor | Self-host free |
| **Elasticsearch** | En güçlü | Karmaşık, pahalı | $100+/ay |

**Önerim:** Typesense Cloud ile başla.

---

### 📘 Faz 6: Self-Hosted LLM (İsteğe Bağlı, Hafta 8+)
**Amaç:** Tam veri kontrolü, sınırsız istek.

**Kurulum:**
```
Hetzner GPU Server (RTX 4090) → Ollama → Llama 3.3 70B
```

| Bileşen | Maliyet |
|---------|---------|
| Hetzner AX102 (RTX 4090) | ~€200/ay |
| Veya Runpod A100 | ~$800-1500/ay |

**Hybrid Yaklaşım (Önerim):**
- Basit sorgular → Groq (Llama 3.3) - ucuz
- Kritik/hassas → Self-hosted Ollama
- Fallback → OpenAI

---

## 💰 Maliyet Karşılaştırması

| Durum | MVP (Şimdi) | Faz 3 Sonrası | Full Self-Hosted |
|-------|-------------|---------------|------------------|
| Database | $0 | $20-50 | $5 VPS |
| Search | $0 | $30 | $10 VPS |
| LLM | $20-50 | $10-20 (Groq) | €200 GPU |
| Cache | $0 | $10 | $5 VPS |
| Hosting | $0 | $20 | $30 VPS |
| **Toplam** | **~$20-50** | **~$90-130** | **~€250** |

---

## ✅ Aksiyon Planı

### Bu Hafta (Hemen)
- [x] LLM abstraction layer oluştur (`app/utils/ai/provider.js`)
- [ ] Groq API key al, test et
- [ ] `agent_logs` tablosu oluştur

### Önümüzdeki 2 Hafta
- [ ] `/api/ai-gateway` - tek endpoint
- [ ] Intent router + agent base class
- [ ] Railway/Neon hesap aç, test DB kur

### 1 Ay İçinde
- [ ] Ana DB migration (Supabase → Railway/Neon)
- [ ] Typesense entegrasyonu
- [ ] Fiyat geçmişi ayrı DB'ye taşı

### 3 Ay İçinde
- [ ] Self-hosted LLM test (Ollama + Llama 3.3)
- [ ] Full infrastructure on VPS (Coolify ile yönet)

---

## 🔐 Güvenlik Notları

| Konu | Önlem |
|------|-------|
| Veri lokasyonu | EU Hetzner veya Türkiye VPS |
| LLM veri gizliliği | Groq EU veya self-hosted |
| DB backup | Otomatik günlük backup |
| Secrets | Railway/Vercel env vars, asla git'te değil |

> Not (MVP): HMAC şu an opsiyonel. Mevcut korumalar (origin check + sanitize + rate limit + bot block + timeout) aktif.
> Detay: `mvp_security_decisions.md`

---

## 📌 Karar Gereken Noktalar

> [!IMPORTANT]
> Aşağıdaki sorulara karar verilmeli:

1. **Database provider hangisi?**
   - [ ] Railway ($5+)
   - [ ] Neon ($19+)
   - [ ] Hetzner VPS + manual ($5)

2. **LLM stratejisi?**
   - [ ] Groq Llama 3.3 (API, ucuz, hızlı)
   - [ ] Self-hosted Ollama (tam kontrol, GPU maliyeti)
   - [ ] Hybrid (ikisi birden)

3. **Search engine?**
   - [ ] Typesense Cloud ($30+)
   - [ ] Meilisearch self-hosted (free)

4. **Timeline?**
   - [ ] Aggressive (4 hafta)
   - [ ] Normal (8 hafta)
   - [ ] Gradual (3 ay)

---

## Doğrulama Planı

### Test 1: LLM Abstraction
```bash
# Groq ile test
LLM_PROVIDER=groq npm run dev
# Sohbet açıp test et, yanıt gelmeli
```

### Test 2: Agent Gateway
```bash
# Intent routing test
curl -X POST http://localhost:3000/api/ai-gateway \
  -H "Content-Type: application/json" \
  -d '{"message": "30 bine laptop öner"}'
# recommendation intent dönmeli
```

### Test 3: Database Migration
- Yeni DB'de ürün sayısını kontrol et
- Arama çalışıyor mu test et
- Auth hala çalışıyor mu kontrol et

### Test 4: Manuel
- Kullanıcı olarak giriş yap
- Ürün ara
- AI chat kullan
- Favori ekle
- Hepsi çalışmalı
