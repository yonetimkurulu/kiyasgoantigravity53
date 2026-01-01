-- Products Tablosu Performance İndeksleri
-- Supabase SQL Editor'de çalıştır

-- 1. Subcategory indeksi (en önemli - kategori bazlı sorgular için)
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);

-- 2. Category indeksi (ana kategori filtreleme)  
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 3. Fiyat indeksi (sıralama ve range sorguları için)
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 4. GSMArena verisi için GIN indeks (JSON sorguları)
CREATE INDEX IF NOT EXISTS idx_products_gsmarena ON products USING gin(gsmarena_data);

-- 6. Composite indeks (subcategory + price birlikte)
CREATE INDEX IF NOT EXISTS idx_products_subcat_price ON products(subcategory, price);

-- İndeks durumunu kontrol et
SELECT indexname, tablename FROM pg_indexes WHERE tablename = 'products';
