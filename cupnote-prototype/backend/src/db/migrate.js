const fs = require('fs')
const path = require('path')
const { pool } = require('./index')

const runMigration = async () => {
  try {
    console.log('🔄 Starting database migration...')

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // Execute schema
    await pool.query(schema)

    console.log('✅ Database migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
runMigration()
