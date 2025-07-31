'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

import sentryIntegration from '../lib/performance/sentry-integration'
import { 
  initWebVitals, 
  onPerformanceReport, 
  getCurrentMetrics, 
  collectCurrentMetrics,
  savePerformanceData,
  logPerformanceInfo,
  loadPerformanceHistory,
  WebVitalsMetric,
  PerformanceReport 
} from '../lib/performance/web-vitals'

export interface UsePerformanceMonitoringOptions {
  autoInit?: boolean
  enableLogging?: boolean
  saveToStorage?: boolean
  reportInterval?: number
  enableSentry?: boolean
  enableAnomalyDetection?: boolean
}

export interface PerformanceMonitoringState {
  metrics: WebVitalsMetric[]
  latestReport: PerformanceReport | null
  isInitialized: boolean
  isCollecting: boolean
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    autoInit = true,
    enableLogging = process.env.NODE_ENV === 'development',
    saveToStorage = true,
    reportInterval = 30000, // 30초
    enableSentry = process.env.NODE_ENV === 'production',
    enableAnomalyDetection = true
  } = options
  
  const [state, setState] = useState<PerformanceMonitoringState>({
    metrics: [],
    latestReport: null,
    isInitialized: false,
    isCollecting: false
  })
  
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const reportTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Web Vitals 초기화
  const initialize = useCallback(() => {
    if (state.isInitialized) return
    
    try {
      initWebVitals()
      
      // 성능 리포트 리스너 등록
      const unsubscribe = onPerformanceReport((report) => {
        setState(prev => ({
          ...prev,
          latestReport: report,
          metrics: Object.values(report.metrics).filter(Boolean) as WebVitalsMetric[]
        }))
        
        // 로깅 활성화 시 콘솔에 출력
        if (enableLogging) {
          logPerformanceInfo()
        }
        
        // 스토리지 저장 활성화 시 로컬에 저장
        if (saveToStorage) {
          savePerformanceData(report)
        }
        
        // Sentry 통합
        if (enableSentry) {
          const validMetrics = Object.values(report.metrics).filter(Boolean) as WebVitalsMetric[]
          
          // 메트릭을 Sentry로 전송
          sentryIntegration.sendMetrics(validMetrics)
          sentryIntegration.sendReport(report)
          
          // 임계값 위반 알림
          validMetrics.forEach(metric => {
            sentryIntegration.alertThreshold(metric)
          })
          
          // 이상 감지 (히스토리가 있는 경우)
          if (enableAnomalyDetection) {
            try {
              const history = loadPerformanceHistory()
              if (history.length > 0) {
                sentryIntegration.detectAnomaly(validMetrics, history)
              }
            } catch (error) {
              console.warn('Failed to detect performance anomaly:', error)
            }
          }
        }
      })
      
      unsubscribeRef.current = unsubscribe
      
      setState(prev => ({
        ...prev,
        isInitialized: true
      }))
      
      // Sentry 성능 알림 설정
      if (enableSentry) {
        sentryIntegration.setupAlerts()
      }
      
      console.log('✅ Performance monitoring initialized', { enableSentry, enableAnomalyDetection })
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error)
    }
  }, [state.isInitialized, enableLogging, saveToStorage, enableSentry, enableAnomalyDetection])
  
  // 현재 메트릭 업데이트
  const updateMetrics = useCallback(() => {
    const currentMetrics = getCurrentMetrics()
    setState(prev => ({
      ...prev,
      metrics: currentMetrics
    }))
  }, [])
  
  // 즉시 메트릭 수집
  const collectMetrics = useCallback(async () => {
    setState(prev => ({ ...prev, isCollecting: true }))
    
    try {
      const metrics = await collectCurrentMetrics()
      setState(prev => ({
        ...prev,
        metrics,
        isCollecting: false
      }))
      
      if (enableLogging) {
        console.log('📊 Collected metrics:', metrics)
      }
      
      return metrics
    } catch (error) {
      console.error('Failed to collect metrics:', error)
      setState(prev => ({ ...prev, isCollecting: false }))
      return []
    }
  }, [enableLogging])
  
  // 메트릭 초기화
  const resetMetrics = useCallback(() => {
    setState(prev => ({
      ...prev,
      metrics: [],
      latestReport: null
    }))
  }, [])
  
  // 성능 모니터링 활성화/비활성화
  const setEnabled = useCallback((enabled: boolean) => {
    if (enabled && !state.isInitialized) {
      initialize()
    } else if (!enabled && unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
      
      if (reportTimerRef.current) {
        clearInterval(reportTimerRef.current)
        reportTimerRef.current = null
      }
      
      setState(prev => ({
        ...prev,
        isInitialized: false
      }))
    }
  }, [state.isInitialized, initialize])
  
  // 자동 초기화
  useEffect(() => {
    if (autoInit && typeof window !== 'undefined') {
      // 페이지 로드 후 약간의 지연을 두고 초기화
      const timer = setTimeout(initialize, 1000)
      return () => clearTimeout(timer)
    }
  }, [autoInit, initialize])
  
  // 주기적 메트릭 업데이트
  useEffect(() => {
    if (state.isInitialized && reportInterval > 0) {
      reportTimerRef.current = setInterval(updateMetrics, reportInterval)
      
      return () => {
        if (reportTimerRef.current) {
          clearInterval(reportTimerRef.current)
          reportTimerRef.current = null
        }
      }
    }
  }, [state.isInitialized, reportInterval, updateMetrics])
  
  // 페이지 언로드 시 최종 메트릭 수집
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.isInitialized) {
        collectMetrics()
      }
    }
    
    // 페이지 가시성 변경 시에도 메트릭 수집
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && state.isInitialized) {
        collectMetrics()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [state.isInitialized, collectMetrics])
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      if (reportTimerRef.current) {
        clearInterval(reportTimerRef.current)
      }
    }
  }, [])
  
  return {
    // 상태
    ...state,
    
    // 액션
    initialize,
    collectMetrics,
    updateMetrics,
    resetMetrics,
    setEnabled,
    
    // 유틸리티
    hasMetrics: state.metrics.length > 0,
    metricsCount: state.metrics.length,
    lastReportTime: state.latestReport?.timestamp,
    
    // 분석 결과
    goodMetrics: state.metrics.filter(m => m.rating === 'good').length,
    poorMetrics: state.metrics.filter(m => m.rating === 'poor').length,
    averageValue: state.metrics.length > 0 
      ? Math.round(state.metrics.reduce((sum, m) => sum + m.value, 0) / state.metrics.length)
      : 0
  }
}

// 성능 지표 요약을 위한 전용 훅
export function usePerformanceSummary() {
  const { metrics, latestReport, isInitialized } = usePerformanceMonitoring({
    autoInit: true,
    enableLogging: false,
    saveToStorage: false,
    reportInterval: 10000 // 10초마다 업데이트
  })
  
  const summary = {
    score: 0,
    rating: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown',
    coreWebVitals: {
      lcp: metrics.find(m => m.name === 'LCP'),
      inp: metrics.find(m => m.name === 'INP'),
      cls: metrics.find(m => m.name === 'CLS')
    },
    loadingMetrics: {
      fcp: metrics.find(m => m.name === 'FCP'),
      ttfb: metrics.find(m => m.name === 'TTFB')
    }
  }
  
  // 점수 계산
  if (metrics.length > 0) {
    const goodCount = metrics.filter(m => m.rating === 'good').length
    summary.score = Math.round((goodCount / metrics.length) * 100)
    
    if (summary.score >= 90) summary.rating = 'good'
    else if (summary.score >= 70) summary.rating = 'needs-improvement'
    else summary.rating = 'poor'
  }
  
  return {
    ...summary,
    isInitialized,
    hasData: metrics.length > 0,
    lastUpdate: latestReport?.timestamp
  }
}

export default usePerformanceMonitoring