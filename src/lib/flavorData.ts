import { FlavorProfile, FlavorCategory, SensoryExpression } from '@/types/coffee'

// 향미 데이터베이스
export const FLAVOR_DATABASE: FlavorProfile[] = [
  // 과일류
  { id: 'strawberry', name: 'Strawberry', category: 'fruity' },
  { id: 'blueberry', name: 'Blueberry', category: 'fruity' },
  { id: 'citrus', name: 'Citrus', category: 'fruity' },
  { id: 'apple', name: 'Apple', category: 'fruity' },
  { id: 'grape', name: 'Grape', category: 'fruity' },
  { id: 'peach', name: 'Peach', category: 'fruity' },
  { id: 'cherry', name: 'Cherry', category: 'fruity' },
  { id: 'orange', name: 'Orange', category: 'fruity' },

  // 견과류
  { id: 'almond', name: 'Almond', category: 'nutty' },
  { id: 'hazelnut', name: 'Hazelnut', category: 'nutty' },
  { id: 'walnut', name: 'Walnut', category: 'nutty' },
  { id: 'peanut', name: 'Peanut', category: 'nutty' },

  // 초콜릿류
  { id: 'chocolate', name: 'Chocolate', category: 'chocolate' },
  { id: 'dark-chocolate', name: 'Dark Chocolate', category: 'chocolate' },
  { id: 'milk-chocolate', name: 'Milk Chocolate', category: 'chocolate' },
  { id: 'cocoa', name: 'Cocoa', category: 'chocolate' },
  { id: 'caramel', name: 'Caramel', category: 'chocolate' },

  // 꽃향류
  { id: 'floral', name: 'Floral', category: 'floral' },
  { id: 'jasmine', name: 'Jasmine', category: 'floral' },
  { id: 'rose', name: 'Rose', category: 'floral' },
  { id: 'lavender', name: 'Lavender', category: 'floral' },

  // 향신료류
  { id: 'cinnamon', name: 'Cinnamon', category: 'spicy' },
  { id: 'vanilla', name: 'Vanilla', category: 'spicy' },
  { id: 'cardamom', name: 'Cardamom', category: 'spicy' },
  { id: 'clove', name: 'Clove', category: 'spicy' },

  // 기타
  { id: 'honey', name: 'Honey', category: 'other' },
  { id: 'wine', name: 'Wine', category: 'other' },
  { id: 'tea', name: 'Tea', category: 'other' },
  { id: 'bergamot', name: 'Bergamot', category: 'other' },
]

// 감각 표현 데이터베이스
export const SENSORY_EXPRESSIONS = {
  acidity: [
    '싱그러운',
    '발랄한',
    '밝은',
    '톡톡한',
    '상큼한',
    '깔끔한',
    '자몽 같은',
    '라임 같은',
    '레몬 같은',
    '사과 같은',
    '와인 같은',
    '젖산 같은',
  ],
  sweetness: [
    '달콤한',
    '꿀 같은',
    '설탕 같은',
    '캐러멜 같은',
    '바닐라 같은',
    '초콜릿 같은',
    '부드러운',
    '메이플 같은',
    '건포도 같은',
    '무화과 같은',
    '데이트 같은',
  ],
  body: [
    '크리미한',
    '벨벳 같은',
    '실키한',
    '진한',
    '묵직한',
    '가벼운',
    '깔끔한',
    '오일리한',
    '버터 같은',
    '풀바디',
    '미디엄바디',
    '라이트바디',
  ],
  aftertaste: [
    '깔끔한',
    '길게 남는',
    '여운이 있는',
    '산뜻한',
    '달콤한',
    '쌉쌀한',
    '스모키한',
    '지속적인',
    '복합적인',
    '단순한',
    '강렬한',
    '부드러운',
  ],
}

// 향미 카테고리별 색상 맵핑
export const FLAVOR_COLORS: Record<FlavorCategory, { bg: string; border: string; text: string }> = {
  fruity: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' },
  nutty: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
  chocolate: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800' },
  floral: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
  spicy: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  other: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800' },
}

// 샘플 데이터 생성 헬퍼
export const generateSampleFlavorProfile = (): FlavorProfile[] => {
  const sampleFlavors = [
    FLAVOR_DATABASE.find(f => f.id === 'strawberry')!,
    FLAVOR_DATABASE.find(f => f.id === 'chocolate')!,
    FLAVOR_DATABASE.find(f => f.id === 'caramel')!,
    FLAVOR_DATABASE.find(f => f.id === 'citrus')!,
    FLAVOR_DATABASE.find(f => f.id === 'floral')!,
  ]
  return sampleFlavors
}

export const generateSampleSensoryExpressions = (): SensoryExpression[] => {
  return [
    {
      category: 'acidity',
      expressions: ['싱그러운', '발랄한'],
    },
    {
      category: 'sweetness',
      expressions: ['달콤한', '꿀 같은'],
    },
    {
      category: 'body',
      expressions: ['크리미한', '벨벳 같은'],
    },
    {
      category: 'aftertaste',
      expressions: ['깔끔한', '길게 남는'],
    },
  ]
}

// 카테고리별 한글명
export const SENSORY_CATEGORY_NAMES = {
  acidity: '산미',
  sweetness: '단맛',
  body: '바디',
  aftertaste: '애프터',
}
