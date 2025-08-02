/**
 * Enhanced Matching Dictionaries for Match Score System
 * 
 * 3단계: 확장된 매칭 테이블 + 시맨틱 매칭
 * - FlavorProfile 시스템으로 다층 매칭
 * - 상반된/관련 향미 관계 정의
 * - 강도별/카테고리별 세분화
 * 
 * @version 2.0.0
 * @since 2025-08-02
 */

export interface FlavorProfile {
  primary: string[]      // 직접 매칭 (1.0 점수)
  related: string[]      // 관련 향미 (0.8 점수)
  similar: string[]      // 유사 향미 (0.6 점수)
  opposite: string[]     // 상반된 향미 (-0.3 점수)
  intensity: number      // 향미 강도 (1-5)
  categories: string[]   // 다중 카테고리
  confidence: number     // 매칭 신뢰도 (0-1)
}

export interface SensoryProfile {
  primary: string[]      // 직접 매칭
  related: string[]      // 관련 표현
  similar: string[]      // 유사 표현
  opposite: string[]     // 상반된 표현
  intensity: number      // 감각 강도
  category: string       // 감각 카테고리
  confidence: number     // 매칭 신뢰도
}

// ===== 향미 프로필 시스템 =====

export const ENHANCED_FLAVOR_PROFILES: Record<string, FlavorProfile> = {
  // === 과일류 ===
  
  citrus: {
    primary: ['시트러스', '시트러스향', 'citrus', 'citrusy'],
    related: ['오렌지', '레몬', '라임', '자몽', '귤', '유자'],
    similar: ['상큼한', '새콤한', '톡쏘는', '과일향', '신선한'],
    opposite: ['무거운', '진한', '어두운', '스모키'],
    intensity: 4,
    categories: ['fruit', 'acidic', 'bright'],
    confidence: 0.95
  },
  
  orange: {
    primary: ['오렌지', '오렌지향', '오렌지 느낌', 'orange'],
    related: ['시트러스', '귤', '만다린', '자몽', '과일향'],
    similar: ['상큼한', '달콤한', '과즙', '새콤달콤'],
    opposite: ['쓴맛', '허브', '스모키'],
    intensity: 4,
    categories: ['fruit', 'citrus', 'sweet'],
    confidence: 0.9
  },
  
  berry: {
    primary: ['베리', '베리류', '딸기', '블루베리', '라즈베리', 'berry'],
    related: ['과일향', '체리', '크랜베리', '블랙베리', '포도'],
    similar: ['달콤한', '과즙', '톡쏘는', '상큼한'],
    opposite: ['견과류', '스모키', '허브'],
    intensity: 3,
    categories: ['fruit', 'sweet', 'juicy'],
    confidence: 0.85
  },
  
  'stone fruit': {
    primary: ['복숭아', '자두', '살구', '체리', '망고'],
    related: ['과일향', '달콤한', '과즙', '부드러운'],
    similar: ['열대과일', '베리', '꿀', '플로럴'],
    opposite: ['견과류', '쓴맛', '허브'],
    intensity: 3,
    categories: ['fruit', 'sweet', 'juicy'],
    confidence: 0.8
  },
  
  tropical: {
    primary: ['열대과일', '파인애플', '바나나', '망고', '패션후르츠'],
    related: ['과일향', '달콤한', '이국적인', '향긋한'],
    similar: ['꿀', '플로럴', '과즙', '상큼한'],
    opposite: ['견과류', '어두운', '스모키'],
    intensity: 4,
    categories: ['fruit', 'sweet', 'exotic'],
    confidence: 0.75
  },
  
  // === 달콤함 ===
  
  chocolate: {
    primary: ['초콜릿', '초콜릿향', '다크초콜릿', '밀크초콜릿', 'chocolate'],
    related: ['코코아', '카카오', '달콤한', '진한', '묵직한'],
    similar: ['바닐라', '캐러멜', '견과류', '로스팅'],
    opposite: ['상큼한', '밝은', '가벼운', '신맛'],
    intensity: 4,
    categories: ['sweet', 'rich', 'roasted'],
    confidence: 0.95
  },
  
  caramel: {
    primary: ['캐러멜', '캐러멜향', '갈색설탕', 'caramel'],
    related: ['달콤한', '꿀', '메이플', '바닐라', '버터'],
    similar: ['초콜릿', '견과류', '구운', '따뜻한'],
    opposite: ['신맛', '허브', '가벼운'],
    intensity: 4,
    categories: ['sweet', 'rich', 'warm'],
    confidence: 0.9
  },
  
  vanilla: {
    primary: ['바닐라', '바닐라향', '바닐린', 'vanilla'],
    related: ['달콤한', '부드러운', '크리미한', '따뜻한'],
    similar: ['캐러멜', '꿀', '초콜릿', '견과류'],
    opposite: ['신맛', '쓴맛', '허브', '스파이시'],
    intensity: 3,
    categories: ['sweet', 'creamy', 'mild'],
    confidence: 0.85
  },
  
  honey: {
    primary: ['꿀', '꿀향', '허니', 'honey'],
    related: ['달콤한', '플로럴', '부드러운', '자연스러운'],
    similar: ['바닐라', '캐러멜', '과일향', '따뜻한'],
    opposite: ['쓴맛', '신맛', '인공적인'],
    intensity: 3,
    categories: ['sweet', 'natural', 'floral'],
    confidence: 0.8
  },
  
  // === 견과류 ===
  
  nutty: {
    primary: ['견과류', '견과', '고소한', '너츠', 'nutty'],
    related: ['아몬드', '헤이즐넛', '호두', '땅콩', '구운'],
    similar: ['초콜릿', '캐러멜', '따뜻한', '로스팅'],
    opposite: ['과일향', '밝은', '상큼한'],
    intensity: 3,
    categories: ['nutty', 'roasted', 'warm'],
    confidence: 0.9
  },
  
  almond: {
    primary: ['아몬드', '아몬드향', 'almond'],
    related: ['견과류', '고소한', '부드러운', '달콤한'],
    similar: ['바닐라', '마지판', '구운', '따뜻한'],
    opposite: ['신맛', '과일향', '허브'],
    intensity: 3,
    categories: ['nutty', 'sweet', 'mild'],
    confidence: 0.85
  },
  
  hazelnut: {
    primary: ['헤이즐넛', '헤이즐너트', 'hazelnut'],
    related: ['견과류', '고소한', '버터', '크리미한'],
    similar: ['초콜릿', '캐러멜', '구운', '따뜻한'],
    opposite: ['신맛', '가벼운', '밝은'],
    intensity: 4,
    categories: ['nutty', 'rich', 'creamy'],
    confidence: 0.8
  },
  
  // === 향신료/로스팅 ===
  
  spice: {
    primary: ['향신료', '스파이스', '계피', '정향', 'spice'],
    related: ['따뜻한', '복합적인', '이국적인', '강한'],
    similar: ['허브', '우디', '로스팅', '진한'],
    opposite: ['단순한', '가벼운', '과일향'],
    intensity: 4,
    categories: ['spice', 'complex', 'warm'],
    confidence: 0.75
  },
  
  cinnamon: {
    primary: ['계피', '시나몬', 'cinnamon'],
    related: ['향신료', '따뜻한', '달콤한', '겨울'],
    similar: ['바닐라', '캐러멜', '구운', '복합적인'],
    opposite: ['시원한', '가벼운', '과일향'],
    intensity: 4,
    categories: ['spice', 'sweet', 'warm'],
    confidence: 0.8
  },
  
  smoky: {
    primary: ['스모키', '연기', '그을린', '탄', 'smoky'],
    related: ['로스팅', '다크', '진한', '우디'],
    similar: ['초콜릿', '견과류', '허브', '미네랄'],
    opposite: ['밝은', '과일향', '달콤한', '가벼운'],
    intensity: 5,
    categories: ['roasted', 'dark', 'strong'],
    confidence: 0.85
  },
  
  roasted: {
    primary: ['로스팅', '구운', '볶은', '토스트', 'roasted'],
    related: ['견과류', '따뜻한', '진한', '캐러멜라이즈드'],
    similar: ['초콜릿', '스모키', '우디', '복합적인'],
    opposite: ['생', '밝은', '가벼운', '과일향'],
    intensity: 4,
    categories: ['roasted', 'warm', 'complex'],
    confidence: 0.9
  },
  
  // === 플로럴 ===
  
  floral: {
    primary: ['꽃향기', '플로럴', '자스민', '장미', 'floral'],
    related: ['향긋한', '부드러운', '우아한', '섬세한'],
    similar: ['꿀', '차', '허브', '달콤한'],
    opposite: ['스모키', '진한', '쓴맛', '견과류'],
    intensity: 2,
    categories: ['floral', 'delicate', 'fragrant'],
    confidence: 0.7
  },
  
  jasmine: {
    primary: ['자스민', 'jasmine'],
    related: ['플로럴', '꽃향기', '향긋한', '섬세한'],
    similar: ['꿀', '차', '부드러운', '우아한'],
    opposite: ['스모키', '쓴맛', '진한'],
    intensity: 3,
    categories: ['floral', 'fragrant', 'delicate'],
    confidence: 0.6
  }
}

// ===== 감각 프로필 시스템 =====

export const ENHANCED_SENSORY_PROFILES: Record<string, SensoryProfile> = {
  // === 산미 관련 ===
  
  bright: {
    primary: ['상큼한', '발랄한', '싱그러운', '밝은', 'bright'],
    related: ['톡쏘는', '신선한', '생동감', '경쾌한'],
    similar: ['시트러스', '과일같은', '깔끔한', '산뜻한'],
    opposite: ['무거운', '진한', '어두운', '둔한'],
    intensity: 4,
    category: 'acidity',
    confidence: 0.9
  },
  
  citrusy: {
    primary: ['시트러스같은', '상큼한', '톡쏘는', 'citrusy'],
    related: ['과일같은', '신선한', '밝은', '경쾌한'],
    similar: ['산뜻한', '깔끔한', '생동감', '발랄한'],
    opposite: ['둔한', '무거운', '진한'],
    intensity: 4,
    category: 'acidity',
    confidence: 0.85
  },
  
  acidic: {
    primary: ['톡쏘는', '신맛', '산미', '과일같은', 'acidic'],
    related: ['상큼한', '와인같은', '밝은', 'tangy'],
    similar: ['시트러스', '신선한', '생동감'],
    opposite: ['평면적인', '무거운', '단조로운'],
    intensity: 5,
    category: 'acidity',
    confidence: 0.9
  },
  
  crisp: {
    primary: ['깔끔한', '산뜻한', '크리스프', 'crisp'],
    related: ['상쾌한', '신선한', '밝은', '클린'],
    similar: ['톡쏘는', '경쾌한', '시원한'],
    opposite: ['무거운', '탁한', '복잡한'],
    intensity: 3,
    category: 'acidity',
    confidence: 0.8
  },
  
  // === 바디/질감 관련 ===
  
  smooth: {
    primary: ['부드러운', '실키한', '벨벳같은', 'smooth'],
    related: ['크리미한', '매끄러운', '우아한', '섬세한'],
    similar: ['라운드한', '균형잡힌', '조화로운'],
    opposite: ['거친', '날카로운', '각진'],
    intensity: 3,
    category: 'body',
    confidence: 0.9
  },
  
  creamy: {
    primary: ['크리미한', '부드러운', '크림같은', 'creamy'],
    related: ['실키한', '벨벳같은', '매끄러운', '풍부한'],
    similar: ['둥근', '따뜻한', '편안한'],
    opposite: ['물같은', '얇은', '거친'],
    intensity: 4,
    category: 'body',
    confidence: 0.85
  },
  
  full: {
    primary: ['묵직한', '풀바디', '진한', '풍부한', 'full'],
    related: ['농밀한', '강한', '두꺼운', '집중된'],
    similar: ['복잡한', '깊은', '인상적인'],
    opposite: ['가벼운', '물같은', '얇은', '약한'],
    intensity: 5,
    category: 'body',
    confidence: 0.9
  },
  
  light: {
    primary: ['가벼운', '라이트', '물같은', '섬세한', 'light'],
    related: ['얇은', '투명한', '깔끔한', '단순한'],
    similar: ['상쾌한', '신선한', '부담없는'],
    opposite: ['무거운', '진한', '농밀한', '묵직한'],
    intensity: 2,
    category: 'body',
    confidence: 0.8
  },
  
  silky: {
    primary: ['실키한', '비단같은', '매끄러운', 'silky'],
    related: ['부드러운', '우아한', '섬세한', '고급스러운'],
    similar: ['크리미한', '벨벳같은', '조화로운'],
    opposite: ['거친', '각진', '날카로운'],
    intensity: 3,
    category: 'body',
    confidence: 0.75
  },
  
  // === 단맛 관련 ===
  
  sweet: {
    primary: ['달콤한', '단맛', '스위트', 'sweet'],
    related: ['꿀같은', '캐러멜같은', '설탕', '과일같은'],
    similar: ['부드러운', '따뜻한', '편안한'],
    opposite: ['쓴맛', '신맛', '드라이한'],
    intensity: 4,
    category: 'sweetness',
    confidence: 0.95
  },
  
  rich: {
    primary: ['농밀한', '진한', '풍부한', '깊은', 'rich'],
    related: ['복잡한', '강한', '집중된', '인상적인'],
    similar: ['묵직한', '가득한', '충만한'],
    opposite: ['가벼운', '단순한', '얇은'],
    intensity: 5,
    category: 'intensity',
    confidence: 0.85
  },
  
  // === 쓴맛 관련 ===
  
  bitter: {
    primary: ['쓴맛', '비터', '카카오같은', 'bitter'],
    related: ['다크', '진한', '강한', '로스팅'],
    similar: ['복잡한', '깊은', '성숙한'],
    opposite: ['달콤한', '부드러운', '가벼운'],
    intensity: 4,
    category: 'bitterness',
    confidence: 0.9
  },
  
  dark: {
    primary: ['다크', '진한', '어두운', '깊은', 'dark'],
    related: ['강한', '무거운', '복잡한', '성숙한'],
    similar: ['쓴맛', '로스팅', '스모키'],
    opposite: ['밝은', '가벼운', '단순한'],
    intensity: 4,
    category: 'intensity',
    confidence: 0.8
  },
  
  // === 여운 관련 ===
  
  clean: {
    primary: ['깔끔한', '클린', '산뜻한', '맑은', 'clean'],
    related: ['상쾌한', '신선한', '투명한', '순수한'],
    similar: ['밝은', '단순한', '명확한'],
    opposite: ['복잡한', '탁한', '무거운'],
    intensity: 3,
    category: 'finish',
    confidence: 0.85
  },
  
  long: {
    primary: ['길게남는', '여운이좋은', '지속적인', 'long'],
    related: ['복합적인', '인상적인', '기억에남는'],
    similar: ['깊은', '풍부한', '완성도높은'],
    opposite: ['짧은', '단순한', '빠른'],
    intensity: 4,
    category: 'finish',
    confidence: 0.8
  },
  
  lingering: {
    primary: ['달콤한여운', '길게남는', '서서히사라지는', 'lingering'],
    related: ['부드러운', '우아한', '매혹적인'],
    similar: ['복합적인', '깊은', '섬세한'],
    opposite: ['급작스러운', '단조로운'],
    intensity: 3,
    category: 'finish',
    confidence: 0.75
  },
  
  // === 밸런스 관련 ===
  
  balanced: {
    primary: ['조화로운', '균형잡힌', '밸런스', '안정된', 'balanced'],
    related: ['완성된', '조율된', '통합된', '원만한'],
    similar: ['부드러운', '자연스러운', '편안한'],
    opposite: ['불균형한', '치우친', '극단적인'],
    intensity: 3,
    category: 'balance',
    confidence: 0.9
  },
  
  complex: {
    primary: ['복잡한', '복합적인', '역동적인', '다층적인', 'complex'],
    related: ['풍부한', '깊은', '흥미로운', '변화하는'],
    similar: ['진한', '강한', '인상적인'],
    opposite: ['단순한', '평면적인', '일차원적인'],
    intensity: 4,
    category: 'complexity',
    confidence: 0.8
  },
  
  simple: {
    primary: ['단순한', '자연스러운', '직관적인', 'simple'],
    related: ['깔끔한', '명확한', '이해하기쉬운'],
    similar: ['부담없는', '편안한', '친근한'],
    opposite: ['복잡한', '어려운', '혼란스러운'],
    intensity: 2,
    category: 'simplicity',
    confidence: 0.75
  }
}

/**
 * 카테고리별 향미 그룹핑
 */
export const FLAVOR_CATEGORIES = {
  fruit: ['citrus', 'orange', 'berry', 'stone fruit', 'tropical', 'apple'],
  sweet: ['chocolate', 'caramel', 'vanilla', 'honey', 'sugar', 'maple'],
  nutty: ['nutty', 'almond', 'hazelnut', 'walnut', 'peanut'],
  spice: ['spice', 'cinnamon', 'clove', 'cardamom', 'nutmeg'],
  roasted: ['smoky', 'roasted', 'tobacco', 'leather', 'cedar'],
  floral: ['floral', 'jasmine', 'rose', 'lavender', 'hibiscus']
} as const

/**
 * 카테고리별 감각 그룹핑
 */
export const SENSORY_CATEGORIES = {
  acidity: ['bright', 'citrusy', 'acidic', 'crisp', 'tangy'],
  body: ['smooth', 'creamy', 'full', 'light', 'silky', 'velvety'],
  sweetness: ['sweet', 'honey-like', 'sugary', 'syrupy'],
  bitterness: ['bitter', 'dark', 'roasty', 'herbal'],
  finish: ['clean', 'long', 'short', 'lingering', 'dry'],
  balance: ['balanced', 'complex', 'simple', 'harmonious']
} as const

/**
 * 향미 강도별 매칭 조정 계수
 */
export const INTENSITY_MULTIPLIERS = {
  1: 0.8,  // 매우 약함
  2: 0.9,  // 약함  
  3: 1.0,  // 보통
  4: 1.1,  // 강함
  5: 1.2   // 매우 강함
} as const