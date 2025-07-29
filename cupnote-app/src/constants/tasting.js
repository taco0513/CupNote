// CupNote 테이스팅 관련 상수

// 테이스팅 모드
export const TASTING_MODES = {
  CAFE: 'cafe',
  HOMECAFE: 'homecafe', 
  LAB: 'lab'
}

export const TASTING_MODE_LABELS = {
  [TASTING_MODES.CAFE]: '카페',
  [TASTING_MODES.HOMECAFE]: '홈카페',
  [TASTING_MODES.LAB]: '랩'
}

// 테이스팅 단계
export const TASTING_STEPS = {
  SETUP: 'setup',
  FLAVOR: 'flavor',
  SENSORY: 'sensory',
  NOTES: 'notes',
  RESULT: 'result'
}

export const TASTING_STEP_LABELS = {
  [TASTING_STEPS.SETUP]: '커피 정보',
  [TASTING_STEPS.FLAVOR]: '향미 선택',
  [TASTING_STEPS.SENSORY]: '감각 표현',
  [TASTING_STEPS.NOTES]: '개인 노트',
  [TASTING_STEPS.RESULT]: '결과'
}

// 감각 표현 카테고리
export const SENSORY_CATEGORIES = {
  ACIDITY: 'acidity',
  SWEETNESS: 'sweetness',
  BITTERNESS: 'bitterness',
  BODY: 'body',
  AROMA: 'aroma',
  FINISH: 'finish'
}

export const SENSORY_CATEGORY_LABELS = {
  [SENSORY_CATEGORIES.ACIDITY]: '산미',
  [SENSORY_CATEGORIES.SWEETNESS]: '단맛',
  [SENSORY_CATEGORIES.BITTERNESS]: '쓴맛',
  [SENSORY_CATEGORIES.BODY]: '바디',
  [SENSORY_CATEGORIES.AROMA]: '향',
  [SENSORY_CATEGORIES.FINISH]: '여운'
}

// 향미 카테고리
export const FLAVOR_CATEGORIES = {
  FRUITS: 'fruits',
  NUTS: 'nuts',
  SWEET: 'sweet',
  FLORAL: 'floral',
  OTHER: 'other'
}

export const FLAVOR_CATEGORY_LABELS = {
  [FLAVOR_CATEGORIES.FRUITS]: '과일류',
  [FLAVOR_CATEGORIES.NUTS]: '견과류',
  [FLAVOR_CATEGORIES.SWEET]: '초콜릿/당류',
  [FLAVOR_CATEGORIES.FLORAL]: '꽃/허브',
  [FLAVOR_CATEGORIES.OTHER]: '기타'
}

// 매치 스코어 레벨
export const MATCH_SCORE_LEVELS = {
  LEVEL1: 'level1',
  LEVEL2: 'level2'
}

export const MATCH_SCORE_LEVEL_LABELS = {
  [MATCH_SCORE_LEVELS.LEVEL1]: '향미만 평가',
  [MATCH_SCORE_LEVELS.LEVEL2]: '향미 + 감각 평가'
}

// 스코어 등급
export const SCORE_GRADES = {
  EXCELLENT: { min: 90, max: 100, label: '탁월함', color: '#28a745', emoji: '🎯' },
  VERY_GOOD: { min: 80, max: 89, label: '매우 좋음', color: '#20c997', emoji: '✨' },
  GOOD: { min: 70, max: 79, label: '좋음', color: '#ffc107', emoji: '👍' },
  FAIR: { min: 60, max: 69, label: '보통', color: '#fd7e14', emoji: '🤔' },
  POOR: { min: 0, max: 59, label: '아쉬움', color: '#dc3545', emoji: '😅' }
}

// 브루잉 방법
export const BREW_METHODS = [
  { value: 'espresso', label: '에스프레소' },
  { value: 'americano', label: '아메리카노' },
  { value: 'pour_over', label: '핸드드립' },
  { value: 'french_press', label: '프렌치프레스' },
  { value: 'aeropress', label: '에어로프레스' },
  { value: 'moka_pot', label: '모카포트' },
  { value: 'cold_brew', label: '콜드브루' },
  { value: 'other', label: '기타' }
]

// 로스팅 레벨
export const ROAST_LEVELS = [
  { value: 'light', label: '라이트 로스트', color: '#D2B48C' },
  { value: 'medium_light', label: '미디엄 라이트', color: '#BC9A6A' },
  { value: 'medium', label: '미디엄', color: '#A0522D' },
  { value: 'medium_dark', label: '미디엄 다크', color: '#8B4513' },
  { value: 'dark', label: '다크 로스트', color: '#654321' }
]

// 기본 설정
export const DEFAULT_SETTINGS = {
  MAX_FLAVORS: 8,
  MAX_SENSORY_PER_CATEGORY: 3,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
  AUTO_SAVE_INTERVAL: 30 * 1000 // 30초
}