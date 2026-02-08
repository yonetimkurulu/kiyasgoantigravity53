# 🔍 Review Discovery & Intelligence Architecture

**Yorum Toplama Sistemi - Legal, Risk-Free, Scalable**

---

> [!NOTE]
> ## 📌 MVP DURUMU
> **Şu an:** Mock/placeholder yıldızlar kullanılıyor (4.2, 4.5 gibi)
> **Gelecek:** Affiliate API'ler geldiğinde bu mimari aktifleşecek
> 
> Bu doküman, affiliate entegrasyonu sonrası kullanılacak full pipeline'ı tanımlıyor.

---

## 🧱 Temel İlke

> **GOOGLE = SADECE INDEX**
> Asla data source değil. Sadece "hangi sitede yorum var?" discovery'si.

---

## 1. Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DISCOVERY LAYER (INDEX ONLY)                      │
│                                                                      │
│  ┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐ │
│  │ SERP API     │ OR  │ Manual Query     │ OR  │ Known Sources   │ │
│  │ (SerpAPI,    │     │ (MVP Only,       │     │ (Hardcoded      │ │
│  │  Zenserp)    │     │  Low Freq)       │     │  Platform List) │ │
│  └──────┬───────┘     └────────┬─────────┘     └────────┬────────┘ │
│         └──────────────────────┴───────────────────────┘           │
│                                │                                    │
│                    { product, review_sources: [...] }              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼ DISCOVERY OUTPUT
┌─────────────────────────────────────────────────────────────────────┐
│                    SOURCE SCRAPING LAYER                             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   N11        │  │ Hepsiburada  │  │   Amazon     │  ...         │
│  │   Scraper    │  │   Scraper    │  │   Scraper    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┴─────────────────┘                       │
│                           │                                         │
│                   Raw Reviews (from original source)                │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AI PROCESSING LAYER                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               REVIEW INTELLIGENCE SERVICE                     │  │
│  │                                                               │  │
│  │  [Raw Review] → [Sentiment] → [Aspect Extract] → [Aggregate] │  │
│  │                      │                                        │  │
│  │              ┌───────┴───────┐                               │  │
│  │              ▼               ▼                               │  │
│  │        [Pros]           [Cons]                               │  │
│  │              │               │                               │  │
│  │              └───────┬───────┘                               │  │
│  │                      ▼                                        │  │
│  │           [Common Issues Detection]                          │  │
│  │           [Platform Fit Analysis]                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Discovery Layer Seçenekleri

### ✅ YOL A — SERP API (Production Ready)

| Provider | Fiyat | Avantaj |
|----------|-------|---------|
| **SerpAPI** | $50/5000 query | En popüler, güvenilir |
| **Zenserp** | $30/3000 query | Ucuz alternatif |
| **DataForSEO** | Custom | Enterprise |

**İmplementasyon:**
```javascript
// /api/discover-review-sources
const response = await serpapi.search({
    q: `"${productName}" site:n11.com OR site:hepsiburada.com reviews`,
    engine: "google",
    num: 10
});

// SADECE domain listesi al, score/count KAYDETME
const sources = extractDomains(response.organic_results);
return { product: productName, review_sources: sources };
```

### ✅ YOL B — Known Sources List (MVP)

```javascript
// Hardcoded platform list - no Google needed
const KNOWN_REVIEW_PLATFORMS = [
    { domain: "n11.com", priority: 1, scraper: "n11Scraper" },
    { domain: "hepsiburada.com", priority: 2, scraper: "hbScraper" },
    { domain: "amazon.com.tr", priority: 3, scraper: "amazonTrScraper" },
    { domain: "trendyol.com", priority: 4, scraper: "trendyolScraper" },
];

// Ürün adıyla platform search URL'lerini oluştur
const getSearchUrls = (productName) => 
    KNOWN_REVIEW_PLATFORMS.map(p => ({
        platform: p.domain,
        searchUrl: buildSearchUrl(p.domain, productName)
    }));
```

---

## 3. Source Scraping Layer

### Scraper Kuralları

> [!IMPORTANT]
> **Her scraper için zorunlu kontroller:**
> - ✅ robots.txt kontrol
> - ✅ Rate limit (min 2-5 saniye arası)
> - ✅ Sadece PUBLIC review (login gerektirmeyen)
> - ✅ Cookie tutma yok
> - ✅ Single request per product (batch değil)

### Scraper Template

```python
# backend/scrapers/base_review_scraper.py

class BaseReviewScraper:
    RATE_LIMIT = 3  # seconds between requests
    RESPECT_ROBOTS = True
    
    def scrape(self, product_url):
        # 1. Check robots.txt
        if not self.can_fetch(product_url):
            return {"error": "blocked_by_robots"}
        
        # 2. Rate limit
        time.sleep(self.RATE_LIMIT)
        
        # 3. Fetch page
        html = self.fetch_public_page(product_url)
        
        # 4. Extract ONLY review text and rating
        reviews = self.parse_reviews(html)
        
        return {
            "source": self.PLATFORM_NAME,
            "reviews": reviews,  # [{text, rating, date}]
            "scraped_at": datetime.now().isoformat()
        }
```

### Platform-Specific Scrapers

| Platform | Selector Strategy | Notes |
|----------|-------------------|-------|
| **N11** | `.review-text`, `.rating-stars` | Pagination gerekebilir |
| **Hepsiburada** | `.hermes-ReviewCard` | API endpoint mevcut |
| **Amazon TR** | `#customer_reviews` | PA-API tercih et |
| **Trendyol** | `.pr-rnr-com-r` | JS render gerekebilir |

---

## 4. AI Processing Layer

### Review Intelligence Pipeline

```javascript
// /api/process-reviews

async function processReviews(productId, rawReviews) {
    // 1. Aggregate from all sources
    const allReviews = rawReviews.flatMap(s => s.reviews);
    
    // 2. AI Analysis (Batch)
    const prompt = `
        Aşağıdaki ürün yorumlarını analiz et.
        
        Yorumlar:
        ${allReviews.map(r => `- ${r.text}`).join('\n')}
        
        Çıktı formatı:
        {
            "common_issues": ["issue1", "issue2"],
            "top_pros": ["pro1", "pro2"],
            "top_cons": ["con1", "con2"],
            "sentiment_score": 0.0-1.0,
            "platform_fit": ["gaming", "business", ...]
        }
    `;
    
    const analysis = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });
    
    return JSON.parse(analysis.choices[0].message.content);
}
```

### Output Schema

```json
{
    "product_id": "xbox-wireless-controller",
    "review_analysis": {
        "total_reviews_analyzed": 247,
        "sources": ["n11", "hepsiburada", "amazon"],
        
        "common_issues": [
            {"issue": "bluetooth_disconnect", "frequency": 0.12},
            {"issue": "button_sticking", "frequency": 0.05}
        ],
        
        "top_pros": [
            {"pro": "ergonomi", "mention_rate": 0.45},
            {"pro": "pil_omru", "mention_rate": 0.38}
        ],
        
        "top_cons": [
            {"con": "fiyat", "mention_rate": 0.25}
        ],
        
        "platform_fit": ["PC", "Xbox", "casual_gaming"],
        
        "sentiment_score": 0.78,
        "confidence": 0.85
    },
    "last_updated": "2025-01-28T12:00:00Z"
}
```

---

## 5. Hukuki & Yatırımcı Dili

### ❌ YAPILMAYACAKLAR

| Asla Yapma | Neden |
|------------|-------|
| Google Shopping HTML scrape | ToS ihlali |
| "4.6 puan – 83.881 yorum" kaydet | Google data theft |
| Google verisini frontend'de göster | Attribution sorunu |
| Google markasını kullan | Trademark ihlali |

### ✅ RESMİ DİL

**Yatırımcıya:**
> "We use compliant SERP data providers to discover public review sources, then aggregate insights directly from original platforms under fair use."

**Türkçe Backend Yorumu:**
> "Arama motorları üzerinden açık inceleme kaynaklarını keşfedip, yorumları doğrudan kaynağından analiz ediyoruz."

---

## 6. Veritabanı Schema

```sql
-- Yorum kaynakları discovery metadata
CREATE TABLE review_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    platform TEXT NOT NULL,  -- 'n11', 'hepsiburada', etc.
    source_url TEXT,
    last_fetched TIMESTAMPTZ,
    review_count INTEGER,    -- OUR count, not Google's
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, platform)
);

-- Ham yorumlar (source'dan çekilen)
CREATE TABLE raw_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    review_text TEXT NOT NULL,
    rating DECIMAL(2,1),
    review_date DATE,
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI işlenmiş analiz
CREATE TABLE review_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL UNIQUE,
    common_issues JSONB,
    top_pros JSONB,
    top_cons JSONB,
    platform_fit TEXT[],
    sentiment_score DECIMAL(3,2),
    total_reviews_analyzed INTEGER,
    sources TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_review_sources_product ON review_sources(product_id);
CREATE INDEX idx_raw_reviews_product ON raw_reviews(product_id);
```

---

## 7. Uygulama Öncelikleri

| # | Aşama | Açıklama | Süre |
|---|-------|----------|------|
| 1 | **Known Sources MVP** | Hardcoded platform list, Google yok | 1 hafta |
| 2 | **N11 + HB Scraper** | İlk iki platform scraperı | 2 hafta |
| 3 | **AI Processing** | Pros/cons extraction | 1 hafta |
| 4 | **SERP API Integration** | Production discovery | 1 hafta |
| 5 | **Full Pipeline** | End-to-end automation | 2 hafta |

---

## 8. Competitive Moat

> 🔥 **Google bunu yapmıyor**
> 🔥 **Akakçe bunu yapmıyor**
> 🔥 **Senin MOAT burada**

```
┌─────────────────────────────────────────────────────────────────┐
│                    KıyasGO FARKI                                 │
│                                                                  │
│  Rakipler:        ⭐⭐⭐⭐ 4.5 (1234 yorum)                        │
│                   ↓ SADECE SAYI                                  │
│                                                                  │
│  KıyasGO:         🧠 YORUM ZEKÂSI                                │
│                   ├─ "Bluetooth kopma sorunu %12 kullanıcıda"    │
│                   ├─ "Ergonomi en çok övülen özellik"            │
│                   ├─ "PC oyuncuları için ideal"                  │
│                   └─ "Fiyat/performans: Orta"                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Yorumum ve Önerilerim

### Katılıyorum:
1. **Google sadece index olarak kullanılmalı** - Kesinlikle doğru. Google'dan herhangi bir sayı, puan veya meta veri kaydedilmemeli.

2. **SERP API kullanımı** - SerpAPI veya Zenserp ile "compliant" discovery yapılabilir. Bu legal ve risksiz.

3. **Kaynak sitelerden çekme** - Gerçek değer buradan geliyor. Robots.txt'e uyarak public review'ları çekmek meşru.

4. **AI ile değer katma** - Bu senin moat'ın. Ham yorum → insight dönüşümü hiçbir rakip yapmıyor.

### Ekleme Önerilerim:

1. **Playwright yerine HTTP requests** - Mümkünse JS render gerektirmeyen siteler tercih et. Daha hızlı, daha az detectable.

2. **Review cache TTL** - Yorumlar günlük değişmez. 7 gün cache yeterli, rate limit dostu.

3. **Incremental scraping** - Her seferinde tüm yorumları çekme, sadece yeni eklenen yorumları al.

4. **Source attribution göster** - "n11'den 45, Hepsiburada'dan 102 yorum analiz edildi" - kullanıcı güveni artırır.

5. **Fallback stratejisi** - Bir site bloklarsa diğerlerinden devam et. Single point of failure olmasın.
