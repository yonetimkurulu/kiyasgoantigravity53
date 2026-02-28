-- 1) Toplam ürün, family key doluluk
SELECT
  COUNT(*) AS total_products,
  COUNT(*) FILTER (WHERE coalesce(product_family_key, '') <> '') AS products_with_family_key,
  COUNT(*) FILTER (WHERE coalesce(product_family_key, '') = '') AS products_without_family_key
FROM products;

-- 2) En çok varyanta sahip model aileleri
SELECT
  product_family_key,
  COUNT(*) AS variant_count,
  MIN(price) AS min_price,
  MAX(price) AS max_price
FROM products
WHERE coalesce(product_family_key, '') <> ''
GROUP BY product_family_key
HAVING COUNT(*) > 1
ORDER BY variant_count DESC, product_family_key
LIMIT 30;

-- 3) Aile içinde isim örnekleri (spot check)
SELECT
  product_family_key,
  ARRAY_AGG(name ORDER BY name) AS sample_names
FROM products
WHERE coalesce(product_family_key, '') <> ''
GROUP BY product_family_key
HAVING COUNT(*) BETWEEN 2 AND 6
ORDER BY COUNT(*) DESC, product_family_key
LIMIT 20;

-- 4) Boş kalanları hızlı inceleme
SELECT id, name, slug, category, subcategory
FROM products
WHERE coalesce(product_family_key, '') = ''
ORDER BY name
LIMIT 100;

-- 5) Samsung telefon kontrolü (sizin örnek için)
SELECT
  product_family_key,
  name,
  slug,
  price
FROM products
WHERE lower(name) LIKE '%samsung%'
  AND (lower(subcategory) LIKE '%telefon%' OR lower(category) LIKE '%telefon%')
ORDER BY product_family_key, price NULLS LAST, name;
