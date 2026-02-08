# 📡 Data Sources Strategy

Tüm veri kaynakları ve scraper planları tek dokümanda.

---

## 1. Aktif Kaynaklar

| Kaynak | Durum | Scraper | Veri Tipi |
|--------|-------|---------|-----------|
| **GSMArena** | ✅ Aktif | `gsmarena_selenium.py` | Specs, benchmark, battery |
| **NanoReview** | ✅ Aktif | `nanoreview_scraper.py` | Skorlar, benchmark |

---

## 2. GSMArena Entegrasyonu

### Çekilen Veriler
| Veri | Örnek | Kaynak |
|------|-------|--------|
| `battery_active_hours` | 12.97 | Test sayfası |
| `battery_endurance` | 86 | Test sayfası |
| `display_brightness_nits` | 1786 | Test sayfası |
| `loudspeaker_lufs` | -26.4 | Test sayfası |
| `antutu_score` | 1918239 | Spec tablosu |
| `display_refresh_rate` | 120 | Spec tablosu |
| `chipset` | "Snapdragon 8 Gen 3" | Spec tablosu |
| `main_camera_mp` | 200 | Spec tablosu |

### Veritabanı
```sql
ALTER TABLE products ADD COLUMN gsmarena_data JSONB;
CREATE INDEX idx_products_gsmarena ON products USING gin(gsmarena_data);
```

### Kullanım
```powershell
.\venv\Scripts\python gsmarena_selenium.py --product-name "Samsung Galaxy S24 Ultra"
```

---

## 3. NanoReview Entegrasyonu

### Neden Ek Kaynak?
NanoReview, GSMArena'dan çok daha zengin **skorlama verileri** sunuyor.

| Veri | NanoReview | GSMArena |
|------|------------|----------|
| Overall Score | ✅ 86/100 | ❌ |
| GeekBench Single | ✅ 2,271 | ❌ |
| GeekBench Multi | ✅ 7,119 | ❌ |
| DxOMark Camera | ✅ 144 | ❌ |
| Gaming Score | ✅ 90/100 | ❌ |

### Çekilen Veriler
```json
{
  "nanoreview_score": 86,
  "antutu_score": 1918239,
  "geekbench_single": 2271,
  "geekbench_multi": 7119,
  "dxomark_score": 144,
  "display_score": 90,
  "battery_score": 86,
  "gaming_score": 90
}
```

### Veritabanı
```sql
ALTER TABLE products ADD COLUMN nanoreview_data JSONB;
CREATE INDEX idx_products_nanoreview ON products USING gin(nanoreview_data);
```

---

## 4. Amazon API (Gelecek)

### Strateji
Amazon PA-API v5 entegrasyonu için hazırlık:
- Parent ASIN → Child ASIN mapping
- Her varyant ayrı ürün olarak kaydedilecek
- Adapter fonksiyonu ile mevcut sisteme uyum

### Mapping
| Amazon | KıyasGO |
|--------|---------|
| Parent ASIN | `group_id` (opsiyonel) |
| Child ASIN | `amazon_sku` |
| Title + Color | `name` |
| Price | `price` |
| Detail Page URL | `store1_link` |

### Kod Örneği
```javascript
amazonItems.forEach(parent => {
    parent.variations.forEach(variant => {
        const kiyasGoName = `${parent.title} ${variant.color} ${variant.size}`;
        supabase.from('products').upsert({
            name: kiyasGoName,
            price: variant.price,
            image: variant.largeImage,
            store1_link: variant.detailPageUrl
        });
    });
});
```

---

## 5. Kaynak Öncelik Matrisi

| Tier | Source | Status | Priority |
|------|--------|--------|----------|
| 🔴 Primary | GSMArena | ✅ Active | P0 |
| 🔴 Primary | NanoReview | ✅ Active | P0 |
| 🟡 Secondary | Amazon TR | ⏳ Planned | P1 |
| 🟡 Secondary | Trendyol | ⏳ Planned | P1 |
| 🟡 Secondary | Hepsiburada | ⏳ Planned | P1 |
| 🟢 Backup | n11 | ⏳ Planned | P2 |
| 🟢 Backup | Epey | ⏳ Planned | P2 |

---

## 6. Dikkat Edilecekler

> [!WARNING]
> GSMArena ve NanoReview anti-scraping koruması var. Rate limiting ve User-Agent gerekli.

> [!IMPORTANT]
> Scraper'lar sadece batch/cron ile çalışmalı. Canlı çekme yapılmamalı.

---

## 7. Scraper Çalıştırma

```powershell
# GSMArena
.\venv\Scripts\python gsmarena_selenium.py --product-name "iPhone 16 Pro"

# NanoReview
.\venv\Scripts\python nanoreview_scraper.py --test
```

---

## 8. Review Intelligence Sources

> [!NOTE]
> **MVP Durumu:** Şu an için mock/placeholder yıldızlar kullanılıyor.
> **Gelecek Plan:** Affiliate API'ler geldiğinde gerçek yorum verisi çekilecek.

Detaylı mimari için: **[review_discovery_architecture.md](./review_discovery_architecture.md)**

### Yorum Kaynakları (Affiliate Bekleniyor)

| Platform | Öncelik | Durum | Affiliate API |
|----------|---------|-------|---------------|
| **Amazon TR** | P0 | ⏳ Beklemede | PA-API v5 |
| **Trendyol** | P0 | ⏳ Beklemede | Trendyol Affiliate |
| **Hepsiburada** | P1 | ⏳ Beklemede | HB Partner API |
| **N11** | P2 | ⏳ Beklemede | N11 Affiliate |

### MVP Stratejisi

```
Şu An (MVP):
├─ Mock/placeholder yıldızlar (4.2, 4.5 gibi)
├─ Gerçek yorum verisi YOK
└─ UI hazır, data bekleniyor

Affiliate Geldiğinde:
├─ Amazon PA-API → Gerçek rating + review count
├─ Trendyol API → Gerçek yorumlar
├─ AI Processing → Pros/cons/issues extraction
└─ Full Review Intelligence aktif
```

> 🎯 **Affiliate API'ler geldiğinde bu bölüm aktifleşecek.**

