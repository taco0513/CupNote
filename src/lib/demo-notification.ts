// 데모 알림 생성 유틸리티

import { NotificationService } from './notification-service'

export function createDemoNotifications() {
  // 환영 알림
  NotificationService.createSystemNotification(
    '🎉 CupNote에 오신 것을 환영해요!',
    '앱의 새로운 알림 시스템을 체험해보세요. 상단의 🔔 아이콘을 클릭해보세요!',
    '/settings#notifications'
  )

  // 기록 작성 독려 알림 (5초 후)
  setTimeout(() => {
    NotificationService.createReminderNotification({
      consecutiveDays: 0,
      totalRecords: 0
    })
  }, 5000)

  // 뱃지 획득 데모 (10초 후)
  setTimeout(() => {
    NotificationService.createAchievementNotification({
      badgeId: 'first_visit',
      badgeName: '첫 방문',
      badgeIcon: '🌟',
      description: 'CupNote에 첫 방문을 축하드려요!'
    })
  }, 10000)

  // 주간 통계 데모 (15초 후)
  setTimeout(() => {
    NotificationService.createStatsNotification({
      period: 'weekly',
      recordCount: 3,
      averageRating: 4.2,
      topOrigin: '에티오피아',
      topRoastery: '블루보틀',
      insights: ['이번 주 3잔의 커피를 기록했어요!', '에티오피아 원두를 선호하시는군요!']
    })
  }, 15000)
}

// 첫 방문자 체크 및 데모 알림 실행
export function initializeDemoNotifications() {
  const hasSeenDemo = localStorage.getItem('cupnote-demo-notifications-shown')
  
  if (!hasSeenDemo) {
    createDemoNotifications()
    localStorage.setItem('cupnote-demo-notifications-shown', 'true')
  }
}