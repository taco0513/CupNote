/**
 * Web Vitals 모니터링 시스템
 * Core Web Vitals 및 기타 성능 지표를 수집하고 분석합니다.
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

// 성능 지표 타입 정의
export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  timestamp: number
  url: string
  userAgent: string
}

export interface PerformanceReport {
  timestamp: number
  url: string
  userAgent: string
  metrics: {
    cls: WebVitalsMetric | null
    inp: WebVitalsMetric | null
    fcp: WebVitalsMetric | null
    lcp: WebVitalsMetric | null
    ttfb: WebVitalsMetric | null
  }
  customMetrics: {
    domContentLoaded: number
    firstPaint: number
    domComplete: number
    loadComplete: number
  }
  deviceInfo: {
    viewport: { width: number; height: number }
    connection: string
    memory?: number
    cores?: number
  }
}

// 성능 지표 임계값 (Google 권장사항 기준)
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 }, // FID 대신 INP 사용
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
} as const

// 성능 지표 평가 함수
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// 디바이스 정보 수집
function getDeviceInfo() {
  const connection = (navigator as any).connection || {}
  const memory = (performance as any).memory
  const cores = navigator.hardwareConcurrency
  
  return {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    connection: connection.effectiveType || 'unknown',
    memory: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : undefined,
    cores: cores || undefined
  }
}

// 커스텀 성능 지표 수집
function getCustomMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')
  
  return {
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
    domComplete: navigation?.domComplete - navigation?.navigationStart || 0,
    loadComplete: navigation?.loadEventEnd - navigation?.navigationStart || 0
  }
}

// Web Vitals 메트릭을 표준화된 형태로 변환
function normalizeMetric(metric: any): WebVitalsMetric {
  return {
    name: metric.name,
    value: Math.round(metric.value),
    rating: getRating(metric.name, metric.value),
    delta: Math.round(metric.delta),
    id: metric.id,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }
}

// 성능 데이터 저장소
class PerformanceStore {
  private metrics: Map<string, WebVitalsMetric> = new Map()
  private listeners: Array<(report: PerformanceReport) => void> = []
  private reportTimer: NodeJS.Timeout | null = null
  
  addMetric(metric: WebVitalsMetric) {
    this.metrics.set(metric.name, metric)
    
    // 5초 후에 리포트 생성 (디바운싱)
    if (this.reportTimer) {
      clearTimeout(this.reportTimer)
    }
    
    this.reportTimer = setTimeout(() => {
      this.generateReport()
    }, 5000)
  }
  
  private generateReport() {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: {
        cls: this.metrics.get('CLS') || null,
        fid: this.metrics.get('FID') || null,
        fcp: this.metrics.get('FCP') || null,
        lcp: this.metrics.get('LCP') || null,
        ttfb: this.metrics.get('TTFB') || null
      },
      customMetrics: getCustomMetrics(),
      deviceInfo: getDeviceInfo()
    }
    
    // 모든 리스너에게 리포트 전송
    this.listeners.forEach(listener => {
      try {
        listener(report)
      } catch (error) {
        console.error('Performance report listener error:', error)
      }
    })
  }
  
  onReport(callback: (report: PerformanceReport) => void) {
    this.listeners.push(callback)
    
    // 구독 해제 함수 반환
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
  
  getMetrics() {
    return Array.from(this.metrics.values())
  }
  
  clear() {
    this.metrics.clear()
    if (this.reportTimer) {
      clearTimeout(this.reportTimer)
      this.reportTimer = null
    }
  }
}

// 글로벌 성능 저장소
const performanceStore = new PerformanceStore()

// Web Vitals 초기화 및 모니터링 시작
export function initWebVitals() {
  // Core Web Vitals 모니터링
  onCLS((metric) => {
    performanceStore.addMetric(normalizeMetric(metric))
  })
  
  onINP((metric) => {
    performanceStore.addMetric(normalizeMetric(metric))
  })
  
  onFCP((metric) => {
    performanceStore.addMetric(normalizeMetric(metric))
  })
  
  onLCP((metric) => {
    performanceStore.addMetric(normalizeMetric(metric))
  })
  
  onTTFB((metric) => {
    performanceStore.addMetric(normalizeMetric(metric))
  })
  
  console.log('✅ Web Vitals monitoring initialized')
}

// 즉시 현재 지표 수집 (페이지 이탈 시 등)
export function collectCurrentMetrics(): Promise<WebVitalsMetric[]> {
  return new Promise((resolve) => {
    const metrics: WebVitalsMetric[] = []
    
    // 현재까지의 지표들을 즉시 수집
    onCLS((metric) => metrics.push(normalizeMetric(metric)), { reportAllChanges: true })
    onINP((metric) => metrics.push(normalizeMetric(metric)), { reportAllChanges: true })
    onFCP((metric) => metrics.push(normalizeMetric(metric)), { reportAllChanges: true })
    onLCP((metric) => metrics.push(normalizeMetric(metric)), { reportAllChanges: true })
    onTTFB((metric) => metrics.push(normalizeMetric(metric)), { reportAllChanges: true })
    
    // 약간의 지연 후 결과 반환
    setTimeout(() => resolve(metrics), 100)
  })
}

// 성능 리포트 구독
export function onPerformanceReport(callback: (report: PerformanceReport) => void) {
  return performanceStore.onReport(callback)
}

// 현재 수집된 지표 반환
export function getCurrentMetrics(): WebVitalsMetric[] {
  return performanceStore.getMetrics()
}

// 성능 지표 분석 함수들
export function analyzePerformance(metrics: WebVitalsMetric[]) {
  const analysis = {
    overall: 'good' as 'good' | 'needs-improvement' | 'poor',
    issues: [] as string[],
    recommendations: [] as string[],
    score: 0
  }
  
  let goodCount = 0
  let totalCount = 0
  
  metrics.forEach(metric => {
    totalCount++
    
    if (metric.rating === 'good') {
      goodCount++
    } else if (metric.rating === 'poor') {
      analysis.issues.push(`${metric.name}이 ${metric.value}ms로 기준치를 초과했습니다`)
      
      // 개선 권장사항
      switch (metric.name) {
        case 'LCP':
          analysis.recommendations.push('이미지 최적화 및 지연 로딩 개선')
          analysis.recommendations.push('서버 응답 시간 최적화')
          break
        case 'INP':
          analysis.recommendations.push('JavaScript 실행 시간 단축')
          analysis.recommendations.push('메인 스레드 블로킹 최소화')
          break
        case 'CLS':
          analysis.recommendations.push('이미지와 요소에 명시적 크기 지정')
          analysis.recommendations.push('동적 콘텐츠 삽입 최소화')
          break
        case 'FCP':
          analysis.recommendations.push('중요 리소스 사전 로딩')
          analysis.recommendations.push('CSS 최적화')
          break
        case 'TTFB':
          analysis.recommendations.push('서버 응답 시간 개선')
          analysis.recommendations.push('CDN 사용 고려')
          break
      }
    }
  })
  
  // 전체 점수 계산 (0-100)
  analysis.score = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 100
  
  // 전체 평가
  if (analysis.score >= 90) analysis.overall = 'good'
  else if (analysis.score >= 70) analysis.overall = 'needs-improvement'
  else analysis.overall = 'poor'
  
  return analysis
}

// 성능 지표 LocalStorage 저장
export function savePerformanceData(report: PerformanceReport) {
  try {
    const key = `perf_${Date.now()}`
    const data = JSON.stringify(report)
    
    // 최대 10개의 최근 리포트만 유지
    const existingKeys = Object.keys(localStorage)
      .filter(k => k.startsWith('perf_'))
      .sort()
    
    if (existingKeys.length >= 10) {
      // 가장 오래된 것들 삭제
      existingKeys.slice(0, existingKeys.length - 9).forEach(k => {
        localStorage.removeItem(k)
      })
    }
    
    localStorage.setItem(key, data)
  } catch (error) {
    console.warn('Failed to save performance data:', error)
  }
}

// 저장된 성능 데이터 불러오기
export function loadPerformanceHistory(): PerformanceReport[] {
  try {
    const reports: PerformanceReport[] = []
    const keys = Object.keys(localStorage)
      .filter(k => k.startsWith('perf_'))
      .sort()
    
    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          reports.push(JSON.parse(data))
        }
      } catch (error) {
        console.warn(`Failed to parse performance data for ${key}:`, error)
        localStorage.removeItem(key) // 손상된 데이터 제거
      }
    })
    
    return reports.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.warn('Failed to load performance history:', error)
    return []
  }
}

// 개발 모드에서 성능 모니터링 정보 출력
export function logPerformanceInfo() {
  if (process.env.NODE_ENV === 'development') {
    const metrics = getCurrentMetrics()
    if (metrics.length > 0) {
      console.group('🚀 Performance Metrics')
      metrics.forEach(metric => {
        const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
        console.log(`${emoji} ${metric.name}: ${metric.value}ms (${metric.rating})`)
      })
      console.groupEnd()
    }
  }
}

const webVitals = {
  init: initWebVitals,
  collect: collectCurrentMetrics,
  onReport: onPerformanceReport,
  getCurrent: getCurrentMetrics,
  analyze: analyzePerformance,
  save: savePerformanceData,
  loadHistory: loadPerformanceHistory,
  log: logPerformanceInfo
}

export default webVitals