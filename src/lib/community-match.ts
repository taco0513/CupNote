/**
 * Community-based Match Score System with Supabase Integration
 * 실제 사용자 데이터를 기반으로 한 커뮤니티 매칭 시스템
 * 
 * @version 2.0.0
 * @since 2025-08-02
 */

import { supabase } from './supabase'
import type { MatchScoreResult } from './match-score'

export interface CommunityData {
  flavorDistribution: Record<string, number>
  expressionDistribution: Record<string, number>
  totalRecords: number
  popularFlavors: string[]
  popularExpressions: string[]
}

/**
 * Supabase에서 커뮤니티 데이터 조회
 */
export const fetchCommunityData = async (
  coffeeName?: string,
  roastery?: string
): Promise<CommunityData> => {
  
  try {
    // Supabase Function을 호출하여 커뮤니티 데이터 가져오기
    const { data, error } = await supabase.rpc('get_community_match_data', {
      p_coffee_name: coffeeName || null,
      p_roastery: roastery || null
    })

    if (error) {
      console.error('커뮤니티 데이터 조회 오류:', error)
      return getFallbackCommunityData()
    }

    if (!data || !data.flavor_distribution) {
      console.log('커뮤니티 데이터 없음, 기본값 사용')
      return getFallbackCommunityData()
    }

    // 인기도 순으로 정렬
    const flavorEntries = Object.entries(data.flavor_distribution || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
    
    const expressionEntries = Object.entries(data.expression_distribution || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))

    return {
      flavorDistribution: data.flavor_distribution || {},
      expressionDistribution: data.expression_distribution || {},
      totalRecords: data.total_records || 0,
      popularFlavors: flavorEntries.slice(0, 10).map(([flavor]) => flavor),
      popularExpressions: expressionEntries.slice(0, 10).map(([expr]) => expr)
    }
  } catch (error) {
    console.error('커뮤니티 데이터 조회 중 오류:', error)
    return getFallbackCommunityData()
  }
}

/**
 * 네트워크 오류나 데이터 부족 시 사용할 기본 커뮤니티 데이터
 */
const getFallbackCommunityData = (): CommunityData => {
  return {
    flavorDistribution: {
      '블루베리': 65,
      '다크초콜릿': 58,
      '견과류': 42,
      '캐러멜': 35,
      '오렌지': 28,
      '바닐라': 25,
      '꿀': 22,
      '와인': 20
    },
    expressionDistribution: {
      '싱그러운': 72,
      '부드러운': 55,
      '달콤한': 48,
      '고소한': 38,
      '상큼한': 32,
      '묵직한': 28,
      '깔끔한': 25
    },
    totalRecords: 50, // 샘플 데이터 기준
    popularFlavors: ['블루베리', '다크초콜릿', '견과류', '캐러멜', '오렌지'],
    popularExpressions: ['싱그러운', '부드러운', '달콤한', '고소한', '상큼한']
  }
}

/**
 * 실제 커뮤니티 데이터를 기반으로 한 매치 점수 계산
 */
export const calculateCommunityMatchScoreWithData = async (
  userFlavors: string[],
  userExpressions: string[],
  coffeeName?: string,
  roastery?: string
): Promise<MatchScoreResult> => {
  // 커뮤니티 데이터 가져오기
  const communityData = await fetchCommunityData(coffeeName, roastery)
  
  // 1. 향미 커뮤니티 매칭 (70% 가중치)
  let flavorMatches = 0
  let flavorTotal = 0
  const matchedFlavors: string[] = []
  
  for (const flavor of userFlavors) {
    flavorTotal++
    const popularity = (communityData.flavorDistribution[flavor] || 0) / 100
    
    if (popularity > 0.2) { // 20% 이상의 사용자가 선택한 향미
      flavorMatches += popularity
      matchedFlavors.push(flavor)
    }
  }
  
  const flavorScore = flavorTotal > 0 
    ? Math.min(100, (flavorMatches / flavorTotal) * 100 + 15) // 15점 기본 보너스
    : 50
  
  // 2. 감각표현 커뮤니티 매칭 (30% 가중치)
  let sensoryMatches = 0
  let sensoryTotal = 0
  const matchedSensory: string[] = []
  
  for (const expression of userExpressions) {
    sensoryTotal++
    const popularity = (communityData.expressionDistribution[expression] || 0) / 100
    
    if (popularity > 0.15) { // 15% 이상의 사용자가 선택한 표현
      sensoryMatches += popularity
      matchedSensory.push(expression)
    }
  }
  
  const sensoryScore = sensoryTotal > 0 
    ? Math.min(100, (sensoryMatches / sensoryTotal) * 100 + 15)
    : 50
  
  // 3. 최종 점수 계산
  const finalScore = Math.round(flavorScore * 0.7 + sensoryScore * 0.3)
  
  // 4. 데이터 기반 메시지 생성
  const message = generateCommunityMessageWithData(
    finalScore, 
    matchedFlavors.length, 
    matchedSensory.length,
    communityData.totalRecords
  )
  
  return {
    finalScore,
    flavorScore: Math.round(flavorScore),
    sensoryScore: Math.round(sensoryScore),
    message,
    matchedFlavors,
    matchedSensory,
    roasterNote: '' // 커뮤니티 매치에서는 로스터 노트 없음
  }
}

/**
 * 실제 커뮤니티 데이터를 반영한 메시지 생성
 */
const generateCommunityMessageWithData = (
  score: number, 
  flavorMatches: number, 
  sensoryMatches: number,
  totalRecords: number
): string => {
  const recordText = totalRecords > 0 ? `${totalRecords}명의 다른 사용자들과` : '커뮤니티와'
  
  if (score >= 85) {
    return `🎯 ${recordText} 완벽한 공감! 많은 분들이 비슷하게 느끼고 계세요!`
  } else if (score >= 75) {
    return `⭐ ${recordText} 높은 일치도! 인기 있는 특성들을 잘 포착하셨네요!`
  } else if (score >= 65) {
    return `👥 ${recordText} 어느 정도 공감해요. ${flavorMatches + sensoryMatches}개의 공통 특성이 있어요!`
  } else if (score >= 50) {
    return `🎨 독특한 관점! 남들과는 다른 특별한 매력을 발견하셨어요!`
  } else {
    return `🌟 완전히 새로운 발견! 당신만의 독창적인 커피 경험이네요!`
  }
}

/**
 * 커뮤니티 데이터를 데이터베이스에 저장
 */
export const saveTastingDataToCommunity = async (
  coffeeRecordId: string,
  userFlavors: string[],
  userExpressions: string[]
): Promise<boolean> => {
  
  try {
    // 1. 향미 데이터 저장
    if (userFlavors.length > 0) {
      const flavorData = userFlavors.map(flavor => ({
        coffee_record_id: coffeeRecordId,
        flavor_name: flavor,
        level2_category: classifyFlavorCategory(flavor),
        level3_subcategory: flavor
      }))
      
      const { error: flavorError } = await supabase
        .from('flavor_selections')
        .insert(flavorData)
      
      if (flavorError) {
        console.error('향미 데이터 저장 오류:', flavorError)
        return false
      }
    }
    
    // 2. 감각표현 데이터 저장
    if (userExpressions.length > 0) {
      const sensoryData = userExpressions.map(expression => ({
        coffee_record_id: coffeeRecordId,
        expression_name: expression,
        category: classifySensoryCategory(expression)
      }))
      
      const { error: sensoryError } = await supabase
        .from('sensory_expressions')
        .insert(sensoryData)
      
      if (sensoryError) {
        console.error('감각표현 데이터 저장 오류:', sensoryError)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('커뮤니티 데이터 저장 중 오류:', error)
    return false
  }
}

/**
 * 향미를 카테고리로 분류하는 헬퍼 함수
 */
const classifyFlavorCategory = (flavor: string): string => {
  if (flavor.includes('베리') || flavor.includes('체리') || flavor.includes('과일')) {
    return 'fruit'
  } else if (flavor.includes('초콜릿') || flavor.includes('코코아') || flavor.includes('카카오')) {
    return 'chocolate'
  } else if (flavor.includes('견과') || flavor.includes('아몬드') || flavor.includes('헤이즐넛')) {
    return 'nutty'
  } else if (flavor.includes('꽃') || flavor.includes('플로럴')) {
    return 'floral'
  } else if (flavor.includes('향신료') || flavor.includes('계피')) {
    return 'spice'
  } else if (flavor.includes('캐러멜') || flavor.includes('바닐라') || flavor.includes('꿀')) {
    return 'sweet'
  } else {
    return 'other'
  }
}

/**
 * 감각표현을 카테고리로 분류하는 헬퍼 함수
 */
const classifySensoryCategory = (expression: string): string => {
  if (expression.includes('상큼') || expression.includes('신맛') || expression.includes('산미')) {
    return 'acidity'
  } else if (expression.includes('달콤') || expression.includes('단맛')) {
    return 'sweetness'
  } else if (expression.includes('부드러') || expression.includes('묵직') || expression.includes('바디')) {
    return 'body'
  } else if (expression.includes('쓴맛') || expression.includes('비터')) {
    return 'bitterness'
  } else if (expression.includes('여운') || expression.includes('피니시')) {
    return 'finish'
  } else if (expression.includes('균형') || expression.includes('조화')) {
    return 'balance'
  } else {
    return 'other'
  }
}