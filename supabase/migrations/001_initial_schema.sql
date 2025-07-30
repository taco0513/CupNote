-- CupNote Database Schema
-- 초기 테이블 생성 및 RLS 정책 설정

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles Table
CREATE TABLE user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Coffee Records Table
CREATE TABLE coffee_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    coffee_name TEXT NOT NULL,
    roastery TEXT,
    origin TEXT,
    roasting_level TEXT,
    brewing_method TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    taste_notes TEXT NOT NULL,
    roaster_notes TEXT,
    personal_notes TEXT,
    mode TEXT NOT NULL CHECK (mode IN ('cafe', 'homecafe', 'lab')),
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Achievement Definitions Table (Master Data)
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

-- 4. User Achievements Table
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

-- 5. Create indexes for better performance
CREATE INDEX idx_coffee_records_user_id ON coffee_records(user_id);
CREATE INDEX idx_coffee_records_created_at ON coffee_records(created_at DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at) WHERE unlocked_at IS NOT NULL;

-- 6. Set up Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for coffee_records
CREATE POLICY "Users can view own coffee records" ON coffee_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coffee records" ON coffee_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coffee records" ON coffee_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coffee records" ON coffee_records
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coffee_records_updated_at 
    BEFORE UPDATE ON coffee_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert default achievement definitions
INSERT INTO achievement_definitions (id, title, description, icon, category, points, target_value, condition_type, condition_field) VALUES
    ('first_record', '첫 기록', '첫 번째 커피를 기록했어요!', '🎉', 'milestone', 10, 1, 'count', 'coffee_records'),
    ('coffee_lover', '커피 애호가', '10개의 커피를 기록했어요', '☕', 'collection', 50, 10, 'count', 'coffee_records'),
    ('world_explorer', '세계 탐험가', '10개 이상의 다른 원산지 커피', '🌍', 'exploration', 100, 10, 'unique_count', 'origin'),
    ('cafe_master', '카페 마스터', '카페 모드로 50개 기록', '🏪', 'expertise', 150, 50, 'mode_count', 'cafe'),
    ('home_barista', '홈 바리스타', '홈카페 모드로 25개 기록', '🏠', 'expertise', 100, 25, 'mode_count', 'homecafe'),
    ('coffee_scientist', '커피 과학자', '랩 모드로 10개 기록', '🔬', 'expertise', 200, 10, 'mode_count', 'lab'),
    ('perfect_cup', '완벽한 한 잔', '5점 만점 기록 달성', '⭐', 'quality', 75, 1, 'rating', '5'),
    ('consistent_quality', '일관된 품질', '4점 이상 기록 10개', '🏆', 'quality', 125, 10, 'rating_above', '4'),
    ('coffee_master', '커피 마스터', '100개의 커피를 기록했어요', '👑', 'mastery', 500, 100, 'count', 'coffee_records'),
    ('weekly_streak', '주간 연속 기록', '7일 연속 기록', '🔥', 'consistency', 100, 7, 'streak', 'daily');

-- 9. Create a function to calculate match score
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
    
    -- Mode bonus
    CASE p_mode
        WHEN 'cafe' THEN score := score + 10;
        WHEN 'homecafe' THEN score := score + 15;
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