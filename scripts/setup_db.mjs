
// Bu dosya veritabanını oluşturmaz, sadece oluşturman gereken SQL kodunu verir.
console.log(`
------------------------------------------------------------------
⚠️ TABLON ZATEN VAR, SADECE SÜTUNLARI EKLEMEMİZ LAZIM ⚠️

Supabase SQL Editor kısmına şu kodu yapıştır ve çalıştır:
------------------------------------------------------------------

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image1 text,
ADD COLUMN IF NOT EXISTS image2 text,
ADD COLUMN IF NOT EXISTS image3 text,
ADD COLUMN IF NOT EXISTS image4 text,
ADD COLUMN IF NOT EXISTS image5 text,

ADD COLUMN IF NOT EXISTS store2_name text,
ADD COLUMN IF NOT EXISTS store2_price numeric,
ADD COLUMN IF NOT EXISTS store2_link text,

ADD COLUMN IF NOT EXISTS store3_name text,
ADD COLUMN IF NOT EXISTS store3_price numeric,
ADD COLUMN IF NOT EXISTS store3_link text,

ADD COLUMN IF NOT EXISTS store4_name text,
ADD COLUMN IF NOT EXISTS store4_price numeric,
ADD COLUMN IF NOT EXISTS store4_link text,

ADD COLUMN IF NOT EXISTS store5_name text,
ADD COLUMN IF NOT EXISTS store5_price numeric,
ADD COLUMN IF NOT EXISTS store5_link text;

------------------------------------------------------------------
`);
