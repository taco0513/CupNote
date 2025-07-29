import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'coffee' | 'achievement' | 'tip'
  title?: string
  message: string
  duration?: number // milliseconds, 0 means permanent
  dismissible?: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary'
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  // 알림 추가
  const addNotification = (notification: Omit<Notification, 'id'>): string => {
    const id = generateId()
    const newNotification: Notification = {
      id,
      duration: 5000, // 기본 5초
      dismissible: true,
      ...notification
    }

    notifications.value.push(newNotification)

    // 자동 제거 설정
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  // 알림 제거
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // 모든 알림 제거
  const clearAllNotifications = () => {
    notifications.value = []
  }

  // 특정 타입의 알림만 제거
  const clearNotificationsByType = (type: Notification['type']) => {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }

  // 편의 메서드들
  const showSuccess = (message: string, title?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const showError = (message: string, title?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // 에러는 조금 더 오래 표시
      ...options
    })
  }

  const showWarning = (message: string, title?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    })
  }

  const showInfo = (message: string, title?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  // CupNote 특화 알림들
  const showCoffeeNotification = (message: string, title?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'coffee',
      title,
      message,
      ...options
    })
  }

  const showAchievement = (message: string, title?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'achievement',
      title: title || '🏆 새로운 성취!',
      message,
      duration: 8000, // 성취는 조금 더 오래 표시
      ...options
    })
  }

  const showTip = (message: string, title?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'tip',
      title: title || '💡 커피 팁',
      message,
      duration: 7000,
      ...options
    })
  }

  // 테이스팅 관련 특화 알림들
  const showTastingStart = (coffeeName: string) => {
    return showCoffeeNotification(
      `${coffeeName} 테이스팅을 시작합니다!`,
      '☕ 테이스팅 시작',
      { duration: 3000 }
    )
  }

  const showTastingComplete = (coffeeName: string, matchScore: number) => {
    const title = matchScore >= 80 ? '🎯 훌륭한 감각!' : matchScore >= 60 ? '👍 좋은 시작!' : '📈 성장 중!'
    return showSuccess(
      `${coffeeName} 테이스팅 완료! 매치 점수: ${matchScore}점`,
      title,
      { duration: 6000 }
    )
  }

  const showScoreImprovement = (previousScore: number, currentScore: number) => {
    const improvement = currentScore - previousScore
    return showAchievement(
      `이전보다 ${improvement}점 향상되었습니다!`,
      '📈 감각 향상',
      { duration: 6000 }
    )
  }

  const showNewBadge = (badgeName: string) => {
    return showAchievement(
      `새로운 배지를 획득했습니다: ${badgeName}`,
      '🏆 새 배지 획득!',
      { duration: 8000 }
    )
  }

  const showDailyStreak = (streakDays: number) => {
    return showAchievement(
      `${streakDays}일 연속 테이스팅 기록!`,
      '🔥 연속 기록',
      { duration: 5000 }
    )
  }

  // ID 생성 유틸리티
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearNotificationsByType,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCoffeeNotification,
    showAchievement,
    showTip,
    showTastingStart,
    showTastingComplete,
    showScoreImprovement,
    showNewBadge,
    showDailyStreak
  }
})

// 타입 확장을 위한 인터페이스
export interface CoffeeNotificationOptions extends Partial<Notification> {
  coffeeName?: string
  matchScore?: number
  previousScore?: number
  badgeName?: string
  streakDays?: number
}

// 전역 알림 헬퍼 (컴포지션 API 외부에서도 사용 가능)
export const notify = {
  success: (message: string, title?: string, options?: Partial<Notification>) => {
    const store = useNotificationStore()
    return store.showSuccess(message, title, options)
  },
  error: (message: string, title?: string, options?: Partial<Notification>) => {
    const store = useNotificationStore()
    return store.showError(message, title, options)
  },
  warning: (message: string, title?: string, options?: Partial<Notification>) => {
    const store = useNotificationStore()
    return store.showWarning(message, title, options)
  },
  info: (message: string, title?: string, options?: Partial<Notification>) => {
    const store = useNotificationStore()
    return store.showInfo(message, title, options)
  },
  coffee: (message: string, title?: string, options?: Partial<Notification>) => {
    const store = useNotificationStore()
    return store.showCoffeeNotification(message, title, options)
  },
  achievement: (message: string, title?: string, options?: Partial<Notification>) => {
    const store = useNotificationStore()
    return store.showAchievement(message, title, options)
  },
  tip: (message: string, title?: string, options?: Partial<Notification>) => {
    const store = useNotificationStore()
    return store.showTip(message, title, options)
  }
}