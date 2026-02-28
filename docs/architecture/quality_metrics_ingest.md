# Quality Metrics Ingest (MVP+)

Bu akış, ürün önerilerinde batarya/ekran/GPU gibi sinyalleri veri odaklı kullanmak için tasarlanmıştır.

## 1) SQL migration

Supabase SQL Editor'de çalıştır:

- `supabase/add_product_quality_metrics.sql`

## 2) İlk veri çekimi

Proje kökünde çalıştır:

- `npm run metrics:collect`

Script:

- `products` tablosundan `specs`, `gsmarena_data`, `desc`, `description` alanlarını okur.
- Aşağıdaki metrikleri parse eder:
  - `battery_mah`
  - `camera_main_mp`
  - `screen_refresh_hz`
  - `screen_resolution_tier`
  - `gpu_model`, `gpu_tier`, `gpu_tdp_watt`
- Sonuçları `product_quality_metrics` tablosuna upsert eder.
- Ham gözlemleri `product_metric_observations` tablosuna yazar.

## 3) Öneri motoru etkisi

Asistan API (`app/api/openai/route.js`) artık:

- Batarya odaklı isteklerde mAh sinyaline,
- Ekran odaklı isteklerde Hz + çözünürlük sinyaline,
- Performans odaklı (özellikle laptop) isteklerde GPU model/tier/TDP sinyaline

ek puan uygular.

## 4) Operasyon

- Haftalık toplu güncelleme için cron/job ile `npm run metrics:collect` planlanabilir.
- Yeni kaynaklar (Amazon, Hepsiburada vb.) geldiğinde `specs/raw payload` alanı zenginleşirse parse kalitesi otomatik artar.
