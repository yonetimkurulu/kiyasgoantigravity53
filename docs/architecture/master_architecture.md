# 🏗️ KıyasGO Master Architecture Document

**Platform Vizyonu:** AI-native, multi-market commerce decision engine.

---

## 1. Architectural Principles

| Prensip | Açıklama |
|---------|----------|
| **Data-First** | Veri topla → sinyal üret → zeka oluştur |
| **AI-Native** | Her katman AI'a hizmet eder |
| **Provider Agnostic** | LLM, DB, Search değiştirilebilir |
| **Moat-Oriented** | Zaman = Veri = Avantaj |
| **API-First** | Her şey API'den erişilebilir |
| **Cost-Conscious** | Free tier'da başla, scale et |
| **Observability-First** | Everything measurable, traceable, improvable |

---

## 2. System Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                                │
│     [Web App]  [Mobile App]  [ChatGPT Plugin]  [Partner Widgets]            │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                             EXPOSURE LAYER                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  AI-Consumable  │  │  Public Pages   │  │    B2B API      │             │
│  │      API        │  │   (AEO/GEO)     │  │  (Partners)     │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
└───────────┴────────────────────┴────────────────────┴───────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                          INTELLIGENCE CORE                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        AI AGENT LAYER                                │   │
│  │  [Tavsiye Agent] [Karşılaştırma Agent] [Fiyat Agent] [SEO Agent]    │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│  ┌──────────────────────────────▼──────────────────────────────────────┐   │
│  │                     PROCESSING ENGINES                               │   │
│  │                                                                      │   │
│  │  ┌──────────────────┐           ┌──────────────────┐                │   │
│  │  │ Product Intel.   │           │ Commerce Signal  │                │   │
│  │  │ Engine (PIE)     │           │ Engine (CSE)     │                │   │
│  │  │ ─────────────────│           │ ─────────────────│                │   │
│  │  │ • Normalization  │           │ • Fake Discount  │                │   │
│  │  │ • Review Intel   │           │ • Store Reliab.  │                │   │
│  │  │ • Usage Inference│           │ • Price Volatil. │                │   │
│  │  │ • Decision Synth │           │ • Lifecycle      │                │   │
│  │  └──────────────────┘           └──────────────────┘                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                 │                                           │
│  ┌──────────────────────────────▼──────────────────────────────────────┐   │
│  │                       LLM GATEWAY                                    │   │
│  │         [OpenAI] [Groq] [Ollama] [Anthropic] [Gemini]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                            DATA LAYER                                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │PostgreSQL │  │TimescaleDB│  │ Typesense │  │  Redis    │  │ Vector DB │ │
│  │ (Core DB) │  │(Price Hist)│  │ (Search)  │  │ (Cache)   │  │  (RAG)    │ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                         DATA INGESTION LAYER                                 │
│     [Scrapers]  [API Feeds]  [User Reviews]  [Price Streams]  [Stock API]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Matrix

| Layer | Component | MVP | Platform | Moat Builder |
|-------|-----------|-----|----------|--------------|
| **Data** | PostgreSQL | ✅ Supabase | Railway/Neon | Hetzner |
| **Data** | TimescaleDB | ❌ | ✅ | ✅ |
| **Data** | Typesense | ❌ | ✅ | ✅ |
| **Data** | Vector DB | ❌ | ❌ | ✅ (RAG) |
| **Intel** | LLM Gateway | ⚠️ OpenAI only | ✅ Multi | ✅ Self-hosted |
| **Intel** | PIE | ❌ | ✅ | ✅ |
| **Intel** | CSE | ❌ | ✅ | ✅ |
| **Intel** | Agent Router | ❌ | ✅ | ✅ |
| **Expose** | AI API | ❌ | ✅ | ✅ |
| **Expose** | AEO Pages | ❌ | ✅ | ✅ |
| **Expose** | ChatGPT Plugin | ❌ | ❌ | ✅ |

---

## 4. Phase Plan (Restructured)

### 🟢 TRACK A: MVP Infrastructure (Weeks 1-4)
*Foundation that enables everything else.*

| Week | Task | Deliverable |
|------|------|-------------|
| 1 | LLM Abstraction | `lib/llm.js` - multi-provider |
| 1-2 | Agent Logs | `agent_logs` table + observability |
| 2-3 | DB Migration Prep | Railway/Neon test instance |
| 3-4 | Search Upgrade | Typesense integration |

### 🔵 TRACK B: Intelligence Engines (Weeks 2-6)
*The core differentiator - proprietary intelligence.*

> [!IMPORTANT]
> **Track B > Track A.** Zaman/enerji kısıtlıysa infra feature kes, intelligence kesme.
> Siteyi herkes kurar, signal engine'i çok az ekip kurar.

**PIE Phasing (Boğulmamak için):**
| Phase | Scope | Effort |
|-------|-------|--------|
| **PIE-0** | Normalization + usage tags | 3-4 gün |
| **PIE-1** | Pros/cons extraction | 3-4 gün |
| **PIE-2** | Decision synthesis | 5-7 gün |
| **PIE-3** | Lifecycle detection | 3-4 gün |

**Decision Quality Layer (her PIE çıktısına ekle):**
```json
{
  "quality": {
    "confidence_score": 0.87,
    "freshness_score": 0.92,
    "data_coverage_score": 0.78
  }
}
```

| Week | Task | Deliverable |
|------|------|-------------|
| 2-3 | PIE-0: Normalization | Spec parsing, variant resolution |
| 3-4 | PIE-1: Usage Inference | Context classification |
| 3-4 | CSE: Fake Discount | Discount verification |
| 4-5 | CSE: Store Reliability | Seller scoring |
| 5-6 | PIE-2: Decision Synthesis | who_should_buy/avoid |

### 🟣 TRACK C: AI Exposure (Weeks 4-8)
*Making intelligence consumable by AI systems.*

> [!NOTE]
> **AEO Pages ≠ Blog.** Bu sayfalar:
> - Structured (tablo ağırlıklı)
> - Kısa hükümler (quote edilebilir)
> - Kaynak gösterilebilir format
> - AI training & citation surface

| Week | Task | Deliverable |
|------|------|-------------|
| 4-5 | AI API v1 | `/api/v1/ai/*` endpoints |
| 5-6 | AEO Pages | `/ai/products/*` crawlable |
| 6-7 | Schema.org | Full structured data |
| 7-8 | Plugin Ready | ChatGPT actions.json |

### 🟠 TRACK D: Scale & Independence (Weeks 8-12)
*Full platform independence.*

| Week | Task | Deliverable |
|------|------|-------------|
| 8-9 | Full DB Migration | Exit Supabase (keep Auth) |
| 9-10 | TimescaleDB | Price history separation |
| 10-11 | Self-hosted LLM | Ollama + Llama 3.3 |
| 11-12 | VPS Consolidation | Coolify managed |

---

## 5. Data Ingestion Strategy

> [!CAUTION]
> **"Data ingestion is a first-class product, not a background task."**
> Bütün bu mimari, veri yoksa = hiçbir şey.

### Kaynak Hedefleri
| Tier | Source | Status | Priority |
|------|--------|--------|----------|
| 🔴 Primary | GSMArena | ✅ Active | P0 |
| 🔴 Primary | Amazon TR | ⏳ Needed | P0 |
| 🔴 Primary | Trendyol | ⏳ Needed | P0 |
| 🟡 Secondary | Hepsiburada | ⏳ Needed | P1 |
| 🟡 Secondary | n11 | ⏳ Needed | P1 |
| 🟢 Backup | Epey | ⏳ Needed | P2 |
| 🟢 Backup | Akakçe (public) | ⏳ Needed | P2 |
| 🔵 Partner | Marka API | ❌ Future | P3 |

### Ingestion Roadmap
| Week | Goal |
|------|------|
| 1-2 | 5 sağlam kaynak aktif |
| 3-4 | 2 yedek kaynak |
| 5-8 | 1 partner hedefi (API deal) |

---

## 6. Critical Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **OpenAI dependency** | Cost + privacy | Faz 1 LLM abstraction |
| **Supabase limits** | Scale blocker | Faz 3 migration |
| **Search performance** | UX degradation | Faz 5 Typesense |
| **Data quality** | Bad signals | PIE validation layer |
| **Scraper blocks** | No data | Multiple sources, proxies |
| **LLM hallucination** | Wrong advice | Ground with PIE/CSE data |
| **Wrong decision liability** | Trust loss, legal risk | Confidence scores, disclaimers, explainability |

---

## 7. Defensibility Analysis

> [!TIP]
> **"Our moat is not traffic. Our moat is accumulated market truth."**
> Bu cümleyi pitch deck'te de kullan.

### Short-Term Moats (0-12 months)
| Moat | Description |
|------|-------------|
| **First mover** | İlk Türkçe AI commerce platform |
| **Data accumulation** | Her gün fiyat geçmişi birikiyor |
| **User trust** | Fake discount tespiti = güven |

### Long-Term Moats (12+ months)
| Moat | Description |
|------|-------------|
| **Proprietary signals** | PIE + CSE zaman geçtikçe daha doğru |
| **AI ecosystem** | ChatGPT/Gemini entegrasyonu |
| **Network effects** | Daha çok kullanıcı = daha çok veri = daha iyi sinyal |
| **B2B relationships** | API müşterileri |

---

## 8. Revenue Milestones

> [!IMPORTANT]
> Para gelmeyen sistem yavaşlar. İlk geliri takvimde işaretle.

| Milestone | Target Date | Goal |
|-----------|-------------|------|
| 🎯 İlk affiliate tıklama | Hafta 2 | 100 tıklama |
| 💰 İlk affiliate gelir | Ay 1 | ₺500 |
| 🔌 İlk B2B deneme | Ay 2 | 1 pilot müşteri |
| 📊 İlk ücretli API | Ay 3 | 1 paying customer |
| 🚀 MRR hedefi | Ay 6 | ₺5,000 MRR |

---

## 9. Cost Projection

| Phase | Monthly Cost | Components |
|-------|-------------|------------|
| **MVP (Now)** | ~$25 | OpenAI ($20) + Supabase (free) + Vercel (free) |
| **Platform (Month 3)** | ~$100 | Groq ($15) + Railway ($20) + Typesense ($30) + Vercel ($20) |
| **Scale (Month 6)** | ~$200 | Above + TimescaleDB ($50) + More compute |
| **Independence (Month 12)** | ~€300 | Hetzner VPS + GPU for LLM |

---

## 10. Success Metrics

| Metric | MVP Target | Platform Target |
|--------|------------|-----------------|
| **Products indexed** | 10K | 100K |
| **Price history depth** | 30 days | 365 days |
| **AI API calls/day** | 100 | 10K |
| **Fake discount detections** | N/A | 1K/month |
| **External AI citations** | 0 | 10+/month |

---

## 11. Viability Assessment

### ✅ STRENGTHS

| Factor | Score | Reason |
|--------|-------|--------|
| **Market Gap** | 9/10 | Türkiye'de Akakçe/Cimri'nin AI versiyonu yok |
| **Timing** | 9/10 | AI boom, AEO/GEO yeni kavramlar |
| **Technical Feasibility** | 8/10 | Tüm teknolojiler mevcut ve erişilebilir |
| **Cost Structure** | 8/10 | Free tier'larla başlanabilir |
| **Differentiation** | 8/10 | PIE + CSE = unique value prop |

### ⚠️ CHALLENGES

| Challenge | Severity | Mitigation |
|-----------|----------|------------|
| **Data acquisition** | High | Scraping + partnerships |
| **Execution speed** | Medium | Focused MVP, iterate fast |
| **Competition response** | Medium | Move fast, build moat |
| **Revenue model** | Medium | Affiliate + API + B2B |
| **Team capacity** | High | Prioritize ruthlessly |

### 📊 OVERALL VIABILITY

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   MARKET OPPORTUNITY:  ████████████████████░░  85%     │
│   TECHNICAL RISK:      ████████░░░░░░░░░░░░░░  40%     │
│   EXECUTION RISK:      ██████████░░░░░░░░░░░░  50%     │
│   COMPETITIVE MOAT:    ████████████████░░░░░░  75%     │
│                                                         │
│   OVERALL VIABILITY:   ████████████████░░░░░░  78%     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Honest Assessment

### 🎯 Bu İş Tutar Mı?

**KISA CEVAP: EVET, ama şartlara bağlı.**

**Neden EVET:**

1. **Pazar boşluğu gerçek** - Akakçe/Cimri fiyat listeler, karar vermez
2. **AI timing mükemmel** - ChatGPT/Perplexity herkesin dilinde
3. **Moat stratejisi sağlam** - Veri + sinyal = savunulabilir avantaj
4. **Maliyet yapısı uygun** - Free tier'larla MVP, gelirle scale

**Kritik Başarı Faktörleri:**

| Faktör | Önem | Durum |
|--------|------|-------|
| **Veri toplama** | 🔴 Kritik | Scraper'lar çalışmalı |
| **Execution hızı** | 🔴 Kritik | 3 ayda Platform'a geçmeli |
| **Kullanıcı güveni** | 🟡 Önemli | Fake discount = güven inşası |
| **AI ecosystem entegrasyonu** | 🟡 Önemli | ChatGPT plugin = büyük darbe |

**Risk Senaryoları:**

| Senaryo | Olasılık | Sonuç |
|---------|----------|-------|
| Akakçe AI ekler | 40% | Hız avantajı kaybolur |
| Trendyol/HB AI çıkarır | 30% | Farklı niche'e odaklan |
| OpenAI fiyat artırır | 60% | Groq/Ollama geçişi zaten planda |
| Veri toplama zorlaşır | 50% | Partnership modeli |

**Tavsiyem:**

1. **Hemen başla** - Her gün fiyat geçmişi kaybediyorsun
2. **PIE + CSE'yi öncelikle** - Bu senin moat'un
3. **AI API'yi 2 ayda aç** - Perplexity/ChatGPT citation hedefle
4. **Affiliate revenue başlat** - Cash flow lazım

---

## 13. Document References

| Document | Path | Content |
|----------|------|---------|
| Product Intelligence Engine | [PIE](file:///C:/Users/ENSARPC/.gemini/antigravity/brain/c710e1b6-ab57-4150-b78d-f00a7d48ef0b/product_intelligence_engine.md) | Specs → Decision signals |
| Commerce Signal Engine | [CSE](file:///C:/Users/ENSARPC/.gemini/antigravity/brain/c710e1b6-ab57-4150-b78d-f00a7d48ef0b/commerce_signal_engine.md) | Market → Trade signals |
| AI-Consumable API | [API](file:///C:/Users/ENSARPC/.gemini/antigravity/brain/c710e1b6-ab57-4150-b78d-f00a7d48ef0b/ai_consumable_api.md) | LLM exposure layer |
| Scaling Plan | [Scale](file:///c:/Users/ENSARPC/.gemini/antigravity/brain/c710e1b6-ab57-4150-b78d-f00a7d48ef0b/scaling_plan.md) | 1M+ ürün stratejisi |

---

## 14. Next Steps

> [!IMPORTANT]
> Öncelik sırası:

1. **Bu hafta:** LLM Abstraction (`lib/llm.js`)
2. **Bu hafta:** Groq API key al, test et
3. **Gelecek hafta:** PIE Normalization başla
4. **2 hafta içinde:** AI API v1 endpoints

**Onaylarsan başlayalım!**
