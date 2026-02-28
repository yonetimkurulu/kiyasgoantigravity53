-- Favorites health check and normalization helper

-- 1) Current shape distribution
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE product_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$') AS uuid_ids,
  COUNT(*) FILTER (WHERE product_id LIKE '%en-ucuz-%-fiyati%') AS route_style_ids,
  COUNT(*) FILTER (WHERE product_id ~* '^[a-z0-9\-]+$') AS slug_like_ids
FROM favorites;

-- 2) Route-style IDs that can be normalized to slug
SELECT
  user_id,
  product_id,
  regexp_replace(product_id, '^.*en-ucuz-(.*)-fiyati.*$', '\\1') AS extracted_slug
FROM favorites
WHERE product_id LIKE '%en-ucuz-%-fiyati%'
LIMIT 100;

-- 3) IDs not matching any product (potential broken favorites)
WITH normalized AS (
  SELECT
    f.user_id,
    f.product_id,
    CASE
      WHEN f.product_id LIKE '%en-ucuz-%-fiyati%'
        THEN regexp_replace(f.product_id, '^.*en-ucuz-(.*)-fiyati.*$', '\\1')
      ELSE f.product_id
    END AS normalized_key
  FROM favorites f
)
SELECT n.user_id, n.product_id, n.normalized_key
FROM normalized n
LEFT JOIN products p_slug ON p_slug.slug = n.normalized_key
LEFT JOIN products p_id ON p_id.id::text = n.normalized_key
WHERE p_slug.id IS NULL AND p_id.id IS NULL
LIMIT 200;

-- 4) Optional normalization UPDATE (safe, idempotent)
-- Converts route-style ids to slugs in place.
UPDATE favorites
SET product_id = regexp_replace(product_id, '^.*en-ucuz-(.*)-fiyati.*$', '\\1')
WHERE product_id LIKE '%en-ucuz-%-fiyati%';
