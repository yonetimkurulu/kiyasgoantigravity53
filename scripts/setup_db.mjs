
// Bu dosya veritabanını oluşturmaz, sadece oluşturman gereken SQL kodunu verir.
console.log(`
------------------------------------------------------------------
⚠️ TABLO YAPISINI GÜNCELLİYORUZ (images1 -> image) ⚠️

Supabase SQL Editor kısmına şu kodu yapıştır ve çalıştır:
------------------------------------------------------------------

-- Önce varsa image1'i silelim (Veri kaybı olmaması için veriyi image'a taşıyabilirsin ama sen sil dedin)
ALTER TABLE products DROP COLUMN IF EXISTS image1;

-- 'image' sütunu yoksa ekleyelim (Ana resim bu olacak)
ALTER TABLE products ADD COLUMN IF NOT EXISTS image text;

-- Diğerleri zaten vardı ama garanti olsun
ALTER TABLE products ADD COLUMN IF NOT EXISTS image2 text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image3 text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image4 text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image5 text;

------------------------------------------------------------------
`);
