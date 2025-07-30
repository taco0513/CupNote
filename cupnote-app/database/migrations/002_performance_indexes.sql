-- Performance Optimization: JSONB Indexes for tastings table
-- Date: 2025-01-30
-- Description: Create optimized indexes for common JSONB queries

-- Drop existing indexes if they exist (idempotent)
DROP INDEX IF EXISTS idx_tastings_coffee_name;
DROP INDEX IF EXISTS idx_tastings_cafe_name;
DROP INDEX IF EXISTS idx_tastings_match_score;
DROP INDEX IF EXISTS idx_tastings_origin;
DROP INDEX IF EXISTS idx_tastings_brewing_method;
DROP INDEX IF EXISTS idx_tastings_roast_level;
DROP INDEX IF EXISTS idx_tastings_tds;
DROP INDEX IF EXISTS idx_tastings_extraction_yield;

-- Primary search indexes
CREATE INDEX CONCURRENTLY idx_tastings_coffee_name 
ON tastings ((coffee_info->>'coffee_name')) 
WHERE coffee_info->>'coffee_name' IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_tastings_cafe_name 
ON tastings ((coffee_info->>'cafe_name')) 
WHERE coffee_info->>'cafe_name' IS NOT NULL;

-- Score-based queries (for leaderboards, statistics)
CREATE INDEX CONCURRENTLY idx_tastings_match_score 
ON tastings ((match_score->>'total')::int) 
WHERE match_score->>'total' IS NOT NULL;

-- Coffee characteristics searches
CREATE INDEX CONCURRENTLY idx_tastings_origin 
ON tastings ((coffee_info->>'origin')) 
WHERE coffee_info->>'origin' IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_tastings_brewing_method 
ON tastings ((coffee_info->>'brewing_method')) 
WHERE coffee_info->>'brewing_method' IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_tastings_roast_level 
ON tastings ((coffee_info->>'roast_level')) 
WHERE coffee_info->>'roast_level' IS NOT NULL;

-- Pro mode specific indexes
CREATE INDEX CONCURRENTLY idx_tastings_tds 
ON tastings ((experimental_data->>'tds')::numeric) 
WHERE mode = 'pro' AND experimental_data->>'tds' IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_tastings_extraction_yield 
ON tastings ((experimental_data->>'extraction_yield')::numeric) 
WHERE mode = 'pro' AND experimental_data->>'extraction_yield' IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_tastings_user_mode_created 
ON tastings (user_id, mode, created_at DESC);

CREATE INDEX CONCURRENTLY idx_tastings_coffee_created 
ON tastings ((coffee_info->>'coffee_name'), created_at DESC) 
WHERE coffee_info->>'coffee_name' IS NOT NULL;

-- GIN index for full-text search on flavors
CREATE INDEX CONCURRENTLY idx_tastings_flavors_gin 
ON tastings USING gin (selected_flavors);

-- GIN index for sensory expressions search
CREATE INDEX CONCURRENTLY idx_tastings_sensory_gin 
ON tastings USING gin (sensory_expressions);

-- Partial index for non-skipped sensory evaluations
CREATE INDEX CONCURRENTLY idx_tastings_sensory_complete 
ON tastings (user_id, created_at DESC) 
WHERE sensory_skipped = false;

-- Index for coffee statistics queries
CREATE INDEX CONCURRENTLY idx_tastings_stats 
ON tastings ((coffee_info->>'coffee_name'), (match_score->>'total')::int) 
WHERE match_score IS NOT NULL;

-- Function-based index for case-insensitive coffee name search
CREATE INDEX CONCURRENTLY idx_tastings_coffee_name_lower 
ON tastings (lower(coffee_info->>'coffee_name')) 
WHERE coffee_info->>'coffee_name' IS NOT NULL;

-- Analyze tables to update statistics
ANALYZE tastings;

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'tastings'
ORDER BY indexname;

-- Query performance hints
COMMENT ON INDEX idx_tastings_coffee_name IS 'Primary index for coffee name searches';
COMMENT ON INDEX idx_tastings_cafe_name IS 'Index for cafe-based queries';
COMMENT ON INDEX idx_tastings_match_score IS 'Index for score-based sorting and filtering';
COMMENT ON INDEX idx_tastings_tds IS 'Pro mode: TDS value queries';
COMMENT ON INDEX idx_tastings_extraction_yield IS 'Pro mode: Extraction yield queries';
COMMENT ON INDEX idx_tastings_flavors_gin IS 'GIN index for flavor array searches';
COMMENT ON INDEX idx_tastings_user_mode_created IS 'Composite index for user dashboard queries';

-- Performance testing queries (commented out, for reference)
/*
-- Test coffee name search performance
EXPLAIN ANALYZE
SELECT * FROM tastings 
WHERE coffee_info->>'coffee_name' = 'Ethiopia Yirgacheffe'
ORDER BY created_at DESC;

-- Test score-based queries
EXPLAIN ANALYZE
SELECT 
    coffee_info->>'coffee_name' as coffee,
    AVG((match_score->>'total')::int) as avg_score
FROM tastings
GROUP BY coffee_info->>'coffee_name'
HAVING COUNT(*) > 5
ORDER BY avg_score DESC;

-- Test Pro mode TDS queries
EXPLAIN ANALYZE
SELECT * FROM tastings
WHERE mode = 'pro'
    AND (experimental_data->>'tds')::numeric BETWEEN 1.2 AND 1.4
ORDER BY created_at DESC;

-- Test flavor search
EXPLAIN ANALYZE
SELECT * FROM tastings
WHERE selected_flavors @> '[{"id": "chocolate"}]'::jsonb;
*/