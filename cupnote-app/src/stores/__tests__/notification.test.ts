import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNotificationStore } from '../notification'

describe('NotificationStore', () => {
  beforeEach(() => {
    // 각 테스트마다 새로운 Pinia 인스턴스 생성
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  describe('기본 알림 관리', () => {
    it('알림을 추가할 수 있다', () => {
      const store = useNotificationStore()

      const id = store.addNotification({
        type: 'success',
        message: '테스트 성공 메시지',
      })

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0]).toMatchObject({
        id: expect.any(String),
        type: 'success',
        message: '테스트 성공 메시지',
        duration: 5000,
        dismissible: true,
      })
      expect(id).toBe(store.notifications[0].id)
    })

    it('알림을 제거할 수 있다', () => {
      const store = useNotificationStore()

      const id1 = store.addNotification({ type: 'info', message: '첫 번째' })
      const id2 = store.addNotification({ type: 'info', message: '두 번째' })

      expect(store.notifications).toHaveLength(2)

      store.removeNotification(id1)

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].id).toBe(id2)
    })

    it('모든 알림을 제거할 수 있다', () => {
      const store = useNotificationStore()

      store.addNotification({ type: 'info', message: '첫 번째' })
      store.addNotification({ type: 'success', message: '두 번째' })
      store.addNotification({ type: 'error', message: '세 번째' })

      expect(store.notifications).toHaveLength(3)

      store.clearAllNotifications()

      expect(store.notifications).toHaveLength(0)
    })

    it('특정 타입의 알림만 제거할 수 있다', () => {
      const store = useNotificationStore()

      store.addNotification({ type: 'error', message: '에러 1' })
      store.addNotification({ type: 'success', message: '성공' })
      store.addNotification({ type: 'error', message: '에러 2' })

      store.clearNotificationsByType('error')

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].type).toBe('success')
    })
  })

  describe('자동 제거 기능', () => {
    it('지정된 시간 후 알림이 자동으로 제거된다', () => {
      const store = useNotificationStore()

      store.addNotification({
        type: 'info',
        message: '자동 제거 테스트',
        duration: 3000,
      })

      expect(store.notifications).toHaveLength(1)

      // 3초 경과
      vi.advanceTimersByTime(3000)

      expect(store.notifications).toHaveLength(0)
    })

    it('duration이 0이면 자동 제거되지 않는다', () => {
      const store = useNotificationStore()

      store.addNotification({
        type: 'info',
        message: '영구 알림',
        duration: 0,
      })

      expect(store.notifications).toHaveLength(1)

      // 10초 경과해도 여전히 존재
      vi.advanceTimersByTime(10000)

      expect(store.notifications).toHaveLength(1)
    })
  })

  describe('편의 메서드', () => {
    it('showSuccess 메서드가 올바르게 작동한다', () => {
      const store = useNotificationStore()

      store.showSuccess('성공했습니다!', '축하')

      expect(store.notifications[0]).toMatchObject({
        type: 'success',
        title: '축하',
        message: '성공했습니다!',
        duration: 5000,
      })
    })

    it('showError 메서드는 더 긴 duration을 가진다', () => {
      const store = useNotificationStore()

      store.showError('에러가 발생했습니다')

      expect(store.notifications[0]).toMatchObject({
        type: 'error',
        message: '에러가 발생했습니다',
        duration: 8000,
      })
    })

    it('showWarning 메서드가 올바르게 작동한다', () => {
      const store = useNotificationStore()

      store.showWarning('주의하세요')

      expect(store.notifications[0]).toMatchObject({
        type: 'warning',
        message: '주의하세요',
        duration: 6000,
      })
    })

    it('showInfo 메서드가 올바르게 작동한다', () => {
      const store = useNotificationStore()

      store.showInfo('정보입니다')

      expect(store.notifications[0]).toMatchObject({
        type: 'info',
        message: '정보입니다',
        duration: 5000,
      })
    })
  })

  describe('CupNote 특화 알림', () => {
    it('showCoffeeNotification이 올바르게 작동한다', () => {
      const store = useNotificationStore()

      store.showCoffeeNotification('새로운 커피를 발견했습니다')

      expect(store.notifications[0]).toMatchObject({
        type: 'coffee',
        message: '새로운 커피를 발견했습니다',
      })
    })

    it('showAchievement는 기본 제목을 가진다', () => {
      const store = useNotificationStore()

      store.showAchievement('첫 테이스팅 완료!')

      expect(store.notifications[0]).toMatchObject({
        type: 'achievement',
        title: '🏆 새로운 성취!',
        message: '첫 테이스팅 완료!',
        duration: 8000,
      })
    })

    it('showTip은 기본 제목을 가진다', () => {
      const store = useNotificationStore()

      store.showTip('물은 92도가 최적입니다')

      expect(store.notifications[0]).toMatchObject({
        type: 'tip',
        title: '💡 커피 팁',
        message: '물은 92도가 최적입니다',
        duration: 7000,
      })
    })
  })

  describe('테이스팅 관련 특화 알림', () => {
    it('showTastingStart가 올바른 메시지를 생성한다', () => {
      const store = useNotificationStore()

      store.showTastingStart('에티오피아 예가체프')

      expect(store.notifications[0]).toMatchObject({
        type: 'coffee',
        title: '☕ 테이스팅 시작',
        message: '에티오피아 예가체프 테이스팅을 시작합니다!',
        duration: 3000,
      })
    })

    it('showTastingComplete가 점수에 따라 다른 제목을 표시한다', () => {
      const store = useNotificationStore()

      // 높은 점수
      store.showTastingComplete('케냐 AA', 92)
      expect(store.notifications[0].title).toBe('🎯 훌륭한 감각!')

      store.clearAllNotifications()

      // 중간 점수
      store.showTastingComplete('콜롬비아', 75)
      expect(store.notifications[0].title).toBe('👍 좋은 시작!')

      store.clearAllNotifications()

      // 낮은 점수
      store.showTastingComplete('브라질', 45)
      expect(store.notifications[0].title).toBe('📈 성장 중!')
    })

    it('showScoreImprovement가 점수 향상을 표시한다', () => {
      const store = useNotificationStore()

      store.showScoreImprovement(70, 85)

      expect(store.notifications[0]).toMatchObject({
        type: 'achievement',
        title: '📈 감각 향상',
        message: '이전보다 15점 향상되었습니다!',
        duration: 6000,
      })
    })

    it('showNewBadge가 새 배지 획득을 알린다', () => {
      const store = useNotificationStore()

      store.showNewBadge('커피 마스터')

      expect(store.notifications[0]).toMatchObject({
        type: 'achievement',
        title: '🏆 새 배지 획득!',
        message: '새로운 배지를 획득했습니다: 커피 마스터',
        duration: 8000,
      })
    })

    it('showDailyStreak가 연속 기록을 표시한다', () => {
      const store = useNotificationStore()

      store.showDailyStreak(7)

      expect(store.notifications[0]).toMatchObject({
        type: 'achievement',
        title: '🔥 연속 기록',
        message: '7일 연속 테이스팅 기록!',
        duration: 5000,
      })
    })
  })

  describe('알림 옵션 오버라이드', () => {
    it('사용자 정의 옵션으로 기본 설정을 오버라이드할 수 있다', () => {
      const store = useNotificationStore()

      store.showSuccess('커스텀 성공', '제목', {
        duration: 10000,
        dismissible: false,
      })

      expect(store.notifications[0]).toMatchObject({
        type: 'success',
        title: '제목',
        message: '커스텀 성공',
        duration: 10000,
        dismissible: false,
      })
    })
  })
})
