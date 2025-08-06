/**
 * Achievement System Types - Unified Single Source
 * 
 * CupNote Achievement System의 중앙 집중화된 타입 정의
 * 모든 Achievement 관련 타입들이 여기에 정의됩니다.
 * 
 * @version 2.0.0 - Unified Types
 * @since 2025-08-06
 */

// ========================================
// Core Achievement Types
// ========================================

export type AchievementCategory = 
  | 'milestone'      // 테이스팅 마일스톤
  | 'quality'        // 품질 및 전문성
  | 'exploration'    // 탐험 및 발견
  | 'consistency'    // 꾸준함
  | 'special'        // 특별 성취

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type AchievementStatus = 'locked' | 'in_progress' | 'completed'

// Achievement Condition Types
export interface AchievementCondition {
  type: 'count' | 'variety' | 'rating' | 'streak' | 'special'
  target: number
  field?: string
  value?: string | number
}

// Achievement Reward Types  
export interface AchievementReward {
  points?: number
  title?: string
  badge?: string
  feature?: string
}

// Core Achievement Interface
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  tier?: AchievementTier
  condition: AchievementCondition
  reward?: AchievementReward
  
  // Runtime Properties
  unlocked: boolean
  unlockedAt?: string
  progress: { current: number; target: number }
}

// ========================================
// User Achievement System
// ========================================

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  progress_current: number
  progress_target: number
  unlocked_at?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserLevel {
  level: number
  title: string
  description: string
  requiredPoints: number
  currentPoints: number
  nextLevelPoints: number
  progress: number // 0-100
}

export interface UserStats {
  totalRecords: number
  totalPoints: number
  level: UserLevel
  achievements: Achievement[]
  streaks: {
    current: number
    longest: number
    lastRecordDate?: string
  }
  favorites: {
    origin?: string
    roastery?: string
    brewMethod?: string
  }
  averageRating: number
  exploredOrigins: string[]
  exploredRoasteries: string[]
}

// ========================================
// Achievement Progress & Events
// ========================================

export interface AchievementProgress {
  achievementId: string
  progress: number
  isComplete: boolean
  completedAt?: string
}

export interface AchievementEvent {
  type: 'tasting_completed' | 'match_score' | 'flavor_discovery' | 'streak' | 'special'
  data: Record<string, any>
  timestamp: string
}

export interface AchievementNotification {
  id: string
  user_id: string
  achievement: Achievement
  type: 'unlocked' | 'progress' | 'milestone'
  message: string
  seen: boolean
  created_at: string
}

// ========================================
// Achievement Filters & Search
// ========================================

export interface AchievementFilters {
  category?: AchievementCategory | 'all'
  tier?: AchievementTier | 'all'
  status?: AchievementStatus | 'all'
  search?: string
}

export type AchievementSortBy = 
  | 'title' 
  | 'tier' 
  | 'progress' 
  | 'unlocked_date' 
  | 'category'

export type AchievementSortOrder = 'asc' | 'desc'

// ========================================
// API Response Types
// ========================================

export interface AchievementResponse {
  success: boolean
  data: Achievement[]
  total: number
  page?: number
  per_page?: number
}

export interface UserAchievementResponse {
  success: boolean
  data: UserAchievement[]
  stats: UserStats
}

// ========================================
// State Management Types
// ========================================

export type AchievementAction = 
  | { type: 'LOAD_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { id: string; unlocked_at: string } }
  | { type: 'SET_FILTER'; payload: AchievementFilters }
  | { type: 'SET_SORT'; payload: { sort_by: AchievementSortBy; order: AchievementSortOrder } }

export interface AchievementContextType {
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  stats: UserStats
  filters: AchievementFilters
  sortBy: AchievementSortBy
  sortOrder: AchievementSortOrder
  loading: boolean
  error: string | null
  updateProgress: (achievementId: string, progress: number) => Promise<void>
  unlockAchievement: (achievementId: string) => Promise<void>
  loadAchievements: () => Promise<void>
  setFilters: (filters: AchievementFilters) => void
  setSort: (sortBy: AchievementSortBy, order: AchievementSortOrder) => void
}

// ========================================
// Constants & Configuration
// ========================================

// Achievement Points by Tier
export const ACHIEVEMENT_POINTS: Record<AchievementTier, number> = {
  bronze: 10,
  silver: 25,
  gold: 50,
  platinum: 100,
}

// Achievement Colors by Tier
export const ACHIEVEMENT_COLORS: Record<AchievementTier, string> = {
  bronze: 'from-amber-500 to-amber-600',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-400 to-yellow-500',
  platinum: 'from-purple-500 to-purple-600',
}

// Achievement Category Configuration
export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, { 
  name: string
  icon: string
  color: string
}> = {
  milestone: { name: '마일스톤', icon: '🏆', color: 'bg-yellow-100' },
  quality: { name: '품질', icon: '💎', color: 'bg-blue-100' },
  exploration: { name: '탐험', icon: '🗺️', color: 'bg-green-100' },
  consistency: { name: '꾸준함', icon: '📈', color: 'bg-orange-100' },
  special: { name: '특별', icon: '⭐', color: 'bg-purple-100' },
}

// Level System Configuration
export interface LevelSystemConfig {
  level: number
  title: string
  description: string
  requiredPoints: number
}

export const LEVEL_SYSTEM: LevelSystemConfig[] = [
  { level: 1, title: '커피 입문자', description: '커피 여행을 시작했어요', requiredPoints: 0 },
  { level: 2, title: '커피 팬', description: '커피에 관심이 생겼어요', requiredPoints: 50 },
  { level: 3, title: '커피 애호가', description: '커피를 좋아해요', requiredPoints: 150 },
  { level: 4, title: '커피 마니아', description: '커피에 푹 빠졌어요', requiredPoints: 300 },
  { level: 5, title: '커피 전문가', description: '커피를 잘 알아요', requiredPoints: 500 },
  { level: 6, title: '커피 큐레이터', description: '좋은 커피를 찾는 눈이 있어요', requiredPoints: 800 },
  { level: 7, title: '커피 마스터', description: '커피의 달인이에요', requiredPoints: 1200 },
  { level: 8, title: '커피 구루', description: '커피 지식이 풍부해요', requiredPoints: 1800 },
  { level: 9, title: '커피 전설', description: '커피계의 전설이에요', requiredPoints: 2500 },
  { level: 10, title: '커피 신', description: '커피의 신이에요', requiredPoints: 3500 },
]

// ========================================
// Utility Types
// ========================================

// For partial updates
export type AchievementUpdate = Partial<Pick<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>>
export type UserAchievementUpdate = Partial<Pick<UserAchievement, 'progress_current' | 'unlocked_at' | 'metadata'>>

// For API operations
export type CreateAchievementInput = Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>
export type UpdateAchievementInput = Partial<CreateAchievementInput>