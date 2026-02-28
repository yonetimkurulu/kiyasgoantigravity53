-- Favorites integrity hardening
-- Safe to run multiple times (idempotent)

-- 1) Normalizer function for legacy route-style favorite IDs
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

  -- Legacy route-style format: ...en-ucuz-<slug>-fiyati...
  IF v ILIKE '%en-ucuz-%-fiyati%' THEN
    v := regexp_replace(v, '^.*en-ucuz-(.*)-fiyati.*$', '\1');
  END IF;

  RETURN btrim(v);
END;
$$;

-- 2) Trigger to normalize on write
CREATE OR REPLACE FUNCTION public.trg_normalize_favorite_product_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.product_id := public.normalize_favorite_product_id(NEW.product_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_favorites_normalize_product_id ON public.favorites;
CREATE TRIGGER trg_favorites_normalize_product_id
BEFORE INSERT OR UPDATE OF product_id ON public.favorites
FOR EACH ROW
EXECUTE FUNCTION public.trg_normalize_favorite_product_id();

-- 3) One-time cleanup for existing rows
UPDATE public.favorites
SET product_id = public.normalize_favorite_product_id(product_id)
WHERE product_id IS DISTINCT FROM public.normalize_favorite_product_id(product_id);

-- 4) Remove exact duplicates (same user + same product_id)
WITH ranked AS (
  SELECT
    ctid,
    row_number() OVER (PARTITION BY user_id, product_id ORDER BY ctid) AS rn
  FROM public.favorites
)
DELETE FROM public.favorites f
USING ranked r
WHERE f.ctid = r.ctid
  AND r.rn > 1;

-- 5) Enforce integrity and performance indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'favorites_product_id_not_blank'
      AND conrelid = 'public.favorites'::regclass
  ) THEN
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_product_id_not_blank
      CHECK (product_id IS NOT NULL AND btrim(product_id) <> '');
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_favorites_user_product
  ON public.favorites (user_id, product_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'favorites'
      AND column_name = 'created_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_favorites_user_created_at
      ON public.favorites (user_id, created_at DESC);
  ELSE
    CREATE INDEX IF NOT EXISTS idx_favorites_user
      ON public.favorites (user_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_favorites_product_id
  ON public.favorites (product_id);

SELECT 'favorites_hardening_complete' AS status;