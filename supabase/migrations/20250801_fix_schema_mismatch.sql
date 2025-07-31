-- Fix schema mismatch between application code and database
-- This migration adds missing columns and updates the coffee_records table structure

-- 1. Update coffee_records table to match application expectations
-- The application uses different field names than what's in the database
ALTER TABLE coffee_records 
ADD COLUMN IF NOT EXISTS taste_notes TEXT,
ADD COLUMN IF NOT EXISTS roaster_notes TEXT,
ADD COLUMN IF NOT EXISTS personal_notes TEXT,
ADD COLUMN IF NOT EXISTS roasting_level TEXT,
ADD COLUMN IF NOT EXISTS temperature TEXT DEFAULT 'Hot',
ADD COLUMN IF NOT EXISTS memo TEXT,
ADD COLUMN IF NOT EXISTS selected_flavors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sensory_expressions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS match_score_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS cafe_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS homecafe_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS pro_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS quick_data JSONB DEFAULT '{}'::jsonb;

-- 2. Update the mode column constraint to include 'quick' and 'pro' modes
ALTER TABLE coffee_records 
DROP CONSTRAINT IF EXISTS coffee_records_mode_check;

ALTER TABLE coffee_records 
ADD CONSTRAINT coffee_records_mode_check 
CHECK (mode IN ('quick', 'cafe', 'homecafe', 'pro', 'lab'));

-- 3. Update achievement_definitions table if it exists, create if not
DO $$ 
BEGIN
    -- Check if achievement_definitions table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'achievement_definitions') THEN
        
        -- Create achievement_definitions table
        CREATE TABLE achievement_definitions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            category TEXT NOT NULL,
            points INTEGER NOT NULL DEFAULT 0,
            target_value INTEGER NOT NULL DEFAULT 1,
            condition_type TEXT NOT NULL, -- 'count', 'streak', 'rating', etc.
            condition_field TEXT, -- field to check
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert achievement definitions
        INSERT INTO achievement_definitions (id, title, description, icon, category, points, target_value, condition_type, condition_field) VALUES
            ('first_record', '첫 기록', '첫 번째 커피를 기록했어요!', '🎉', 'milestone', 10, 1, 'count', 'coffee_records'),
            ('coffee_lover', '커피 애호가', '10개의 커피를 기록했어요', '☕', 'collection', 50, 10, 'count', 'coffee_records'),
            ('world_explorer', '세계 탐험가', '10개 이상의 다른 원산지 커피', '🌍', 'exploration', 100, 10, 'unique_count', 'origin'),
            ('cafe_master', '카페 마스터', '카페 모드로 50개 기록', '🏪', 'expertise', 150, 50, 'mode_count', 'cafe'),
            ('home_barista', '홈 바리스타', '홈카페 모드로 25개 기록', '🏠', 'expertise', 100, 25, 'mode_count', 'homecafe'),
            ('coffee_scientist', '커피 과학자', '프로 모드로 10개 기록', '🔬', 'expertise', 200, 10, 'mode_count', 'pro'),
            ('perfect_cup', '완벽한 한 잔', '5점 만점 기록 달성', '⭐', 'quality', 75, 1, 'rating', '5'),
            ('consistent_quality', '일관된 품질', '4점 이상 기록 10개', '🏆', 'quality', 125, 10, 'rating_above', '4'),
            ('coffee_master', '커피 마스터', '100개의 커피를 기록했어요', '👑', 'mastery', 500, 100, 'count', 'coffee_records'),
            ('weekly_streak', '주간 연속 기록', '7일 연속 기록', '🔥', 'consistency', 100, 7, 'streak', 'daily'),
            ('quick_master', '퀵 모드 마스터', '퀵 모드로 20개 기록', '⚡', 'expertise', 80, 20, 'mode_count', 'quick');

    END IF;
END $$;

-- 4. Create user_achievements table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_achievements') THEN
        
        CREATE TABLE user_achievements (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            achievement_id TEXT REFERENCES achievement_definitions(id) NOT NULL,
            progress_current INTEGER DEFAULT 0,
            progress_target INTEGER NOT NULL,
            unlocked_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, achievement_id)
        );

        -- Enable RLS
        ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        CREATE POLICY "Users can view own achievements" ON user_achievements
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own achievements" ON user_achievements
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update own achievements" ON user_achievements
            FOR UPDATE USING (auth.uid() = user_id);

        -- Create index
        CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
        CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at) WHERE unlocked_at IS NOT NULL;

    END IF;
END $$;

-- 5. Create a view to map old column names to new ones for backward compatibility
CREATE OR REPLACE VIEW coffee_records_v2 AS
SELECT 
    id,
    user_id,
    coffee_name,
    roastery,
    origin,
    roasting_level as roast_level,
    temperature,
    rating,
    taste_notes as taste,
    roaster_notes,
    personal_notes,
    memo,
    mode,
    match_score,
    match_score_data,
    selected_flavors,
    sensory_expressions,
    tags,
    cafe_data,
    homecafe_data,
    pro_data,
    quick_data,
    image_url,
    thumbnail_url,
    additional_images,
    created_at,
    updated_at
FROM coffee_records;

-- 6. Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_coffee_records_mode ON coffee_records(mode);
CREATE INDEX IF NOT EXISTS idx_coffee_records_rating ON coffee_records(rating);
CREATE INDEX IF NOT EXISTS idx_coffee_records_tags ON coffee_records USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_coffee_records_selected_flavors ON coffee_records USING GIN(selected_flavors);

-- 7. Update the calculate_match_score function to handle new parameters
CREATE OR REPLACE FUNCTION calculate_match_score(
    p_rating INTEGER,
    p_mode TEXT,
    p_taste_notes TEXT,
    p_roaster_notes TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    detail_bonus INTEGER := 0;
    quality_multiplier DECIMAL := 1.0;
BEGIN
    -- Base score from rating (0-60 points)
    score := p_rating * 12;
    
    -- Mode bonus (updated to include new modes)
    CASE p_mode
        WHEN 'quick' THEN score := score + 5;
        WHEN 'cafe' THEN score := score + 10;
        WHEN 'homecafe' THEN score := score + 15;
        WHEN 'pro' THEN score := score + 20;
        WHEN 'lab' THEN score := score + 20;
    END CASE;
    
    -- Detail bonus based on taste notes length
    IF LENGTH(p_taste_notes) > 50 THEN
        detail_bonus := 10;
    ELSIF LENGTH(p_taste_notes) > 20 THEN
        detail_bonus := 5;
    END IF;
    
    -- Roaster notes comparison bonus
    IF p_roaster_notes IS NOT NULL AND LENGTH(p_roaster_notes) > 0 THEN
        detail_bonus := detail_bonus + 10;
    END IF;
    
    -- Quality multiplier based on rating
    IF p_rating >= 4 THEN
        quality_multiplier := 1.2;
    ELSIF p_rating <= 2 THEN
        quality_multiplier := 0.8;
    END IF;
    
    -- Calculate final score
    score := ROUND((score + detail_bonus) * quality_multiplier);
    
    -- Ensure score is between 0 and 100
    IF score > 100 THEN score := 100; END IF;
    IF score < 0 THEN score := 0; END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- 8. Add helpful comments
COMMENT ON COLUMN coffee_records.taste_notes IS 'User taste notes/description';
COMMENT ON COLUMN coffee_records.roaster_notes IS 'Official roaster tasting notes';
COMMENT ON COLUMN coffee_records.personal_notes IS 'Personal memo/notes';
COMMENT ON COLUMN coffee_records.selected_flavors IS 'Selected flavor profiles from SCA wheel (JSON array)';
COMMENT ON COLUMN coffee_records.sensory_expressions IS 'Korean sensory expressions (JSON array)';
COMMENT ON COLUMN coffee_records.match_score_data IS 'Detailed match score breakdown (JSON object)';
COMMENT ON COLUMN coffee_records.cafe_data IS 'Cafe mode specific data (JSON object)';
COMMENT ON COLUMN coffee_records.homecafe_data IS 'HomeCafe mode specific data (JSON object)';
COMMENT ON COLUMN coffee_records.pro_data IS 'Pro mode specific data (JSON object)';
COMMENT ON COLUMN coffee_records.quick_data IS 'Quick mode specific data (JSON object)';