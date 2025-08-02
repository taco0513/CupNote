'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Zap, Activity, Clock, Smartphone, Wifi } from 'lucide-react'

// 성능 메트릭 인터페이스
interface PerformanceMetrics {
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay  
  cls: number // Cumulative Layout Shift
  fcp: number // First Contentful Paint
  ttfb: number // Time to First Byte
  memoryUsage?: number
  connectionType?: string
}

interface PerformanceOptimizerProps {
  enableMonitoring?: boolean
  showMetrics?: boolean
  onOptimize?: (metrics: PerformanceMetrics) => void
}

export default function PerformanceOptimizer({ 
  enableMonitoring = true,
  showMetrics = false,
  onOptimize
}: PerformanceOptimizerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [performanceScore, setPerformanceScore] = useState<number>(0)

  // 성능 메트릭 수집
  const collectMetrics = useCallback(() => {
    if (!enableMonitoring || typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const newMetrics: Partial<PerformanceMetrics> = {}

      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            newMetrics.lcp = entry.startTime
            break
          case 'first-input':
            newMetrics.fid = (entry as any).processingStart - entry.startTime
            break
          case 'layout-shift':
            if (!newMetrics.cls) newMetrics.cls = 0
            newMetrics.cls += (entry as any).value
            break
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              newMetrics.fcp = entry.startTime
            }
            break
          case 'navigation':
            newMetrics.ttfb = (entry as any).responseStart
            break
        }
      })

      // 메모리 사용량 (Chrome에서만)
      if ('memory' in performance) {
        newMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
      }

      // 네트워크 연결 타입
      if ('connection' in navigator) {
        newMetrics.connectionType = (navigator as any).connection.effectiveType
      }

      setMetrics(prev => ({ ...prev, ...newMetrics } as PerformanceMetrics))
    })

    // 다양한 성능 메트릭 관찰
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] })
    } catch (e) {
      console.warn('Performance observer not supported for some metrics')
    }

    return () => observer.disconnect()
  }, [enableMonitoring])

  // 성능 점수 계산
  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics) => {
    if (!metrics) return 0

    // Google의 Core Web Vitals 기준
    const lcpScore = metrics.lcp <= 2500 ? 100 : metrics.lcp <= 4000 ? 50 : 0
    const fidScore = metrics.fid <= 100 ? 100 : metrics.fid <= 300 ? 50 : 0
    const clsScore = metrics.cls <= 0.1 ? 100 : metrics.cls <= 0.25 ? 50 : 0
    const fcpScore = metrics.fcp <= 1800 ? 100 : metrics.fcp <= 3000 ? 50 : 0

    return Math.round((lcpScore + fidScore + clsScore + fcpScore) / 4)
  }, [])

  // 성능 최적화 수행
  const performOptimizations = useCallback(async () => {
    if (!metrics) return

    setIsOptimizing(true)

    try {
      // 1. 이미지 지연 로딩 강화
      const images = document.querySelectorAll('img:not([loading])')
      images.forEach(img => {
        img.setAttribute('loading', 'lazy')
      })

      // 2. 미사용 CSS 제거 표시
      const styleSheets = Array.from(document.styleSheets)
      let unusedRules = 0
      
      styleSheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach(rule => {
              if (rule instanceof CSSStyleRule) {
                try {
                  if (!document.querySelector(rule.selectorText)) {
                    unusedRules++
                  }
                } catch (e) {
                  // 복잡한 선택자는 건너뛰기
                }
              }
            })
          }
        } catch (e) {
          // CORS 제한으로 접근할 수 없는 스타일시트
        }
      })

      // 3. 스크롤 성능 개선
      const scrollElements = document.querySelectorAll('[style*="overflow"]')
      scrollElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'scroll-position'
      })

      // 4. 폰트 로딩 최적화
      if (document.fonts) {
        await document.fonts.ready
      }

      // 5. 리소스 힌트 추가
      const head = document.head
      
      // DNS prefetch for external resources
      const externalLinks = Array.from(document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])'))
      const domains = new Set(externalLinks.map(link => new URL((link as HTMLAnchorElement).href).hostname))
      
      domains.forEach(domain => {
        if (!document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`)) {
          const link = document.createElement('link')
          link.rel = 'dns-prefetch'
          link.href = `//${domain}`
          head.appendChild(link)
        }
      })

      // 최적화 완료 후 메트릭 재수집
      setTimeout(() => {
        collectMetrics()
        setIsOptimizing(false)
        
        if (onOptimize && metrics) {
          onOptimize(metrics)
        }
      }, 1000)

    } catch (error) {
      console.error('Performance optimization failed:', error)
      setIsOptimizing(false)
    }
  }, [metrics, collectMetrics, onOptimize])

  // 컴포넌트 마운트 시 메트릭 수집 시작
  useEffect(() => {
    if (enableMonitoring) {
      const cleanup = collectMetrics()
      return cleanup
    }
  }, [collectMetrics, enableMonitoring])

  // 메트릭 변경 시 성능 점수 업데이트
  useEffect(() => {
    if (metrics) {
      const score = calculatePerformanceScore(metrics)
      setPerformanceScore(score)
    }
  }, [metrics, calculatePerformanceScore])

  // 자동 최적화 (성능 점수가 낮을 때)
  useEffect(() => {
    if (performanceScore > 0 && performanceScore < 70 && !isOptimizing) {
      console.log('Low performance detected, applying optimizations...')
      performOptimizations()
    }
  }, [performanceScore, isOptimizing, performOptimizations])

  if (!showMetrics || !metrics) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900">성능 모니터</h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          performanceScore >= 90 ? 'bg-green-100 text-green-800' :
          performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {performanceScore}/100
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <MetricRow 
          label="LCP" 
          value={`${Math.round(metrics.lcp)}ms`}
          icon={<Clock className="w-4 h-4" />}
          status={metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor'}
        />
        
        <MetricRow 
          label="FID" 
          value={`${Math.round(metrics.fid)}ms`}
          icon={<Zap className="w-4 h-4" />}
          status={metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor'}
        />
        
        <MetricRow 
          label="CLS" 
          value={metrics.cls.toFixed(3)}
          icon={<Smartphone className="w-4 h-4" />}
          status={metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor'}
        />

        {metrics.memoryUsage && (
          <MetricRow 
            label="메모리" 
            value={`${Math.round(metrics.memoryUsage)}MB`}
            icon={<Activity className="w-4 h-4" />}
            status={metrics.memoryUsage <= 50 ? 'good' : metrics.memoryUsage <= 100 ? 'needs-improvement' : 'poor'}
          />
        )}

        {metrics.connectionType && (
          <MetricRow 
            label="연결" 
            value={metrics.connectionType}
            icon={<Wifi className="w-4 h-4" />}
            status="good"
          />
        )}
      </div>

      <button
        onClick={performOptimizations}
        disabled={isOptimizing || performanceScore >= 90}
        className={`w-full mt-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          isOptimizing ? 
            'bg-gray-100 text-gray-500 cursor-not-allowed' :
          performanceScore >= 90 ?
            'bg-green-100 text-green-700 cursor-default' :
            'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isOptimizing ? '최적화 중...' : 
         performanceScore >= 90 ? '✓ 최적화됨' : 
         '성능 최적화'}
      </button>
    </div>
  )
}

// 메트릭 행 컴포넌트
interface MetricRowProps {
  label: string
  value: string
  icon: React.ReactNode
  status: 'good' | 'needs-improvement' | 'poor'
}

const MetricRow = memo(function MetricRow({ label, value, icon, status }: MetricRowProps) {
  const statusColors = {
    good: 'text-green-600',
    'needs-improvement': 'text-yellow-600',
    poor: 'text-red-600'
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={statusColors[status]}>{icon}</span>
        <span className="text-gray-700">{label}</span>
      </div>
      <span className={`font-medium ${statusColors[status]}`}>
        {value}
      </span>
    </div>
  )
})

// 성능 최적화 유틸리티 함수들
export const PerformanceUtils = {
  // 이미지 지연 로딩 설정
  enableImageLazyLoading: () => {
    const images = document.querySelectorAll('img:not([loading])')
    images.forEach(img => {
      img.setAttribute('loading', 'lazy')
    })
  },

  // 중요하지 않은 스크립트 지연 로딩
  deferNonCriticalScripts: () => {
    const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])')
    scripts.forEach(script => {
      script.setAttribute('defer', 'true')
    })
  },

  // 리소스 힌트 추가
  addResourceHints: () => {
    const head = document.head
    
    // Preconnect to Google Fonts
    if (!document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]')) {
      const preconnect = document.createElement('link')
      preconnect.rel = 'preconnect'
      preconnect.href = 'https://fonts.googleapis.com'
      head.appendChild(preconnect)
    }
  },

  // 스크롤 성능 최적화
  optimizeScrolling: () => {
    const scrollElements = document.querySelectorAll('[style*="overflow-y"], [style*="overflow-x"]')
    scrollElements.forEach(el => {
      (el as HTMLElement).style.willChange = 'scroll-position'
    })
  }
}