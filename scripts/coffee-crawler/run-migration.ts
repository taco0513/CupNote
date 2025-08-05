#!/usr/bin/env ts-node

/**
 * Manual Migration Runner for Coffee Products Table
 * Supabase CLI 문제 해결을 위한 직접 마이그레이션 실행
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

async function runMigration() {
  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 환경 변수 누락:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다')
    console.error('  .env.local 파일을 확인하세요')
    process.exit(1)
  }

  // Supabase 클라이언트 생성
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log('🚀 Coffee Products 테이블 마이그레이션 시작...')

    // 마이그레이션 SQL 읽기
    const migrationPath = path.join(__dirname, '../../supabase/migrations/20250805_coffee_products_table.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // SQL 실행
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // RPC 함수가 없는 경우 직접 쿼리 실행 시도
      if (error.message.includes('function')) {
        console.log('📝 직접 SQL 실행 시도...')
        
        // SQL을 여러 문장으로 분리해서 실행
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))

        for (const statement of statements) {
          if (statement.trim()) {
            const { error: execError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(0) // 실제로는 SQL을 직접 실행할 방법이 필요

            console.log(`⚠️ SQL 직접 실행 제한으로 인해 수동 실행이 필요합니다`)
            console.log('아래 SQL을 Supabase Dashboard에서 실행하세요:')
            console.log('\n' + '='.repeat(50))
            console.log(sql)
            console.log('='.repeat(50))
            return
          }
        }
      } else {
        throw error
      }
    }

    console.log('✅ 마이그레이션 완료!')
    
    // 테이블 생성 확인
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'coffee_products')

    if (tables && tables.length > 0) {
      console.log('✅ coffee_products 테이블 생성 확인됨')
    } else {
      console.log('⚠️ 테이블 생성 확인 불가 - Supabase Dashboard에서 직접 확인하세요')
    }

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error)
    console.log('\n📝 수동 실행 방법:')
    console.log('1. Supabase Dashboard > SQL Editor 접속')
    console.log('2. 아래 파일 내용을 복사하여 실행:')
    console.log(`   ${path.join(__dirname, '../../supabase/migrations/20250805_coffee_products_table.sql')}`)
  }
}

// 환경 변수 로드
require('dotenv').config({ path: '../../.env.local' })

if (require.main === module) {
  runMigration().catch(console.error)
}