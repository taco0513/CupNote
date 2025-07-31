// Script to check current database schema
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  try {
    console.log('Checking coffee_records table schema...')
    
    // Try to get table structure by attempting a select with limit 0
    const { data, error } = await supabase
      .from('coffee_records')
      .select('*')
      .limit(0)
    
    if (error) {
      console.error('Error accessing coffee_records table:', error)
    } else {
      console.log('coffee_records table exists and is accessible')
    }

    // Check achievement_definitions table
    console.log('Checking achievement_definitions table...')
    const { data: achievementData, error: achievementError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .limit(0)
    
    if (achievementError) {
      console.error('Error accessing achievement_definitions table:', achievementError)
    } else {
      console.log('achievement_definitions table exists and is accessible')
    }

    // Test mode constraint - check if 'quick' and 'pro' modes are supported
    console.log('Testing mode constraint...')
    const testQuickMode = {
      coffee_name: 'Test Coffee',
      rating: 5,
      taste_notes: 'Test notes',
      mode: 'quick'  // This might not be allowed
    }

    const { error: quickModeError } = await supabase
      .from('coffee_records')
      .insert(testQuickMode)
      .select()

    if (quickModeError) {
      if (quickModeError.message.includes('mode')) {
        console.log('❌ Mode "quick" is NOT supported (constraint violation)')
      } else {
        console.log('✅ Mode "quick" constraint OK (other error expected)')
      }
    }

    // Test if additional_images column exists
    console.log('Testing additional_images column...')
    const testRecordWithImages = {
      coffee_name: 'Test Coffee',
      rating: 5,
      taste_notes: 'Test notes',
      mode: 'cafe',
      additional_images: ['test1.jpg', 'test2.jpg']
    }

    const { error: insertError } = await supabase
      .from('coffee_records')
      .insert(testRecordWithImages)
      .select()

    if (insertError) {
      if (insertError.message.includes('additional_images')) {
        console.log('❌ additional_images column does NOT exist in database')
      } else if (insertError.message.includes('row-level security')) {
        console.log('✅ additional_images column exists (RLS error expected)')
      } else {
        console.error('Other insert error:', insertError.message)
      }
    } else {
      console.log('Insert succeeded (unexpected)')
    }

    // Test achievement_definitions table access
    console.log('Testing achievement_definitions select...')
    const { data: achievements, error: achError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .limit(5)

    if (achError) {
      console.error('Achievement definitions error:', achError.message)
    } else {
      console.log(`✅ Found ${achievements?.length || 0} achievement definitions`)
      if (achievements?.length > 0) {
        console.log('Sample achievement:', achievements[0])
      }
    }

  } catch (error) {
    console.error('Script error:', error)
  }
}

checkSchema()