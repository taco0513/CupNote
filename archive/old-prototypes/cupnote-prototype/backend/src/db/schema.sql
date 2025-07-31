-- CupNote Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) NOT NULL,
  profile_image TEXT,
  preferred_mode VARCHAR(10) DEFAULT 'cafe' CHECK (preferred_mode IN ('cafe', 'brew', 'lab')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coffees table
CREATE TABLE IF NOT EXISTS coffees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  roaster VARCHAR(255) NOT NULL,
  origin VARCHAR(100),
  process VARCHAR(50),
  roast_date DATE,
  variety VARCHAR(100),
  altitude VARCHAR(50),
  tasting_notes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasting notes table
CREATE TABLE IF NOT EXISTS tasting_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coffee_id UUID REFERENCES coffees(id) ON DELETE SET NULL,
  mode VARCHAR(10) NOT NULL CHECK (mode IN ('cafe', 'brew', 'lab')),
  
  -- Cafe mode fields
  cafe_name VARCHAR(255),
  cafe_location VARCHAR(255),
  menu_item VARCHAR(100),
  
  -- Brew mode fields
  brew_method VARCHAR(50),
  water_temp INTEGER,
  grind_size VARCHAR(50),
  brew_time VARCHAR(20),
  coffee_weight DECIMAL(5,1),
  water_weight DECIMAL(6,1),
  brew_ratio VARCHAR(10),
  timer_laps JSONB,
  
  -- Lab mode fields
  equipment TEXT[],
  detailed_process TEXT,
  
  -- Common evaluation fields
  overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 5),
  flavor_notes TEXT[],
  aroma INTEGER CHECK (aroma >= 1 AND aroma <= 5),
  acidity INTEGER CHECK (acidity >= 1 AND acidity <= 5),
  body INTEGER CHECK (body >= 1 AND body <= 5),
  aftertaste INTEGER CHECK (aftertaste >= 1 AND aftertaste <= 5),
  balance INTEGER CHECK (balance >= 1 AND balance <= 5),
  mouthfeel INTEGER CHECK (mouthfeel >= 1 AND mouthfeel <= 10),
  
  -- Notes
  personal_notes TEXT,
  roaster_notes TEXT,
  
  -- Metadata
  photos TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coffee_id UUID REFERENCES coffees(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Brew parameters
  brew_method VARCHAR(50) NOT NULL,
  water_temp INTEGER NOT NULL,
  grind_size VARCHAR(50) NOT NULL,
  coffee_weight DECIMAL(5,1) NOT NULL,
  water_weight DECIMAL(6,1) NOT NULL,
  brew_ratio VARCHAR(10) NOT NULL,
  brew_time VARCHAR(20) NOT NULL,
  brew_steps JSONB,
  
  -- Metadata
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('tasting', 'brewing', 'exploration', 'social')),
  requirement_type VARCHAR(20) NOT NULL,
  requirement_value INTEGER NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_coffees_roaster ON coffees(roaster);
CREATE INDEX idx_coffees_name ON coffees(name);
CREATE INDEX idx_tasting_notes_user ON tasting_notes(user_id);
CREATE INDEX idx_tasting_notes_coffee ON tasting_notes(coffee_id);
CREATE INDEX idx_tasting_notes_created ON tasting_notes(created_at DESC);
CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipes_favorite ON recipes(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_coffees_updated_at BEFORE UPDATE ON coffees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_tasting_notes_updated_at BEFORE UPDATE ON tasting_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();