// Import from central config
import { TastingModeId } from '../config/tasting-modes.config'

export type TasteMode = 'simple' | 'professional'
export type CoffeeMode = TastingModeId // 'quick' | 'cafe' | 'homecafe' | 'pro'

// 향미 카테고리
export type FlavorCategory = 'fruity' | 'nutty' | 'chocolate' | 'floral' | 'spicy' | 'other'

// 향미 프로파일
export interface FlavorProfile {
  id: string
  name: string
  category: FlavorCategory
  intensity?: number // 1-5
}

// 감각 표현
export interface SensoryExpression {
  category: 'acidity' | 'sweetness' | 'body' | 'aftertaste'
  expressions: string[]
}

// Quick 모드 전용 데이터 (최소 정보)
export interface QuickData {
  // 간단한 메모 정도만
  quickNote?: string
}

// Cafe 모드 전용 데이터 (카페 방문)
export interface CafeData {
  cafeName?: string // 카페 이름
  cafeLocation?: string // 카페 위치
  menuName?: string // 메뉴명
  price?: number // 가격
  atmosphere?: string // 분위기
}

// HomeCafe 모드 전용 데이터
export interface HomeCafeData {
  dripper?: string // "V60", "Chemex" 등
  grindSize?: string // "Fine", "Medium", "Coarse"
  waterTemp?: number // 92
  brewTime?: string // "3분 30초"
  ratio?: string // "1:16"
  coffeeWeight?: number // 20g
  waterWeight?: number // 320ml
  notes?: string // 실험 노트
  nextTry?: string // 다음번 시도할 것
  satisfaction?: number // 1-5 별점
}

// Pro/Lab mode data removed - migrated to HomeCafe mode
// For professional features, use HomeCafe mode with extended options

// Match Score 분석
export interface MatchScore {
  overall: number // 88
  flavorMatching: number // 92
  expressionAccuracy: number // 85
  consistency: number // 87
  strengths: string[] // ["향미 감지 뛰어남"]
  improvements: string[] // ["바디감 더 주의깊게"]
}

// 확장된 커피 기록
export interface CoffeeRecord {
  id: string
  userId: string

  // 기본 정보
  coffeeName: string
  roastery?: string
  origin?: string // "에티오피아 > 예가체프"
  roastLevel?: string // "미디엄 라이트"
  temperature?: string // "Hot", "Cold"
  date: string
  createdAt: string
  updatedAt?: string

  // 맛 정보
  taste: string
  roasterNote?: string
  tasteMode: TasteMode
  memo?: string

  // 모드별 데이터
  mode?: CoffeeMode // 'cafe', 'homecafe'
  quickData?: QuickData
  cafeData?: CafeData
  homecafeData?: HomeCafeData
  // proData removed - use homecafeData for professional features

  // 향미 프로파일
  selectedFlavors?: FlavorProfile[]
  sensoryExpressions?: SensoryExpression[]

  // 분석 데이터
  matchScore?: MatchScore

  // 기타
  images?: string[]
  tags?: string[]
  rating?: number
  brewMethod?: string
}

export interface User {
  id: string
  email: string
  name: string
  profileImage?: string
  createdAt: string
}

export interface CoffeeTaste {
  id: string
  recordId: string
  category: 'aroma' | 'flavor' | 'aftertaste' | 'acidity' | 'body' | 'balance'
  score?: number
  notes: string[]
}
