# 📊 SEO & AEO Master Guide

Tüm SEO ve AI SEO (AEO) stratejileri tek dokümanda.

---

## 1. Robots.txt - AI Bot İzinleri

```javascript
// app/robots.js
export default function robots() {
    return {
        rules: [
            { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] },
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ChatGPT-User', allow: '/' },
            { userAgent: 'Google-Extended', allow: '/' },
            { userAgent: 'ClaudeBot', allow: '/' },
            { userAgent: 'Anthropic-AI', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
        ],
        sitemap: 'https://www.kiyasgo.com/sitemap.xml',
    }
}
```

---

## 2. Schema.org Markup

### Organization + WebSite + SoftwareApplication
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "KıyasGO",
      "url": "https://www.kiyasgo.com",
      "logo": "https://www.kiyasgo.com/logo.png",
      "alternateName": ["kıyasgo", "kiyasgo", "Kıyas Go"]
    },
    {
      "@type": "WebSite",
      "name": "KıyasGO",
      "url": "https://www.kiyasgo.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.kiyasgo.com/arama?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "KıyasGO",
      "operatingSystem": "Web",
      "applicationCategory": "ShoppingApplication"
    }
  ]
}
```

### Product Schema (Ürün Sayfaları)
```json
{
  "@type": "Product",
  "name": "iPhone 15 Pro",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "45000",
    "highPrice": "52000",
    "priceCurrency": "TRY",
    "offerCount": "5"
  }
}
```

### FAQ Schema (KıyasGO Nedir sayfası)
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "KıyasGO nedir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "KıyasGO, Türkiye'de fiyat karşılaştırma için geliştirilmiş yapay zeka destekli bir platformdur."
      }
    }
  ]
}
```

---

## 3. Google Search Console İşlemleri

### İlk Kurulum
1. **Sitemap ekle:** GSC > Sitemaps > `sitemap.xml` ekle
2. **URL Denetimi:** Ana sayfayı ve önemli sayfaları manuel indeksle
3. **Schema Test:** [Rich Results Test](https://search.google.com/test/rich-results)

### Haftalık Takip
- Performance > Query "kıyasgo" filtrele
- Impression ve Click artışını izle
- Average Position 1. sıraya yaklaşmalı

---

## 4. AI Dostu İçerik

### Net Tanım Cümleleri
> "KıyasGO, Türkiye'de telefon ve elektronik ürünler için geliştirilmiş yapay zeka destekli bir fiyat karşılaştırma platformudur."

> "KıyasGO, Akakçe ve Cimri'ye alternatif olarak geliştirilen yeni nesil bir fiyat karşılaştırma sitesidir."

### Footer
> "KıyasGO - Türkiye'nin yapay zeka destekli fiyat karşılaştırma platformu"

---

## 5. Off-Site SEO

| Platform | Aksiyon |
|----------|---------|
| Medium | "Türkiye'de fiyat karşılaştırma siteleri 2026" yazısı |
| Ekşi Sözlük | "kıyasgo" entry'si |
| Reddit r/Turkey | "Yeni fiyat karşılaştırma sitesi buldum" postu |
| LinkedIn | Şirket sayfasında duyuru |
| Sosyal Medya | KıyasGO Nedir sayfasına link veren post |

---

## 6. Checklist

- [x] robots.txt AI botlarına açık
- [x] Organization schema aktif
- [x] WebSite schema (SearchAction) aktif
- [x] Product schema ürün sayfalarında (AggregateOffer ile)
- [x] FAQ schema /kiyasgo-nedir'de
- [ ] OG Image (1200x630px alınacak, şu an logo.png)
- [x] Sitemap GSC'de
- [ ] Manuel indeksleme yapıldı

