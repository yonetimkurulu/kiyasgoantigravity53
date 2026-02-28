# Variant Ingest Playbook (Amazon ve yeni feed kaynakları)

Bu playbook, yeni kaynaklardan gelen ürün/varyant akışlarında tekrarları kontrol etmek ve model ailelerini doğru gruplamak için hazırlanmıştır.

## 1) Önkoşul

Önce aşağıdaki SQL migration'ı çalıştır:

- `supabase/add_variant_ingest_infra.sql`

Bu migration şunları ekler:

- `products.source_name`
- `products.source_product_id`
- `products.source_variant_id`
- `products.variant_attributes` (JSONB)
- `products.canonical_variant_key`
- `products.raw_source_payload`
- `products.first_seen_at`
- `products.last_seen_at`
- `products.is_active`
- Otomatik identity trigger'ı (`trg_products_set_identity_fields`)
- Feed-safe upsert RPC fonksiyonu: `public.upsert_product_from_feed(...)`

## 2) Önerilen ingestion kuralı

Yeni kaynaklarda doğrudan `insert` yerine RPC kullan:

- `source_name`: örn. `amazon`, `akakce`, `hepsiburada`
- `source_product_id`: kaynak ürün id
- `source_variant_id`: kaynak varyant id (varsa)
- `variant_attributes`: örn. `{ "color": "Siyah", "storage": "256 GB", "ram": "8 GB" }`

## 3) Örnek RPC çağrısı (Supabase JS)

```js
await supabase.rpc('upsert_product_from_feed', {
  p_name: 'Samsung Galaxy S23 FE 256 GB Siyah',
  p_slug: 'samsung-galaxy-s23-fe-256-gb-siyah',
  p_category: 'elektronik',
  p_subcategory: 'cep-telefonu',
  p_brand: 'Samsung',
  p_price: 27999,
  p_image: 'https://.../image.jpg',
  p_source_name: 'amazon',
  p_source_product_id: 'B0XXXXX',
  p_source_variant_id: 'B0YYYYY',
  p_variant_attributes: {
    color: 'Siyah',
    storage: '256 GB',
    ram: '8 GB'
  },
  p_raw_source_payload: {
    rawTitle: 'Amazon title',
    merchant: 'Amazon TR'
  }
});
```

## 4) Veri kalitesi kontrolleri

- `supabase/verify_product_family_key.sql` ile periodik kontrol yap.
- Özellikle `products_without_family_key` değerini 0'a yakın tut.
- `variant_count` aşırı yüksek aileleri manuel spot-check et.

## 5) Operasyon notları

- Aynı modelin farklı renk/depolama kombinasyonları `product_family_key` altında gruplanır.
- Her varyant `canonical_variant_key` ile ayrıştırılır.
- Aynı kaynakta gelen tekrarlar (`source_variant_id` varsa) update edilir, yeni satır açılmaz.
