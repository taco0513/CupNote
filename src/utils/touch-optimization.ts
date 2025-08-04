/**
 * Touch Optimization Utilities
 * 터치 인터페이스 최적화를 위한 유틸리티 함수들
 */

// 최소 터치 타겟 크기 (WCAG 권장)
export const MIN_TOUCH_TARGET = 44 // px
export const COMFORTABLE_TOUCH_TARGET = 48 // px
export const SPACIOUS_TOUCH_TARGET = 56 // px

// 터치 타겟 사이 최소 간격
export const MIN_TOUCH_SPACING = 8 // px

/**
 * 터치 타겟 크기 검증
 */
export function validateTouchTarget(width: number, height: number): {
  isValid: boolean
  minSize: number
  recommendations: string[]
} {
  const minDimension = Math.min(width, height)
  const recommendations: string[] = []
  
  if (minDimension < MIN_TOUCH_TARGET) {
    recommendations.push(`최소 크기 ${MIN_TOUCH_TARGET}px 이상 권장`)
  }
  
  if (minDimension < COMFORTABLE_TOUCH_TARGET) {
    recommendations.push(`편안한 사용을 위해 ${COMFORTABLE_TOUCH_TARGET}px 이상 권장`)
  }
  
  return {
    isValid: minDimension >= MIN_TOUCH_TARGET,
    minSize: minDimension,
    recommendations
  }
}

/**
 * 터치 이벤트 유틸리티
 */
export class TouchEventUtils {
  /**
   * 터치 포인트 좌표 추출
   */
  static getPointerCoordinates(e: TouchEvent | MouseEvent): { x: number; y: number } {
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }
    
    if ('clientX' in e) {
      return {
        x: e.clientX,
        y: e.clientY
      }
    }
    
    return { x: 0, y: 0 }
  }
  
  /**
   * 터치 거리 계산
   */
  static calculateDistance(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): number {
    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }
  
  /**
   * 스와이프 방향 감지
   */
  static getSwipeDirection(
    start: { x: number; y: number },
    end: { x: number; y: number },
    threshold: number = 30
  ): 'left' | 'right' | 'up' | 'down' | null {
    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
      return null // 거리가 너무 짧음
    }
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }
  
  /**
   * 터치 이벤트 디바운싱
   */
  static createDebouncedTouchHandler<T extends any[]>(
    handler: (...args: T) => void,
    delay: number = 16 // ~60fps
  ) {
    let timeoutId: NodeJS.Timeout | null = null
    
    return (...args: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        handler(...args)
        timeoutId = null
      }, delay)
    }
  }
}

/**
 * 터치 제스처 감지기
 */
export interface GestureConfig {
  // 스와이프 설정
  swipeThreshold: number
  swipeVelocityThreshold: number
  
  // 탭 설정
  tapMaxDistance: number
  tapMaxDuration: number
  
  // 롱 프레스 설정
  longPressMinDuration: number
  longPressMaxDistance: number
}

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  tapMaxDistance: 10,
  tapMaxDuration: 300,
  longPressMinDuration: 500,
  longPressMaxDistance: 10
}

export class GestureDetector {
  private startPoint: { x: number; y: number; time: number } | null = null
  private config: GestureConfig
  private longPressTimer: NodeJS.Timeout | null = null
  
  constructor(config: Partial<GestureConfig> = {}) {
    this.config = { ...DEFAULT_GESTURE_CONFIG, ...config }
  }
  
  /**
   * 터치 시작
   */
  onTouchStart(e: TouchEvent | MouseEvent): void {
    const point = TouchEventUtils.getPointerCoordinates(e)
    this.startPoint = {
      x: point.x,
      y: point.y,
      time: Date.now()
    }
    
    // 롱 프레스 타이머 시작
    this.longPressTimer = setTimeout(() => {
      if (this.startPoint) {
        this.onLongPress?.(this.startPoint)
      }
    }, this.config.longPressMinDuration)
  }
  
  /**
   * 터치 이동
   */
  onTouchMove(e: TouchEvent | MouseEvent): void {
    if (!this.startPoint) return
    
    const currentPoint = TouchEventUtils.getPointerCoordinates(e)
    const distance = TouchEventUtils.calculateDistance(this.startPoint, currentPoint)
    
    // 롱 프레스 취소 (이동 거리가 임계값 초과)
    if (distance > this.config.longPressMaxDistance && this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
    
    this.onMove?.(currentPoint, distance)
  }
  
  /**
   * 터치 종료
   */
  onTouchEnd(e: TouchEvent | MouseEvent): void {
    if (!this.startPoint) return
    
    const endPoint = TouchEventUtils.getPointerCoordinates(e)
    const distance = TouchEventUtils.calculateDistance(this.startPoint, endPoint)
    const duration = Date.now() - this.startPoint.time
    const velocity = distance / duration
    
    // 롱 프레스 타이머 정리
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
    
    // 제스처 판별
    if (distance < this.config.tapMaxDistance && duration < this.config.tapMaxDuration) {
      // 탭
      this.onTap?.(this.startPoint)
    } else if (distance > this.config.swipeThreshold && velocity > this.config.swipeVelocityThreshold) {
      // 스와이프
      const direction = TouchEventUtils.getSwipeDirection(this.startPoint, endPoint)
      if (direction) {
        this.onSwipe?.(direction, distance, velocity)
      }
    }
    
    this.startPoint = null
  }
  
  // 이벤트 핸들러 (옵션)
  onTap?: (point: { x: number; y: number; time: number }) => void
  onLongPress?: (point: { x: number; y: number; time: number }) => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number, velocity: number) => void
  onMove?: (point: { x: number; y: number }, distance: number) => void
}

/**
 * CSS 클래스 생성 유틸리티
 */
export function createTouchTargetClass(size: number = MIN_TOUCH_TARGET): string {
  return `min-w-[${size}px] min-h-[${size}px] flex items-center justify-center`
}

/**
 * 터치 최적화된 버튼 Props 생성
 */
export function createTouchOptimizedProps(size: 'sm' | 'md' | 'lg' = 'md') {
  const sizeMap = {
    sm: MIN_TOUCH_TARGET,
    md: COMFORTABLE_TOUCH_TARGET,
    lg: SPACIOUS_TOUCH_TARGET
  }
  
  const targetSize = sizeMap[size]
  
  return {
    className: createTouchTargetClass(targetSize),
    style: {
      minWidth: `${targetSize}px`,
      minHeight: `${targetSize}px`,
      touchAction: 'manipulation' as const, // 더블탭 줌 방지
    }
  }
}

/**
 * 터치 디바이스 감지
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * 터치 지원 CSS 적용
 */
export function applyTouchSupport(): void {
  if (typeof document === 'undefined') return
  
  const style = document.createElement('style')
  style.textContent = `
    /* 터치 최적화 CSS */
    .touch-target {
      min-width: ${MIN_TOUCH_TARGET}px;
      min-height: ${MIN_TOUCH_TARGET}px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .touch-target-comfortable {
      min-width: ${COMFORTABLE_TOUCH_TARGET}px;
      min-height: ${COMFORTABLE_TOUCH_TARGET}px;
    }
    
    .touch-target-spacious {
      min-width: ${SPACIOUS_TOUCH_TARGET}px;
      min-height: ${SPACIOUS_TOUCH_TARGET}px;
    }
    
    /* 터치 피드백 */
    .touch-feedback {
      transition: transform 0.1s ease-out, background-color 0.15s ease-out;
    }
    
    .touch-feedback:active {
      transform: scale(0.98);
    }
    
    /* 터치 액션 최적화 */
    .touch-optimized {
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    /* 스크롤 최적화 */
    .smooth-scroll {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }
  `
  
  document.head.appendChild(style)
}

/**
 * 성능 모니터링
 */
export class TouchPerformanceMonitor {
  private touchStartTime: number = 0
  private frameId: number | null = null
  
  startMonitoring(): void {
    this.touchStartTime = performance.now()
    this.frameId = requestAnimationFrame(this.checkPerformance)
  }
  
  private checkPerformance = (): void => {
    const currentTime = performance.now()
    const duration = currentTime - this.touchStartTime
    
    if (duration > 16) { // 60fps 기준
      console.warn(`Touch response time: ${duration.toFixed(2)}ms (>16ms)`)
    }
    
    this.frameId = null
  }
  
  stopMonitoring(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }
}