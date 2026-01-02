-- Comparison History Table
-- Kullanıcıların geçmiş kıyaslamalarını saklar

CREATE TABLE IF NOT EXISTS comparison_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_ids INTEGER[] NOT NULL,
    product_names TEXT[] NOT NULL,
    product_images TEXT[],
    winner_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE comparison_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own history
CREATE POLICY "Users can view own history" 
    ON comparison_history FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can insert own history" 
    ON comparison_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own history
CREATE POLICY "Users can delete own history" 
    ON comparison_history FOR DELETE 
    USING (auth.uid() = user_id);

-- Index for fast user queries (ordered by most recent)
CREATE INDEX IF NOT EXISTS idx_comparison_history_user 
    ON comparison_history(user_id, created_at DESC);

-- Limit to 20 comparisons per user (auto cleanup via trigger)
-- Can be called periodically or via trigger
CREATE OR REPLACE FUNCTION cleanup_old_comparisons()
RETURNS void AS $$
BEGIN
    DELETE FROM comparison_history 
    WHERE id IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
            FROM comparison_history
        ) ranked
        WHERE rn > 20
    );
END;
$$ LANGUAGE plpgsql;
