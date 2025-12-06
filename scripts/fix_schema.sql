
-- EKSİK SÜTUNLARI EKLEME KOMUTU
-- Bu kodu Supabase SQL Editor'de çalıştırıp "Success" yazısını görmen lazım.

ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'elektronik';
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory text DEFAULT 'diger';
ALTER TABLE products ADD COLUMN IF NOT EXISTS "desc" text DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image text;

-- Slug'ı benzersiz (unique) yapalım ki aynı üründen 2 tane olmasın
ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);

-- İsteğe bağlı: Link sütunu yoksa ekleyelim
ALTER TABLE products ADD COLUMN IF NOT EXISTS link text;
