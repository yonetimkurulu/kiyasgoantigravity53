# KıyasGO Ölçekleme Planı (1M+ Ürün Hedefli)

## Hedef: MVP → 1 Milyon Ürün

---

## Aşama 1: MVP (Şu an → 50K ürün)
| Bileşen | Çözüm | Maliyet |
|---------|-------|---------|
| Database | Supabase Free | $0 |
| Search | Supabase ilike | $0 |
| Hosting | Vercel Free | $0 |
| Cache | Upstash Free | $0 |

**Toplam:** $0/ay

---

## Aşama 2: Büyüme (50K → 300K ürün)
| Bileşen | Çözüm | Maliyet |
|---------|-------|---------|
| Database | Supabase Pro (8GB) | $25/ay |
| Search | **Typesense Cloud** (önerilen) | $30/ay |
| Hosting | Vercel Pro | $20/ay |
| Cache | Upstash Pro | $10/ay |

**Toplam:** ~$85/ay

**Neden Typesense?**
- Elasticsearch'ten ucuz ve kolay
- 1M ürün araması <50ms
- Türkçe desteği iyi

---

## Aşama 3: Ciddi Ölçek (300K → 1M ürün)
| Bileşen | Çözüm | Maliyet |
|---------|-------|---------|
| Database | **PlanetScale** veya AWS RDS | $50-100/ay |
| Search | Typesense ($50) veya Algolia | $50-200/ay |
| Auth | Supabase Auth (ayrı tut) | $25/ay |
| Cache | Redis Cluster | $30/ay |

**Toplam:** ~$155-355/ay

---

## Aşama 4: Akakçe Seviyesi (1M → 10M+ ürün)
| Bileşen | Çözüm | Maliyet |
|---------|-------|---------|
| Database | AWS Aurora + Read Replicas | $300-500/ay |
| Search | Elasticsearch Cluster | $200-500/ay |
| Fiyat Geçmişi | TimescaleDB (ayrı) | $100-200/ay |

**Toplam:** $600-1200/ay

---

## Kritik Milestones

| Ürün Sayısı | Kritik Aksiyon |
|-------------|----------------|
| 50K | ✅ İndeksler optimize |
| 100K | ⚠️ Typesense entegrasyonu başla |
| 300K | ⚠️ Supabase'den migration planla |
| 500K | 🔴 PlanetScale/RDS'e geç |
| 1M | 🔴 Fiyat geçmişi ayrı DB'ye taşı |

---

## 1M Ürün İçin Önerim

```
┌─────────────────────────────────────┐
│         Vercel / Cloudflare         │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│            Typesense Cloud          │ ← Arama için
│           (1M ürün araması)         │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│      PlanetScale / AWS RDS          │ ← Ana ürün veritabanı
│         (PostgreSQL/MySQL)          │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│     Supabase Auth (ayrı kalır)     │ ← Kullanıcı yönetimi
└─────────────────────────────────────┘
```

---

## Şu An Yapılması Gerekenler

1. ✅ İndeksler oluştur (`add_performance_indexes.sql`)
2. ✅ Rate limiting aktif
3. ✅ `select('*')` → spesifik kolonlar
4. ⏳ 50K ürüne yaklaşınca Typesense test et
5. ⏳ 100K'da Supabase Pro'ya geç

---

## Arama Optimizasyon Yol Haritası

### Aşama 1 (MVP - Şimdi)
- [x] Sorgu limitlemesi (`.limit(100)`)
- [x] Spesifik kolon seçimi
- [x] Popüler aramaları Redis cache'le

### Aşama 2 (50K+ Ürün)
- [ ] Typesense entegrasyonu
- [ ] Autocomplete Typesense'e taşı
- [ ] Trending ürünler precompute (5dk cache)

### Aşama 3 (100K+ Ürün)
- [ ] Elasticsearch/Typesense tam migration
- [ ] DB → Search Engine async sync
- [ ] Kategori bazlı data partitioning

### Aşama 4 (500K+ Ürün)
- [ ] Search sharding
- [ ] Read replicas
- [ ] Materialized views for heavy queries

