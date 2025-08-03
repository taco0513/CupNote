/**
 * 사용자 커피 기록과 마스터 커피 데이터 동기화
 * 사용자가 새로운 커피를 기록하면 자동으로 커피 정보 DB에 추가
 */

import { logger } from '../lib/logger'
import { supabase } from '../lib/supabase'

import type { Coffee } from '../types/data-management'

interface UserCoffeeRecord {
  coffee_name: string
  roastery?: string
  origin?: string
  processing?: string
  roast_level?: string
  flavor_notes?: string[]
  brew_method?: string
}

/**
 * 사용자 커피 기록에서 커피 정보 추출 및 저장
 */
export async function syncCoffeeInfoFromUserRecord(record: UserCoffeeRecord): Promise<void> {
  try {
    // 이미 존재하는 커피인지 확인
    const { data: existingCoffee } = await supabase
      .from('coffees')
      .select('id')
      .eq('name', record.coffee_name)
      .eq('roastery_name', record.roastery || '')
      .single()
    
    if (existingCoffee) {
      logger.info('Coffee already exists in master data', { 
        name: record.coffee_name,
        id: existingCoffee.id 
      })
      return
    }
    
    // 로스터리 찾기 또는 생성
    let roasteryId = null
    if (record.roastery) {
      const { data: roastery } = await supabase
        .from('cafe_roasteries')
        .select('id')
        .eq('name', record.roastery)
        .single()
      
      if (roastery) {
        roasteryId = roastery.id
      } else {
        // 새 로스터리 생성 (미검증 상태)
        const { data: newRoastery } = await supabase
          .from('cafe_roasteries')
          .insert({
            name: record.roastery,
            type: 'roastery',
            address: '주소 미입력',
            city: '미확인',
            is_verified: false,
            is_active: true,
            data_source: 'user_generated'
          })
          .select()
          .single()
        
        if (newRoastery) {
          roasteryId = newRoastery.id
          logger.info('Created new roastery from user record', { 
            name: record.roastery,
            id: newRoastery.id 
          })
        }
      }
    }
    
    // 새 커피 정보 생성 (미검증 상태)
    const newCoffee: Partial<Coffee> = {
      name: record.coffee_name,
      roastery_id: roasteryId,
      roastery_name: record.roastery || '알 수 없음',
      origin_country: extractCountryFromOrigin(record.origin),
      origin_region: extractRegionFromOrigin(record.origin),
      processing: record.processing || '알 수 없음',
      roast_level: mapRoastLevel(record.roast_level),
      flavor_notes: record.flavor_notes || [],
      category: 'single_origin', // 기본값
      is_active: true,
      is_featured: false,
      is_verified: false, // 사용자 생성 데이터는 미검증
      popularity_score: 50,
      data_source: 'user_generated' // 사용자가 생성한 데이터 표시
    }
    
    const { data: insertedCoffee, error } = await supabase
      .from('coffees')
      .insert(newCoffee)
      .select()
      .single()
    
    if (error) {
      logger.error('Failed to create coffee from user record', { error, record })
      return
    }
    
    // 로그 기록
    await supabase
      .from('data_update_logs')
      .insert({
        entity_type: 'coffee',
        entity_id: insertedCoffee.id,
        action: 'create',
        source: 'user_generated',
        changes: newCoffee
      })
    
    logger.info('Coffee created from user record', { 
      name: record.coffee_name,
      id: insertedCoffee.id 
    })
    
  } catch (error) {
    logger.error('Failed to sync coffee info from user record', { error, record })
  }
}

/**
 * 원산지에서 국가 추출
 */
function extractCountryFromOrigin(origin?: string): string {
  if (!origin) return '알 수 없음'
  
  // 일반적인 커피 생산국 매핑
  const countryMap: { [key: string]: string } = {
    '콜롬비아': 'Colombia',
    '에티오피아': 'Ethiopia',
    '케냐': 'Kenya',
    '브라질': 'Brazil',
    '코스타리카': 'Costa Rica',
    '과테말라': 'Guatemala',
    '파나마': 'Panama',
    '인도네시아': 'Indonesia',
    '하와이': 'Hawaii',
    '자메이카': 'Jamaica'
  }
  
  for (const [korean, english] of Object.entries(countryMap)) {
    if (origin.includes(korean)) return english
  }
  
  // 영어로 된 경우 첫 단어 추출
  const firstWord = origin.split(' ')[0]
  return firstWord || '알 수 없음'
}

/**
 * 원산지에서 지역 추출
 */
function extractRegionFromOrigin(origin?: string): string | null {
  if (!origin) return null
  
  // 국가명을 제거하고 나머지를 지역으로
  const parts = origin.split(' ')
  if (parts.length > 1) {
    return parts.slice(1).join(' ')
  }
  
  return null
}

/**
 * 로스팅 레벨 매핑
 */
function mapRoastLevel(level?: string): Coffee['roast_level'] {
  if (!level) return 'Medium'
  
  const levelMap: { [key: string]: Coffee['roast_level'] } = {
    '라이트': 'Light',
    'light': 'Light',
    '라이트미디엄': 'Light-Medium',
    'light-medium': 'Light-Medium',
    '미디엄': 'Medium',
    'medium': 'Medium',
    '미디엄다크': 'Medium-Dark',
    'medium-dark': 'Medium-Dark',
    '다크': 'Dark',
    'dark': 'Dark'
  }
  
  return levelMap[level.toLowerCase()] || 'Medium'
}

/**
 * 사용자 기록에서 커피 정보 일괄 동기화
 * 관리자가 수동으로 실행할 수 있는 기능
 */
export async function batchSyncCoffeeInfoFromRecords(): Promise<{
  synced: number
  errors: number
}> {
  try {
    // 최근 기록에서 고유한 커피 이름 추출
    const { data: records, error } = await supabase
      .from('coffee_records')
      .select('coffee_info')
      .not('coffee_info', 'is', null)
      .limit(1000)
    
    if (error) {
      logger.error('Failed to fetch coffee records', { error })
      return { synced: 0, errors: 0 }
    }
    
    const uniqueCoffees = new Map<string, UserCoffeeRecord>()
    
    for (const record of records || []) {
      const info = record.coffee_info as any
      if (info?.name && !uniqueCoffees.has(info.name)) {
        uniqueCoffees.set(info.name, {
          coffee_name: info.name,
          roastery: info.roastery,
          origin: info.origin,
          processing: info.processing,
          roast_level: info.roast_level,
          flavor_notes: info.flavor_notes
        })
      }
    }
    
    let synced = 0
    let errors = 0
    
    for (const coffeeRecord of uniqueCoffees.values()) {
      try {
        await syncCoffeeInfoFromUserRecord(coffeeRecord)
        synced++
      } catch (error) {
        errors++
        logger.error('Failed to sync individual coffee', { error, coffeeRecord })
      }
    }
    
    logger.info('Batch sync completed', { synced, errors, total: uniqueCoffees.size })
    return { synced, errors }
    
  } catch (error) {
    logger.error('Batch sync failed', { error })
    return { synced: 0, errors: 0 }
  }
}