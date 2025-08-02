-- Add structured tasting data tables for community-based matching
-- 2025-08-02: Support for TastingFlow v2.0 community features

-- 1. Flavor Selections Table
CREATE TABLE flavor_selections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coffee_record_id UUID REFERENCES coffee_records(id) ON DELETE CASCADE NOT NULL,
    flavor_name TEXT NOT NULL,
    level2_category TEXT, -- e.g., 'fruit', 'chocolate', 'nutty'
    level3_subcategory TEXT, -- e.g., 'berry', 'dark_chocolate', 'almond'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sensory Expressions Table
CREATE TABLE sensory_expressions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coffee_record_id UUID REFERENCES coffee_records(id) ON DELETE CASCADE NOT NULL,
    expression_name TEXT NOT NULL,
    category TEXT, -- e.g., 'acidity', 'body', 'sweetness'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Community Statistics View
CREATE VIEW community_flavor_stats AS
SELECT 
    flavor_name,
    level2_category,
    COUNT(*) as selection_count,
    COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT coffee_record_id) FROM flavor_selections) as popularity_percentage
FROM flavor_selections
GROUP BY flavor_name, level2_category
ORDER BY selection_count DESC;

CREATE VIEW community_sensory_stats AS
SELECT 
    expression_name,
    category,
    COUNT(*) as selection_count,
    COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT coffee_record_id) FROM sensory_expressions) as popularity_percentage
FROM sensory_expressions
GROUP BY expression_name, category
ORDER BY selection_count DESC;

-- 4. Coffee-specific Community Data View
CREATE VIEW coffee_community_stats AS
SELECT 
    cr.coffee_name,
    cr.roastery,
    cr.origin,
    COUNT(DISTINCT cr.id) as total_records,
    ARRAY_AGG(DISTINCT fs.flavor_name) as popular_flavors,
    ARRAY_AGG(DISTINCT se.expression_name) as popular_expressions
FROM coffee_records cr
LEFT JOIN flavor_selections fs ON cr.id = fs.coffee_record_id
LEFT JOIN sensory_expressions se ON cr.id = se.coffee_record_id
GROUP BY cr.coffee_name, cr.roastery, cr.origin
HAVING COUNT(DISTINCT cr.id) >= 2; -- Only show coffees with 2+ records

-- 5. Create indexes for performance
CREATE INDEX idx_flavor_selections_coffee_record ON flavor_selections(coffee_record_id);
CREATE INDEX idx_flavor_selections_flavor_name ON flavor_selections(flavor_name);
CREATE INDEX idx_sensory_expressions_coffee_record ON sensory_expressions(coffee_record_id);
CREATE INDEX idx_sensory_expressions_name ON sensory_expressions(expression_name);

-- 6. RLS Policies
ALTER TABLE flavor_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensory_expressions ENABLE ROW LEVEL SECURITY;

-- Allow read access to community stats (for community matching)
CREATE POLICY "Anyone can view flavor selections for community stats" ON flavor_selections
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view sensory expressions for community stats" ON sensory_expressions
    FOR SELECT USING (true);

-- Users can only insert/update/delete their own data
CREATE POLICY "Users can manage own flavor selections" ON flavor_selections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM coffee_records 
            WHERE id = coffee_record_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own sensory expressions" ON sensory_expressions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM coffee_records 
            WHERE id = coffee_record_id AND user_id = auth.uid()
        )
    );

-- 7. Function to get community match data for a specific coffee
CREATE OR REPLACE FUNCTION get_community_match_data(
    p_coffee_name TEXT DEFAULT NULL,
    p_roastery TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'flavor_distribution', (
            SELECT json_object_agg(
                fs.flavor_name, 
                ROUND(COUNT(*) * 100.0 / NULLIF((
                    SELECT COUNT(DISTINCT cr2.id) 
                    FROM coffee_records cr2 
                    WHERE (p_coffee_name IS NULL OR cr2.coffee_name = p_coffee_name)
                    AND (p_roastery IS NULL OR cr2.roastery = p_roastery)
                ), 0), 2)
            )
            FROM flavor_selections fs
            JOIN coffee_records cr ON fs.coffee_record_id = cr.id
            WHERE (p_coffee_name IS NULL OR cr.coffee_name = p_coffee_name)
            AND (p_roastery IS NULL OR cr.roastery = p_roastery)
            GROUP BY fs.flavor_name
            HAVING COUNT(*) >= 1
        ),
        'expression_distribution', (
            SELECT json_object_agg(
                se.expression_name,
                ROUND(COUNT(*) * 100.0 / NULLIF((
                    SELECT COUNT(DISTINCT cr2.id) 
                    FROM coffee_records cr2 
                    WHERE (p_coffee_name IS NULL OR cr2.coffee_name = p_coffee_name)
                    AND (p_roastery IS NULL OR cr2.roastery = p_roastery)
                ), 0), 2)
            )
            FROM sensory_expressions se
            JOIN coffee_records cr ON se.coffee_record_id = cr.id
            WHERE (p_coffee_name IS NULL OR cr.coffee_name = p_coffee_name)
            AND (p_roastery IS NULL OR cr.roastery = p_roastery)
            GROUP BY se.expression_name
            HAVING COUNT(*) >= 1
        ),
        'total_records', (
            SELECT COUNT(DISTINCT cr.id)
            FROM coffee_records cr
            WHERE (p_coffee_name IS NULL OR cr.coffee_name = p_coffee_name)
            AND (p_roastery IS NULL OR cr.roastery = p_roastery)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Insert some sample data for testing (optional)
-- This can be removed in production
INSERT INTO coffee_records (user_id, coffee_name, roastery, origin, roasting_level, brewing_method, rating, taste_notes, mode)
SELECT 
    auth.uid(),
    'Ethiopia Yirgacheffe',
    'Blue Bottle Coffee',
    'Ethiopia',
    'Light',
    'Pour Over',
    5,
    'Bright citrus, floral, blueberry notes',
    'cafe'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;