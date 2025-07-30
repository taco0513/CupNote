# CupNote Database Documentation

## Overview

CupNote uses PostgreSQL with Supabase as the backend. The database schema has been designed to support multiple tasting modes (Cafe, HomeCafe, Pro) with flexible JSONB storage for mode-specific data.

## Migration Guide

### From coffee_records to tastings

The database has been migrated from the legacy `coffee_records` table to the new `tastings` table structure.

#### Running the Migration

1. **Backup your data first**:

```sql
CREATE TABLE coffee_records_backup AS SELECT * FROM coffee_records;
```

2. **Run the migration**:

```sql
-- Execute the migration script
\i migrations/001_coffee_records_to_tastings.sql
```

3. **Verify the migration**:

```sql
-- Check migration results
SELECT COUNT(*) FROM coffee_records;
SELECT COUNT(*) FROM tastings WHERE mode = 'homecafe';
```

4. **If rollback is needed**:

```sql
-- Execute the rollback script
\i migrations/001_rollback_tastings_to_coffee_records.sql
```

## Schema Details

### tastings Table

The main table for storing all tasting records across different modes.

| Column              | Type        | Description                               |
| ------------------- | ----------- | ----------------------------------------- |
| id                  | UUID        | Primary key                               |
| user_id             | UUID        | Reference to auth.users                   |
| coffee_id           | UUID        | Optional reference to coffees table       |
| mode                | VARCHAR(20) | 'cafe', 'homecafe', or 'pro'              |
| session_id          | UUID        | Session identifier                        |
| coffee_info         | JSONB       | Coffee details (name, cafe, origin, etc.) |
| brew_settings       | JSONB       | HomeCafe/Pro brewing parameters           |
| experimental_data   | JSONB       | Pro mode specific data                    |
| selected_flavors    | JSONB       | Array of selected flavors                 |
| sensory_expressions | JSONB       | Sensory evaluation data                   |
| personal_comment    | TEXT        | User's personal notes                     |
| roaster_notes       | TEXT        | Roaster's tasting notes                   |
| match_score         | JSONB       | Calculated match scores                   |
| total_duration      | INTEGER     | Session duration in seconds               |
| sensory_skipped     | BOOLEAN     | Whether sensory evaluation was skipped    |
| completed_at        | TIMESTAMP   | When the tasting was completed            |
| created_at          | TIMESTAMP   | Record creation time                      |
| updated_at          | TIMESTAMP   | Last update time                          |

### JSONB Structure Examples

#### coffee_info

```json
{
  "coffee_name": "Ethiopia Yirgacheffe",
  "cafe_name": "Blue Bottle Coffee",
  "location": "Seoul",
  "brewing_method": "V60",
  "origin": "Ethiopia",
  "variety": "Heirloom",
  "altitude": "1900-2100m",
  "process": "Washed",
  "roast_level": "Light"
}
```

#### brew_settings (HomeCafe/Pro)

```json
{
  "dripper": "V60",
  "recipe": {
    "coffee_amount": 15,
    "water_amount": 250,
    "ratio": 16.7,
    "water_temp": 93,
    "brew_time": 180,
    "lap_times": [30, 60, 90, 120, 150, 180]
  },
  "quick_notes": "30초 블루밍, 부드럽게 추출"
}
```

#### experimental_data (Pro Mode)

```json
{
  "extraction_method": "Cupping",
  "grind_size": "Medium-Coarse",
  "tds": 1.35,
  "extraction_yield": 19.5,
  "water_tds": 120,
  "water_ph": 7.2,
  "bloom_time": 30,
  "total_time": 240,
  "notes": "Standard SCA cupping protocol",
  "qc_report": {
    "uniformity": 10,
    "clean_cup": 10,
    "sweetness": 10,
    "defects": 0
  }
}
```

#### match_score

```json
{
  "flavor_match": 85,
  "sensory_match": 82,
  "total": 88,
  "roaster_bonus": 10
}
```

### Indexes

For optimal JSONB query performance:

```sql
-- Coffee name searches
CREATE INDEX idx_tastings_coffee_name ON tastings ((coffee_info->>'coffee_name'));

-- Cafe name searches
CREATE INDEX idx_tastings_cafe_name ON tastings ((coffee_info->>'cafe_name'));

-- Score-based queries
CREATE INDEX idx_tastings_match_score ON tastings ((match_score->>'total'));

-- Mode filtering
CREATE INDEX idx_tastings_mode ON tastings (mode);

-- User's records
CREATE INDEX idx_tastings_user_id ON tastings (user_id);

-- Chronological queries
CREATE INDEX idx_tastings_created_at ON tastings (created_at DESC);
```

## Query Examples

### Get user's recent tastings

```sql
SELECT * FROM tastings
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 10;
```

### Find all tastings for a specific coffee

```sql
SELECT * FROM tastings
WHERE coffee_info->>'coffee_name' = 'Ethiopia Yirgacheffe'
ORDER BY created_at DESC;
```

### Calculate average score for a coffee

```sql
SELECT
  coffee_info->>'coffee_name' as coffee_name,
  AVG((match_score->>'total')::numeric) as avg_score,
  COUNT(*) as total_tastings
FROM tastings
WHERE coffee_info->>'coffee_name' = 'Ethiopia Yirgacheffe'
GROUP BY coffee_info->>'coffee_name';
```

### Get Pro mode tastings with high TDS

```sql
SELECT * FROM tastings
WHERE mode = 'pro'
  AND (experimental_data->>'tds')::numeric > 1.35
ORDER BY created_at DESC;
```

## Security

All tables have Row Level Security (RLS) enabled:

- Users can only view and modify their own tastings
- Coffee master data is viewable by all authenticated users
- Flavor and sensory expression master data is public

## Performance Considerations

1. **JSONB vs Normalized Tables**: We chose JSONB for flexibility as different modes have different data requirements
2. **Indexing Strategy**: Create indexes on frequently queried JSONB fields
3. **Query Optimization**: Use specific JSONB operators for better performance
4. **Data Growth**: Consider partitioning by created_at for very large datasets

## Future Enhancements

1. **Coffee Relationships**: Link tastings to a master coffee database
2. **Social Features**: Share tastings, follow other users
3. **Analytics**: Aggregated statistics and trends
4. **Export/Import**: Backup and restore user data
5. **Versioning**: Track changes to tasting records
