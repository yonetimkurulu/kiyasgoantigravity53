# Vercel + Data Jobs (Hybrid)

Hibrit model:

- Kısa ve düzenli metrik hesapları: **Vercel Cron**
- Uzun/anti-bot riski olan scraping işleri: **GitHub Actions**

## Eklenen workflow/cron yapısı

- `.github/workflows/metrics-collect.yml`
  - Sadece manual fallback (schedule kapalı)
  - `npm run metrics:collect`

- `.github/workflows/data-enrichment.yml`
  - Her gün 02:50 UTC
  - Varsayılan schedule: GSMArena enrichment
  - Manual dispatch ile NanoReview opsiyonel açılabilir
  - Manual input'lar: `gsmarena_limit`, `gsmarena_delay`, `run_nanoreview`, `nanoreview_limit`, `run_metrics_collect`

- `vercel.json` cron
  - Her gün 03:20 UTC → `/api/cron/metrics`
  - Endpoint: `app/api/cron/metrics/route.js`

## "Data Enrichment nerede?" (UI yolu)

GitHub repo içinde:

1. **Actions** sekmesine gir
2. Sol listede **Data Enrichment** workflow adını gör
3. Sağ üstten **Run workflow** butonuna bas

Eğer listede görünmüyorsa genelde sebep:

- `.github/workflows/data-enrichment.yml` dosyası henüz GitHub'a push edilmemiştir
- veya default branch dışında kalmıştır

Önce değişiklikleri push et, sonra Actions ekranını yenile.

## Gerekli GitHub Secrets

Repository Settings → Secrets and variables → Actions:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

## Gerekli Vercel Environment Variables

Project Settings → Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `CRON_SECRET`
- `METRICS_CRON_LIMIT` (opsiyonel, öneri: `120`)

Not: Vercel cron endpoint'i `Authorization: Bearer <CRON_SECRET>` ile korunur.

## Manual run önerisi

Actions → Data Enrichment → Run workflow:

- `run_gsmarena: true`
- `gsmarena_limit: 30`
- `gsmarena_delay: 15`
- `run_nanoreview: false` (ilk aşamada)
- `run_metrics_collect: false` (normalde Vercel cron bunu yapıyor)

NanoReview anti-bot sebebiyle flaky olabilir; bu yüzden default kapalıdır.

## Neden bu model?

- Vercel serverless fonksiyonları uzun scraping job'ları için uygun değil.
- Vercel cron kısa işleri otomatik yönetir.
- Actions ağır scraping işlerini güvenli şekilde taşır.
- API performansı etkilenmeden ürün verisi düzenli zenginleşir.
