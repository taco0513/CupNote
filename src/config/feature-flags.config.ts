/**
 * Feature Flags Configuration
 * TastingFlow 마이그레이션을 위한 Feature Flag 시스템
 * 
 * @version 1.0.0
 * @since 2025-01-31
 */

export interface FeatureFlags {
  // TastingFlow v2.0 플래그
  ENABLE_NEW_TASTING_FLOW: boolean
  ENABLE_MATCH_SCORE: boolean
  ENABLE_ACHIEVEMENTS: boolean
  ENABLE_SCA_FLAVOR_WHEEL_V2: boolean
  ENABLE_CASCADE_AUTOCOMPLETE: boolean
  
  // 마이그레이션 플래그
  REDIRECT_OLD_ROUTES: boolean
  SHOW_MIGRATION_BANNER: boolean
  
  // 디버그 플래그
  DEBUG_MODE: boolean
  SHOW_FEATURE_FLAGS: boolean
}

// 환경변수 기반 플래그 설정
const getEnvFlag = (key: string, defaultValue: boolean = false): boolean => {
  // 환경변수 체크 (빌드 타임에 결정됨)
  const value = process.env[`NEXT_PUBLIC_${key}`]
  if (value === undefined) return defaultValue
  
  return value === 'true'
}

// Feature Flags 기본값
export const FEATURE_FLAGS: FeatureFlags = {
  // TastingFlow v2.0 - 활성화됨
  ENABLE_NEW_TASTING_FLOW: getEnvFlag('ENABLE_NEW_TASTING_FLOW', true),
  ENABLE_MATCH_SCORE: getEnvFlag('ENABLE_MATCH_SCORE', true),
  ENABLE_ACHIEVEMENTS: getEnvFlag('ENABLE_ACHIEVEMENTS', true),
  ENABLE_SCA_FLAVOR_WHEEL_V2: getEnvFlag('ENABLE_SCA_FLAVOR_WHEEL_V2', true),
  ENABLE_CASCADE_AUTOCOMPLETE: getEnvFlag('ENABLE_CASCADE_AUTOCOMPLETE', true),
  
  // 마이그레이션 - 항상 활성화
  REDIRECT_OLD_ROUTES: getEnvFlag('REDIRECT_OLD_ROUTES', true),
  SHOW_MIGRATION_BANNER: getEnvFlag('SHOW_MIGRATION_BANNER', false),
  
  // 디버그
  DEBUG_MODE: getEnvFlag('DEBUG_MODE', false),
  SHOW_FEATURE_FLAGS: getEnvFlag('SHOW_FEATURE_FLAGS', false),
}

// Feature Flag Hook
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[flag]
}

// Feature Flag 체크 유틸리티
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[flag]
}

// 개발환경에서 Feature Flag 상태 출력
if (process.env.NODE_ENV === 'development' && FEATURE_FLAGS.SHOW_FEATURE_FLAGS) {
}

// A/B 테스트를 위한 사용자 그룹 할당
export const getUserTestGroup = (userId: string): 'control' | 'test' => {
  if (!FEATURE_FLAGS.ENABLE_NEW_TASTING_FLOW) return 'control'
  
  // 간단한 해시 기반 그룹 할당 (50/50)
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % 2 === 0 ? 'control' : 'test'
}

// 마이그레이션 헬퍼
export const shouldUseNewTastingFlow = (userId?: string): boolean => {
  if (!FEATURE_FLAGS.ENABLE_NEW_TASTING_FLOW) return false
  if (!userId) return false
  
  return getUserTestGroup(userId) === 'test'
}

// Feature Flag 오버라이드 (개발/테스트용)
export const overrideFeatureFlag = (flag: keyof FeatureFlags, value: boolean): void => {
  if (process.env.NODE_ENV === 'development') {
    FEATURE_FLAGS[flag] = value
  }
}