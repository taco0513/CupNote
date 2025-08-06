'use client'

import { useEffect } from 'react'

import usePerformanceMonitoring from '../../hooks/usePerformanceMonitoring'
import bundleMonitor from '../../lib/performance/bundle-monitor'

/**
 * Enhanced RUM (Real User Monitoring) 초기화 컴포넌트
 * Web Vitals, 번들 성능, 사용자 상호작용을 포함한 종합적인 성능 모니터링을 시작합니다.
 */
export default function WebVitalsInitializer() {
  const { initialize, isInitialized } = usePerformanceMonitoring({
    autoInit: false, // 수동으로 초기화
    enableLogging: process.env.NODE_ENV === 'development',
    saveToStorage: true,
    reportInterval: 30000 // 30초마다 업데이트
  })
  
  useEffect(() => {
    // 페이지 로드 완료 후 Enhanced RUM 초기화
    if (typeof window !== 'undefined' && !isInitialized) {
      // 약간의 지연을 두고 초기화 (다른 중요한 스크립트들이 먼저 로드되도록)
      const timer = setTimeout(() => {
        // Web Vitals 및 RUM 모니터링 초기화
        initialize()
        
        // 번들 성능 모니터링 초기화
        try {
          const monitor = bundleMonitor.initBundleMonitoring()
          monitor.start()
          
          if (process.env.NODE_ENV === 'development') {
          }
        } catch (error) {
          console.warn('Failed to initialize bundle monitoring:', error)
        }
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [initialize, isInitialized])
  
  // 개발 모드에서만 초기화 상태 표시
  if (process.env.NODE_ENV === 'development' && isInitialized) {
  }
  
  // 이 컴포넌트는 UI를 렌더링하지 않습니다
  return null
}