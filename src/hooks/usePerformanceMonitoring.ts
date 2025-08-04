/**
 * Performance Monitoring Hook
 * Provides utilities for tracking custom performance metrics
 */
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { reportMetric } from '../lib/web-vitals'

interface PerformanceTimings {
  start: number
  end?: number
  duration?: number
}

interface CustomMetric {
  name: string
  value: number
  label?: string
}

export function usePerformanceMonitoring() {
  const timings = useRef<Map<string, PerformanceTimings>>(new Map())

  // Start timing a custom metric
  const startTiming = useCallback((name: string) => {
    const startTime = performance.now()
    timings.current.set(name, { start: startTime })
    
    // Optional: Mark in Performance Timeline
    if ('mark' in performance) {
      performance.mark(`${name}-start`)
    }
  }, [])

  // End timing and report metric
  const endTiming = useCallback((name: string, label: string = 'custom') => {
    const timing = timings.current.get(name)
    if (!timing) {
      console.warn(`Performance timing '${name}' not found`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - timing.start

    // Update timing record
    timings.current.set(name, {
      ...timing,
      end: endTime,
      duration
    })

    // Report metric
    reportMetric(name, duration, label)

    // Optional: Mark in Performance Timeline
    if ('mark' in performance && 'measure' in performance) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }

    return duration
  }, [])

  // Report custom metric directly
  const reportCustomMetric = useCallback((metric: CustomMetric) => {
    reportMetric(metric.name, metric.value, metric.label || 'custom')
  }, [])

  // Get timing for a metric
  const getTiming = useCallback((name: string): PerformanceTimings | null => {
    return timings.current.get(name) || null
  }, [])

  // Clear all timings
  const clearTimings = useCallback(() => {
    timings.current.clear()
  }, [])

  // Track component mount time
  const trackComponentMount = useCallback((componentName: string) => {
    startTiming(`component-mount-${componentName}`)
    
    return () => {
      endTiming(`component-mount-${componentName}`, 'component-lifecycle')
    }
  }, [startTiming, endTiming])

  // Track API call performance
  const trackAPICall = useCallback(async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    startTiming(`api-${apiName}`)
    
    try {
      const result = await apiCall()
      endTiming(`api-${apiName}`, 'api-call')
      return result
    } catch (error) {
      endTiming(`api-${apiName}`, 'api-call-error')
      throw error
    }
  }, [startTiming, endTiming])

  // Track user interaction performance
  const trackInteraction = useCallback((interactionName: string) => {
    const interactionId = `interaction-${interactionName}-${Date.now()}`
    startTiming(interactionId)
    
    return {
      end: () => endTiming(interactionId, 'user-interaction'),
      getId: () => interactionId
    }
  }, [startTiming, endTiming])

  // Track resource loading
  const trackResourceLoad = useCallback((resourceName: string, resourceType: string = 'resource') => {
    startTiming(`resource-${resourceName}`)
    
    return () => {
      endTiming(`resource-${resourceName}`, resourceType)
    }
  }, [startTiming, endTiming])

  // Monitor long tasks (tasks > 50ms)
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    let observer: PerformanceObserver | null = null

    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            reportCustomMetric({
              name: 'long-task',
              value: entry.duration,
              label: 'performance-observer'
            })
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Long task monitoring not supported:', error)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [reportCustomMetric])

  // Monitor largest contentful paint attribution
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    let observer: PerformanceObserver | null = null

    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Report detailed LCP information
          reportCustomMetric({
            name: 'lcp-element',
            value: entry.startTime,
            label: 'lcp-attribution'
          })
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP monitoring not supported:', error)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [reportCustomMetric])

  return {
    // Basic timing functions
    startTiming,
    endTiming,
    getTiming,
    clearTimings,
    
    // Custom metrics
    reportCustomMetric,
    
    // High-level tracking functions
    trackComponentMount,
    trackAPICall,
    trackInteraction,
    trackResourceLoad,
    
    // Utilities
    getCurrentTimings: () => Array.from(timings.current.entries())
  }
}

// Helper hook for tracking component performance
export function useComponentPerformance(componentName: string) {
  const { trackComponentMount } = usePerformanceMonitoring()
  
  useEffect(() => {
    const endTracking = trackComponentMount(componentName)
    return endTracking
  }, [componentName, trackComponentMount])
}

// Helper hook for tracking route changes
export function useRoutePerformance() {
  const { startTiming, endTiming } = usePerformanceMonitoring()
  
  const trackRouteChange = useCallback((routeName: string) => {
    startTiming(`route-${routeName}`)
    
    return () => {
      endTiming(`route-${routeName}`, 'route-change')
    }
  }, [startTiming, endTiming])
  
  return { trackRouteChange }
}

// Helper for tracking form performance
export function useFormPerformance() {
  const { trackInteraction, reportCustomMetric } = usePerformanceMonitoring()
  
  const trackFormSubmission = useCallback((formName: string) => {
    return trackInteraction(`form-submit-${formName}`)
  }, [trackInteraction])
  
  const trackFormValidation = useCallback((formName: string, validationTime: number) => {
    reportCustomMetric({
      name: `form-validation-${formName}`,
      value: validationTime,
      label: 'form-performance'
    })
  }, [reportCustomMetric])
  
  const trackFieldInteraction = useCallback((fieldName: string) => {
    return trackInteraction(`field-${fieldName}`)
  }, [trackInteraction])
  
  return {
    trackFormSubmission,
    trackFormValidation,
    trackFieldInteraction
  }
}