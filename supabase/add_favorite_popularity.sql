-- Favorite popularity infrastructure
-- Provides durable counters and top-favorited query surface

-- 1) Ensure normalizer exists (idempotent)
CREATE OR REPLACE FUNCTION public.normalize_favorite_product_id(input_value text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v text;
BEGIN
  IF input_value IS NULL THEN
    RETURN NULL;
  END IF;

  v := btrim(input_value);
  IF v = '' THEN
    RETURN NULL;
  END IF;

  IF v ILIKE '%en-ucuz-%-fiyati%' THEN
    v := regexp_replace(v, '^.*en-ucuz-(.*)-fiyati.*$', '\1');
  END IF;

  RETURN lower(btrim(v));
END;
$$;

-- 2) Counter table
CREATE TABLE IF NOT EXISTS public.product_favorite_counters (
  product_key text PRIMARY KEY,
  favorites_count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Counter refresh helper (single key)
CREATE OR REPLACE FUNCTION public.refresh_product_favorite_counter(p_product_key text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_key text;
  v_count bigint;
BEGIN
  v_key := public.normalize_favorite_product_id(p_product_key);

  IF v_key IS NULL THEN
    RETURN;
  END IF;

  SELECT COUNT(*)::bigint
  INTO v_count
  FROM public.favorites
  WHERE product_id = v_key;

  IF v_count <= 0 THEN
    DELETE FROM public.product_favorite_counters
    WHERE product_key = v_key;
    RETURN;
  END IF;

  INSERT INTO public.product_favorite_counters (product_key, favorites_count, updated_at)
  VALUES (v_key, v_count, now())
  ON CONFLICT (product_key)
  DO UPDATE SET
    favorites_count = EXCLUDED.favorites_count,
    updated_at = now();
END;
$$;

-- 4) Trigger maintenance on favorites writes
CREATE OR REPLACE FUNCTION public.trg_refresh_product_favorite_counters()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.refresh_product_favorite_counter(NEW.product_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_product_favorite_counter(OLD.product_id);
    RETURN OLD;
  ELSE
    IF NEW.product_id IS DISTINCT FROM OLD.product_id THEN
      PERFORM public.refresh_product_favorite_counter(OLD.product_id);
      PERFORM public.refresh_product_favorite_counter(NEW.product_id);
    ELSE
      PERFORM public.refresh_product_favorite_counter(NEW.product_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_favorites_refresh_counters ON public.favorites;
CREATE TRIGGER trg_favorites_refresh_counters
AFTER INSERT OR UPDATE OR DELETE ON public.favorites
FOR EACH ROW
EXECUTE FUNCTION public.trg_refresh_product_favorite_counters();

-- 5) Backfill/rebuild counters from existing favorites
INSERT INTO public.product_favorite_counters (product_key, favorites_count, updated_at)
SELECT
  f.product_id AS product_key,
  COUNT(*)::bigint AS favorites_count,
  now() AS updated_at
FROM public.favorites f
GROUP BY f.product_id
ON CONFLICT (product_key)
DO UPDATE SET
  favorites_count = EXCLUDED.favorites_count,
  updated_at = now();

DELETE FROM public.product_favorite_counters c
WHERE NOT EXISTS (
  SELECT 1
  FROM public.favorites f
  WHERE f.product_id = c.product_key
);

-- 6) Product-facing stats view
CREATE OR REPLACE VIEW public.product_favorite_stats AS
SELECT
  p.id AS product_id,
  p.slug,
  p.name,
  p.category,
  p.subcategory,
  COALESCE(fc.favorites_count, 0)::bigint AS favorite_count,
  fc.updated_at
FROM public.products p
LEFT JOIN LATERAL (
  SELECT
    SUM(c.favorites_count)::bigint AS favorites_count,
    MAX(c.updated_at) AS updated_at
  FROM public.product_favorite_counters c
  WHERE c.product_key = p.slug
     OR c.product_key = p.id::text
) fc ON true
WHERE COALESCE(fc.favorites_count, 0) > 0;

-- 7) Top favorites RPC
CREATE OR REPLACE FUNCTION public.get_top_favorited_products(
  p_limit integer DEFAULT 20,
  p_category text DEFAULT NULL
)
RETURNS TABLE (
  product_id text,
  slug text,
  name text,
  category text,
  subcategory text,
  favorite_count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.product_id::text,
    s.slug,
    s.name,
    s.category,
    s.subcategory,
    s.favorite_count
  FROM public.product_favorite_stats s
  WHERE p_category IS NULL
     OR lower(coalesce(s.category, '')) = lower(p_category)
  ORDER BY s.favorite_count DESC, s.name ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100));
$$;

GRANT SELECT ON public.product_favorite_counters TO anon, authenticated;
GRANT SELECT ON public.product_favorite_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_favorited_products(integer, text) TO anon, authenticated;

SELECT 'favorite_popularity_ready' AS status;