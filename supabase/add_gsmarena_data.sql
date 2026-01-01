-- GSMArena Data Migration
-- Ürün tablosuna gsmarena_data JSONB kolonu ekle

-- 1. Kolon ekle
ALTER TABLE products ADD COLUMN IF NOT EXISTS gsmarena_data JSONB;

-- 2. İndeks ekle (arama performansı için)
CREATE INDEX IF NOT EXISTS idx_products_gsmarena_data ON products USING gin(gsmarena_data);

-- Örnek veri yapısı:
-- {
--   "gsmarena_url": "https://www.gsmarena.com/apple_iphone_15_pro-12557.php",
--   "gsmarena_name": "Apple iPhone 15 Pro",
--   "battery_active_hours": 12.97,
--   "battery_endurance": 86,
--   "display_brightness_nits": 1786,
--   "loudspeaker_lufs": -26.4,
--   "antutu_score": 1641883,
--   "scraped_at": "2024-12-30"
-- }
