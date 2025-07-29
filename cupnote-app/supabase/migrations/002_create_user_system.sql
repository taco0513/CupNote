-- User System Tables Migration
-- Creates tables for user profiles, achievements, statistics, and preferences

-- Enable RLS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    coffee_experience VARCHAR(50) DEFAULT 'beginner' CHECK (coffee_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
    preferred_mode VARCHAR(20) DEFAULT 'cafe' CHECK (preferred_mode IN ('cafe', 'homecafe', 'pro')),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Statistics Table
CREATE TABLE user_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    total_tastings INTEGER DEFAULT 0,
    total_pro_sessions INTEGER DEFAULT 0,
    average_sca_score DECIMAL(5,2) DEFAULT 0,
    favorite_origin VARCHAR(255),
    favorite_roaster VARCHAR(255),
    favorite_process VARCHAR(100),
    total_brewing_time INTEGER DEFAULT 0, -- in seconds
    preferred_ratio DECIMAL(4,2) DEFAULT 16.0,
    preferred_temperature INTEGER DEFAULT 93,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_session_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Achievements Table
CREATE TABLE achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('brewing', 'exploration', 'quality', 'consistency', 'expertise')),
    tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,
    requirement_condition JSONB,
    points INTEGER DEFAULT 10,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements Table (junction table)
CREATE TABLE user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress DECIMAL(5,2) DEFAULT 0,
    UNIQUE(user_id, achievement_id)
);

-- User Preferences Table
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    auto_save BOOLEAN DEFAULT TRUE,
    default_coffee_amount INTEGER DEFAULT 20,
    default_ratio DECIMAL(4,2) DEFAULT 16.0,
    default_temperature INTEGER DEFAULT 93,
    measurement_units VARCHAR(20) DEFAULT 'metric' CHECK (measurement_units IN ('metric', 'imperial')),
    privacy_level VARCHAR(20) DEFAULT 'private' CHECK (privacy_level IN ('public', 'friends', 'private')),
    show_tips BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Update coffee_records to include user_id
ALTER TABLE coffee_records 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_coffee_records_user_id ON coffee_records(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_tier ON achievements(tier);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for coffee_records
CREATE POLICY "Users can view own records" ON coffee_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON coffee_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON coffee_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON coffee_records
    FOR DELETE USING (auth.uid() = user_id);

-- Achievement definitions
INSERT INTO achievements (code, name, description, icon, category, tier, requirement_type, requirement_value, points) VALUES
-- Brewing Achievements
('first_brew', 'First Brew', '첫 커피 테이스팅 기록을 완성하세요', '☕', 'brewing', 'bronze', 'total_sessions', 1, 10),
('coffee_explorer', 'Coffee Explorer', '10회 이상 테이스팅을 기록하세요', '🌍', 'brewing', 'silver', 'total_sessions', 10, 25),
('brew_master', 'Brew Master', '50회 이상 테이스팅을 기록하세요', '👨‍🍳', 'brewing', 'gold', 'total_sessions', 50, 50),
('coffee_legend', 'Coffee Legend', '100회 이상 테이스팅을 기록하세요', '🏆', 'brewing', 'platinum', 'total_sessions', 100, 100),

-- Pro Mode Achievements
('pro_beginner', 'Pro Beginner', '첫 Pro Mode 세션을 완료하세요', '🎯', 'expertise', 'bronze', 'pro_sessions', 1, 15),
('sca_compliant', 'SCA Compliant', 'SCA 준수율 90% 이상을 달성하세요', '✅', 'quality', 'silver', 'sca_score', 90, 30),
('quality_seeker', 'Quality Seeker', '품질 점수 4.5점 이상을 달성하세요', '⭐', 'quality', 'gold', 'quality_score', 45, 40),

-- Exploration Achievements
('origin_explorer', 'Origin Explorer', '5개 이상의 다른 원산지 커피를 시도하세요', '🗺️', 'exploration', 'silver', 'unique_origins', 5, 20),
('process_curious', 'Process Curious', '3가지 이상의 가공법 커피를 시도하세요', '🔬', 'exploration', 'bronze', 'unique_processes', 3, 15),
('roaster_hunter', 'Roaster Hunter', '10개 이상의 다른 로스터리를 탐험하세요', '🏭', 'exploration', 'gold', 'unique_roasters', 10, 35),

-- Consistency Achievements
('consistent_brewer', 'Consistent Brewer', '일주일 연속 테이스팅을 기록하세요', '📅', 'consistency', 'silver', 'streak_days', 7, 25),
('dedicated_taster', 'Dedicated Taster', '한 달 연속 테이스팅을 기록하세요', '🗓️', 'consistency', 'gold', 'streak_days', 30, 50);

-- Functions for automatic stats updates
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user stats when a new coffee record is inserted
    INSERT INTO user_stats (user_id, total_tastings, last_session_date)
    VALUES (NEW.user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_tastings = user_stats.total_tastings + 1,
        last_session_date = CURRENT_DATE,
        updated_at = NOW();
    
    -- Update Pro Mode stats if applicable
    IF NEW.mode = 'pro' THEN
        UPDATE user_stats 
        SET total_pro_sessions = total_pro_sessions + 1
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating stats
CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT ON coffee_records
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();