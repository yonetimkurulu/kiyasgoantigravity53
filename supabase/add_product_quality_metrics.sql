-- Product quality metrics for feature-aware assistant ranking
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS product_quality_metrics (
  product_slug text PRIMARY KEY,
  product_id text,
  product_name text,
  category text,
  subcategory text,
  battery_mah integer,
  camera_main_mp integer,
  screen_size_inch numeric(4,2),
  screen_refresh_hz integer,
  screen_resolution_tier smallint,
  gpu_model text,
  gpu_tier smallint,
  gpu_tdp_watt integer,
  quality_score numeric(6,2) DEFAULT 0,
  confidence numeric(4,2) DEFAULT 0,
  metrics_payload jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_metric_observations (
  id bigserial PRIMARY KEY,
  run_id text NOT NULL,
  product_slug text NOT NULL,
  metric_key text NOT NULL,
  metric_value text NOT NULL,
  metric_numeric numeric,
  source_field text,
  source_name text DEFAULT 'internal_parse',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quality_metrics_category
  ON product_quality_metrics(category, subcategory);

CREATE INDEX IF NOT EXISTS idx_quality_metrics_battery
  ON product_quality_metrics(battery_mah DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_quality_metrics_screen
  ON product_quality_metrics(screen_refresh_hz DESC NULLS LAST, screen_resolution_tier DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_quality_metrics_gpu
  ON product_quality_metrics(gpu_tier DESC NULLS LAST, gpu_tdp_watt DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_metric_observations_slug
  ON product_metric_observations(product_slug, metric_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_metric_observations_run
  ON product_metric_observations(run_id);
