-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (will be linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Coffee records table
CREATE TABLE coffee_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Coffee info
  coffee_name TEXT NOT NULL,
  cafe_name TEXT NOT NULL,
  location TEXT NOT NULL,
  brewing_method TEXT NOT NULL,
  
  -- Tasting data
  selected_flavors JSONB DEFAULT '[]'::jsonb,
  selected_sensory JSONB DEFAULT '[]'::jsonb,
  personal_notes TEXT,
  roaster_notes TEXT,
  roaster_notes_level INTEGER DEFAULT 1, -- 1: no notes, 2: with notes
  
  -- Scores
  flavor_match_score INTEGER,
  sensory_match_score INTEGER,
  total_match_score INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC)
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User achievements junction table
CREATE TABLE user_achievements (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, achievement_id)
);

-- Statistics table for aggregated data
CREATE TABLE coffee_statistics (
  coffee_name TEXT PRIMARY KEY,
  cafe_name TEXT,
  total_records INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  common_flavors JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Users can only see and manage their own coffee records
CREATE POLICY "Users can view own coffee records" ON coffee_records
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own coffee records" ON coffee_records
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own coffee records" ON coffee_records
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own coffee records" ON coffee_records
  FOR DELETE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Everyone can view coffee statistics
CREATE POLICY "Anyone can view coffee statistics" ON coffee_statistics
  FOR SELECT USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coffee_records_updated_at BEFORE UPDATE ON coffee_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();