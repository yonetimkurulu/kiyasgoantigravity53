-- ============================================
-- KıyasGO Performance Fix: RLS & Index Cleanup
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Delete duplicate/conflicting policies
-- ============================================

-- Drop old "Enable read access for all users" policies (replaced by our new ones)
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON product_summaries;
DROP POLICY IF EXISTS "Enable read access for all users" ON content_chunks;

-- ============================================
-- STEP 2: Fix auth.role() -> (select auth.role())
-- This prevents re-evaluation per row
-- ============================================

-- Products: Fix service role write policy
DROP POLICY IF EXISTS "Service role write products" ON products;
CREATE POLICY "Service role write products" ON products
    FOR ALL 
    USING ((select auth.role()) = 'service_role');

-- Product Summaries: Fix write policies
DROP POLICY IF EXISTS "Service write summaries" ON product_summaries;
CREATE POLICY "Service write summaries" ON product_summaries
    FOR INSERT 
    WITH CHECK ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service update summaries" ON product_summaries;
CREATE POLICY "Service update summaries" ON product_summaries
    FOR UPDATE 
    USING ((select auth.role()) = 'service_role');

-- Content Chunks: Fix service role policy
DROP POLICY IF EXISTS "Service role only chunks" ON content_chunks;
CREATE POLICY "Service role only chunks" ON content_chunks
    FOR ALL 
    USING ((select auth.role()) = 'service_role');

-- Profiles: Fix user policies (if they exist)
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles
    FOR UPDATE 
    USING ((select auth.uid()) = id);

-- Favorites: Fix user policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT 
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE 
    USING ((select auth.uid()) = user_id);

-- ============================================
-- STEP 3: Remove duplicate index
-- ============================================

DROP INDEX IF EXISTS idx_product_summaries_name;
-- Keep idx_summaries_product (the one we created)

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Policies cleaned up and optimized!' as status;
