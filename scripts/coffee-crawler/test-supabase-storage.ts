#!/usr/bin/env ts-node

/**
 * Supabase Storage Test Script
 * 크롤링된 데이터를 Supabase에 저장하는 테스트
 */

import { SupabaseStorageService } from './src/services/supabase-storage'
import * as fs from 'fs'
import * as path from 'path'

async function testSupabaseStorage() {
  console.log('🧪 Supabase Storage 테스트 시작...')

  try {
    // 환경 변수 로드
    require('dotenv').config({ path: '../../.env.local' })

    // 서비스 초기화
    const storageService = new SupabaseStorageService()

    // 1. 연결 테스트
    console.log('\n1️⃣ Supabase 연결 테스트...')
    const isConnected = await storageService.testConnection()
    
    if (!isConnected) {
      console.error('❌ Supabase 연결 실패')
      console.log('환경 변수를 확인하세요:')
      console.log('  NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('  SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return
    }
    
    console.log('✅ Supabase 연결 성공')

    // 2. 테스트 데이터 로드
    console.log('\n2️⃣ 테스트 데이터 로드...')
    const latestJsonFile = fs.readdirSync('./')
      .filter(f => f.startsWith('crawl-results-unspecialty-'))
      .sort()
      .reverse()[0]

    if (!latestJsonFile) {
      console.error('❌ 크롤링 결과 파일을 찾을 수 없습니다')
      return
    }

    console.log(`📂 로드: ${latestJsonFile}`)
    const testData = JSON.parse(fs.readFileSync(latestJsonFile, 'utf8'))
    console.log(`📊 ${testData.length}개 제품 로드됨`)

    // 3. 데이터 저장 테스트
    console.log('\n3️⃣ 데이터 저장 테스트...')
    const result = await storageService.storeProducts(testData)

    console.log('\n📊 저장 결과:')
    console.log(`  ✅ 성공: ${result.success}`)
    console.log(`  📝 신규 삽입: ${result.insertedCount}개`)
    console.log(`  🔄 업데이트: ${result.updatedCount}개`)
    console.log(`  ⚠️ 에러: ${result.errors.length}개`)

    if (result.errors.length > 0) {
      console.log('\n❌ 에러 목록:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }

    // 4. 저장 통계 확인
    console.log('\n4️⃣ 저장 통계 확인...')
    const stats = await storageService.getStorageStats()
    
    console.log('📈 데이터베이스 통계:')
    console.log(`  📦 총 제품 수: ${stats.totalProducts}개`)
    console.log(`  🏪 로스터리별:`, stats.roasteryStats)
    console.log(`  🌍 원산지별:`, stats.originStats)
    console.log(`  ⏰ 최근 1시간 크롤링: ${stats.recentCrawls}개`)

    console.log('\n✅ 모든 테스트 완료!')

  } catch (error) {
    console.error('❌ 테스트 실패:', error)
    
    if ((error as Error).message.includes('환경 변수')) {
      console.log('\n📝 해결 방법:')
      console.log('1. .env.local 파일에 다음 변수들이 설정되어 있는지 확인:')
      console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
      console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
      console.log('2. Supabase 프로젝트 설정에서 키를 확인하세요')
    }
  }
}

if (require.main === module) {
  testSupabaseStorage().catch(console.error)
}