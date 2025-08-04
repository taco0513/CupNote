/**
 * Achievement Types - CupNote Achievement System
 * Comprehensive type definitions for the achievement system
 */

// Achievement Categories
export type AchievementCategory = 
  | 'experience'      // Recording coffee experiences
  | 'quality'         // High-quality records and consistency
  | 'exploration'     // Trying new coffees, roasters, origins
  | 'social'          // Community interaction and sharing
  | 'expertise'       // Advanced coffee knowledge and skills
  | 'milestone';      // Major milestones and anniversaries

// Achievement Difficulty Levels
export type AchievementDifficulty = 'bronze' | 'silver' | 'gold' | 'platinum';

// Achievement Progress Status
export type AchievementStatus = 'locked' | 'in_progress' | 'completed' | 'hidden';

// Core Achievement Interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  icon: string;
  progress_current: number;
  progress_target: number;
  status: AchievementStatus;
  unlocked_at?: string;
  requirements?: AchievementRequirement[];
  rewards?: AchievementReward[];
  created_at: string;
  updated_at: string;
}

// Achievement Requirements
export interface AchievementRequirement {
  type: 'record_count' | 'rating_average' | 'unique_roasters' | 'unique_origins' | 'streak_days';
  value: number;
  description: string;
}

// Achievement Rewards
export interface AchievementReward {
  type: 'points' | 'badge' | 'title' | 'feature_unlock';
  value: string | number;
  description: string;
}

// User Achievement Progress
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress_current: number;
  progress_target: number;
  status: AchievementStatus;
  unlocked_at?: string;
  created_at: string;
  updated_at: string;
}

// Achievement Update Operations
export interface AchievementUpdate {
  progress_current?: number;
  progress_target?: number;
  status?: AchievementStatus;
  unlocked_at?: string;
}

// Achievement Statistics
export interface AchievementStats {
  total_achievements: number;
  completed_achievements: number;
  completion_percentage: number;
  points_earned: number;
  recent_unlocks: Achievement[];
  next_achievements: Achievement[];
}

// Achievement Notification
export interface AchievementNotification {
  id: string;
  user_id: string;
  achievement: Achievement;
  type: 'unlocked' | 'progress' | 'milestone';
  message: string;
  seen: boolean;
  created_at: string;
}

// Achievement Filter Options
export interface AchievementFilters {
  category?: AchievementCategory | 'all';
  difficulty?: AchievementDifficulty | 'all';
  status?: AchievementStatus | 'all';
  search?: string;
}

// Achievement Sort Options
export type AchievementSortBy = 
  | 'name' 
  | 'difficulty' 
  | 'progress' 
  | 'unlocked_date' 
  | 'category';

export type AchievementSortOrder = 'asc' | 'desc';

// Achievement API Response Types
export interface AchievementResponse {
  success: boolean;
  data: Achievement[];
  total: number;
  page: number;
  per_page: number;
}

export interface UserAchievementResponse {
  success: boolean;
  data: UserAchievement[];
  stats: AchievementStats;
}

// Achievement Action Types (for state management)
export type AchievementAction = 
  | { type: 'LOAD_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { id: string; unlocked_at: string } }
  | { type: 'SET_FILTER'; payload: AchievementFilters }
  | { type: 'SET_SORT'; payload: { sort_by: AchievementSortBy; order: AchievementSortOrder } };

// Achievement Context Type
export interface AchievementContextType {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  stats: AchievementStats;
  filters: AchievementFilters;
  sortBy: AchievementSortBy;
  sortOrder: AchievementSortOrder;
  loading: boolean;
  error: string | null;
  updateProgress: (achievementId: string, progress: number) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  loadAchievements: () => Promise<void>;
  setFilters: (filters: AchievementFilters) => void;
  setSort: (sortBy: AchievementSortBy, order: AchievementSortOrder) => void;
}

// Export commonly used types as defaults
export type { Achievement as default };