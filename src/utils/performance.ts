/**
 * 성능 최적화 유틸리티
 * - 메모이제이션
 * - 지연 로딩
 * - 캐싱
 */

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// 스로틀 함수
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 메모이제이션 캐시
const memoCache = new Map<string, { value: any; timestamp: number }>()
const MEMO_EXPIRY = 5 * 60 * 1000 // 5분

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    const cached = memoCache.get(key)
    
    if (cached && Date.now() - cached.timestamp < MEMO_EXPIRY) {
      return cached.value
    }
    
    const result = func(...args)
    memoCache.set(key, { value: result, timestamp: Date.now() })
    
    return result
  }) as T
}

// 비동기 메모이제이션
const asyncMemoCache = new Map<string, Promise<any>>()

export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (asyncMemoCache.has(key)) {
      return asyncMemoCache.get(key)
    }
    
    const promise = func(...args)
    asyncMemoCache.set(key, promise)
    
    try {
      const result = await promise
      // 성공한 결과는 5분간 캐시
      setTimeout(() => asyncMemoCache.delete(key), 5 * 60 * 1000)
      return result
    } catch (error) {
      // 실패한 경우 즉시 캐시에서 제거
      asyncMemoCache.delete(key)
      throw error
    }
  }) as T
}

// 리소스 미리 로딩
export function preloadResource(href: string, as: string = 'fetch') {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// 모듈 미리 로딩
export function preloadModule(modulePath: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'modulepreload'
  link.href = modulePath
  document.head.appendChild(link)
}

// 성능 측정
export class PerformanceMonitor {
  private static marks = new Map<string, number>()

  static mark(name: string) {
    this.marks.set(name, performance.now())
  }

  static measure(name: string, startMark?: string): number {
    const endTime = performance.now()
    const startTime = startMark ? this.marks.get(startMark) || 0 : 0
    const duration = endTime - startTime

    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  static clearMarks() {
    this.marks.clear()
  }
}

// 메모리 정리
export function cleanupMemory() {
  // 만료된 메모 캐시 정리
  const now = Date.now()
  for (const [key, { timestamp }] of memoCache.entries()) {
    if (now - timestamp > MEMO_EXPIRY) {
      memoCache.delete(key)
    }
  }

  // 만료된 비동기 캐시 정리는 각 promise에서 자동으로 처리됨
  console.log('🧹 Memory cleanup completed')
}

// 주기적 메모리 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(cleanupMemory, 5 * 60 * 1000)
}