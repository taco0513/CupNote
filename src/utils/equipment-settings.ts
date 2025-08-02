/**
 * Equipment Settings Utility Functions
 * 
 * 사용자의 홈카페 장비 설정을 관리하는 유틸리티 함수들
 * HomeCafe 모드와 설정 페이지에서 공통으로 사용
 */

interface UserSettings {
  displayName: string
  autoSaveEnabled: boolean
  showRatingInList: boolean
  compactView: boolean
  homeCafeEquipment: {
    grinder: string
    brewingMethod: string
    scale: string
    kettle: string
    other: string[]
  }
}

const defaultSettings: UserSettings = {
  displayName: '',
  autoSaveEnabled: true,
  showRatingInList: true,
  compactView: false,
  homeCafeEquipment: {
    grinder: '',
    brewingMethod: '',
    scale: '',
    kettle: '',
    other: []
  }
}

const SETTINGS_STORAGE_KEY = 'userSettings'

/**
 * 사용자 설정 불러오기
 */
export const getUserSettings = (): UserSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsedSettings = JSON.parse(stored)
      return { ...defaultSettings, ...parsedSettings }
    }
    return defaultSettings
  } catch (error) {
    console.error('Failed to load user settings:', error)
    return defaultSettings
  }
}

/**
 * 사용자 설정 저장하기
 */
export const saveUserSettings = (settings: UserSettings): boolean => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('Failed to save user settings:', error)
    return false
  }
}

/**
 * 홈카페 장비 설정만 가져오기
 */
export const getHomeCafeEquipment = () => {
  const settings = getUserSettings()
  return settings.homeCafeEquipment
}

/**
 * 특정 장비 정보 가져오기
 */
export const getEquipmentByType = (type: keyof UserSettings['homeCafeEquipment']) => {
  const equipment = getHomeCafeEquipment()
  return equipment[type]
}

/**
 * 드리퍼/추출 도구 추천 목록 생성
 * 사용자 설정을 우선으로 하고, 기본 옵션들을 추가
 */
export const getBrewingMethodSuggestions = (): string[] => {
  const userMethod = getEquipmentByType('brewingMethod')
  const defaultMethods = ['V60', 'Kalita Wave', 'Origami', 'April', '에어로프레스', '프렌치프레스', '케멕스']
  
  if (userMethod && !defaultMethods.includes(userMethod)) {
    return [userMethod, ...defaultMethods]
  }
  
  return defaultMethods
}

/**
 * 그라인더 추천 목록 생성
 */
export const getGrinderSuggestions = (): string[] => {
  const userGrinder = getEquipmentByType('grinder')
  const defaultGrinders = [
    '코만단테 C40',
    '바라짜 엔코어',
    '1zpresso JX',
    '바라짜 세테 270',
    '펠로우 옥소',
    '하리오 미니밀'
  ]
  
  if (userGrinder && !defaultGrinders.includes(userGrinder)) {
    return [userGrinder, ...defaultGrinders]
  }
  
  return defaultGrinders
}

/**
 * 분쇄도 추천 생성
 * 사용자 그라인더에 따른 분쇄도 가이드
 */
export const getGrindSizeRecommendations = (grinder?: string): string[] => {
  const userGrinder = grinder || getEquipmentByType('grinder')
  
  const recommendations: Record<string, string[]> = {
    '코만단테 C40': ['18-22클릭 (V60)', '25-30클릭 (프렌치프레스)', '15-18클릭 (에스프레소)'],
    '1zpresso JX': ['2.8-3.2 (V60)', '4.0-4.5 (프렌치프레스)', '1.5-2.0 (에스프레소)'],
    '바라짜 엔코어': ['15-20 (V60)', '25-30 (프렌치프레스)', '8-12 (에스프레소)'],
    '바라짜 세테 270': ['30M (V60)', '5E (프렌치프레스)', '10M (에스프레소)']
  }
  
  if (userGrinder && recommendations[userGrinder]) {
    return recommendations[userGrinder]
  }
  
  return ['중간-가는 입자 (V60)', '굵은 입자 (프렌치프레스)', '가는 입자 (에스프레소)']
}

/**
 * 장비 기반 추출 파라미터 추천
 */
export const getBrewingRecommendations = (equipment?: Partial<UserSettings['homeCafeEquipment']>) => {
  const userEquipment = equipment || getHomeCafeEquipment()
  
  const recommendations: {
    ratio?: string
    grindSize?: string
    temperature?: string
    notes?: string[]
  } = {}
  
  // 추출 도구별 추천
  if (userEquipment.brewingMethod) {
    const method = userEquipment.brewingMethod.toLowerCase()
    
    if (method.includes('v60')) {
      recommendations.ratio = '1:16'
      recommendations.grindSize = '중간-가는 입자'
      recommendations.temperature = '92-96°C'
      recommendations.notes = ['원형으로 천천히 붓기', '블룸 30초', '총 추출시간 2:30-3:30']
    } else if (method.includes('kalita') || method.includes('웨이브')) {
      recommendations.ratio = '1:15.5'
      recommendations.grindSize = '중간 입자'
      recommendations.temperature = '90-94°C'
      recommendations.notes = ['중앙에서 원형으로', '3회 나누어 붓기', '총 추출시간 3:00-4:00']
    } else if (method.includes('aeropress') || method.includes('에어로프레스')) {
      recommendations.ratio = '1:15'
      recommendations.grindSize = '가는-중간 입자'
      recommendations.temperature = '85-90°C'
      recommendations.notes = ['뒤집기 방식 추천', '1분 30초 우린 후 압추출', '압추출 30초']
    } else if (method.includes('french') || method.includes('프렌치')) {
      recommendations.ratio = '1:17'
      recommendations.grindSize = '굵은 입자'
      recommendations.temperature = '93-96°C'
      recommendations.notes = ['4분 우리기', '천천히 눌러주기', '거품 제거 후 따르기']
    }
  }
  
  return recommendations
}

/**
 * 장비 유효성 검사
 */
export const validateEquipmentSetup = (equipment: Partial<UserSettings['homeCafeEquipment']>) => {
  const errors: string[] = []
  
  if (!equipment.grinder && !equipment.brewingMethod) {
    errors.push('그라인더 또는 추출 도구를 설정해주세요.')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 장비 설정 자동 완성 데이터
 */
export const getEquipmentAutoCompleteData = () => {
  return {
    grinders: getGrinderSuggestions(),
    brewingMethods: getBrewingMethodSuggestions(),
    scales: [
      '아카이아 펄',
      '하리오 V60 드립스케일',
      '브루이스타 스케일',
      '옥소 정밀 저울',
      '보나비타 디지털 스케일'
    ],
    kettles: [
      '펠로우 스타그 EKG',
      '하리오 부오노',
      '브루이스타 아티산',
      '보나비타 변수 온도 케틀',
      '브루이스타 Immersion Dripper'
    ]
  }
}

/**
 * 설정 마이그레이션
 * 기존 설정을 새로운 형식으로 변환
 */
export const migrateEquipmentSettings = (oldSettings: any): UserSettings => {
  const migrated: UserSettings = { ...defaultSettings }
  
  if (oldSettings) {
    // 기존 설정 유지
    migrated.displayName = oldSettings.displayName || ''
    migrated.autoSaveEnabled = oldSettings.autoSaveEnabled ?? true
    migrated.showRatingInList = oldSettings.showRatingInList ?? true
    migrated.compactView = oldSettings.compactView ?? false
    
    // 장비 설정 마이그레이션
    if (oldSettings.homeCafeEquipment) {
      migrated.homeCafeEquipment = {
        ...defaultSettings.homeCafeEquipment,
        ...oldSettings.homeCafeEquipment
      }
    }
  }
  
  return migrated
}

export type { UserSettings }