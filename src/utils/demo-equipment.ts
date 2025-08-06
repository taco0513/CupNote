/**
 * Demo Equipment Settings
 * 
 * 장비 통합 기능을 테스트하기 위한 데모 데이터
 */

import { saveUserSettings, getUserSettings } from './equipment-settings'

/**
 * 데모 장비 설정을 저장
 */
export const setupDemoEquipment = () => {
  const currentSettings = getUserSettings()
  
  const demoSettings = {
    ...currentSettings,
    displayName: '커피 애호가',
    homeCafeEquipment: {
      grinder: '코만단테 C40',
      brewingMethod: 'V60',
      scale: '아카이아 펄',
      kettle: '펠로우 스타그 EKG',
      other: ['온도계', '타이머', '서버']
    }
  }
  
  const success = saveUserSettings(demoSettings)
  
  if (success) {
    return true
  } else {
    console.error('❌ 데모 장비 설정 저장 실패')
    return false
  }
}

/**
 * 다른 장비 조합 설정
 */
export const setupAlternativeEquipment = () => {
  const currentSettings = getUserSettings()
  
  const altSettings = {
    ...currentSettings,
    displayName: '홈카페 마니아',
    homeCafeEquipment: {
      grinder: '바라짜 세테 270',
      brewingMethod: 'Kalita Wave',
      scale: '하리오 V60 드립스케일',
      kettle: '하리오 부오노',
      other: ['TDS 미터', '밸런스', '클렌징 컵']
    }
  }
  
  const success = saveUserSettings(altSettings)
  
  if (success) {
    return true
  } else {
    console.error('❌ 대체 장비 설정 저장 실패')
    return false
  }
}

/**
 * 장비 설정 초기화
 */
export const clearEquipmentSettings = () => {
  const currentSettings = getUserSettings()
  
  const clearedSettings = {
    ...currentSettings,
    homeCafeEquipment: {
      grinder: '',
      brewingMethod: '',
      scale: '',
      kettle: '',
      other: []
    }
  }
  
  const success = saveUserSettings(clearedSettings)
  
  if (success) {
    return true
  } else {
    console.error('❌ 장비 설정 초기화 실패')
    return false
  }
}

/**
 * 현재 장비 설정 확인
 */
export const checkCurrentEquipment = () => {
  const settings = getUserSettings()
  return settings.homeCafeEquipment
}

// 브라우저 콘솔에서 사용할 수 있도록 전역 변수로 등록
if (typeof window !== 'undefined') {
  (window as any).demoEquipment = {
    setup: setupDemoEquipment,
    setupAlt: setupAlternativeEquipment,
    clear: clearEquipmentSettings,
    check: checkCurrentEquipment
  }
  
}