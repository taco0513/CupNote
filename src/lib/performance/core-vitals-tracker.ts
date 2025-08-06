/**
 * Core Web Vitals Tracker - Enhanced Performance Monitoring
 * 
 * 구글 Core Web Vitals 및 커스텀 성능 지표를 종합적으로 추적
 * Real User Monitoring (RUM) 데이터 수집
 * 
 * @version 2.0.0  
 * @since 2025-08-06
 */

// ========================================
// Core Web Vitals 타입 정의
// ========================================

export interface VitalMetric {
  name: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  timestamp: number
  id: string
  navigationType: NavigationType
  url: string
}

export interface CustomMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

export interface PerformanceReport {
  session_id: string
  url: string
  user_agent: string
  connection_type?: string
  device_memory?: number
  vitals: VitalMetric[]
  custom_metrics: CustomMetric[]
  errors: PerformanceError[]
  collected_at: string
}

export interface PerformanceError {
  message: string
  source?: string
  line_number?: number
  stack?: string
  timestamp: number
}

export type NavigationType = 'navigate' | 'reload' | 'back_forward' | 'prerender'

// ========================================
// Core Web Vitals 임계값
// ========================================

export const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const

// ========================================
// Core Vitals Tracker 클래스
// ========================================

export class CoreVitalsTracker {
  private static instance: CoreVitalsTracker
  private sessionId: string
  private vitals: VitalMetric[] = []
  private customMetrics: CustomMetric[] = []
  private errors: PerformanceError[] = []
  private observers: PerformanceObserver[] = []
  private isInitialized: boolean = false

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.initialize()
  }

  public static getInstance(): CoreVitalsTracker {
    if (!CoreVitalsTracker.instance) {
      CoreVitalsTracker.instance = new CoreVitalsTracker()
    }
    return CoreVitalsTracker.instance
  }

  // ========================================
  // 초기화 및 관찰자 설정
  // ========================================

  private initialize() {
    if (this.isInitialized || typeof window === 'undefined') return

    try {
      this.setupCLSObserver()
      this.setupLCPObserver()
      this.setupFCPObserver()
      this.setupINPObserver()
      this.setupTTFBObserver()
      this.setupErrorTracking()
      this.setupPageVisibilityHandler()
      
      this.isInitialized = true
      console.log('🔍 Core Vitals Tracker initialized')

    } catch (error) {
      console.error('Failed to initialize Core Vitals Tracker:', error)
    }
  }

  private setupCLSObserver() {
    if (!('PerformanceObserver' in window)) return

    let clsValue = 0
    let clsEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as any
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value
          clsEntries.push(entry)
        }
      }
    })

    observer.observe({ entryTypes: ['layout-shift'] })
    this.observers.push(observer)

    // CLS 최종 값 보고 (페이지 종료 시)
    const reportCLS = () => {
      if (clsValue > 0) {
        this.recordVital({
          name: 'CLS',
          value: clsValue,
          delta: clsValue,
          id: this.generateId(),
          timestamp: Date.now(),
          navigationType: this.getNavigationType(),
          url: window.location.href,
          rating: this.getRating('CLS', clsValue)
        })
      }
    }

    window.addEventListener('beforeunload', reportCLS)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') reportCLS()
    })
  }

  private setupLCPObserver() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      if (lastEntry) {
        this.recordVital({
          name: 'LCP',
          value: lastEntry.startTime,
          delta: lastEntry.startTime,
          id: this.generateId(),
          timestamp: Date.now(),
          navigationType: this.getNavigationType(),
          url: window.location.href,
          rating: this.getRating('LCP', lastEntry.startTime)
        })
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.push(observer)
  }

  private setupFCPObserver() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordVital({
            name: 'FCP',
            value: entry.startTime,
            delta: entry.startTime,
            id: this.generateId(),
            timestamp: Date.now(),
            navigationType: this.getNavigationType(),
            url: window.location.href,
            rating: this.getRating('FCP', entry.startTime)
          })
        }
      }
    })

    observer.observe({ entryTypes: ['paint'] })
    this.observers.push(observer)
  }

  private setupINPObserver() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as any
        const inp = eventEntry.processingStart - eventEntry.startTime
        
        this.recordVital({
          name: 'INP',
          value: inp,
          delta: inp,
          id: this.generateId(),
          timestamp: Date.now(),
          navigationType: this.getNavigationType(),
          url: window.location.href,
          rating: this.getRating('INP', inp)
        })
      }
    })

    observer.observe({ entryTypes: ['first-input'] })
    this.observers.push(observer)
  }

  private setupTTFBObserver() {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.fetchStart
      
      this.recordVital({
        name: 'TTFB',
        value: ttfb,
        delta: ttfb,
        id: this.generateId(),
        timestamp: Date.now(),
        navigationType: this.getNavigationType(),
        url: window.location.href,
        rating: this.getRating('TTFB', ttfb)
      })
    }
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        source: event.filename,
        line_number: event.lineno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })
  }

  private setupPageVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendReport()
      }
    })

    window.addEventListener('beforeunload', () => {
      this.sendReport()
    })
  }

  // ========================================
  // 메트릭 기록 및 분석
  // ========================================

  private recordVital(vital: VitalMetric) {
    this.vitals.push(vital)
    
    // 실시간 로깅 (개발 모드)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${vital.name}:`, {
        value: `${vital.value.toFixed(2)}ms`,
        rating: vital.rating,
        url: vital.url
      })
    }

    // 임계값 초과 시 경고
    if (vital.rating === 'poor') {
      console.warn(`⚠️ Poor ${vital.name} performance detected:`, vital.value)
    }
  }

  public recordCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: CustomMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }

    this.customMetrics.push(metric)

    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Custom metric ${name}:`, value, metadata)
    }
  }

  private recordError(error: PerformanceError) {
    this.errors.push(error)
    
    if (process.env.NODE_ENV === 'development') {
      console.error('🐛 Performance error:', error)
    }
  }

  // ========================================
  // 유틸리티 메서드
  // ========================================

  private getRating(metric: keyof typeof VITALS_THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = VITALS_THRESHOLDS[metric]
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }

  private getNavigationType(): NavigationType {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return (navigationEntry?.type as NavigationType) || 'navigate'
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // ========================================
  // 데이터 수집 및 전송
  // ========================================

  public getReport(): PerformanceReport {
    return {
      session_id: this.sessionId,
      url: window.location.href,
      user_agent: navigator.userAgent,
      connection_type: (navigator as any).connection?.effectiveType,
      device_memory: (navigator as any).deviceMemory,
      vitals: [...this.vitals],
      custom_metrics: [...this.customMetrics],
      errors: [...this.errors],
      collected_at: new Date().toISOString()
    }
  }

  public async sendReport(): Promise<void> {
    if (this.vitals.length === 0 && this.customMetrics.length === 0) return

    const report = this.getReport()

    try {
      // Beacon API를 사용한 안정적인 전송
      if ('sendBeacon' in navigator) {
        const success = navigator.sendBeacon(
          '/api/performance/vitals',
          JSON.stringify(report)
        )
        
        if (success && process.env.NODE_ENV === 'development') {
          console.log('📤 Performance report sent via Beacon API')
        }
      } else {
        // 폴백: fetch API
        await fetch('/api/performance/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
          keepalive: true
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('📤 Performance report sent via Fetch API')
        }
      }

      // 전송 후 데이터 정리
      this.vitals = []
      this.customMetrics = []
      this.errors = []

    } catch (error) {
      console.error('Failed to send performance report:', error)
    }
  }

  // ========================================
  // 성능 분석 메서드
  // ========================================

  public getPerformanceScore(): number {
    if (this.vitals.length === 0) return 0

    const scores = this.vitals.map(vital => {
      switch (vital.rating) {
        case 'good': return 100
        case 'needs-improvement': return 60
        case 'poor': return 0
        default: return 50
      }
    })

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }

  public getVitalsByRating() {
    return {
      good: this.vitals.filter(v => v.rating === 'good').length,
      needs_improvement: this.vitals.filter(v => v.rating === 'needs-improvement').length,
      poor: this.vitals.filter(v => v.rating === 'poor').length
    }
  }

  // ========================================
  // 정리 메서드
  // ========================================

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.vitals = []
    this.customMetrics = []
    this.errors = []
    this.isInitialized = false
  }
}

// ========================================
// 편의 함수들
// ========================================

export const coreVitalsTracker = CoreVitalsTracker.getInstance()

// 커스텀 메트릭 기록 헬퍼
export function trackCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
  coreVitalsTracker.recordCustomMetric(name, value, metadata)
}

// 성능 측정 데코레이터
export function measurePerformance<T extends (...args: any[]) => any>(
  target: T,
  name?: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const result = target(...args)
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now()
        trackCustomMetric(name || target.name || 'async_function', end - start)
      })
    } else {
      const end = performance.now()
      trackCustomMetric(name || target.name || 'function', end - start)
      return result
    }
  }) as T
}

export default CoreVitalsTracker