/**
 * TastingFlow Type Definitions
 * 새로운 테이스팅 플로우 시스템의 타입 정의
 * 
 * @version 2.0.0
 * @since 2025-01-31
 */

// ===== Core Types =====

export type TastingMode = 'cafe' | 'homecafe'

// ===== Coffee Info Types =====

export interface CoffeeInfo {
  // 모드별 필수 정보
  cafeName?: string // Cafe mode only
  roasterName: string
  coffeeName: string
  temperature: 'hot' | 'iced'
  
  // 선택 정보 (Progressive Disclosure)
  origin?: string
  variety?: string
  processing?: string
  roastLevel?: string
  altitude?: number
  
  // 메타데이터
  isNewCoffee?: boolean
  autoFilled?: boolean
}

// ===== Brew Setup Types (HomeCafe only) =====

export interface BrewSetup {
  dripper: string
  coffeeAmount: number // grams
  waterAmount: number // ml
  ratio: number // calculated ratio
  grindSize: string
  customDripper?: string
  grinderBrand?: string
  grinderModel?: string
  grinderSetting?: string
  waterTemp?: number // celsius
  brewTime: number // seconds
  timerData?: {
    totalTime: number
    lapTimes: Array<{ time: number; note: string; timestamp: Date }>
    completed: boolean
  }
}

// ===== Flavor Selection Types =====

export interface FlavorProfile {
  selectedFlavors: string[]
  intensity: 'low' | 'medium' | 'high'
  complexity: number
}

// ===== Sensory Expression Types =====

export interface SensoryExpression {
  selectedExpressions: string[]
}

// ===== Sensory Mouthfeel Types (Optional) =====

export interface SensoryMouthFeel {
  ratings: Record<string, number>
  totalScore: number
  averageScore: number
  strengths: string[]
  weaknesses: string[]
  autoComment: string
}

// ===== Personal Notes Types =====

export interface PersonalNotes {
  noteText: string
  selectedQuickInputs: string[]
  selectedEmotions: string[]
  timeContext: string
  imageUrl?: string // 사진 URL
  thumbnailUrl?: string // 썸네일 URL
  createdAt: string
}

// ===== Match Score Types =====

export interface MatchScoreResult {
  finalScore: number // 0-100
  flavorScore: number // 0-100
  sensoryScore: number // 0-100
  message: string
  matchedFlavors: string[]
  matchedSensory: string[]
  roasterNote: string
}

// ===== Achievement Types =====

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum'
  points: number
  condition: (stats: UserStatistics, newTasting?: TastingSession) => boolean
}

export interface AchievementUnlock {
  achievement: Achievement
  unlockedAt: Date
  triggerTasting: string // tasting ID
}

export interface UserStatistics {
  totalTastings: number
  totalCafeTastings: number
  totalHomeCafeTastings: number
  uniqueRoasters: number
  uniqueCafes: number
  totalFlavorsDetected: number
  averageMatchScore: number
  unlockedAchievements: string[] // achievement IDs
}

// ===== Main TastingFlow Session Structure =====

export interface TastingSession {
  mode: TastingMode
  startedAt: string
  completedAt?: string
  currentScreen: string
  tastingDate?: string
  
  // Flow Data
  coffeeInfo?: CoffeeInfo
  brewSetup?: BrewSetup // HomeCafe only
  flavorProfile?: FlavorProfile
  sensoryExpression?: SensoryExpression
  sensoryMouthFeel?: SensoryMouthFeel // Optional
  personalNotes?: PersonalNotes
  
  // Computed Results
  matchScore?: MatchScoreResult
  achievements?: AchievementUnlock[]
}

// ===== Navigation Types =====

export interface TastingFlowStep {
  id: string
  name: string
  route: string
  required: boolean
  modeSpecific?: TastingMode[]
}

export const TASTING_FLOW_STEPS: TastingFlowStep[] = [
  {
    id: 'mode-selection',
    name: '모드 선택',
    route: '/tasting-flow',
    required: true
  },
  {
    id: 'coffee-info',
    name: '커피 정보',
    route: '/tasting-flow/[mode]/coffee-info',
    required: true
  },
  {
    id: 'brew-setup',
    name: '브루잉 설정',
    route: '/tasting-flow/homecafe/brew-setup',
    required: true,
    modeSpecific: ['homecafe']
  },
  {
    id: 'flavor-selection',
    name: '향미 선택',
    route: '/tasting-flow/[mode]/flavor-selection',
    required: true
  },
  {
    id: 'sensory-expression',
    name: '감각 표현',
    route: '/tasting-flow/[mode]/sensory-expression',
    required: true
  },
  {
    id: 'sensory-mouthfeel',
    name: '수치 평가',
    route: '/tasting-flow/[mode]/sensory-mouthfeel',
    required: false
  },
  {
    id: 'personal-notes',
    name: '개인 노트',
    route: '/tasting-flow/[mode]/personal-notes',
    required: true
  },
  {
    id: 'result',
    name: '결과',
    route: '/tasting-flow/[mode]/result',
    required: true
  }
]

// ===== Utility Types =====

export type StepProgressMap = {
  [K in TastingFlowStep['id']]?: boolean
}

export interface TastingFlowSession {
  id: string
  mode: TastingMode
  startedAt: Date
  lastActiveAt: Date
  currentStep: string
  completedSteps: StepProgressMap
  data: Partial<TastingSession>
}

// ===== Migration Types =====

export type LegacyTastingMode = TastingMode | 'lab'

export interface MigrationResult {
  success: number
  failed: number
  errors: Array<{
    recordId: string
    error: Error
  }>
}