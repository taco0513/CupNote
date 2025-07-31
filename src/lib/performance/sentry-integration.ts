/**
 * Sentry와 Web Vitals 통합 서비스
 * 성능 지표를 Sentry로 전송하고 실시간 모니터링을 제공합니다.
 */

import * as Sentry from '@sentry/nextjs'

import { PerformanceReport, WebVitalsMetric } from './web-vitals'

// Sentry 성능 지표 전송
export function sendMetricsToSentry(metrics: WebVitalsMetric[]) {
  if (!Sentry.getClient()) {
    console.warn('Sentry not initialized, skipping metrics')
    return
  }
  
  metrics.forEach(metric => {
    // Core Web Vitals를 Sentry 메트릭으로 전송
    Sentry.setMeasurement(metric.name, metric.value, metric.name === 'CLS' ? '' : 'millisecond')
    
    // Web Vitals 점수를 태그로 추가
    Sentry.setTag(`webvital.${metric.name.toLowerCase()}.rating`, metric.rating)
    
    // 성능 지표별 커스텀 이벤트 생성
    if (metric.rating === 'poor') {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `Poor ${metric.name}: ${metric.value}${metric.name === 'CLS' ? '' : 'ms'}`,
        level: 'warning',
        data: {
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta
        }
      })
    }
  })
}

// 성능 리포트를 Sentry로 전송
export function sendPerformanceReportToSentry(report: PerformanceReport) {
  if (!Sentry.getClient()) {
    return
  }
  
  // 성능 리포트를 Sentry 이벤트로 전송
  Sentry.withScope(scope => {
    scope.setTag('report.type', 'performance')
    scope.setTag('report.url', new URL(report.url).pathname)
    scope.setTag('report.device.connection', report.deviceInfo.connection)
    scope.setTag('report.device.viewport', `${report.deviceInfo.viewport.width}x${report.deviceInfo.viewport.height}`)
    
    // 디바이스 정보
    if (report.deviceInfo.memory) {
      scope.setTag('device.memory', `${report.deviceInfo.memory}MB`)
    }
    if (report.deviceInfo.cores) {
      scope.setTag('device.cores', report.deviceInfo.cores.toString())
    }
    
    // 각 메트릭을 측정값으로 설정
    Object.entries(report.metrics).forEach(([key, metric]) => {
      if (metric) {
        Sentry.setMeasurement(`webvital.${key.toLowerCase()}`, metric.value, metric.name === 'CLS' ? '' : 'millisecond')
        scope.setTag(`webvital.${key.toLowerCase()}.rating`, metric.rating)
      }
    })
    
    // 커스텀 메트릭도 전송
    Object.entries(report.customMetrics).forEach(([key, value]) => {
      if (value > 0) {
        Sentry.setMeasurement(`custom.${key}`, value, 'millisecond')
      }
    })
    
    // 성능 점수 계산
    const validMetrics = Object.values(report.metrics).filter(Boolean)
    if (validMetrics.length > 0) {
      const goodCount = validMetrics.filter(m => m!.rating === 'good').length
      const performanceScore = Math.round((goodCount / validMetrics.length) * 100)
      
      Sentry.setMeasurement('performance.score', performanceScore, '')
      scope.setTag('performance.score.rating', performanceScore >= 90 ? 'good' : performanceScore >= 70 ? 'needs-improvement' : 'poor')
    }
    
    // 성능 이슈가 발견된 경우 별도 이벤트 생성
    const poorMetrics = validMetrics.filter(m => m!.rating === 'poor')
    if (poorMetrics.length > 0) {
      Sentry.captureMessage(`Performance issues detected: ${poorMetrics.length} poor metrics`, 'warning')
    }
  })
}

// 성능 임계값 위반 알림
export function alertPerformanceThreshold(metric: WebVitalsMetric) {
  if (metric.rating !== 'poor') return
  
  Sentry.withScope(scope => {
    scope.setLevel('warning')
    scope.setTag('alert.type', 'performance_threshold')
    scope.setTag('metric.name', metric.name)
    scope.setTag('metric.rating', metric.rating)
    
    scope.setContext('metric', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      url: metric.url,
      timestamp: metric.timestamp
    })
    
    const thresholds = {
      LCP: 2500,
      FID: 100,
      CLS: 0.1,
      FCP: 1800,
      TTFB: 800
    }
    
    const threshold = thresholds[metric.name as keyof typeof thresholds]
    const message = `${metric.name} threshold exceeded: ${metric.value}${metric.name === 'CLS' ? '' : 'ms'} (threshold: ${threshold}${metric.name === 'CLS' ? '' : 'ms'})`
    
    Sentry.captureMessage(message, 'warning')
  })
}

// 사용자 세션 성능 추적
export function trackUserSession(sessionData: {
  userId?: string
  sessionId: string
  startTime: number
  pageViews: number
  interactions: number
}) {
  Sentry.withScope(scope => {
    scope.setTag('session.tracking', 'performance')
    scope.setTag('session.id', sessionData.sessionId)
    
    if (sessionData.userId) {
      scope.setUser({ id: sessionData.userId })
    }
    
    scope.setContext('session', {
      sessionId: sessionData.sessionId,
      duration: Date.now() - sessionData.startTime,
      pageViews: sessionData.pageViews,
      interactions: sessionData.interactions
    })
    
    // 세션 지속 시간이 매우 짧거나 긴 경우 별도 추적
    const duration = Date.now() - sessionData.startTime
    if (duration < 5000) { // 5초 미만
      Sentry.addBreadcrumb({
        category: 'session',
        message: 'Very short session detected',
        level: 'info',
        data: { duration, pageViews: sessionData.pageViews }
      })
    } else if (duration > 1800000) { // 30분 이상
      Sentry.addBreadcrumb({
        category: 'session',
        message: 'Long session detected',
        level: 'info',
        data: { duration, pageViews: sessionData.pageViews, interactions: sessionData.interactions }
      })
    }
  })
}

// 성능 이상 감지 및 알림
export function detectPerformanceAnomaly(currentMetrics: WebVitalsMetric[], historicalData: PerformanceReport[]) {
  if (historicalData.length < 5) return // 충분한 데이터가 없으면 건너뛰기
  
  currentMetrics.forEach(metric => {
    // 같은 메트릭의 과거 데이터 수집
    const historicalValues = historicalData
      .map(report => report.metrics[metric.name.toLowerCase() as keyof typeof report.metrics])
      .filter(Boolean)
      .map(m => m!.value)
    
    if (historicalValues.length < 3) return
    
    // 평균과 표준편차 계산
    const average = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / historicalValues.length
    const stdDev = Math.sqrt(variance)
    
    // 현재 값이 2 표준편차를 벗어나면 이상치로 판단
    const deviation = Math.abs(metric.value - average)
    if (deviation > (2 * stdDev) && stdDev > 0) {
      Sentry.withScope(scope => {
        scope.setLevel('warning')
        scope.setTag('anomaly.type', 'performance')
        scope.setTag('metric.name', metric.name)
        
        scope.setContext('anomaly', {
          metric: metric.name,
          currentValue: metric.value,
          historicalAverage: Math.round(average),
          standardDeviation: Math.round(stdDev),
          deviationFactor: Math.round(deviation / stdDev * 10) / 10
        })
        
        Sentry.captureMessage(
          `Performance anomaly detected: ${metric.name} = ${metric.value}${metric.name === 'CLS' ? '' : 'ms'} (avg: ${Math.round(average)}${metric.name === 'CLS' ? '' : 'ms'}, deviation: ${Math.round(deviation / stdDev * 10) / 10}σ)`,
          'warning'
        )
      })
    }
  })
}

// Sentry에서 성능 대시보드 링크 생성
export function generateSentryDashboardUrl(projectId?: string): string | null {
  if (!projectId) return null
  
  const baseUrl = 'https://sentry.io/organizations/your-org/projects/cupnote'
  const params = new URLSearchParams({
    statsPeriod: '7d',
    query: 'transaction.op:pageload OR transaction.op:navigation'
  })
  
  return `${baseUrl}/performance/?${params.toString()}`
}

// 성능 알림 설정
export function setupPerformanceAlerts() {
  // 개발 환경에서는 알림 비활성화
  if (process.env.NODE_ENV === 'development') {
    return
  }
  
  // 글로벌 에러 핸들러 설정
  if (typeof window !== 'undefined') {
    // 처리되지 않은 프로미스 거부 추적
    window.addEventListener('unhandledrejection', (event) => {
      Sentry.withScope(scope => {
        scope.setTag('error.type', 'unhandled_promise_rejection')
        scope.setLevel('error')
        
        Sentry.captureException(event.reason)
      })
    })
    
    // 리소스 로딩 에러 추적
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        Sentry.withScope(scope => {
          scope.setTag('error.type', 'resource_load_error')
          scope.setLevel('warning')
          
          scope.setContext('resource', {
            tagName: (event.target as Element).tagName,
            src: (event.target as HTMLImageElement | HTMLScriptElement).src,
            href: (event.target as HTMLLinkElement).href
          })
          
          Sentry.captureMessage(`Resource load failed: ${(event.target as Element).tagName}`, 'warning')
        })
      }
    }, true)
  }
}

const sentryIntegration = {
  sendMetrics: sendMetricsToSentry,
  sendReport: sendPerformanceReportToSentry,
  alertThreshold: alertPerformanceThreshold,
  trackSession: trackUserSession,
  detectAnomaly: detectPerformanceAnomaly,
  generateDashboardUrl: generateSentryDashboardUrl,
  setupAlerts: setupPerformanceAlerts
}

export default sentryIntegration