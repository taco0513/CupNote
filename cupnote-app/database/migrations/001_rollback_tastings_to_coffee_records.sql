-- Rollback Migration: tastings to coffee_records
-- Date: 2025-01-30
-- Description: Rollback from tastings to coffee_records structure if needed

-- Step 1: Recreate coffee_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS coffee_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coffee_name VARCHAR(200) NOT NULL,
  cafe_name VARCHAR(200) NOT NULL,
  location VARCHAR(200) NOT NULL,
  brewing_method VARCHAR(200) NOT NULL,
  origin VARCHAR(100),
  variety VARCHAR(100),
  altitude VARCHAR(100),
  process VARCHAR(100),
  roast_level VARCHAR(100),
  selected_flavors JSONB DEFAULT '[]',
  selected_sensory JSONB DEFAULT '[]',
  personal_notes TEXT,
  roaster_notes TEXT,
  roaster_notes_level INTEGER DEFAULT 1,
  flavor_match_score INTEGER,
  sensory_match_score INTEGER,
  total_match_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Migrate data back from tastings to coffee_records
INSERT INTO coffee_records (
  user_id,
  coffee_name,
  cafe_name,
  location,
  brewing_method,
  origin,
  variety,
  altitude,
  process,
  roast_level,
  selected_flavors,
  selected_sensory,
  personal_notes,
  roaster_notes,
  roaster_notes_level,
  flavor_match_score,
  sensory_match_score,
  total_match_score,
  created_at,
  updated_at
)
SELECT
  user_id,
  coffee_info->>'coffee_name' AS coffee_name,
  coffee_info->>'cafe_name' AS cafe_name,
  COALESCE(coffee_info->>'location', 'Unknown') AS location,
  coffee_info->>'brewing_method' AS brewing_method,
  coffee_info->>'origin' AS origin,
  coffee_info->>'variety' AS variety,
  coffee_info->>'altitude' AS altitude,
  coffee_info->>'process' AS process,
  coffee_info->>'roast_level' AS roast_level,
  selected_flavors,
  sensory_expressions AS selected_sensory,
  personal_comment AS personal_notes,
  roaster_notes,
  CASE 
    WHEN match_score->>'roaster_bonus' = '10' THEN 2 
    ELSE 1 
  END AS roaster_notes_level,
  (match_score->>'flavor_match')::INTEGER AS flavor_match_score,
  (match_score->>'sensory_match')::INTEGER AS sensory_match_score,
  (match_score->>'total')::INTEGER AS total_match_score,
  created_at,
  updated_at
FROM tastings
WHERE mode = 'homecafe' -- Only migrate homecafe records back
AND NOT EXISTS (
  SELECT 1 FROM coffee_records cr 
  WHERE cr.user_id = tastings.user_id 
  AND cr.created_at = tastings.created_at
);

-- Step 3: Verify rollback
DO $$
DECLARE
  tastings_count INTEGER;
  records_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tastings_count FROM tastings WHERE mode = 'homecafe';
  SELECT COUNT(*) INTO records_count FROM coffee_records;
  
  RAISE NOTICE 'Rollback Summary:';
  RAISE NOTICE '  - HomeCafe tastings: %', tastings_count;
  RAISE NOTICE '  - Restored coffee_records: %', records_count;
  
  IF tastings_count = records_count THEN
    RAISE NOTICE '✅ Rollback successful!';
  ELSE
    RAISE WARNING '⚠️  Count mismatch! Please verify the rollback.';
    RAISE WARNING 'Note: Only homecafe mode records are rolled back.';
  END IF;
END $$;

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_coffee_records_user_id ON coffee_records(user_id);
CREATE INDEX IF NOT EXISTS idx_coffee_records_created_at ON coffee_records(created_at DESC);

-- Rollback notes:
-- 1. Only 'homecafe' mode records are rolled back (cafe and pro modes have no equivalent)
-- 2. brew_settings data is lost (not in old schema)
-- 3. experimental_data is lost (Pro mode feature)
-- 4. total_duration is lost (not tracked in old schema)
-- 5. Original coffee_records_backup table should be used if complete rollback is needed