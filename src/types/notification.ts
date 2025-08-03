// 알림 시스템 타입 정의

export type NotificationType = 'reminder' | 'achievement' | 'stats' | 'system'

export interface Notification {
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
  reminder: boolean
  achievement: boolean
  stats: boolean
  system: boolean
  reminderTime: string // HH:mm 형식
  reminderDays: number[] // 0-6 (일-토)
}

export interface ReminderData {
  lastRecordDate?: string
  consecutiveDays: number
  totalRecords: number
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