/**
 * Bundle Performance Monitoring
 * 번들 크기, 메모리 사용량, JavaScript 실행 성능 추적
 */

// 번들 성능 메트릭 타입
export interface BundleMetrics {
  timestamp: number
  bundleSize: {
    total: number // 전체 번들 크기 (KB)
    javascript: number // JavaScript 번들 크기
    css: number // CSS 번들 크기
    images: number // 이미지 리소스 크기
    fonts: number // 폰트 리소스 크기
  }
  memoryUsage: {
    used: number // 사용된 힙 메모리 (MB)
    total: number // 전체 힙 메모리 (MB)
    limit: number // 힙 메모리 한계 (MB)
    percentage: number // 사용률 (%)
  }
  executionTiming: {
    scriptParsing: number // 스크립트 파싱 시간 (ms)
    scriptExecution: number // 스크립트 실행 시간 (ms)
    domContentLoaded: number // DOM 콘텐츠 로드 시간 (ms)
    pageLoad: number // 전체 페이지 로드 시간 (ms)
  }
  resourceCount: {
    scripts: number
    stylesheets: number
    images: number
    fonts: number
    xhr: number
  }
  compressionStats: {
    gzipSavings: number // Gzip 압축률 (%)
    brotliSavings: number // Brotli 압축률 (%)
    uncompressedSize: number // 압축되지 않은 크기
  }
}

// 번들 성능 분석 결과
export interface BundleAnalysis {
  performance: {
    score: number // 0-100
    rating: 'excellent' | 'good' | 'needs-improvement' | 'poor'
    issues: string[]
  }
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    type: 'bundle-size' | 'memory' | 'execution' | 'compression'
    title: string
    description: string
    impact: number // 예상 개선 효과 (%)
  }>
  trends: {
    bundleSizeChange: number // 변화량 (KB)
    memoryUsageChange: number // 변화량 (MB)
    performanceChange: number // 점수 변화
  }
}

// 번들 성능 모니터
export class BundlePerformanceMonitor {
  private metrics: BundleMetrics[] = []
  private observers: Array<(metrics: BundleMetrics) => void> = []
  private isMonitoring = false
  
  // 모니터링 시작
  start() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    
    // 페이지 로드 완료 후 초기 메트릭 수집
    if (document.readyState === 'complete') {
      this.collectMetrics()
    } else {
      window.addEventListener('load', () => {
        // 약간의 지연 후 수집 (모든 리소스 로드 대기)
        setTimeout(() => this.collectMetrics(), 1000)
      })
    }
    
    console.log('📊 Bundle performance monitoring started')
  }
  
  // 모니터링 중지
  stop() {
    this.isMonitoring = false
    console.log('⏹️ Bundle performance monitoring stopped')
  }
  
  // 메트릭 수집
  collectMetrics(): BundleMetrics {
    const metrics: BundleMetrics = {
      timestamp: Date.now(),
      bundleSize: this.calculateResourceSizes(),
      memoryUsage: this.calculateMemoryUsage(),
      executionTiming: this.calculateExecutionTiming(),
      resourceCount: this.calculateResourceCount(),
      compressionStats: this.estimateCompressionStats()
    }
    
    this.metrics.push(metrics)
    
    // 최대 100개 메트릭 유지
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
    
    // 옵저버에게 알림
    this.observers.forEach(observer => {
      try {
        observer(metrics)
      } catch (error) {
        console.error('Bundle metrics observer error:', error)
      }
    })
    
    return metrics
  }
  
  // 리소스 크기 계산
  private calculateResourceSizes(): BundleMetrics['bundleSize'] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const sizes = {
      total: 0,
      javascript: 0,
      css: 0,
      images: 0,
      fonts: 0
    }
    
    resources.forEach(resource => {
      const size = resource.transferSize || resource.decodedBodySize || 0
      const sizeKB = size / 1024
      
      sizes.total += sizeKB
      
      if (resource.name.match(/\.(js|mjs|jsx|ts|tsx)$/)) {
        sizes.javascript += sizeKB
      } else if (resource.name.match(/\.(css|scss|sass)$/)) {
        sizes.css += sizeKB
      } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) {
        sizes.images += sizeKB
      } else if (resource.name.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
        sizes.fonts += sizeKB
      }
    })
    
    return sizes
  }
  
  // 메모리 사용량 계산
  private calculateMemoryUsage(): BundleMetrics['memoryUsage'] {
    const memory = (performance as any).memory
    
    if (!memory) {
      return {
        used: 0,
        total: 0,
        limit: 0,
        percentage: 0
      }
    }
    
    const used = Math.round(memory.usedJSHeapSize / 1024 / 1024)
    const total = Math.round(memory.totalJSHeapSize / 1024 / 1024)
    const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    const percentage = Math.round((used / limit) * 100)
    
    return { used, total, limit, percentage }
  }
  
  // 실행 타이밍 계산
  private calculateExecutionTiming(): BundleMetrics['executionTiming'] {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (!navigation) {
      return {
        scriptParsing: 0,
        scriptExecution: 0,
        domContentLoaded: 0,
        pageLoad: 0
      }
    }
    
    const scriptParsing = navigation.domInteractive - navigation.responseEnd
    const scriptExecution = navigation.domContentLoadedEventStart - navigation.domInteractive
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    const pageLoad = navigation.loadEventEnd - navigation.startTime
    
    return {
      scriptParsing: Math.max(0, scriptParsing),
      scriptExecution: Math.max(0, scriptExecution),
      domContentLoaded: Math.max(0, domContentLoaded),
      pageLoad: Math.max(0, pageLoad)
    }
  }
  
  // 리소스 개수 계산
  private calculateResourceCount(): BundleMetrics['resourceCount'] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const counts = {
      scripts: 0,
      stylesheets: 0,
      images: 0,
      fonts: 0,
      xhr: 0
    }
    
    resources.forEach(resource => {
      if (resource.name.match(/\.(js|mjs|jsx|ts|tsx)$/)) {
        counts.scripts++
      } else if (resource.name.match(/\.(css|scss|sass)$/)) {
        counts.stylesheets++
      } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) {
        counts.images++
      } else if (resource.name.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
        counts.fonts++
      } else if (resource.initiatorType === 'xmlhttprequest' || resource.initiatorType === 'fetch') {
        counts.xhr++
      }
    })
    
    return counts
  }
  
  // 압축 통계 추정
  private estimateCompressionStats(): BundleMetrics['compressionStats'] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    let totalTransferSize = 0
    let totalDecodedSize = 0
    
    resources.forEach(resource => {
      if (resource.name.match(/\.(js|css|html|json|xml)$/)) {
        totalTransferSize += resource.transferSize || 0
        totalDecodedSize += resource.decodedBodySize || 0
      }
    })
    
    const compressionRatio = totalDecodedSize > 0 ? 
      ((totalDecodedSize - totalTransferSize) / totalDecodedSize) * 100 : 0
    
    return {
      gzipSavings: Math.round(compressionRatio),
      brotliSavings: Math.round(compressionRatio * 1.15), // Brotli는 보통 Gzip보다 15% 더 효율적
      uncompressedSize: Math.round(totalDecodedSize / 1024)
    }
  }
  
  // 메트릭 분석
  analyze(): BundleAnalysis {
    if (this.metrics.length === 0) {
      return {
        performance: { score: 100, rating: 'excellent', issues: [] },
        recommendations: [],
        trends: { bundleSizeChange: 0, memoryUsageChange: 0, performanceChange: 0 }
      }
    }
    
    const latest = this.metrics[this.metrics.length - 1]
    const previous = this.metrics.length > 1 ? this.metrics[this.metrics.length - 2] : null
    
    // 성능 점수 계산
    const performance = this.calculatePerformanceScore(latest)
    
    // 권장사항 생성
    const recommendations = this.generateRecommendations(latest)
    
    // 트렌드 분석
    const trends = this.calculateTrends(latest, previous)
    
    return { performance, recommendations, trends }
  }
  
  // 성능 점수 계산
  private calculatePerformanceScore(metrics: BundleMetrics): BundleAnalysis['performance'] {
    const issues: string[] = []
    let score = 100
    
    // 번들 크기 평가
    if (metrics.bundleSize.total > 2000) { // 2MB 이상
      score -= 20
      issues.push(`번들 크기가 너무 큽니다 (${Math.round(metrics.bundleSize.total)}KB)`)
    } else if (metrics.bundleSize.total > 1000) { // 1MB 이상
      score -= 10
      issues.push(`번들 크기 최적화가 필요합니다 (${Math.round(metrics.bundleSize.total)}KB)`)
    }
    
    // 메모리 사용량 평가
    if (metrics.memoryUsage.percentage > 80) {
      score -= 25
      issues.push(`메모리 사용량이 높습니다 (${metrics.memoryUsage.percentage}%)`)
    } else if (metrics.memoryUsage.percentage > 60) {
      score -= 10
      issues.push(`메모리 사용량 주의 (${metrics.memoryUsage.percentage}%)`)
    }
    
    score = Math.max(0, score)
    
    const rating = score >= 90 ? 'excellent' : 
                   score >= 75 ? 'good' : 
                   score >= 50 ? 'needs-improvement' : 'poor'
    
    return { score, rating, issues }
  }
  
  // 권장사항 생성
  private generateRecommendations(metrics: BundleMetrics): BundleAnalysis['recommendations'] {
    const recommendations: BundleAnalysis['recommendations'] = []
    
    // 번들 크기 권장사항
    if (metrics.bundleSize.total > 1000) {
      recommendations.push({
        priority: 'high',
        type: 'bundle-size',
        title: '번들 크기 최적화',
        description: 'Code splitting, tree shaking을 통해 번들 크기를 줄이세요.',
        impact: 25
      })
    }
    
    return recommendations
  }
  
  // 트렌드 계산
  private calculateTrends(current: BundleMetrics, previous: BundleMetrics | null): BundleAnalysis['trends'] {
    if (!previous) {
      return { bundleSizeChange: 0, memoryUsageChange: 0, performanceChange: 0 }
    }
    
    const bundleSizeChange = current.bundleSize.total - previous.bundleSize.total
    const memoryUsageChange = current.memoryUsage.used - previous.memoryUsage.used
    
    return {
      bundleSizeChange: Math.round(bundleSizeChange),
      memoryUsageChange: Math.round(memoryUsageChange),
      performanceChange: 0
    }
  }
  
  // 메트릭 히스토리 가져오기
  getMetrics(): BundleMetrics[] {
    return [...this.metrics]
  }
  
  // 최신 메트릭 가져오기
  getLatestMetrics(): BundleMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }
  
  // 옵저버 등록
  subscribe(observer: (metrics: BundleMetrics) => void): () => void {
    this.observers.push(observer)
    
    return () => {
      const index = this.observers.indexOf(observer)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }
}

// 글로벌 번들 모니터 인스턴스
let bundleMonitor: BundlePerformanceMonitor | null = null

// 번들 모니터링 초기화
export function initBundleMonitoring(): BundlePerformanceMonitor {
  if (!bundleMonitor) {
    bundleMonitor = new BundlePerformanceMonitor()
  }
  
  return bundleMonitor
}

// 번들 모니터 가져오기
export function getBundleMonitor(): BundlePerformanceMonitor | null {
  return bundleMonitor
}

const bundleMonitorExports = {
  BundlePerformanceMonitor,
  initBundleMonitoring,
  getBundleMonitor
}

export default bundleMonitorExports