// 알림 서비스 - 알림 생성 및 관리 로직

import { Notification, NotificationSettings, NotificationType, ReminderData, AchievementData, StatsData } from '../types/notification'

export class NotificationService {
  private static STORAGE_KEY = 'cupnote-notifications'
  private static SETTINGS_KEY = 'cupnote-notification-settings'
  
  // 기본 설정
  static getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      reminder: true,
      achievement: true,
      stats: true,
      system: true,
      reminderTime: '19:00', // 저녁 7시
      reminderDays: [1, 2, 3, 4, 5, 6, 0] // 매일
    }
  }

  // 설정 관리
  static getSettings(): NotificationSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY)
      return stored ? { ...this.getDefaultSettings(), ...JSON.parse(stored) } : this.getDefaultSettings()
    } catch {
      return this.getDefaultSettings()
    }
  }

  static saveSettings(settings: NotificationSettings): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
  }

  // 알림 목록 관리
  static getNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static saveNotifications(notifications: Notification[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications))
  }

  // 새 알림 추가
  static addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }

    const notifications = this.getNotifications()
    notifications.unshift(newNotification) // 최신 알림이 위로

    // 최대 50개까지만 보관
    if (notifications.length > 50) {
      notifications.splice(50)
    }

    this.saveNotifications(notifications)
    
    // 브라우저 알림 표시 (권한이 있는 경우)
    this.showBrowserNotification(newNotification)
    
    return newNotification
  }

  // 알림 읽음 처리
  static markAsRead(notificationId: string): void {
    const notifications = this.getNotifications()
    const notification = notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveNotifications(notifications)
    }
  }

  // 모든 알림 읽음 처리
  static markAllAsRead(): void {
    const notifications = this.getNotifications()
    notifications.forEach(n => n.read = true)
    this.saveNotifications(notifications)
  }

  // 알림 삭제
  static deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications().filter(n => n.id !== notificationId)
    this.saveNotifications(notifications)
  }

  // 읽지 않은 알림 개수
  static getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length
  }

  // 리마인더 알림 생성
  static createReminderNotification(data: ReminderData): void {
    const settings = this.getSettings()
    if (!settings.enabled || !settings.reminder) return

    const { consecutiveDays, totalRecords } = data
    
    let title = '☕ 커피 기록 시간이에요!'
    let message = '오늘 마신 커피는 어떠셨나요? 간단히 기록해보세요.'

    // 연속 기록 일수에 따른 메시지 변경
    if (consecutiveDays > 0) {
      title = `🔥 ${consecutiveDays}일 연속 기록 중!`
      message = '연속 기록을 이어가세요. 꾸준함이 취향 발견의 열쇠입니다!'
    }

    if (totalRecords === 0) {
      title = '🌟 첫 번째 커피를 기록해보세요!'
      message = '전문 용어 없이도 충분해요. 간단한 기록부터 시작해보세요.'
    }

    this.addNotification({
      type: 'reminder',
      title,
      message,
      data,
      read: false,
      actionUrl: '/mode-selection'
    })
  }

  // 성취 알림 생성
  static createAchievementNotification(data: AchievementData): void {
    const settings = this.getSettings()
    if (!settings.enabled || !settings.achievement) return

    this.addNotification({
      type: 'achievement',
      title: `🎉 새로운 뱃지 획득!`,
      message: `"${data.badgeName}" 뱃지를 받았어요! ${data.description}`,
      data,
      read: false,
      actionUrl: '/achievements'
    })
  }

  // 통계 요약 알림 생성
  static createStatsNotification(data: StatsData): void {
    const settings = this.getSettings()
    if (!settings.enabled || !settings.stats) return

    const periodText = data.period === 'weekly' ? '주간' : '월간'
    
    this.addNotification({
      type: 'stats',
      title: `📊 ${periodText} 커피 여정 요약`,
      message: `${data.recordCount}잔의 커피를 기록했어요! 평균 평점 ${data.averageRating.toFixed(1)}점`,
      data,
      read: false,
      actionUrl: '/my-records?tab=analytics'
    })
  }

  // 시스템 알림 생성
  static createSystemNotification(title: string, message: string, actionUrl?: string): void {
    const settings = this.getSettings()
    if (!settings.enabled || !settings.system) return

    this.addNotification({
      type: 'system',
      title,
      message,
      read: false,
      actionUrl
    })
  }

  // 브라우저 알림 표시
  private static async showBrowserNotification(notification: Notification): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192.png',
          tag: notification.type,
          requireInteraction: false
        })

        // 클릭 시 앱으로 이동
        browserNotification.onclick = () => {
          window.focus()
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl
          }
          browserNotification.close()
        }

        // 3초 후 자동 닫기
        setTimeout(() => {
          browserNotification.close()
        }, 3000)
      } catch (error) {
        console.warn('브라우저 알림 표시 실패:', error)
      }
    }
  }

  // 브라우저 알림 권한 요청
  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  // 리마인더 체크 (앱 시작 시 호출)
  static checkReminder(): void {
    const settings = this.getSettings()
    if (!settings.enabled || !settings.reminder) return

    const now = new Date()
    const today = now.getDay() // 0: 일요일, 6: 토요일
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    // 설정된 요일이 아니면 리턴
    if (!settings.reminderDays.includes(today)) return

    // 설정된 시간과 현재 시간 비교 (±5분 허용)
    const [reminderHour, reminderMinute] = settings.reminderTime.split(':').map(Number)
    const reminderTimeMinutes = reminderHour * 60 + reminderMinute
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes()
    const timeDiff = Math.abs(currentTimeMinutes - reminderTimeMinutes)

    if (timeDiff <= 5) { // 5분 오차 허용
      // 오늘 이미 리마인더를 보냈는지 확인
      const todayString = now.toISOString().split('T')[0]
      const notifications = this.getNotifications()
      const todayReminder = notifications.find(n => 
        n.type === 'reminder' && 
        n.createdAt.startsWith(todayString)
      )

      if (!todayReminder) {
        // 사용자 통계 가져오기
        try {
          const records = JSON.parse(localStorage.getItem('coffeeRecords') || '[]')
          const lastRecord = records[0]
          const lastRecordDate = lastRecord?.date
          
          // 연속 기록일 계산
          let consecutiveDays = 0
          if (lastRecordDate) {
            const lastDate = new Date(lastRecordDate)
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            
            if (lastDate.toDateString() === yesterday.toDateString()) {
              consecutiveDays = 1 // 간단한 계산, 나중에 더 정교하게 개선 가능
            }
          }

          this.createReminderNotification({
            lastRecordDate,
            consecutiveDays,
            totalRecords: records.length
          })
        } catch (error) {
          console.warn('리마인더 데이터 로드 실패:', error)
        }
      }
    }
  }

  // 뱃지 획득 체크 (기록 작성 후 호출)
  static checkAchievements(): void {
    try {
      const records = JSON.parse(localStorage.getItem('coffeeRecords') || '[]')
      const achievements = JSON.parse(localStorage.getItem('cupnote-achievements') || '[]')
      
      // 첫 기록 뱃지
      if (records.length === 1 && !achievements.includes('first_record')) {
        this.createAchievementNotification({
          badgeId: 'first_record',
          badgeName: '첫 걸음',
          badgeIcon: '🏆',
          description: '첫 번째 커피 기록을 작성했어요!'
        })
        
        // 뱃지 저장
        achievements.push('first_record')
        localStorage.setItem('cupnote-achievements', JSON.stringify(achievements))
      }

      // 10잔 기록 뱃지
      if (records.length === 10 && !achievements.includes('ten_records')) {
        this.createAchievementNotification({
          badgeId: 'ten_records',
          badgeName: '커피 애호가',
          badgeIcon: '☕',
          description: '10잔의 커피를 기록했어요!'
        })
        
        achievements.push('ten_records')
        localStorage.setItem('cupnote-achievements', JSON.stringify(achievements))
      }

      // 더 많은 뱃지 조건들을 추가할 수 있습니다
    } catch (error) {
      console.warn('뱃지 체크 실패:', error)
    }
  }

  // 주간/월간 통계 체크
  static checkStatsNotification(): void {
    const settings = this.getSettings()
    if (!settings.enabled || !settings.stats) return

    try {
      const records = JSON.parse(localStorage.getItem('coffeeRecords') || '[]')
      const now = new Date()
      
      // 주간 통계 (매주 일요일)
      if (now.getDay() === 0) { // 일요일
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        
        const weeklyRecords = records.filter((record: any) => {
          const recordDate = new Date(record.date)
          return recordDate >= weekAgo && recordDate <= now
        })

        if (weeklyRecords.length > 0) {
          const avgRating = weeklyRecords.reduce((sum: number, r: any) => sum + (r.overall || 0), 0) / weeklyRecords.length
          
          this.createStatsNotification({
            period: 'weekly',
            recordCount: weeklyRecords.length,
            averageRating: avgRating,
            topOrigin: '에티오피아', // 실제로는 통계에서 계산
            topRoastery: '블루보틀', // 실제로는 통계에서 계산
            insights: [`이번 주 ${weeklyRecords.length}잔의 커피를 기록했어요!`]
          })
        }
      }
    } catch (error) {
      console.warn('통계 알림 체크 실패:', error)
    }
  }
}