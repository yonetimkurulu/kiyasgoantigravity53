ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_family_key text;

CREATE OR REPLACE FUNCTION public.normalize_product_family_key(raw_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    trim(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  lower(
                    translate(
                      coalesce(raw_name, ''),
                      'ÇĞİÖŞÜçğıöşü',
                      'CGIOSUcgiosu'
                    )
                  ),
                  '[-_/]+', ' ', 'g'
                ),
                '\m\d+\s*(gb|tb|mb|ram)\M', ' ', 'g'
              ),
              '\m(5g|4g|lte|nfc|dual\s?sim|tek\s?sim|cift\s?sim|ciftsim)\M', ' ', 'g'
            ),
            '\m(siyah|black|beyaz|white|mavi|blue|yesil|green|kirmizi|red|mor|purple|pembe|pink|gri|gray|grey|silver|gold|altin|altn|midnight|starlight|graphite|titanyum|titanium|uzay\s?grisi|space\s?gray)\M', ' ', 'g'
          ),
          '[^a-z0-9\s]+', ' ', 'g'
        ),
        '\s+', ' ', 'g'
      )
    ),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.set_product_family_key()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.product_family_key := public.normalize_product_family_key(
    coalesce(nullif(NEW.slug, ''), NEW.name)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_set_family_key ON products;

CREATE TRIGGER trg_products_set_family_key
BEFORE INSERT OR UPDATE OF name, slug
ON products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_family_key();

UPDATE products
SET product_family_key = public.normalize_product_family_key(
  coalesce(nullif(slug, ''), name)
)
WHERE coalesce(product_family_key, '') = ''
   OR product_family_key <> public.normalize_product_family_key(coalesce(nullif(slug, ''), name));

CREATE INDEX IF NOT EXISTS idx_products_family_key
ON products(product_family_key);
