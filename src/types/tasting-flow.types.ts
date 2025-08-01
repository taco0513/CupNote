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

export interface CoffeeInfoData {
  // Cafe Mode specific
  cafeName?: string
  
  // Common fields
  coffeeName: string
  roastery: string
  temperature: 'hot' | 'iced'
  
  // Optional details
  origin?: string
  variety?: string
  altitude?: string
  roastLevel?: string
  processing?: string
  price?: string
  
  // Metadata
  inputTimestamp: Date
  completionTime: number // seconds
}

// ===== Brew Setup Types (HomeCafe only) =====

export interface BrewSetupData {
  dripper: 'v60' | 'kalita' | 'origami' | 'april'
  ratio: string // e.g., '1:16'
  coffeeAmount: number // grams
  waterAmount: number // ml (auto-calculated)
  temperature: number // celsius
  grindSetting: string // free text
  bloomTime: number // seconds
  totalTime: number // seconds
  notes?: string
}

// ===== Flavor Selection Types =====

export interface FlavorChoice {
  level2: string // Level 2 ID (required)
  level3?: string[] // Level 3 IDs (optional)
}

export interface FlavorSelectionData {
  selectedFlavors: FlavorChoice[]
  timestamp: Date
  selectionDuration: number // seconds
}

// ===== Sensory Expression Types =====

export type SensoryCategoryKey = 'acidity' | 'sweetness' | 'bitterness' | 'body' | 'aftertaste' | 'balance'

export interface SensoryExpressionData {
  acidity: string[] // max 3
  sweetness: string[] // max 3
  bitterness: string[] // max 3
  body: string[] // max 3
  aftertaste: string[] // max 3
  balance: string[] // max 3
  timestamp: Date
  completionTime: number // seconds
}

// ===== Sensory Mouthfeel Types (Optional) =====

export interface SensoryMouthFeelData {
  body: number // 1-5
  acidity: number // 1-5
  sweetness: number // 1-5
  finish: number // 1-5
  bitterness: number // 1-5
  balance: number // 1-5
  timestamp: Date
  skipped: boolean
}

// ===== Personal Notes Types =====

export interface PersonalNotesData {
  mainNote: string // max 200 chars
  quickInputs: string[] // selected quick inputs
  emotionTags: string[] // selected emotion tags
  timestamp: Date
  context: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  }
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
  condition: (stats: UserStatistics, newTasting?: TastingFlowData) => boolean
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

// ===== Main TastingFlow Data Structure =====

export interface TastingFlowData {
  // Metadata
  id: string
  userId: string
  mode: TastingMode
  createdAt: Date
  completedAt?: Date
  
  // Flow Data
  coffeeInfo: CoffeeInfoData
  brewSetup?: BrewSetupData // HomeCafe only
  flavorSelection: FlavorSelectionData
  sensoryExpression: SensoryExpressionData
  sensoryMouthfeel?: SensoryMouthFeelData // Optional
  personalNotes: PersonalNotesData
  
  // Computed Results
  matchScore?: MatchScoreResult
  achievements?: AchievementUnlock[]
  
  // Session Management
  sessionId: string
  currentStep: number
  totalSteps: number
  progress: number // percentage
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
  data: Partial<TastingFlowData>
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