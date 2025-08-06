/**
 * Performance Monitoring and Optimization Utilities
 */

// Web Vitals thresholds
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needs_improvement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needs_improvement: 300 },    // First Input Delay
  CLS: { good: 0.1, needs_improvement: 0.25 },   // Cumulative Layout Shift
  FCP: { good: 1800, needs_improvement: 3000 },  // First Contentful Paint
  TTFB: { good: 800, needs_improvement: 1800 }   // Time to First Byte
}

// Performance observer for monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Log Web Vitals
  if ('PerformanceObserver' in window) {
    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS Observer
      let clsValue = 0
      let clsEntries: PerformanceEntry[] = []
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsEntries.push(entry)
            clsValue += (entry as any).value
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Log final CLS on page unload
      window.addEventListener('beforeunload', () => {
      })
    } catch (e) {
      console.warn('Performance monitoring not available')
    }
  }

  // Monitor long tasks
  if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn('[Performance] Long task detected:', {
          duration: entry.duration,
          startTime: entry.startTime,
          name: entry.name
        })
      }
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })
  }
}

// Image loading optimization
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Lazy load images with Intersection Observer
export function lazyLoadImages() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  const images = document.querySelectorAll('img[data-lazy]')
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        if (src) {
          img.src = src
          img.removeAttribute('data-lazy')
          imageObserver.unobserve(img)
        }
      }
    })
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  })

  images.forEach(img => imageObserver.observe(img))
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Request Idle Callback wrapper
export function requestIdleCallbackWrapper(
  callback: () => void,
  options?: { timeout?: number }
): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, options)
  } else {
    // Fallback to setTimeout
    setTimeout(callback, options?.timeout || 1)
  }
}

// Memory usage monitoring
export function getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } | null {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    }
  }
  return null
}

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window === 'undefined') return

  // Track resource timing
  const resources = performance.getEntriesByType('resource')
  const jsResources = resources.filter(r => r.name.endsWith('.js'))
  const cssResources = resources.filter(r => r.name.endsWith('.css'))
  
  const totalJsSize = jsResources.reduce((acc, r) => acc + (r as any).transferSize, 0)
  const totalCssSize = cssResources.reduce((acc, r) => acc + (r as any).transferSize, 0)
  
  return {
    js: `${(totalJsSize / 1024).toFixed(2)} KB`,
    css: `${(totalCssSize / 1024).toFixed(2)} KB`,
    total: `${((totalJsSize + totalCssSize) / 1024).toFixed(2)} KB`
  }
}