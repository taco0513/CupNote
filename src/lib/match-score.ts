/**
 * Match Score 시스템 - Simple MVP 버전
 * 향미 매칭 70% + 감각 매칭 30%
 * 
 * @version 1.0.0
 * @since 2025-01-31
 */

// ===== 향미 매칭 테이블 =====
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

// ===== 감각 매칭 테이블 =====
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
 * 향미 매칭 점수 계산 (70% 가중치)
 */
export const calculateFlavorMatching = (
  userFlavors: string[],
  roasterNote: string
): { score: number; matches: string[] } => {
  // 1. 로스터 노트에서 키워드 추출
  const roasterKeywords = extractFlavorKeywords(roasterNote)
  
  if (roasterKeywords.length === 0) {
    return { score: 50, matches: [] } // 로스터 노트 없으면 중립 점수
  }
  
  // 2. 매칭 개수 세기
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
  
  // 3. 점수 계산 (0-100%)
  const matchingScore = (matches / roasterKeywords.length) * 100
  
  // 4. 보너스: 사용자가 더 많은 향미 선택한 경우 약간 보너스
  const bonusMatches = Math.max(0, userFlavors.length - roasterKeywords.length)
  const bonus = Math.min(20, bonusMatches * 5) // 최대 20점 보너스
  
  return {
    score: Math.min(100, matchingScore + bonus),
    matches: matchedItems
  }
}

/**
 * 감각 매칭 점수 계산 (30% 가중치)
 */
export const calculateSensoryMatching = (
  userExpressions: string[],
  roasterNote: string
): { score: number; matches: string[] } => {
  // 1. 로스터 노트에서 감각 키워드 추출
  const roasterKeywords = extractSensoryKeywords(roasterNote)
  
  if (roasterKeywords.length === 0) {
    return { score: 50, matches: [] } // 로스터 노트 없으면 중립 점수
  }
  
  // 2. 매칭 개수 세기
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
  
  // 3. 점수 계산
  return {
    score: (matches / roasterKeywords.length) * 100,
    matches: matchedItems
  }
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
 * 최종 Match Score 계산 (메인 함수)
 */
export const calculateMatchScore = (
  userFlavors: string[],
  userExpressions: string[],
  roasterNote: string
): MatchScoreResult => {
  // 1. 향미 매칭 계산 (70%)
  const flavorResult = calculateFlavorMatching(userFlavors, roasterNote)
  
  // 2. 감각 매칭 계산 (30%)
  const flatUserExpressions = flattenUserExpressions(userExpressions)
  const sensoryResult = calculateSensoryMatching(flatUserExpressions, roasterNote)
  
  // 3. 가중평균으로 최종 점수
  const finalScore = Math.round(
    flavorResult.score * 0.7 + sensoryResult.score * 0.3
  )
  
  // 4. 메시지 생성
  const message = generateScoreMessage(finalScore)
  
  return {
    finalScore,
    flavorScore: Math.round(flavorResult.score),
    sensoryScore: Math.round(sensoryResult.score),
    message,
    matchedFlavors: flavorResult.matches,
    matchedSensory: sensoryResult.matches,
    roasterNote
  }
}

/**
 * 빈 로스터 노트일 때 기본 점수 반환
 */
export const getDefaultMatchScore = (): MatchScoreResult => {
  return {
    finalScore: 75,
    flavorScore: 75,
    sensoryScore: 75,
    message: '🤗 로스터 노트를 입력하면 더 정확한 매칭을 확인할 수 있어요!',
    matchedFlavors: [],
    matchedSensory: [],
    roasterNote: ''
  }
}