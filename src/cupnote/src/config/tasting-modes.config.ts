/**
 * TastingFlow Mode Configuration
 * 중앙집중화된 모드 관리 시스템
 * 
 * 이 파일에서 모드 이름을 변경하면 앱 전체에 자동 반영됩니다.
 */

export const TASTING_MODES_CONFIG = {
  quick: {
    id: 'quick',
    label: 'Quick Mode',
    labelKr: '빠른 기록',
    icon: '⚡',
    color: 'orange',
    steps: 4,
    estimatedTime: '1-2분',
    description: '간단하고 빠른 커피 기록',
    target: '빠른 기록이 필요한 순간',
    route: '/record/quick',
  },
  cafe: {
    id: 'cafe',
    label: 'Cafe Mode',
    labelKr: '카페 모드',
    icon: '☕',
    color: 'blue',
    steps: 7,
    estimatedTime: '3-5분',
    description: '카페 방문 경험을 상세히 기록',
    target: '카페에서 마신 커피',
    route: '/record/cafe',
  },
  homecafe: {
    id: 'homecafe',
    label: 'HomeCafe Mode',
    labelKr: '홈카페 모드',
    icon: '🏠',
    color: 'green',
    steps: 8,
    estimatedTime: '5-8분',
    description: '홈카페 레시피와 추출 과정 기록',
    target: '집에서 직접 내린 커피',
    route: '/record/homecafe',
  },
} as const

// Type exports
export type TastingModeId = keyof typeof TASTING_MODES_CONFIG
export type TastingMode = typeof TASTING_MODES_CONFIG[TastingModeId]

// Helper functions
export const getModeById = (id: TastingModeId): TastingMode => {
  return TASTING_MODES_CONFIG[id]
}

export const getAllModes = (): TastingMode[] => {
  return Object.values(TASTING_MODES_CONFIG)
}

export const getModeColor = (id: TastingModeId): string => {
  const colors = {
    quick: 'bg-orange-100 text-orange-800 border-orange-300',
    cafe: 'bg-blue-100 text-blue-800 border-blue-300',
    homecafe: 'bg-green-100 text-green-800 border-green-300',
  }
  return colors[id]
}

export const getModeGradient = (id: TastingModeId): string => {
  const gradients = {
    quick: 'from-orange-50 to-orange-100',
    cafe: 'from-blue-50 to-blue-100',
    homecafe: 'from-green-50 to-green-100',
  }
  return gradients[id]
}

// Validation
export const isValidMode = (mode: string): mode is TastingModeId => {
  return mode in TASTING_MODES_CONFIG
}

// Legacy support (for gradual migration)
export const LEGACY_MODE_MAPPING = {
  lab: 'homecafe', // lab 모드를 homecafe로 매핑
  pro: 'homecafe', // pro 모드를 homecafe로 매핑
} as const