-- NanoReview enrichment compatibility
-- Run once in Supabase SQL Editor

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS nanoreview_data jsonb;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS nanoreview_score integer;

CREATE INDEX IF NOT EXISTS idx_products_nanoreview_data_not_null
  ON public.products (id)
  WHERE nanoreview_data IS NOT NULL;

SELECT 'nanoreview_columns_ready' AS status;