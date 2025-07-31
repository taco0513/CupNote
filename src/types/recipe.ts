// HomeCafe 레시피 관리를 위한 타입 정의

export interface TimerData {
  totalTime: number
  lapTimes: { time: number, note: string, timestamp: Date }[]
  completed: boolean
}

export interface SavedRecipe {
  id: string
  name: string // 사용자 지정 레시피 이름
  coffeeName: string
  roastery: string
  dripper: string
  coffeeAmount: number
  waterAmount: number
  ratio: number
  grindSize?: string
  grinderBrand?: string
  grinderModel?: string
  grinderSetting?: string
  waterTemp?: number
  brewTime?: number
  notes?: string
  timerData?: TimerData
  rating?: number // 결과 만족도 (1-5)
  tastingNotes?: string // 맛 평가
  createdAt: Date
  lastUsed?: Date
  isFavorite: boolean
  useCount: number // 사용 횟수
}

export interface RecipeCollection {
  recipes: SavedRecipe[]
  lastUpdated: Date
}