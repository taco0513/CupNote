/**
 * Coffee Terms Configuration
 * 커피 관련 용어 중앙집중화 관리
 */

export const COFFEE_TERMS = {
  // Roast Levels
  roastLevels: {
    light: { id: 'light', label: '라이트 로스트', labelEn: 'Light Roast' },
    mediumLight: { id: 'medium-light', label: '미디엄 라이트', labelEn: 'Medium Light' },
    medium: { id: 'medium', label: '미디엄 로스트', labelEn: 'Medium Roast' },
    mediumDark: { id: 'medium-dark', label: '미디엄 다크', labelEn: 'Medium Dark' },
    dark: { id: 'dark', label: '다크 로스트', labelEn: 'Dark Roast' },
  },

  // Brew Methods
  brewMethods: {
    v60: { id: 'v60', label: 'V60', icon: '☕' },
    chemex: { id: 'chemex', label: '케멕스', labelEn: 'Chemex', icon: '🧪' },
    aeropress: { id: 'aeropress', label: '에어로프레스', labelEn: 'AeroPress', icon: '💨' },
    frenchPress: { id: 'french-press', label: '프렌치프레스', labelEn: 'French Press', icon: '🫖' },
    espresso: { id: 'espresso', label: '에스프레소', labelEn: 'Espresso', icon: '☕' },
    moka: { id: 'moka', label: '모카포트', labelEn: 'Moka Pot', icon: '⚗️' },
    coldBrew: { id: 'cold-brew', label: '콜드브루', labelEn: 'Cold Brew', icon: '🧊' },
    kalitaWave: { id: 'kalita-wave', label: 'Kalita Wave', icon: '🌊' },
    origami: { id: 'origami', label: '오리가미', labelEn: 'Origami', icon: '📄' },
    clever: { id: 'clever', label: '클레버 드리퍼', labelEn: 'Clever Dripper', icon: '🎯' },
    syphon: { id: 'syphon', label: '사이폰', labelEn: 'Syphon', icon: '⚗️' },
  },

  // Grind Sizes
  grindSizes: {
    extraFine: { id: 'extra-fine', label: '매우 고운', labelEn: 'Extra Fine' },
    fine: { id: 'fine', label: '고운', labelEn: 'Fine' },
    mediumFine: { id: 'medium-fine', label: '중간-고운', labelEn: 'Medium Fine' },
    medium: { id: 'medium', label: '중간', labelEn: 'Medium' },
    mediumCoarse: { id: 'medium-coarse', label: '중간-굵은', labelEn: 'Medium Coarse' },
    coarse: { id: 'coarse', label: '굵은', labelEn: 'Coarse' },
  },

  // Processing Methods
  processingMethods: {
    washed: { id: 'washed', label: '워시드', labelEn: 'Washed' },
    natural: { id: 'natural', label: '내추럴', labelEn: 'Natural' },
    honey: { id: 'honey', label: '허니', labelEn: 'Honey' },
    semiWashed: { id: 'semi-washed', label: '세미워시드', labelEn: 'Semi-Washed' },
    anaerobic: { id: 'anaerobic', label: '혐기발효', labelEn: 'Anaerobic' },
  },

  // Coffee Varieties
  varieties: {
    arabica: { id: 'arabica', label: '아라비카', labelEn: 'Arabica' },
    bourbon: { id: 'bourbon', label: '부르봉', labelEn: 'Bourbon' },
    geisha: { id: 'geisha', label: '게이샤', labelEn: 'Geisha' },
    typica: { id: 'typica', label: '티피카', labelEn: 'Typica' },
    caturra: { id: 'caturra', label: '카투라', labelEn: 'Caturra' },
    sl28: { id: 'sl28', label: 'SL28', labelEn: 'SL28' },
    sl34: { id: 'sl34', label: 'SL34', labelEn: 'SL34' },
  },

  // Temperature Ranges
  temperatureRanges: {
    hot: { id: 'hot', label: '뜨거운', labelEn: 'Hot', range: '85-96°C' },
    warm: { id: 'warm', label: '따뜻한', labelEn: 'Warm', range: '70-85°C' },
    iced: { id: 'iced', label: '아이스', labelEn: 'Iced', range: '0-10°C' },
  },

  // Extraction Standards (SCA)
  extractionStandards: {
    tds: {
      ideal: { min: 1.15, max: 1.35, label: 'SCA 표준' },
      weak: { max: 1.15, label: '연한' },
      strong: { min: 1.35, label: '진한' },
    },
    extraction: {
      ideal: { min: 18, max: 22, label: '적정 추출' },
      under: { max: 18, label: '미추출' },
      over: { min: 22, label: '과추출' },
    },
  },
} as const

// Type exports
export type RoastLevel = keyof typeof COFFEE_TERMS.roastLevels
export type BrewMethod = keyof typeof COFFEE_TERMS.brewMethods
export type GrindSize = keyof typeof COFFEE_TERMS.grindSizes
export type ProcessingMethod = keyof typeof COFFEE_TERMS.processingMethods
export type CoffeeVariety = keyof typeof COFFEE_TERMS.varieties

// Helper functions
export const getRoastLevelLabel = (id: RoastLevel): string => {
  return COFFEE_TERMS.roastLevels[id]?.label || id
}

export const getBrewMethodLabel = (id: BrewMethod): string => {
  return COFFEE_TERMS.brewMethods[id]?.label || id
}

export const getGrindSizeLabel = (id: GrindSize): string => {
  return COFFEE_TERMS.grindSizes[id]?.label || id
}

export const getProcessingMethodLabel = (id: ProcessingMethod): string => {
  return COFFEE_TERMS.processingMethods[id]?.label || id
}

// Get all options for select inputs
export const getRoastLevelOptions = () => Object.values(COFFEE_TERMS.roastLevels)
export const getBrewMethodOptions = () => Object.values(COFFEE_TERMS.brewMethods)
export const getGrindSizeOptions = () => Object.values(COFFEE_TERMS.grindSizes)
export const getProcessingMethodOptions = () => Object.values(COFFEE_TERMS.processingMethods)