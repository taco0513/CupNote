/**
 * Web Vitals Integration for App Router
 * Reports Core Web Vitals to analytics and monitoring systems
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals' // FID is deprecated, replaced with INP

// Types for metric reporting
interface WebVitalsMetric extends Metric {
  label: string
}

// Web Vitals thresholds for CupNote app
const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint (replaces FID)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte
}

// Determine performance rating
function getVitalsRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const threshold = VITALS_THRESHOLDS[metric.name as keyof typeof VITALS_THRESHOLDS]
  if (!threshold) return 'good'
  
  if (metric.value <= threshold.good) return 'good'
  if (metric.value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Send metric to analytics/monitoring
function sendToAnalytics(metric: WebVitalsMetric) {
  const rating = getVitalsRating(metric)
  
  // Send to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Web Vital: ${metric.name}`)
    console.log(`Value: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`)
    console.log(`Rating: ${rating}`)
    console.log(`ID: ${metric.id}`)
    console.groupEnd()
  }

  // Send to Sentry if available
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value}`,
      level: rating === 'poor' ? 'warning' : 'info',
      data: {
        name: metric.name,
        value: metric.value,
        rating,
        id: metric.id,
        label: metric.label
      }
    })
  }

  // Send to Google Analytics 4 if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: rating,
      custom_parameter_3: metric.id,
      custom_parameter_4: metric.label
    })
  }

  // Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    try {
      fetch('/api/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating,
          id: metric.id,
          label: metric.label,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(error => {
        console.warn('Failed to send web vitals:', error)
      })
    } catch (error) {
      // Silently fail for analytics
    }
  }
}

// Initialize Web Vitals reporting
export function reportWebVitals() {
  try {
    onCLS((metric) => sendToAnalytics({ ...metric, label: 'web-vital' }))
    onINP((metric) => sendToAnalytics({ ...metric, label: 'web-vital' })) // Updated to INP from FID
    onFCP((metric) => sendToAnalytics({ ...metric, label: 'web-vital' }))
    onLCP((metric) => sendToAnalytics({ ...metric, label: 'web-vital' }))
    onTTFB((metric) => sendToAnalytics({ ...metric, label: 'web-vital' }))
  } catch (error) {
    console.warn('Failed to initialize web vitals reporting:', error)
  }
}

// Report specific metric (for custom usage)
export function reportMetric(name: string, value: number, label: string = 'custom') {
  const metric: WebVitalsMetric = {
    name,
    value,
    rating: 'good', // Default for custom metrics
    delta: value,
    entries: [],
    id: `${name}-${Date.now()}`,
    label
  }
  
  sendToAnalytics(metric)
}

// Performance observer for additional metrics
export function observePerformance() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  try {
    // Observe long tasks (>50ms)
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          reportMetric('long-task', entry.duration, 'performance')
        }
      })
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })

    // Observe layout shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.hadRecentInput) return // Ignore user-initiated shifts
        reportMetric('layout-shift', entry.value, 'performance')
      })
    })
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })

  } catch (error) {
    console.warn('Failed to observe performance:', error)
  }
}

// Coffee app specific performance tracking
export function trackCoffeeAppMetrics() {
  // Track time to interactive for coffee record forms
  const trackFormInteraction = () => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      reportMetric('form-interaction-time', duration, 'coffee-app')
    }
  }

  // Track search performance
  const trackSearchPerformance = (query: string, resultsCount: number) => {
    const searchTime = performance.now()
    
    setTimeout(() => {
      const duration = performance.now() - searchTime
      reportMetric('search-duration', duration, 'coffee-app')
      reportMetric('search-results', resultsCount, 'coffee-app')
    }, 0)
  }

  // Track image loading performance
  const trackImageLoading = () => {
    const images = document.querySelectorAll('img')
    images.forEach((img) => {
      const startTime = performance.now()
      
      img.addEventListener('load', () => {
        const duration = performance.now() - startTime
        reportMetric('image-load-time', duration, 'coffee-app')
      }, { once: true })
    })
  }

  return {
    trackFormInteraction,
    trackSearchPerformance,
    trackImageLoading
  }
}

// Global declarations for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void
    Sentry?: {
      addBreadcrumb: (breadcrumb: any) => void
      captureException: (error: any) => void
    }
  }
}