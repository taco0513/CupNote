/**
 * 관리자 계정 생성 스크립트
 * admin@mycupnote.com 계정을 생성하고 관리자 권한을 설정합니다
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

// Create admin client with service role key
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminAccount() {
  console.log('🔧 Creating admin account: admin@mycupnote.com')

  const adminEmail = 'admin@mycupnote.com'
  const adminPassword = generateSecurePassword()

  try {
    // 1. Create admin user
    console.log('📝 Creating user account...')
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin',
        name: 'CupNote Administrator',
        created_by: 'system',
        created_at: new Date().toISOString()
      }
    })

    if (authError) {
      console.error('❌ Failed to create user:', authError.message)
      return
    }

    if (!authData.user) {
      console.error('❌ No user data returned')
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('👤 User ID:', authData.user.id)
    console.log('📧 Email:', authData.user.email)

    // 2. Create admin profile (if you have a profiles table)
    console.log('📝 Creating admin profile...')
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: adminEmail,
        name: 'CupNote Administrator',
        role: 'admin',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.warn('⚠️ Profile creation failed (table might not exist):', profileError.message)
    } else {
      console.log('✅ Admin profile created!')
    }

    // 3. Log the operation
    console.log('📝 Logging admin account creation...')
    const { error: logError } = await adminClient
      .from('admin_activity_logs')
      .insert({
        admin_id: authData.user.id,
        action: 'admin_account_created',
        details: {
          email: adminEmail,
          created_by: 'system_script',
          timestamp: new Date().toISOString()
        }
      })

    if (logError) {
      console.warn('⚠️ Activity log failed (table might not exist):', logError.message)
    }

    // 4. Display credentials
    console.log('\n🎉 Admin account created successfully!')
    console.log('=' .repeat(50))
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('🌐 Login URL: https://mycupnote.com/auth')
    console.log('🛡️ Admin Dashboard: https://mycupnote.com/admin')
    console.log('=' .repeat(50))
    console.log('\n⚠️ IMPORTANT:')
    console.log('- Save these credentials securely')
    console.log('- Change the password after first login')
    console.log('- Enable 2FA when available')
    console.log('- This password will not be shown again')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

function generateSecurePassword(): string {
  // Generate a secure 16-character password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Fill the rest randomly
  for (let i = 4; i < 16; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Helper function to check if admin account already exists
async function checkExistingAdmin() {
  console.log('🔍 Checking if admin account already exists...')
  
  const { data: users, error } = await adminClient.auth.admin.listUsers()
  
  if (error) {
    console.error('❌ Failed to check existing users:', error.message)
    return false
  }

  const existingAdmin = users.users.find(user => 
    user.email === 'admin@mycupnote.com'
  )

  if (existingAdmin) {
    console.log('⚠️ Admin account already exists!')
    console.log('👤 User ID:', existingAdmin.id)
    console.log('📧 Email:', existingAdmin.email)
    console.log('📅 Created:', existingAdmin.created_at)
    
    const reset = await promptUserForReset()
    return !reset
  }

  return false
}

async function promptUserForReset(): Promise<boolean> {
  // In a real script, you'd use readline or similar
  // For now, we'll just log and return false
  console.log('\nIf you want to reset the existing admin account:')
  console.log('1. Go to Supabase Dashboard > Authentication > Users')
  console.log('2. Find admin@mycupnote.com and delete the user')
  console.log('3. Run this script again')
  
  return false
}

// Main execution
async function main() {
  console.log('🚀 CupNote Admin Account Creation Script')
  console.log('=====================================\n')

  const exists = await checkExistingAdmin()
  if (exists) {
    console.log('❌ Admin account already exists. Script terminated.')
    return
  }

  await createAdminAccount()
}

// Run the script
main().catch(console.error)