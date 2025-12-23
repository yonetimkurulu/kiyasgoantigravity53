-- ============================================
-- KıyasGO Security: Row Level Security Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pg_trgm extension for fuzzy search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- STEP 1: Enable RLS on all tables
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY; -- Uncomment if exists

-- ============================================
-- STEP 2: Products Table Policies
-- ============================================

-- Public can read all products (price comparison site)
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products
    FOR SELECT 
    USING (true);

-- Only service_role can modify products
DROP POLICY IF EXISTS "Service role write products" ON products;
CREATE POLICY "Service role write products" ON products
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ============================================
-- STEP 3: Product Summaries (AI Cache) Policies
-- ============================================

-- Public can read cached AI summaries
DROP POLICY IF EXISTS "Public read summaries" ON product_summaries;
CREATE POLICY "Public read summaries" ON product_summaries
    FOR SELECT 
    USING (true);

-- Only service_role can insert/update summaries
DROP POLICY IF EXISTS "Service write summaries" ON product_summaries;
CREATE POLICY "Service write summaries" ON product_summaries
    FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service update summaries" ON product_summaries;
CREATE POLICY "Service update summaries" ON product_summaries
    FOR UPDATE 
    USING (auth.role() = 'service_role');

-- ============================================
-- STEP 4: Content Chunks (RAG) Policies
-- ============================================

-- Only service_role can access content chunks
DROP POLICY IF EXISTS "Service role only chunks" ON content_chunks;
CREATE POLICY "Service role only chunks" ON content_chunks
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ============================================
-- STEP 5: Performance Indexes
-- ============================================

-- Product search optimization
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

-- Composite index for filtered listings
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price);

-- JSONB specs search
CREATE INDEX IF NOT EXISTS idx_products_specs ON products USING gin(specs);

-- Product summaries cache lookup
CREATE INDEX IF NOT EXISTS idx_summaries_product ON product_summaries(product_name);

-- ============================================
-- VERIFICATION: Check RLS is enabled
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'product_summaries', 'content_chunks');
