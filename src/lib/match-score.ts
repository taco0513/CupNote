/**
 * Match Score 시스템 - Enhanced v2.0
 * 
 * 1단계: 고급 텍스트 매칭 (퍼지 매칭, 유사도 기반)
 * 3단계: 확장된 매칭 테이블 + 시맨틱 매칭
 * 
 * @version 2.0.0  
 * @since 2025-08-02
 */

import { calculateCommunityMatchScoreWithData } from './community-match'
import { 
  ENHANCED_FLAVOR_PROFILES, 
  ENHANCED_SENSORY_PROFILES,
  type FlavorProfile,
  type SensoryProfile,
  INTENSITY_MULTIPLIERS
} from './enhanced-dictionaries'
import { 
  findBestMatches, 
  type FuzzyMatchResult 
} from './fuzzy-matching'

// ===== 레거시 매칭 테이블 (하위 호환성) =====
export const FLAVOR_MATCHING: Record<string, string[]> = {
  // 과일류
  citrus: ['오렌지', '레몬', '라임', '자몽', '시트러스'],
  berry: ['딸기', '블루베리', '라즈베리', '베리류', '크랜베리'],
  'stone fruit': ['복숭아', '자두', '살구', '체리', '망고'],
  tropical: ['파인애플', '바나나', '파파야', '패션후르츠', '구아바'],
  apple: ['사과', '배', '포도', '키위', '무화과'],
  
  // 달콤함
  chocolate: ['초콜릿향', '다크초콜릿', '밀크초콜릿', '코코아', '카카오'],
  caramel: ['캐러멜향', '캐러멜', '갈색설탕', '캐러멜라이즈드 슈가'],
  vanilla: ['바닐라', '바닐린'],
  honey: ['꿀', '꿀같은', '허니'],
  sugar: ['설탕', '단맛', '당밀'],
  maple: ['메이플시럽', '메이플'],
  
  // 견과류
  nutty: ['견과류', '아몬드', '헤이즐넛', '땅콩', '호두', '피칸'],
  almond: ['아몬드'],
  hazelnut: ['헤이즐넛'],
  walnut: ['호두'],
  peanut: ['땅콩'],
  
  // 향신료/로스팅
  spice: ['향신료', '계피', '정향', '넛메그', '카다몸'],
  cinnamon: ['계피'],
  clove: ['정향'],
  smoky: ['스모키한', '연기', '그을린', '스모키'],
  roasted: ['로스팅', '구운', '볶은', '토스트', '빵'],
  tobacco: ['담배', '가죽', '삼나무'],
  
  // 플로럴
  floral: ['꽃향기', '자스민', '장미', '라벤더', '히비스커스']
}

// ===== 레거시 감각 매칭 테이블 (하위 호환성) =====
export const SENSORY_MATCHING: Record<string, string[]> = {
  // 산미 관련
  bright: ['상큼한', '발랄한', '싱그러운'],
  citrusy: ['시트러스 같은', '상큼한', '톡 쏘는'],
  acidic: ['톡 쏘는', '신맛', '과일 같은', '와인 같은'],
  crisp: ['깔끔한', '산뜻한'],
  
  // 바디/질감 관련
  smooth: ['부드러운', '실키한', '벨벳 같은'],
  creamy: ['크리미한', '부드러운'],
  full: ['묵직한', '풀바디', '진한'],
  light: ['가벼운', '라이트', '물 같은'],
  thin: ['물 같은', '얇은', '가벼운'],
  silky: ['실키한', '부드러운'],
  velvety: ['벨벳 같은', '부드러운'],
  oily: ['오일리한', '기름진'],
  
  // 단맛 관련
  sweet: ['달콤한', '단맛', '농밀한', '꿀 같은'],
  rich: ['농밀한', '진한', '풍부한'],
  
  // 쓴맛 관련
  bitter: ['쓴맛', '비터', '카카오 같은'],
  dark: ['다크', '진한', '다크 초콜릿 같은'],
  roasty: ['로스티한', '구운', '스모키한'],
  herbal: ['허브 느낌의', '허브 같은'],
  nutty_taste: ['고소한', '견과류 같은'],
  
  // 여운 관련
  clean: ['깔끔한', '클린', '산뜻한'],
  long: ['길게 남는', '여운이 좋은', '복합적인'],
  short: ['여운이 짧음', '드라이한'],
  lingering: ['달콤한 여운의', '길게 남는'],
  
  // 밸런스 관련
  balanced: ['조화로운', '균형잡힌', '밸런스', '안정된'],
  complex: ['복잡한', '복합적인', '역동적인'],
  simple: ['단순한', '자연스러운']
}

// ===== 타입 정의 =====
export interface MatchScoreResult {
  finalScore: number          // 0-100
  flavorScore: number         // 향미 매칭 점수 (0-100)
  sensoryScore: number        // 감각 매칭 점수 (0-100)
  message: string            // 사용자 메시지
  matchedFlavors: string[]   // 일치한 향미들
  matchedSensory: string[]   // 일치한 감각표현들
  roasterNote: string        // 원본 로스터 노트
  // v2.0 확장 필드
  confidence?: number        // 전체 매칭 신뢰도 (0-1)
  matchDetails?: {           // 상세 매칭 정보
    flavorMatches: FuzzyMatchResult[]
    sensoryMatches: FuzzyMatchResult[]
  }
  algorithm?: 'legacy' | 'enhanced'  // 사용된 알고리즘
}

// ===== 핵심 계산 함수들 =====

/**
 * 로스터 노트에서 향미 키워드 추출
 */
export const extractFlavorKeywords = (note: string): string[] => {
  const keywords: string[] = []
  const normalizedNote = note.toLowerCase()
  
  // 매칭 테이블의 키워드들을 찾기
  for (const keyword of Object.keys(FLAVOR_MATCHING)) {
    if (normalizedNote.includes(keyword)) {
      keywords.push(keyword)
    }
  }
  
  return keywords
}

/**
 * 로스터 노트에서 감각 키워드 추출
 */
export const extractSensoryKeywords = (note: string): string[] => {
  const keywords: string[] = []
  const normalizedNote = note.toLowerCase()
  
  for (const keyword of Object.keys(SENSORY_MATCHING)) {
    if (normalizedNote.includes(keyword)) {
      keywords.push(keyword)
    }
  }
  
  return keywords
}

/**
 * 향미 매칭 점수 계산 (70% 가중치) - Enhanced v2.0
 */
export const calculateFlavorMatching = (
  userFlavors: string[],
  roasterNote: string,
  useEnhanced: boolean = true
): { score: number; matches: string[]; details?: FuzzyMatchResult[] } => {
  
  if (useEnhanced) {
    return calculateEnhancedFlavorMatching(userFlavors, roasterNote)
  }
  
  // 레거시 알고리즘 (하위 호환성)
  const roasterKeywords = extractFlavorKeywords(roasterNote)
  
  if (roasterKeywords.length === 0) {
    return { score: 50, matches: [] }
  }
  
  let matches = 0
  const matchedItems: string[] = []
  
  for (const roasterKeyword of roasterKeywords) {
    const possibleMatches = FLAVOR_MATCHING[roasterKeyword] || []
    
    const matchedFlavor = userFlavors.find(userFlavor =>
      possibleMatches.includes(userFlavor) || 
      userFlavor.toLowerCase().includes(roasterKeyword) ||
      roasterKeyword.includes(userFlavor.toLowerCase())
    )
    
    if (matchedFlavor) {
      matches++
      matchedItems.push(matchedFlavor)
    }
  }
  
  const matchingScore = (matches / roasterKeywords.length) * 100
  const bonusMatches = Math.max(0, userFlavors.length - roasterKeywords.length)
  const bonus = Math.min(20, bonusMatches * 5)
  
  return {
    score: Math.min(100, matchingScore + bonus),
    matches: matchedItems
  }
}

/**
 * 향미 매칭 점수 계산 - Enhanced v2.0 (1단계 + 3단계)
 */
export const calculateEnhancedFlavorMatching = (
  userFlavors: string[],
  roasterNote: string
): { score: number; matches: string[]; details: FuzzyMatchResult[] } => {
  
  // 로스터 노트가 없거나 빈 문자열인 경우 처리
  if (!roasterNote || roasterNote.trim() === '') {
    return { score: 50, matches: [], details: [] }
  }
  
  // 1. 로스터 노트에서 향미 키워드 추출 (확장된 방식)
  const roasterKeywords = extractEnhancedFlavorKeywords(roasterNote)
  
  if (roasterKeywords.length === 0) {
    return { score: 50, matches: [], details: [] }
  }
  
  // 2. 퍼지 매칭으로 최적 매칭 찾기
  const fuzzyMatches = findBestMatches(
    roasterKeywords,
    userFlavors,
    roasterNote,
    0.6 // threshold
  )
  
  // 3. 프로필 기반 점수 계산
  let totalScore = 0
  let totalWeight = 0
  const matchedItems: string[] = []
  
  for (const roasterKeyword of roasterKeywords) {
    const profile = ENHANCED_FLAVOR_PROFILES[roasterKeyword]
    if (!profile) continue
    
    // 해당 키워드에 대한 최고 매치 찾기
    const bestMatch = fuzzyMatches.find(match => 
      match.keyword === roasterKeyword
    )
    
    if (bestMatch) {
      // 프로필 기반 점수 계산
      let matchScore = 0
      
      // Primary 매칭 (1.0)
      if (profile.primary.some(p => p.toLowerCase() === bestMatch.userSelection.toLowerCase())) {
        matchScore = 1.0
      }
      // Related 매칭 (0.8)  
      else if (profile.related.some(r => r.toLowerCase() === bestMatch.userSelection.toLowerCase())) {
        matchScore = 0.8
      }
      // Similar 매칭 (0.6)
      else if (profile.similar.some(s => s.toLowerCase() === bestMatch.userSelection.toLowerCase())) {
        matchScore = 0.6
      }
      // 퍼지 매칭 점수 활용
      else {
        matchScore = bestMatch.similarity * 0.5
      }
      
      // Opposite 페널티 (-0.3)
      if (profile.opposite.some(o => o.toLowerCase() === bestMatch.userSelection.toLowerCase())) {
        matchScore = -0.3
      }
      
      // 강도 보정
      const intensityMultiplier = INTENSITY_MULTIPLIERS[profile.intensity as keyof typeof INTENSITY_MULTIPLIERS] || 1.0
      matchScore *= intensityMultiplier
      
      // 신뢰도 보정
      matchScore *= profile.confidence
      
      totalScore += Math.max(-0.3, Math.min(1.2, matchScore))
      totalWeight += 1
      
      if (matchScore > 0) {
        matchedItems.push(bestMatch.userSelection)
      }
    }
  }
  
  // 4. 최종 점수 계산 (0-100)
  const finalScore = totalWeight > 0 
    ? Math.max(0, Math.min(100, (totalScore / totalWeight) * 100))
    : 50
  
  // 5. 참여도 보너스 (사용자가 다양한 향미 선택)
  const diversityBonus = Math.min(15, userFlavors.length * 2)
  const adjustedScore = Math.min(100, finalScore + diversityBonus)
  
  return {
    score: Math.round(adjustedScore),
    matches: matchedItems,
    details: fuzzyMatches
  }
}

/**
 * 로스터 노트에서 향미 키워드 추출 - Enhanced v2.0
 */
export const extractEnhancedFlavorKeywords = (note: string): string[] => {
  const keywords: string[] = []
  const normalizedNote = note.toLowerCase()
  
  // 1. 기본 키워드 매칭
  for (const keyword of Object.keys(ENHANCED_FLAVOR_PROFILES)) {
    const profile = ENHANCED_FLAVOR_PROFILES[keyword]
    
    // Primary 키워드 체크
    const foundPrimary = profile.primary.some(primary => 
      normalizedNote.includes(primary.toLowerCase())
    )
    
    if (foundPrimary || normalizedNote.includes(keyword)) {
      keywords.push(keyword)
    }
  }
  
  // 2. 중복 제거 및 신뢰도순 정렬
  const uniqueKeywords = [...new Set(keywords)]
  
  return uniqueKeywords.sort((a, b) => {
    const confidenceA = ENHANCED_FLAVOR_PROFILES[a]?.confidence || 0
    const confidenceB = ENHANCED_FLAVOR_PROFILES[b]?.confidence || 0
    return confidenceB - confidenceA
  })
}

/**
 * 감각 매칭 점수 계산 (30% 가중치) - Enhanced v2.0
 */
export const calculateSensoryMatching = (
  userExpressions: string[],
  roasterNote: string,
  useEnhanced: boolean = true
): { score: number; matches: string[]; details?: FuzzyMatchResult[] } => {
  
  if (useEnhanced) {
    return calculateEnhancedSensoryMatching(userExpressions, roasterNote)
  }
  
  // 레거시 알고리즘 (하위 호환성)
  const roasterKeywords = extractSensoryKeywords(roasterNote)
  
  if (roasterKeywords.length === 0) {
    return { score: 50, matches: [] }
  }
  
  let matches = 0
  const matchedItems: string[] = []
  
  for (const roasterKeyword of roasterKeywords) {
    const possibleMatches = SENSORY_MATCHING[roasterKeyword] || []
    
    const matchedExpression = userExpressions.find(userExpression =>
      possibleMatches.includes(userExpression) ||
      userExpression.toLowerCase().includes(roasterKeyword)
    )
    
    if (matchedExpression) {
      matches++
      matchedItems.push(matchedExpression)
    }
  }
  
  return {
    score: (matches / roasterKeywords.length) * 100,
    matches: matchedItems
  }
}

/**
 * 감각 매칭 점수 계산 - Enhanced v2.0 (1단계 + 3단계)
 */
export const calculateEnhancedSensoryMatching = (
  userExpressions: string[],
  roasterNote: string
): { score: number; matches: string[]; details: FuzzyMatchResult[] } => {
  
  // 로스터 노트가 없거나 빈 문자열인 경우 처리
  if (!roasterNote || roasterNote.trim() === '') {
    return { score: 50, matches: [], details: [] }
  }
  
  // 1. 로스터 노트에서 감각 키워드 추출 (확장된 방식)
  const roasterKeywords = extractEnhancedSensoryKeywords(roasterNote)
  
  if (roasterKeywords.length === 0) {
    return { score: 50, matches: [], details: [] }
  }
  
  // 2. 퍼지 매칭으로 최적 매칭 찾기
  const fuzzyMatches = findBestMatches(
    roasterKeywords,
    userExpressions,
    roasterNote,
    0.6 // threshold
  )
  
  // 3. 프로필 기반 점수 계산
  let totalScore = 0
  let totalWeight = 0
  const matchedItems: string[] = []
  
  for (const roasterKeyword of roasterKeywords) {
    const profile = ENHANCED_SENSORY_PROFILES[roasterKeyword]
    if (!profile) continue
    
    // 해당 키워드에 대한 최고 매치 찾기
    const bestMatch = fuzzyMatches.find(match => 
      match.keyword === roasterKeyword
    )
    
    if (bestMatch) {
      // 프로필 기반 점수 계산
      let matchScore = 0  
      
      // Primary 매칭 (1.0)
      if (profile.primary.some(p => p.toLowerCase() === bestMatch.userSelection.toLowerCase())) {
        matchScore = 1.0
      }
      // Related 매칭 (0.8)
      else if (profile.related.some(r => r.toLowerCase() === bestMatch.userSelection.toLowerCase())) {
        matchScore = 0.8
      }
      // Similar 매칭 (0.6)
      else if (profile.similar.some(s => s.toLowerCase() === bestMatch.userSelection.toLowerCase())) {
        matchScore = 0.6
      }
      // 퍼지 매칭 점수 활용
      else {
        matchScore = bestMatch.similarity * 0.5
      }
      
      // Opposite 페널티 (-0.3)
      if (profile.opposite.some(o => o.toLowerCase() === bestMatch.userSelection.toLowerCase())) {
        matchScore = -0.3
      }
      
      // 강도 보정 (감각표현은 향미보다 보정 계수 작게)
      const intensityMultiplier = 0.9 + (profile.intensity / 10) // 0.9-1.4 범위
      matchScore *= intensityMultiplier
      
      // 신뢰도 보정
      matchScore *= profile.confidence
      
      totalScore += Math.max(-0.3, Math.min(1.2, matchScore))
      totalWeight += 1
      
      if (matchScore > 0) {
        matchedItems.push(bestMatch.userSelection)
      }
    }
  }
  
  // 4. 최종 점수 계산 (0-100)
  const finalScore = totalWeight > 0 
    ? Math.max(0, Math.min(100, (totalScore / totalWeight) * 100))
    : 50
  
  // 5. 다양성 보너스 (향미보다 적게)
  const diversityBonus = Math.min(10, userExpressions.length * 1.5)
  const adjustedScore = Math.min(100, finalScore + diversityBonus)
  
  return {
    score: Math.round(adjustedScore),
    matches: matchedItems,
    details: fuzzyMatches
  }
}

/**
 * 로스터 노트에서 감각 키워드 추출 - Enhanced v2.0
 */
export const extractEnhancedSensoryKeywords = (note: string): string[] => {
  const keywords: string[] = []
  const normalizedNote = note.toLowerCase()
  
  // 1. 기본 키워드 매칭
  for (const keyword of Object.keys(ENHANCED_SENSORY_PROFILES)) {
    const profile = ENHANCED_SENSORY_PROFILES[keyword]
    
    // Primary 키워드 체크
    const foundPrimary = profile.primary.some(primary => 
      normalizedNote.includes(primary.toLowerCase())
    )
    
    if (foundPrimary || normalizedNote.includes(keyword)) {
      keywords.push(keyword)
    }
  }
  
  // 2. 중복 제거 및 신뢰도순 정렬
  const uniqueKeywords = [...new Set(keywords)]
  
  return uniqueKeywords.sort((a, b) => {
    const confidenceA = ENHANCED_SENSORY_PROFILES[a]?.confidence || 0
    const confidenceB = ENHANCED_SENSORY_PROFILES[b]?.confidence || 0
    return confidenceB - confidenceA
  })
}

/**
 * 사용자 감각표현을 평면 배열로 변환
 */
export const flattenUserExpressions = (
  selectedExpressions: string[]
): string[] => {
  return selectedExpressions || []
}

/**
 * 점수별 메시지 생성
 */
export const generateScoreMessage = (score: number): string => {
  if (score >= 90) {
    return '🎯 완벽한 매치! 로스터의 의도를 정확히 파악하셨네요!'
  } else if (score >= 80) {
    return '⭐ 훌륭한 매치! 로스터와 비슷하게 느끼고 계세요!'
  } else if (score >= 70) {
    return '👍 좋은 매치! 로스터 노트와 잘 일치해요!'
  } else if (score >= 60) {
    return '🤔 적당한 매치. 몇 가지 공통점이 있어요!'
  } else if (score >= 50) {
    return '🎨 다른 관점! 로스터와는 다른 매력을 발견하셨네요!'
  } else {
    return '🌟 새로운 발견! 완전히 다른 특별한 경험을 하셨어요!'
  }
}

/**
 * 최종 Match Score 계산 (메인 함수) - Enhanced v2.0
 */
export const calculateMatchScore = (
  userFlavors: string[],
  userExpressions: string[],
  roasterNote: string,
  useEnhanced: boolean = true
): MatchScoreResult => {
  
  if (useEnhanced) {
    return calculateEnhancedMatchScore(userFlavors, userExpressions, roasterNote)
  }
  
  // 레거시 알고리즘 (하위 호환성)
  const flavorResult = calculateFlavorMatching(userFlavors, roasterNote, false)
  const flatUserExpressions = flattenUserExpressions(userExpressions)
  const sensoryResult = calculateSensoryMatching(flatUserExpressions, roasterNote, false)
  
  const finalScore = Math.round(
    flavorResult.score * 0.7 + sensoryResult.score * 0.3
  )
  
  const message = generateScoreMessage(finalScore)
  
  return {
    finalScore,
    flavorScore: Math.round(flavorResult.score),
    sensoryScore: Math.round(sensoryResult.score),
    message,
    matchedFlavors: flavorResult.matches,
    matchedSensory: sensoryResult.matches,
    roasterNote,
    algorithm: 'legacy'
  }
}

/**
 * Enhanced Match Score 계산 - v2.0 (1단계 + 3단계 통합)
 */
export const calculateEnhancedMatchScore = (
  userFlavors: string[],
  userExpressions: string[],
  roasterNote: string
): MatchScoreResult => {
  
  console.log('🚀 Enhanced Match Score v2.0 시작')
  console.log('향미 입력:', userFlavors)
  console.log('감각 입력:', userExpressions)
  console.log('로스터 노트:', roasterNote ? roasterNote.substring(0, 100) + '...' : '없음')
  
  // 1. 향미 매칭 계산 (70% 가중치)
  const flavorResult = calculateEnhancedFlavorMatching(userFlavors, roasterNote)
  console.log('향미 매칭 결과:', flavorResult.score, '점, 매치:', flavorResult.matches)
  
  // 2. 감각 매칭 계산 (30% 가중치)
  const flatUserExpressions = flattenUserExpressions(userExpressions)
  const sensoryResult = calculateEnhancedSensoryMatching(flatUserExpressions, roasterNote)
  console.log('감각 매칭 결과:', sensoryResult.score, '점, 매치:', sensoryResult.matches)
  
  // 3. 가중평균으로 최종 점수 계산
  const finalScore = Math.round(
    flavorResult.score * 0.7 + sensoryResult.score * 0.3
  )
  
  // 4. 전체 매칭 신뢰도 계산
  const totalMatches = flavorResult.details.length + sensoryResult.details.length
  const avgConfidence = totalMatches > 0 
    ? ([...flavorResult.details, ...sensoryResult.details]
        .reduce((sum, match) => sum + match.confidence, 0) / totalMatches)
    : 0.5
  
  // 5. Enhanced 메시지 생성
  const message = generateEnhancedScoreMessage(
    finalScore, 
    flavorResult.matches.length,
    sensoryResult.matches.length,
    avgConfidence
  )
  
  console.log('🎯 최종 Enhanced 점수:', finalScore, '점, 신뢰도:', Math.round(avgConfidence * 100) + '%')
  
  return {
    finalScore,
    flavorScore: Math.round(flavorResult.score),
    sensoryScore: Math.round(sensoryResult.score),
    message,
    matchedFlavors: flavorResult.matches,
    matchedSensory: sensoryResult.matches,
    roasterNote,
    confidence: avgConfidence,
    matchDetails: {
      flavorMatches: flavorResult.details,
      sensoryMatches: sensoryResult.details
    },
    algorithm: 'enhanced'
  }
}

/**
 * Enhanced 점수별 메시지 생성
 */
export const generateEnhancedScoreMessage = (
  score: number, 
  flavorMatches: number, 
  sensoryMatches: number,
  confidence: number
): string => {
  
  const confidenceLevel = confidence >= 0.8 ? '높은' : confidence >= 0.6 ? '보통' : '낮은'
  const totalMatches = flavorMatches + sensoryMatches
  
  if (score >= 90) {
    return `🎯 거의 완벽한 매치! ${totalMatches}개 특성이 일치하며 ${confidenceLevel} 신뢰도를 보입니다!`
  } else if (score >= 80) {
    return `⭐ 훌륭한 매치! ${totalMatches}개 특성에서 로스터와 비슷한 감각을 보여주네요!`  
  } else if (score >= 70) {
    return `👍 좋은 매치! ${totalMatches}개의 공통 특성을 발견했습니다!`
  } else if (score >= 60) {
    return `🤔 적절한 매치. ${totalMatches}개 항목에서 공통점을 찾았어요!`
  } else if (score >= 50) {
    return `🎨 독특한 관점! 로스터와는 다른 특별한 매력을 발견하셨네요!`
  } else {
    return `🌟 완전히 새로운 발견! 당신만의 독창적인 커피 경험입니다!`
  }
}

/**
 * 커뮤니티 기반 매치 점수 계산 (레거시 - 샘플 데이터 사용)
 * @deprecated 새로운 calculateCommunityMatchScoreWithData 사용 권장
 */
export const calculateCommunityMatchScore = (
  userFlavors: string[],
  userExpressions: string[],
  coffeeId?: string
): MatchScoreResult => {
  console.warn('레거시 커뮤니티 매치 함수 사용중 - community-match.ts의 새 함수 사용 권장')
  
  const communityData = {
    // 샘플 커뮤니티 향미 분포 (가장 많이 선택된 향미들)
    popularFlavors: ['블루베리', '다크초콜릿', '견과류', '캐러멜', '오렌지'],
    flavorDistribution: {
      '블루베리': 0.65, // 65%의 사용자가 선택
      '다크초콜릿': 0.58,
      '견과류': 0.42,
      '캐러멜': 0.35,
      '오렌지': 0.28
    },
    // 샘플 커뮤니티 감각표현 분포
    popularExpressions: ['싱그러운', '부드러운', '달콤한', '고소한', '상큼한'],
    expressionDistribution: {
      '싱그러운': 0.72,
      '부드러운': 0.55,
      '달콤한': 0.48,
      '고소한': 0.38,
      '상큼한': 0.32
    }
  }
  
  // 1. 향미 커뮤니티 매칭 (70% 가중치)
  let flavorMatches = 0
  let flavorTotal = 0
  const matchedFlavors: string[] = []
  
  // 사용자가 선택한 향미들이 커뮤니티에서 얼마나 인기 있는지 확인
  for (const flavor of userFlavors) {
    flavorTotal++
    const popularity = (communityData.flavorDistribution as Record<string, number>)[flavor] || 0
    
    if (popularity > 0.3) { // 30% 이상의 사용자가 선택한 향미
      flavorMatches += popularity // 인기도에 비례해서 점수 추가
      matchedFlavors.push(flavor)
    }
  }
  
  // 향미 점수 계산 (커뮤니티 평균 대비)
  const flavorScore = flavorTotal > 0 
    ? Math.min(100, (flavorMatches / flavorTotal) * 100 + 10) // 10점 기본 보너스
    : 50
  
  // 2. 감각표현 커뮤니티 매칭 (30% 가중치)
  let sensoryMatches = 0
  let sensoryTotal = 0
  const matchedSensory: string[] = []
  
  for (const expression of userExpressions) {
    sensoryTotal++
    const popularity = (communityData.expressionDistribution as Record<string, number>)[expression] || 0
    
    if (popularity > 0.25) { // 25% 이상의 사용자가 선택한 표현
      sensoryMatches += popularity
      matchedSensory.push(expression)
    }
  }
  
  const sensoryScore = sensoryTotal > 0 
    ? Math.min(100, (sensoryMatches / sensoryTotal) * 100 + 10)
    : 50
  
  // 3. 최종 점수 계산
  const finalScore = Math.round(flavorScore * 0.7 + sensoryScore * 0.3)
  
  // 4. 커뮤니티 기반 메시지 생성
  const message = generateCommunityMessage(finalScore, matchedFlavors.length, matchedSensory.length)
  
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
 * 커뮤니티 매치 전용 메시지 생성
 */
export const generateCommunityMessage = (
  score: number, 
  flavorMatches: number, 
  sensoryMatches: number
): string => {
  if (score >= 85) {
    return '🎯 커뮤니티와 완벽한 공감! 많은 분들이 비슷하게 느끼고 계세요!'
  } else if (score >= 75) {
    return '⭐ 커뮤니티 대세와 일치! 인기 있는 특성들을 잘 포착하셨네요!'
  } else if (score >= 65) {
    return '👥 커뮤니티와 어느 정도 공감해요. 몇 가지 공통 특성이 있어요!'
  } else if (score >= 50) {
    return '🎨 독특한 관점! 남들과는 다른 특별한 매력을 발견하셨어요!'
  } else {
    return '🌟 완전히 새로운 발견! 당신만의 독창적인 커피 경험이네요!'
  }
}

/**
 * 빈 로스터 노트일 때 커뮤니티 기반 점수 반환
 * v2.0: Supabase 기반 실제 커뮤니티 데이터 사용
 */
export const getDefaultMatchScore = (
  userFlavors?: string[],
  userExpressions?: string[],
  coffeeId?: string
): MatchScoreResult => {
  // 사용자 선택 데이터가 있으면 커뮤니티 매치 계산 (레거시)
  if (userFlavors && userExpressions) {
    return calculateCommunityMatchScore(userFlavors, userExpressions, coffeeId)
  }
  
  // 데이터가 없으면 기본 상태
  return {
    finalScore: 0,
    flavorScore: 0,
    sensoryScore: 0,
    message: '🤗 커피를 선택하고 기록해보세요!',
    matchedFlavors: [],
    matchedSensory: [],
    roasterNote: ''
  }
}

/**
 * Supabase 기반 커뮤니티 매치 점수 반환 (비동기)
 * v2.0 권장 사용법
 */
export const getDefaultMatchScoreAsync = async (
  userFlavors?: string[],
  userExpressions?: string[],
  coffeeName?: string,
  roastery?: string
): Promise<MatchScoreResult> => {
  try {
    // 사용자 선택 데이터가 있으면 실제 커뮤니티 데이터로 계산
    if (userFlavors && userExpressions) {
      return await calculateCommunityMatchScoreWithData(
        userFlavors, 
        userExpressions, 
        coffeeName, 
        roastery
      )
    }
  } catch (error) {
    console.error('커뮤니티 매치 시스템 에러, 레거시 사용:', error)
    
    // 실패 시 레거시 시스템 사용
    if (userFlavors && userExpressions) {
      return calculateCommunityMatchScore(userFlavors, userExpressions)
    }
  }
  
  // 데이터가 없으면 기본 상태
  return {
    finalScore: 0,
    flavorScore: 0,
    sensoryScore: 0,
    message: '🤗 커피를 선택하고 기록해보세요!',
    matchedFlavors: [],
    matchedSensory: [],
    roasterNote: ''
  }
}