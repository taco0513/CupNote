/**
 * CSV 파일 처리 유틸리티
 * 카페/로스터리 및 커피 데이터 import/export
 */

import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'
import type { CafeRoastery, Coffee } from '../types/data-management'

// CSV 파싱 헬퍼
export function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || null
    })
    
    data.push(row)
  }
  
  return data
}

// CSV 생성 헬퍼
export function generateCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // 쉼표나 줄바꿈이 있으면 따옴표로 감싸기
      if (value && (value.toString().includes(',') || value.toString().includes('\n'))) {
        return `"${value}"`
      }
      return value || ''
    }).join(',')
  })
  
  return [csvHeaders, ...csvRows].join('\n')
}

// 카페/로스터리 CSV 가져오기
export async function importCafeRoasteriesCSV(file: File): Promise<{
  success: boolean
  imported: number
  errors: string[]
}> {
  try {
    const text = await file.text()
    const data = parseCSV(text)
    
    const errors: string[] = []
    const toImport: Partial<CafeRoastery>[] = []
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      
      // 필수 필드 검증
      if (!row['이름'] || !row['타입'] || !row['주소'] || !row['도시']) {
        errors.push(`행 ${i + 2}: 필수 필드 누락 (이름, 타입, 주소, 도시)`)
        continue
      }
      
      // 타입 검증
      const typeMap: { [key: string]: CafeRoastery['type'] } = {
        '카페': 'cafe',
        '로스터리': 'roastery',
        '둘다': 'both',
        'cafe': 'cafe',
        'roastery': 'roastery',
        'both': 'both'
      }
      
      const type = typeMap[row['타입'].toLowerCase()]
      if (!type) {
        errors.push(`행 ${i + 2}: 잘못된 타입 (카페, 로스터리, 둘다 중 하나)`)
        continue
      }
      
      // 데이터 변환
      const cafeRoastery: any = {
        name: row['이름'],
        type,
        description: row['설명'] || null,
        address: row['주소'],
        address_detail: row['상세주소'] || null,
        city: row['도시'],
        district: row['구'] || null,
        phone: row['전화번호'] || null,
        email: row['이메일'] || null,
        website: row['웹사이트'] || null,
        instagram: row['인스타그램'] || null,
        roasting_style: row['로스팅스타일'] || null,
        features: row['특징'] ? row['특징'].split('|') : [],
        signature_menu: row['시그니처메뉴'] ? row['시그니처메뉴'].split('|') : [],
        is_active: row['활성'] !== 'false' && row['활성'] !== '0',
        is_verified: row['검증'] === 'true' || row['검증'] === '1',
        data_source: 'csv'
      }
      
      toImport.push(cafeRoastery)
    }
    
    // Supabase에 일괄 삽입
    if (toImport.length > 0) {
      const { data: imported, error } = await supabase
        .from('cafe_roasteries')
        .insert(toImport)
        .select()
      
      if (error) {
        logger.error('Failed to import cafe/roasteries', { error })
        errors.push(`데이터베이스 오류: ${error.message}`)
        return { success: false, imported: 0, errors }
      }
      
      // 로그 기록
      const logs = imported.map(item => ({
        entity_type: 'cafe_roastery',
        entity_id: item.id,
        action: 'import',
        source: 'csv',
        changes: item
      }))
      
      await supabase.from('data_update_logs').insert(logs)
      
      logger.info('Cafe/roasteries imported successfully', { count: imported.length })
      return { success: true, imported: imported.length, errors }
    }
    
    return { success: errors.length === 0, imported: 0, errors }
    
  } catch (error) {
    logger.error('CSV import failed', { error })
    return { 
      success: false, 
      imported: 0, 
      errors: [`파일 처리 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`] 
    }
  }
}

// 커피 CSV 가져오기
export async function importCoffeesCSV(file: File): Promise<{
  success: boolean
  imported: number
  errors: string[]
}> {
  try {
    const text = await file.text()
    const data = parseCSV(text)
    
    const errors: string[] = []
    const toImport: any[] = []
    
    // 로스터리 이름-ID 매핑 가져오기
    const { data: roasteries } = await supabase
      .from('cafe_roasteries')
      .select('id, name')
      .in('type', ['roastery', 'both'])
    
    const roasteryMap = new Map(roasteries?.map(r => [r.name, r.id]) || [])
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      
      // 필수 필드 검증
      if (!row['이름'] || !row['로스터리'] || !row['원산지'] || !row['가공방식'] || !row['로스팅레벨']) {
        errors.push(`행 ${i + 2}: 필수 필드 누락`)
        continue
      }
      
      // 로스터리 ID 찾기
      const roasteryId = roasteryMap.get(row['로스터리'])
      if (!roasteryId) {
        errors.push(`행 ${i + 2}: 로스터리 '${row['로스터리']}' 를 찾을 수 없음`)
        continue
      }
      
      // 로스팅 레벨 검증
      const roastLevelMap: { [key: string]: Coffee['roast_level'] } = {
        'light': 'Light',
        '라이트': 'Light',
        'light-medium': 'Light-Medium',
        '라이트미디엄': 'Light-Medium',
        'medium': 'Medium',
        '미디엄': 'Medium',
        'medium-dark': 'Medium-Dark',
        '미디엄다크': 'Medium-Dark',
        'dark': 'Dark',
        '다크': 'Dark'
      }
      
      const roastLevel = roastLevelMap[row['로스팅레벨'].toLowerCase()]
      if (!roastLevel) {
        errors.push(`행 ${i + 2}: 잘못된 로스팅 레벨`)
        continue
      }
      
      // 원산지 파싱
      const originParts = row['원산지'].split(' ')
      const originCountry = originParts[0]
      const originRegion = originParts[1] || null
      
      // 카테고리 결정
      let category: Coffee['category'] = 'single_origin'
      if (row['카테고리']) {
        const categoryMap: { [key: string]: Coffee['category'] } = {
          '싱글오리진': 'single_origin',
          'single': 'single_origin',
          '블렌드': 'blend',
          'blend': 'blend',
          '디카페인': 'decaf',
          'decaf': 'decaf'
        }
        category = categoryMap[row['카테고리'].toLowerCase()] || 'single_origin'
      }
      
      // 데이터 변환
      const coffee = {
        name: row['이름'],
        name_en: row['영문명'] || null,
        roastery_id: roasteryId,
        roastery_name: row['로스터리'],
        origin_country: originCountry,
        origin_region: originRegion,
        origin_farm: row['농장'] || null,
        origin_altitude: row['고도'] || null,
        variety: row['품종'] ? row['품종'].split('|') : [],
        processing: row['가공방식'],
        roast_level: roastLevel,
        roasted_date: row['로스팅날짜'] || null,
        flavor_notes: row['맛노트'] ? row['맛노트'].split('|') : [],
        aroma: row['향'] ? row['향'].split('|') : [],
        acidity: parseInt(row['산미']) || null,
        body: parseInt(row['바디']) || null,
        sweetness: parseInt(row['단맛']) || null,
        bitterness: parseInt(row['쓴맛']) || null,
        sca_score: parseFloat(row['SCA점수']) || null,
        price_retail: parseInt(row['가격']) || null,
        price_per_kg: parseInt(row['kg당가격']) || null,
        availability: row['재고상태'] || 'in_stock',
        harvest_year: parseInt(row['수확년도']) || null,
        tags: row['태그'] ? row['태그'].split('|') : [],
        category,
        is_featured: row['추천'] === 'true' || row['추천'] === '1',
        popularity_score: parseInt(row['인기도']) || 50,
        data_source: 'csv'
      }
      
      toImport.push(coffee)
    }
    
    // Supabase에 일괄 삽입
    if (toImport.length > 0) {
      const { data: imported, error } = await supabase
        .from('coffees')
        .insert(toImport)
        .select()
      
      if (error) {
        logger.error('Failed to import coffees', { error })
        errors.push(`데이터베이스 오류: ${error.message}`)
        return { success: false, imported: 0, errors }
      }
      
      // 카페/로스터리와 커피 연결
      const connections = imported.map(coffee => ({
        cafe_roastery_id: coffee.roastery_id,
        coffee_id: coffee.id
      }))
      
      await supabase.from('cafe_roastery_coffees').insert(connections)
      
      // 로그 기록
      const logs = imported.map(item => ({
        entity_type: 'coffee',
        entity_id: item.id,
        action: 'import',
        source: 'csv',
        changes: item
      }))
      
      await supabase.from('data_update_logs').insert(logs)
      
      logger.info('Coffees imported successfully', { count: imported.length })
      return { success: true, imported: imported.length, errors }
    }
    
    return { success: errors.length === 0, imported: 0, errors }
    
  } catch (error) {
    logger.error('Coffee CSV import failed', { error })
    return { 
      success: false, 
      imported: 0, 
      errors: [`파일 처리 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`] 
    }
  }
}

// 카페/로스터리 CSV 내보내기
export async function exportCafeRoasteriesToCSV(): Promise<Blob> {
  const { data, error } = await supabase
    .from('cafe_roasteries')
    .select('*')
    .order('name')
  
  if (error) {
    logger.error('Failed to export cafe/roasteries', { error })
    throw error
  }
  
  const headers = [
    '이름', '타입', '설명', '설립년도', '대표자',
    '주소', '상세주소', '도시', '구', '위도', '경도',
    '전화번호', '이메일', '웹사이트', '인스타그램',
    '특징', '시그니처메뉴', '로스팅스타일',
    '평점', '리뷰수', '활성', '검증', '생성일', '수정일'
  ]
  
  const csvData = data.map(item => ({
    '이름': item.name,
    '타입': item.type === 'both' ? '둘다' : item.type === 'cafe' ? '카페' : '로스터리',
    '설명': item.description || '',
    '설립년도': item.established_year || '',
    '대표자': item.owner_name || '',
    '주소': item.address,
    '상세주소': item.address_detail || '',
    '도시': item.city,
    '구': item.district || '',
    '위도': item.latitude || '',
    '경도': item.longitude || '',
    '전화번호': item.phone || '',
    '이메일': item.email || '',
    '웹사이트': item.website || '',
    '인스타그램': item.instagram || '',
    '특징': item.features?.join('|') || '',
    '시그니처메뉴': item.signature_menu?.join('|') || '',
    '로스팅스타일': item.roasting_style || '',
    '평점': item.rating || '',
    '리뷰수': item.review_count || '',
    '활성': item.is_active ? '1' : '0',
    '검증': item.is_verified ? '1' : '0',
    '생성일': new Date(item.created_at).toLocaleDateString('ko-KR'),
    '수정일': new Date(item.updated_at).toLocaleDateString('ko-KR')
  }))
  
  const csv = generateCSV(csvData, headers)
  return new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
}

// 커피 CSV 내보내기
export async function exportCoffeesToCSV(): Promise<Blob> {
  const { data, error } = await supabase
    .from('coffees')
    .select('*')
    .order('name')
  
  if (error) {
    logger.error('Failed to export coffees', { error })
    throw error
  }
  
  const headers = [
    '이름', '영문명', '로스터리', '원산지', '지역', '농장', '고도',
    '품종', '가공방식', '로스팅레벨', '로스팅날짜',
    '맛노트', '향', '산미', '바디', '단맛', '쓴맛',
    'SCA점수', '가격', 'kg당가격', '재고상태',
    '수확년도', '태그', '카테고리', '추천', '인기도'
  ]
  
  const csvData = data.map(item => ({
    '이름': item.name,
    '영문명': item.name_en || '',
    '로스터리': item.roastery_name,
    '원산지': item.origin_country,
    '지역': item.origin_region || '',
    '농장': item.origin_farm || '',
    '고도': item.origin_altitude || '',
    '품종': item.variety?.join('|') || '',
    '가공방식': item.processing,
    '로스팅레벨': item.roast_level,
    '로스팅날짜': item.roasted_date || '',
    '맛노트': item.flavor_notes?.join('|') || '',
    '향': item.aroma?.join('|') || '',
    '산미': item.acidity || '',
    '바디': item.body || '',
    '단맛': item.sweetness || '',
    '쓴맛': item.bitterness || '',
    'SCA점수': item.sca_score || '',
    '가격': item.price_retail || '',
    'kg당가격': item.price_per_kg || '',
    '재고상태': item.availability,
    '수확년도': item.harvest_year || '',
    '태그': item.tags?.join('|') || '',
    '카테고리': item.category === 'single_origin' ? '싱글오리진' : 
               item.category === 'blend' ? '블렌드' : '디카페인',
    '추천': item.is_featured ? '1' : '0',
    '인기도': item.popularity_score
  }))
  
  const csv = generateCSV(csvData, headers)
  return new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
}

// 파일 다운로드 헬퍼
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}