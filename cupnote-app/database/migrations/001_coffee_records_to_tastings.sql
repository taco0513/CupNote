-- Migration: coffee_records to tastings
-- Date: 2025-01-30
-- Description: Migrate existing coffee_records data to new tastings table structure

-- Step 1: Create backup of existing data
CREATE TABLE IF NOT EXISTS coffee_records_backup AS 
SELECT * FROM coffee_records;

-- Step 2: Migrate data to tastings table
INSERT INTO tastings (
  user_id,
  mode,
  coffee_info,
  brew_settings,
  selected_flavors,
  sensory_expressions,
  personal_comment,
  roaster_notes,
  match_score,
  total_duration,
  sensory_skipped,
  created_at,
  updated_at
)
SELECT
  user_id,
  'homecafe' AS mode, -- Default to homecafe for existing records
  jsonb_build_object(
    'coffee_name', coffee_name,
    'cafe_name', cafe_name,
    'location', location,
    'brewing_method', brewing_method,
    'origin', origin,
    'variety', variety,
    'altitude', altitude,
    'process', process,
    'roast_level', roast_level
  ) AS coffee_info,
  NULL AS brew_settings, -- No brew settings in old schema
  COALESCE(selected_flavors, '[]'::jsonb) AS selected_flavors,
  COALESCE(selected_sensory, '[]'::jsonb) AS sensory_expressions,
  personal_notes AS personal_comment,
  roaster_notes,
  CASE 
    WHEN flavor_match_score IS NOT NULL OR sensory_match_score IS NOT NULL OR total_match_score IS NOT NULL
    THEN jsonb_build_object(
      'flavor_match', COALESCE(flavor_match_score, 0),
      'sensory_match', COALESCE(sensory_match_score, 0),
      'total', COALESCE(total_match_score, 0),
      'roaster_bonus', CASE WHEN roaster_notes_level = 2 THEN 10 ELSE 0 END
    )
    ELSE NULL
  END AS match_score,
  NULL AS total_duration, -- Not tracked in old schema
  CASE 
    WHEN selected_sensory IS NULL OR selected_sensory = '[]'::jsonb 
    THEN true 
    ELSE false 
  END AS sensory_skipped,
  created_at,
  updated_at
FROM coffee_records
WHERE NOT EXISTS (
  SELECT 1 FROM tastings t 
  WHERE t.user_id = coffee_records.user_id 
  AND t.created_at = coffee_records.created_at
);

-- Step 3: Update statistics
UPDATE coffee_statistics cs
SET 
  coffee_name = (
    SELECT coffee_info->>'coffee_name' 
    FROM tastings t 
    WHERE t.coffee_info->>'coffee_name' = cs.coffee_name 
    LIMIT 1
  ),
  average_score = (
    SELECT AVG((match_score->>'total')::int)
    FROM tastings t
    WHERE t.coffee_info->>'coffee_name' = cs.coffee_name
  ),
  total_records = (
    SELECT COUNT(*)
    FROM tastings t
    WHERE t.coffee_info->>'coffee_name' = cs.coffee_name
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM tastings t 
  WHERE t.coffee_info->>'coffee_name' = cs.coffee_name
);

-- Step 4: Verify migration
DO $$
DECLARE
  old_count INTEGER;
  new_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM coffee_records;
  SELECT COUNT(*) INTO new_count FROM tastings WHERE mode = 'homecafe';
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  - Original coffee_records: %', old_count;
  RAISE NOTICE '  - Migrated tastings: %', new_count;
  
  IF old_count = new_count THEN
    RAISE NOTICE '✅ Migration successful!';
  ELSE
    RAISE WARNING '⚠️  Count mismatch! Please verify the migration.';
  END IF;
END $$;

-- Step 5: Add helpful indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_tastings_coffee_name ON tastings ((coffee_info->>'coffee_name'));
CREATE INDEX IF NOT EXISTS idx_tastings_cafe_name ON tastings ((coffee_info->>'cafe_name'));
CREATE INDEX IF NOT EXISTS idx_tastings_match_score ON tastings ((match_score->>'total'));

-- Step 6: Clean up (uncomment after verifying migration)
-- DROP TABLE coffee_records;
-- ALTER TABLE coffee_records_backup RENAME TO coffee_records_archive;

-- Migration notes:
-- 1. All existing records are migrated as 'homecafe' mode
-- 2. brew_settings is NULL for migrated records (not in old schema)
-- 3. experimental_data is NULL for migrated records (Pro mode feature)
-- 4. total_duration is NULL for migrated records (not tracked before)
-- 5. Backup table is preserved as coffee_records_backup