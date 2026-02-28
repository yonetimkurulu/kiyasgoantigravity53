-- Future variant ingestion infrastructure (Amazon/Akakçe/other feeds)
-- Safe to run multiple times.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS source_name text,
ADD COLUMN IF NOT EXISTS source_product_id text,
ADD COLUMN IF NOT EXISTS source_variant_id text,
ADD COLUMN IF NOT EXISTS variant_attributes jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS canonical_variant_key text,
ADD COLUMN IF NOT EXISTS raw_source_payload jsonb,
ADD COLUMN IF NOT EXISTS first_seen_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

CREATE OR REPLACE FUNCTION public.normalize_identity_token(raw_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    trim(
      regexp_replace(
        regexp_replace(
          lower(
            translate(
              coalesce(raw_text, ''),
              'ÇĞİÖŞÜçğıöşü',
              'CGIOSUcgiosu'
            )
          ),
          '[^a-z0-9\s]+', ' ', 'g'
        ),
        '\s+', ' ', 'g'
      )
    ),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.detect_variant_color(raw_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN coalesce(raw_text, '') ~* '\m(siyah|black|midnight|graphite)\M' THEN 'siyah'
    WHEN coalesce(raw_text, '') ~* '\m(beyaz|white|starlight)\M' THEN 'beyaz'
    WHEN coalesce(raw_text, '') ~* '\m(mavi|blue)\M' THEN 'mavi'
    WHEN coalesce(raw_text, '') ~* '\m(yesil|green)\M' THEN 'yesil'
    WHEN coalesce(raw_text, '') ~* '\m(kirmizi|red)\M' THEN 'kirmizi'
    WHEN coalesce(raw_text, '') ~* '\m(mor|purple)\M' THEN 'mor'
    WHEN coalesce(raw_text, '') ~* '\m(gri|gray|grey|uzay grisi|space gray|titanyum|titanium|silver)\M' THEN 'gri'
    WHEN coalesce(raw_text, '') ~* '\m(gold|altin|altn)\M' THEN 'altin'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.extract_storage_bucket(raw_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN coalesce(raw_text, '') ~* '\m(64\s?gb)\M' THEN '64gb'
    WHEN coalesce(raw_text, '') ~* '\m(128\s?gb)\M' THEN '128gb'
    WHEN coalesce(raw_text, '') ~* '\m(256\s?gb)\M' THEN '256gb'
    WHEN coalesce(raw_text, '') ~* '\m(512\s?gb)\M' THEN '512gb'
    WHEN coalesce(raw_text, '') ~* '\m(1\s?tb|1024\s?gb)\M' THEN '1tb'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.build_canonical_variant_key(
  raw_name text,
  raw_slug text,
  attrs jsonb DEFAULT '{}'::jsonb
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized_family text;
  scan_text text;
  color_token text;
  storage_token text;
  ram_token text;
  model_token text;
BEGIN
  normalized_family := coalesce(
    public.normalize_product_family_key(coalesce(nullif(raw_slug, ''), raw_name)),
    ''
  );

  scan_text := lower(coalesce(raw_slug, '') || ' ' || coalesce(raw_name, ''));

  color_token := coalesce(
    public.normalize_identity_token(attrs ->> 'color'),
    public.detect_variant_color(scan_text)
  );

  storage_token := coalesce(
    public.normalize_identity_token(attrs ->> 'storage'),
    public.extract_storage_bucket(scan_text)
  );

  ram_token := public.normalize_identity_token(attrs ->> 'ram');
  model_token := public.normalize_identity_token(attrs ->> 'model');

  RETURN trim(both '|' FROM concat_ws(
    '|',
    NULLIF(normalized_family, ''),
    NULLIF(model_token, ''),
    NULLIF(storage_token, ''),
    NULLIF(ram_token, ''),
    NULLIF(color_token, '')
  ));
END;
$$;

CREATE OR REPLACE FUNCTION public.set_product_identity_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.source_name := NULLIF(lower(trim(coalesce(NEW.source_name, ''))), '');
  NEW.source_product_id := NULLIF(trim(coalesce(NEW.source_product_id, '')), '');
  NEW.source_variant_id := NULLIF(trim(coalesce(NEW.source_variant_id, '')), '');
  NEW.variant_attributes := coalesce(NEW.variant_attributes, '{}'::jsonb);

  NEW.product_family_key := public.normalize_product_family_key(
    coalesce(nullif(NEW.slug, ''), NEW.name)
  );

  NEW.canonical_variant_key := public.build_canonical_variant_key(
    NEW.name,
    NEW.slug,
    NEW.variant_attributes
  );

  NEW.first_seen_at := coalesce(NEW.first_seen_at, now());
  NEW.last_seen_at := coalesce(NEW.last_seen_at, now());
  NEW.is_active := coalesce(NEW.is_active, true);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_set_identity_fields ON products;

CREATE TRIGGER trg_products_set_identity_fields
BEFORE INSERT OR UPDATE OF name, slug, source_name, source_product_id, source_variant_id, variant_attributes
ON products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_identity_fields();

UPDATE products
SET
  variant_attributes = coalesce(variant_attributes, '{}'::jsonb),
  source_name = NULLIF(lower(trim(coalesce(source_name, ''))), ''),
  source_product_id = NULLIF(trim(coalesce(source_product_id, '')), ''),
  source_variant_id = NULLIF(trim(coalesce(source_variant_id, '')), ''),
  product_family_key = public.normalize_product_family_key(coalesce(nullif(slug, ''), name)),
  canonical_variant_key = public.build_canonical_variant_key(name, slug, coalesce(variant_attributes, '{}'::jsonb)),
  first_seen_at = coalesce(first_seen_at, now()),
  last_seen_at = coalesce(last_seen_at, now()),
  is_active = coalesce(is_active, true)
WHERE
  coalesce(product_family_key, '') = ''
  OR coalesce(canonical_variant_key, '') = ''
  OR source_name IS DISTINCT FROM NULLIF(lower(trim(coalesce(source_name, ''))), '')
  OR source_product_id IS DISTINCT FROM NULLIF(trim(coalesce(source_product_id, '')), '')
  OR source_variant_id IS DISTINCT FROM NULLIF(trim(coalesce(source_variant_id, '')), '')
  OR variant_attributes IS NULL
  OR first_seen_at IS NULL
  OR last_seen_at IS NULL
  OR is_active IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_source_name ON products(source_name);
CREATE INDEX IF NOT EXISTS idx_products_source_variant_id ON products(source_variant_id);
CREATE INDEX IF NOT EXISTS idx_products_canonical_variant_key ON products(canonical_variant_key);
CREATE INDEX IF NOT EXISTS idx_products_source_variant_lookup ON products(source_name, source_variant_id);
CREATE INDEX IF NOT EXISTS idx_products_source_family_lookup ON products(source_name, product_family_key, canonical_variant_key);

-- Optional after duplicate cleanup:
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_products_source_variant_id
-- ON products(source_name, source_variant_id)
-- WHERE coalesce(source_name, '') <> '' AND coalesce(source_variant_id, '') <> '';

CREATE OR REPLACE FUNCTION public.upsert_product_from_feed(
  p_name text,
  p_slug text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_subcategory text DEFAULT NULL,
  p_brand text DEFAULT NULL,
  p_price numeric DEFAULT NULL,
  p_image text DEFAULT NULL,
  p_source_name text DEFAULT NULL,
  p_source_product_id text DEFAULT NULL,
  p_source_variant_id text DEFAULT NULL,
  p_variant_attributes jsonb DEFAULT '{}'::jsonb,
  p_raw_source_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_id text;
  v_source text;
  v_canonical_variant_key text;
BEGIN
  v_source := NULLIF(lower(trim(coalesce(p_source_name, ''))), '');
  v_canonical_variant_key := public.build_canonical_variant_key(
    p_name,
    coalesce(p_slug, ''),
    coalesce(p_variant_attributes, '{}'::jsonb)
  );

  IF v_source IS NOT NULL AND NULLIF(trim(coalesce(p_source_variant_id, '')), '') IS NOT NULL THEN
    SELECT id::text INTO v_id
    FROM products
    WHERE source_name = v_source
      AND source_variant_id = NULLIF(trim(coalesce(p_source_variant_id, '')), '')
    LIMIT 1;
  END IF;

  IF v_id IS NULL AND v_source IS NOT NULL AND v_canonical_variant_key <> '' THEN
    SELECT id::text INTO v_id
    FROM products
    WHERE source_name = v_source
      AND canonical_variant_key = v_canonical_variant_key
    LIMIT 1;
  END IF;

  IF v_id IS NULL THEN
    INSERT INTO products (
      name,
      slug,
      category,
      subcategory,
      brand,
      price,
      image,
      source_name,
      source_product_id,
      source_variant_id,
      variant_attributes,
      raw_source_payload,
      first_seen_at,
      last_seen_at,
      is_active
    ) VALUES (
      p_name,
      coalesce(p_slug, ''),
      p_category,
      p_subcategory,
      p_brand,
      p_price,
      p_image,
      v_source,
      NULLIF(trim(coalesce(p_source_product_id, '')), ''),
      NULLIF(trim(coalesce(p_source_variant_id, '')), ''),
      coalesce(p_variant_attributes, '{}'::jsonb),
      coalesce(p_raw_source_payload, '{}'::jsonb),
      now(),
      now(),
      true
    )
    RETURNING id::text INTO v_id;
  ELSE
    UPDATE products
    SET
      name = coalesce(NULLIF(p_name, ''), name),
      slug = coalesce(NULLIF(p_slug, ''), slug),
      category = coalesce(NULLIF(p_category, ''), category),
      subcategory = coalesce(NULLIF(p_subcategory, ''), subcategory),
      brand = coalesce(NULLIF(p_brand, ''), brand),
      price = coalesce(p_price, price),
      image = coalesce(NULLIF(p_image, ''), image),
      source_name = coalesce(v_source, source_name),
      source_product_id = coalesce(NULLIF(trim(coalesce(p_source_product_id, '')), ''), source_product_id),
      source_variant_id = coalesce(NULLIF(trim(coalesce(p_source_variant_id, '')), ''), source_variant_id),
      variant_attributes = coalesce(p_variant_attributes, variant_attributes, '{}'::jsonb),
      raw_source_payload = coalesce(p_raw_source_payload, raw_source_payload, '{}'::jsonb),
      last_seen_at = now(),
      is_active = true
    WHERE id::text = v_id;
  END IF;

  RETURN v_id;
END;
$$;
