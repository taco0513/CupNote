// 알림 시스템 타입 정의

export type NotificationType = 'achievement' | 'stats' | 'system'

export interface CupNoteNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
  actionUrl?: string // 클릭 시 이동할 URL
}

export interface NotificationSettings {
  enabled: boolean
  achievement: boolean
  stats: boolean
  system: boolean
}

export interface AchievementData {
  badgeId: string
  badgeName: string
  badgeIcon: string
  description: string
}

export interface StatsData {
  period: 'weekly' | 'monthly'
  recordCount: number
  averageRating: number
  topOrigin: string
  topRoastery: string
  insights: string[]
}