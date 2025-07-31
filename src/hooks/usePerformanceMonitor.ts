import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartRef = useRef<number>(0)
  const renderCountRef = useRef<number>(0)

  useEffect(() => {
    // Record render start time
    renderStartRef.current = performance.now()
    renderCountRef.current++

    // Measure after render
    const measurePerformance = () => {
      const renderTime = performance.now() - renderStartRef.current
      
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now()
      }

      // Log slow renders (> 16ms)
      if (renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }

      // Store metrics for analysis
      if (typeof window !== 'undefined') {
        const storedMetrics = JSON.parse(
          sessionStorage.getItem('cupnote_performance_metrics') || '[]'
        )
        storedMetrics.push(metrics)
        
        // Keep only last 100 metrics
        if (storedMetrics.length > 100) {
          storedMetrics.shift()
        }
        
        sessionStorage.setItem('cupnote_performance_metrics', JSON.stringify(storedMetrics))
      }
    }

    // Use requestIdleCallback for non-blocking measurement
    if ('requestIdleCallback' in window) {
      requestIdleCallback(measurePerformance)
    } else {
      setTimeout(measurePerformance, 0)
    }
  })

  return {
    renderCount: renderCountRef.current
  }
}

// Get performance report
export function getPerformanceReport(): Record<string, any> {
  if (typeof window === 'undefined') return {}

  const metrics = JSON.parse(
    sessionStorage.getItem('cupnote_performance_metrics') || '[]'
  ) as PerformanceMetrics[]

  if (metrics.length === 0) return {}

  // Group by component
  const componentMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.componentName]) {
      acc[metric.componentName] = []
    }
    acc[metric.componentName].push(metric.renderTime)
    return acc
  }, {} as Record<string, number[]>)

  // Calculate statistics
  const report: Record<string, any> = {}
  
  for (const [component, times] of Object.entries(componentMetrics)) {
    const sorted = times.sort((a, b) => a - b)
    const sum = times.reduce((a, b) => a + b, 0)
    
    report[component] = {
      count: times.length,
      average: sum / times.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    }
  }

  return report
}