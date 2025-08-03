/**
 * Sentry와 Web Vitals 통합 서비스
 * 성능 지표를 Sentry로 전송하고 실시간 모니터링을 제공합니다.
 */

import * as Sentry from '@sentry/nextjs'

import { PerformanceReport, WebVitalsMetric } from './web-vitals'

// Sentry 성능 지표 전송 (확장된 RUM 버전)
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
    
    // RUM 확장 태그
    if (metric.sessionId) Sentry.setTag('rum.session_id', metric.sessionId)
    if (metric.navigationType) Sentry.setTag('rum.navigation_type', metric.navigationType)
    if (metric.effectiveConnectionType) Sentry.setTag('rum.connection_type', metric.effectiveConnectionType)
    if (metric.deviceMemory) Sentry.setTag('rum.device_memory', `${metric.deviceMemory}MB`)
    if (metric.hardwareConcurrency) Sentry.setTag('rum.cpu_cores', metric.hardwareConcurrency.toString())
    
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
          delta: metric.delta,
          sessionId: metric.sessionId,
          navigationType: metric.navigationType,
          connectionType: metric.effectiveConnectionType
        }
      })
    }
  })
}

// 성능 리포트를 Sentry로 전송 (확장된 RUM 버전)
export function sendPerformanceReportToSentry(report: PerformanceReport) {
  if (!Sentry.getClient()) {
    return
  }
  
  // 성능 리포트를 Sentry 이벤트로 전송
  Sentry.withScope(scope => {
    scope.setTag('report.type', 'performance_rum')
    scope.setTag('report.url', new URL(report.url).pathname)
    scope.setTag('report.session_id', report.sessionId)
    scope.setTag('report.page_load_id', report.pageLoadId)
    scope.setTag('report.device.connection', report.deviceInfo.connection)
    scope.setTag('report.device.viewport', `${report.deviceInfo.viewport.width}x${report.deviceInfo.viewport.height}`)
    scope.setTag('report.device.platform', report.deviceInfo.platform)
    scope.setTag('report.device.is_mobile', report.deviceInfo.isMobile.toString())
    scope.setTag('report.device.is_low_end', report.deviceInfo.isLowEndDevice.toString())
    
    // 디바이스 정보
    if (report.deviceInfo.memory) {
      scope.setTag('device.memory', `${report.deviceInfo.memory}MB`)
    }
    if (report.deviceInfo.cores) {
      scope.setTag('device.cores', report.deviceInfo.cores.toString())
    }
    if (report.deviceInfo.effectiveType) {
      scope.setTag('device.network_effective_type', report.deviceInfo.effectiveType)
    }
    if (report.deviceInfo.downlink) {
      scope.setTag('device.network_downlink', `${report.deviceInfo.downlink}Mbps`)
    }
    
    // 사용자 상호작용 지표
    scope.setTag('user.click_count', report.userInteractions.clickCount.toString())
    scope.setTag('user.scroll_depth', `${report.userInteractions.scrollDepth}%`)
    scope.setTag('user.time_on_page', `${Math.round(report.userInteractions.timeOnPage / 1000)}s`)
    scope.setTag('user.engagement_score', report.userInteractions.engagementScore.toString())
    
    // 성능 예산 상태
    scope.setTag('budget.within_budget', report.budgetStatus.isWithinBudget.toString())
    scope.setTag('budget.score', report.budgetStatus.budgetScore.toString())
    if (report.budgetStatus.exceededMetrics.length > 0) {
      scope.setTag('budget.exceeded_metrics', report.budgetStatus.exceededMetrics.join(','))
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
      if (typeof value === 'number' && value > 0) {
        const unit = key.includes('Size') ? 'byte' : 
                    key.includes('Score') || key.includes('Count') ? '' : 'millisecond'
        Sentry.setMeasurement(`custom.${key}`, value, unit)
      }
    })
    
    // Navigation Timing 데이터
    if (report.navigationTiming) {
      const nav = report.navigationTiming
      Sentry.setMeasurement('navigation.dns_lookup', nav.domainLookupEnd - nav.domainLookupStart, 'millisecond')
      Sentry.setMeasurement('navigation.tcp_connect', nav.connectEnd - nav.connectStart, 'millisecond')
      Sentry.setMeasurement('navigation.request_response', nav.responseEnd - nav.requestStart, 'millisecond')
      Sentry.setMeasurement('navigation.dom_processing', nav.domComplete - nav.responseEnd, 'millisecond')
    }
    
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
      Sentry.captureMessage(
        `Performance issues detected: ${poorMetrics.length} poor metrics (${poorMetrics.map(m => m!.name).join(', ')})`,
        'warning'
      )
    }
    
    // 예산 초과 알림
    if (!report.budgetStatus.isWithinBudget) {
      Sentry.captureMessage(
        `Performance budget exceeded: ${report.budgetStatus.exceededMetrics.join(', ')} (Score: ${report.budgetStatus.budgetScore}/100)`,
        'warning'
      )
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

// 성능 이상 감지 및 알림 (확장된 RUM 버전)
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
        scope.setTag('anomaly.type', 'performance_regression')
        scope.setTag('metric.name', metric.name)
        scope.setTag('anomaly.session_id', metric.sessionId || 'unknown')
        scope.setTag('anomaly.navigation_type', metric.navigationType || 'unknown')
        scope.setTag('anomaly.connection_type', metric.effectiveConnectionType || 'unknown')
        
        scope.setContext('anomaly', {
          metric: metric.name,
          currentValue: metric.value,
          historicalAverage: Math.round(average),
          standardDeviation: Math.round(stdDev),
          deviationFactor: Math.round(deviation / stdDev * 10) / 10,
          sessionId: metric.sessionId,
          navigationType: metric.navigationType,
          connectionType: metric.effectiveConnectionType,
          deviceMemory: metric.deviceMemory,
          cpuCores: metric.hardwareConcurrency
        })
        
        Sentry.captureMessage(
          `Performance anomaly detected: ${metric.name} = ${metric.value}${metric.name === 'CLS' ? '' : 'ms'} (avg: ${Math.round(average)}${metric.name === 'CLS' ? '' : 'ms'}, deviation: ${Math.round(deviation / stdDev * 10) / 10}σ)`,
          'warning'
        )
      })
    }
  })
}

// 실시간 성능 회귀 감지
export function detectPerformanceRegression(current: PerformanceReport, previous: PerformanceReport[]) {
  if (previous.length < 3) return
  
  const recentReports = previous.slice(0, 5) // 최근 5개 리포트
  
  // 각 메트릭의 평균 계산
  const metricAverages = {
    lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0
  }
  
  Object.keys(metricAverages).forEach(metricKey => {
    const values = recentReports
      .map(report => report.metrics[metricKey as keyof typeof report.metrics]?.value)
      .filter(Boolean) as number[]
    
    if (values.length > 0) {
      metricAverages[metricKey as keyof typeof metricAverages] = 
        values.reduce((sum, val) => sum + val, 0) / values.length
    }
  })
  
  // 현재 성능과 비교하여 회귀 감지
  const regressions: string[] = []
  Object.entries(current.metrics).forEach(([key, metric]) => {
    if (metric) {
      const avgKey = key.toLowerCase() as keyof typeof metricAverages
      const historicalAvg = metricAverages[avgKey]
      
      if (historicalAvg > 0) {
        const regressionPercent = ((metric.value - historicalAvg) / historicalAvg) * 100
        
        // 20% 이상 성능 저하 시 회귀로 판단
        if (regressionPercent > 20) {
          regressions.push(`${metric.name}: +${Math.round(regressionPercent)}% (${Math.round(historicalAvg)}ms → ${metric.value}ms)`)
        }
      }
    }
  })
  
  if (regressions.length > 0) {
    Sentry.withScope(scope => {
      scope.setLevel('error')
      scope.setTag('alert.type', 'performance_regression')
      scope.setTag('regression.count', regressions.length.toString())
      scope.setTag('regression.session_id', current.sessionId)
      
      scope.setContext('regression', {
        regressions,
        currentScore: current.customMetrics.performanceScore,
        sessionId: current.sessionId,
        url: current.url,
        deviceInfo: current.deviceInfo
      })
      
      Sentry.captureMessage(
        `Performance regression detected: ${regressions.join(', ')}`,
        'error'
      )
    })
  }
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

// 성능 알림 설정 (확장된 RUM 버전)
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
    
    // 메모리 압박 상황 모니터링
    if ('memory' in performance) {
      const checkMemoryPressure = () => {
        const memory = (performance as any).memory
        if (memory) {
          const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
          
          if (usagePercent > 90) {
            Sentry.withScope(scope => {
              scope.setTag('alert.type', 'memory_pressure')
              scope.setLevel('warning')
              
              scope.setContext('memory', {
                usedHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                totalHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                heapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
                usagePercent: Math.round(usagePercent)
              })
              
              Sentry.captureMessage(`High memory usage detected: ${Math.round(usagePercent)}%`, 'warning')
            })
          }
        }
      }
      
      // 30초마다 메모리 상태 확인
      setInterval(checkMemoryPressure, 30000)
    }
    
    // 네트워크 상태 변화 모니터링
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', () => {
          Sentry.addBreadcrumb({
            category: 'network',
            message: `Network change: ${connection.effectiveType} (${connection.downlink}Mbps)`,
            level: 'info',
            data: {
              effectiveType: connection.effectiveType,
              downlink: connection.downlink,
              rtt: connection.rtt,
              saveData: connection.saveData
            }
          })
        })
      }
    }
  }
}

const sentryIntegration = {
  sendMetrics: sendMetricsToSentry,
  sendReport: sendPerformanceReportToSentry,
  alertThreshold: alertPerformanceThreshold,
  trackSession: trackUserSession,
  detectAnomaly: detectPerformanceAnomaly,
  detectRegression: detectPerformanceRegression,
  generateDashboardUrl: generateSentryDashboardUrl,
  setupAlerts: setupPerformanceAlerts
}

export default sentryIntegration