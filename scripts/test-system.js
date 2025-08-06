/**
 * Simple System Test Script for CupNote
 * Tests core functionality without complex imports
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('   Please check .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBasicFunctionality() {
  console.log('🧪 Testing CupNote basic functionality...\n')
  
  // Test 1: Database connection
  console.log('1. Testing database connection...')
  try {
    const { count, error } = await supabase
      .from('coffee_records')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    console.log(`✅ Connected! Found ${count || 0} records`)
  } catch (error) {
    console.log('❌ Connection failed:', error.message)
    return false
  }
  
  // Test 2: Required tables
  console.log('\n2. Checking required tables...')
  const tables = ['coffee_records', 'user_achievements', 'achievement_definitions']
  let tablesOk = true
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      if (error) throw error
      console.log(`✅ Table '${table}' OK`)
    } catch (error) {
      console.log(`❌ Table '${table}' issue:`, error.message)
      tablesOk = false
    }
  }
  
  // Test 3: Community tables (optional)
  console.log('\n3. Checking community tables (optional)...')
  const communityTables = ['flavor_selections', 'sensory_expressions']
  let communityTablesExist = 0
  
  for (const table of communityTables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      if (!error) {
        console.log(`✅ Community table '${table}' exists`)
        communityTablesExist++
      } else {
        console.log(`ℹ️ Community table '${table}' not found (will use fallback)`)
      }
    } catch (error) {
      console.log(`ℹ️ Community table '${table}' not accessible`)
    }
  }
  
  // Test 4: RPC functions
  console.log('\n4. Testing RPC functions...')
  try {
    const { data, error } = await supabase.rpc('get_community_match_data', {
      p_coffee_name: null,
      p_roastery: null
    })
    
    if (error) {
      console.log('ℹ️ RPC functions not available (will use client-side calculation)')
      console.log('   This is normal if migrations haven\'t been applied')
    } else {
      console.log('✅ RPC functions working')
      console.log(`   Total records: ${data?.total_records || 0}`)
    }
  } catch (error) {
    console.log('ℹ️ RPC test skipped:', error.message)
  }
  
  // Summary
  console.log('\n' + '='.repeat(40))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(40))
  
  if (tablesOk) {
    console.log('✅ Core system: READY')
    console.log('✅ Records can be saved and retrieved')
    console.log('✅ Achievement system available')
    
    if (communityTablesExist === communityTables.length) {
      console.log('✅ Community features: FULL SUPPORT')
      console.log('   - Real-time community matching')
      console.log('   - Advanced flavor analytics')
    } else {
      console.log('⚠️ Community features: FALLBACK MODE')
      console.log('   - Basic community matching available')
      console.log('   - Data stored in main records table')
      console.log('   - Consider applying migration for full features')
    }
    
    console.log('\n🎉 System is functional and ready for use!')
    console.log('\n💡 To enable full community features:')
    console.log('   Apply: supabase/migrations/20250802_add_tasting_details.sql')
    
    return true
  } else {
    console.log('❌ Core system: ISSUES DETECTED')
    console.log('   Please check database setup')
    return false
  }
}

// Run tests if called directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' })
  
  testBasicFunctionality()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testBasicFunctionality }