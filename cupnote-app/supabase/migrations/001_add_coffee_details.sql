-- Add coffee detail fields to coffee_records table
ALTER TABLE coffee_records
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS variety TEXT,
ADD COLUMN IF NOT EXISTS altitude TEXT,
ADD COLUMN IF NOT EXISTS process TEXT,
ADD COLUMN IF NOT EXISTS roast_level TEXT;

-- Add comment for documentation
COMMENT ON COLUMN coffee_records.origin IS 'Coffee origin country or region';
COMMENT ON COLUMN coffee_records.variety IS 'Coffee variety (e.g., Arabica, Geisha)';
COMMENT ON COLUMN coffee_records.altitude IS 'Growing altitude (e.g., 1,800m)';
COMMENT ON COLUMN coffee_records.process IS 'Processing method (washed, natural, honey, anaerobic)';
COMMENT ON COLUMN coffee_records.roast_level IS 'Roasting level (light, medium, dark)';