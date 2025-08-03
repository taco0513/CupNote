/**
 * Real User Monitoring (RUM) Analytics
 * 실사용자 모니터링 분석 및 인사이트 제공
 */

import { PerformanceReport, WebVitalsMetric } from './web-vitals'

// RUM 분석 결과 타입
export interface RUMAnalysis {
  performanceTrends: {
    score: number
    trend: 'improving' | 'declining' | 'stable'
    change: number
  }
  userBehavior: {
    averageSessionDuration: number
    averageEngagement: number
    bounceRate: number
    interactionPatterns: string[]
  }
  deviceInsights: {
    lowEndDevicePercentage: number
    mobileUsagePercentage: number
    connectionTypeDistribution: Record<string, number>
    topPerformingDevices: string[]
  }
  performanceBottlenecks: {
    slowestMetrics: Array<{ name: string; averageValue: number; samples: number }>
    problematicPages: Array<{ url: string; issueCount: number; avgScore: number }>
    timeBasedPatterns: Array<{ timeRange: string; performance: number }>
  }
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    category: 'performance' | 'ux' | 'technical'
    title: string
    description: string
    impact: string
  }>
}

// RUM 데이터 분석기
export class RUMAnalyzer {
  private reports: PerformanceReport[]
  
  constructor(reports: PerformanceReport[]) {
    this.reports = reports.sort((a, b) => b.timestamp - a.timestamp)
  }
  
  // 전체 분석 실행
  analyze(): RUMAnalysis {
    return {
      performanceTrends: this.analyzePerformanceTrends(),
      userBehavior: this.analyzeUserBehavior(),
      deviceInsights: this.analyzeDeviceInsights(),
      performanceBottlenecks: this.analyzeBottlenecks(),
      recommendations: this.generateRecommendations()
    }
  }
  
  // 성능 트렌드 분석
  private analyzePerformanceTrends() {
    if (this.reports.length < 2) {
      return { score: 0, trend: 'stable' as const, change: 0 }
    }
    
    const scores = this.reports.map(r => r.customMetrics.performanceScore).filter(Boolean)
    if (scores.length === 0) {
      return { score: 0, trend: 'stable' as const, change: 0 }
    }
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    
    // 최근 5개와 그 이전 5개 비교
    const recentScores = scores.slice(0, 5)
    const olderScores = scores.slice(5, 10)
    
    if (olderScores.length === 0) {
      return { score: Math.round(averageScore), trend: 'stable' as const, change: 0 }
    }
    
    const recentAvg = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
    const olderAvg = olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length
    
    const change = recentAvg - olderAvg
    const trend = Math.abs(change) < 5 ? 'stable' : change > 0 ? 'improving' : 'declining'
    
    return {
      score: Math.round(averageScore),
      trend,
      change: Math.round(change)
    }
  }
  
  // 사용자 행동 분석
  private analyzeUserBehavior() {
    const interactions = this.reports
      .map(r => r.userInteractions)
      .filter(Boolean)
    
    if (interactions.length === 0) {
      return {
        averageSessionDuration: 0,
        averageEngagement: 0,
        bounceRate: 0,
        interactionPatterns: []
      }
    }
    
    const avgDuration = interactions.reduce((sum, i) => sum + i.timeOnPage, 0) / interactions.length
    const avgEngagement = interactions.reduce((sum, i) => sum + i.engagementScore, 0) / interactions.length
    
    // 바운스 레이트 (5초 미만 체류를 바운스로 간주)
    const bounces = interactions.filter(i => i.timeOnPage < 5000).length
    const bounceRate = (bounces / interactions.length) * 100
    
    // 상호작용 패턴 분석
    const patterns: string[] = []
    const avgClicks = interactions.reduce((sum, i) => sum + i.clickCount, 0) / interactions.length
    const avgScroll = interactions.reduce((sum, i) => sum + i.scrollDepth, 0) / interactions.length
    
    if (avgClicks > 10) patterns.push('높은 클릭 활동')
    if (avgScroll > 80) patterns.push('깊은 스크롤 탐색')
    if (avgDuration > 120000) patterns.push('긴 체류 시간')
    if (bounceRate < 20) patterns.push('낮은 이탈률')
    
    return {
      averageSessionDuration: Math.round(avgDuration / 1000),
      averageEngagement: Math.round(avgEngagement),
      bounceRate: Math.round(bounceRate),
      interactionPatterns: patterns
    }
  }
  
  // 디바이스 인사이트 분석
  private analyzeDeviceInsights() {
    const devices = this.reports.map(r => r.deviceInfo)
    
    if (devices.length === 0) {
      return {
        lowEndDevicePercentage: 0,
        mobileUsagePercentage: 0,
        connectionTypeDistribution: {},
        topPerformingDevices: []
      }
    }
    
    // 저사양 디바이스 비율
    const lowEndCount = devices.filter(d => d.isLowEndDevice).length
    const lowEndPercentage = (lowEndCount / devices.length) * 100
    
    // 모바일 사용 비율
    const mobileCount = devices.filter(d => d.isMobile).length
    const mobilePercentage = (mobileCount / devices.length) * 100
    
    // 연결 타입 분포
    const connectionTypes: Record<string, number> = {}
    devices.forEach(d => {
      const type = d.effectiveType || d.connection || 'unknown'
      connectionTypes[type] = (connectionTypes[type] || 0) + 1
    })
    
    // 백분율로 변환
    Object.keys(connectionTypes).forEach(key => {
      connectionTypes[key] = Math.round((connectionTypes[key] / devices.length) * 100)
    })
    
    // 상위 성능 디바이스 (간단한 분류)
    const platformCounts: Record<string, number> = {}
    devices.forEach(d => {
      platformCounts[d.platform] = (platformCounts[d.platform] || 0) + 1
    })
    
    const topPerformingDevices = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([platform]) => platform)
    
    return {
      lowEndDevicePercentage: Math.round(lowEndPercentage),
      mobileUsagePercentage: Math.round(mobilePercentage),
      connectionTypeDistribution: connectionTypes,
      topPerformingDevices
    }
  }
  
  // 성능 병목 분석
  private analyzeBottlenecks() {
    // 가장 느린 메트릭 식별
    const metricData: Record<string, { values: number[]; count: number }> = {}
    
    this.reports.forEach(report => {
      Object.entries(report.metrics).forEach(([key, metric]) => {
        if (metric) {
          if (!metricData[metric.name]) {
            metricData[metric.name] = { values: [], count: 0 }
          }
          metricData[metric.name].values.push(metric.value)
          metricData[metric.name].count++
        }
      })
    })
    
    const slowestMetrics = Object.entries(metricData)
      .map(([name, data]) => ({
        name,
        averageValue: Math.round(data.values.reduce((sum, v) => sum + v, 0) / data.values.length),
        samples: data.count
      }))
      .sort((a, b) => b.averageValue - a.averageValue)
      .slice(0, 5)
    
    // 문제가 있는 페이지 식별
    const pageData: Record<string, { scores: number[]; issues: number }> = {}
    
    this.reports.forEach(report => {
      const pathname = new URL(report.url).pathname
      if (!pageData[pathname]) {
        pageData[pathname] = { scores: [], issues: 0 }
      }
      
      pageData[pathname].scores.push(report.customMetrics.performanceScore)
      if (!report.budgetStatus?.isWithinBudget) {
        pageData[pathname].issues++
      }
    })
    
    const problematicPages = Object.entries(pageData)
      .filter(([, data]) => data.issues > 0)
      .map(([url, data]) => ({
        url,
        issueCount: data.issues,
        avgScore: Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length)
      }))
      .sort((a, b) => b.issueCount - a.issueCount)
      .slice(0, 5)
    
    // 시간 기반 패턴 (간단한 시간대 분석)
    const timeBasedPatterns = this.analyzeTimePatterns()
    
    return {
      slowestMetrics,
      problematicPages,
      timeBasedPatterns
    }
  }
  
  // 시간 패턴 분석
  private analyzeTimePatterns() {
    const hourlyData: Record<number, number[]> = {}
    
    this.reports.forEach(report => {
      const hour = new Date(report.timestamp).getHours()
      if (!hourlyData[hour]) {
        hourlyData[hour] = []
      }
      hourlyData[hour].push(report.customMetrics.performanceScore)
    })
    
    return Object.entries(hourlyData)
      .map(([hour, scores]) => ({
        timeRange: `${hour}:00-${hour}:59`,
        performance: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      }))
      .sort((a, b) => parseInt(a.timeRange) - parseInt(b.timeRange))
  }
  
  // 개선 권장사항 생성
  private generateRecommendations(): RUMAnalysis['recommendations'] {
    const recommendations: RUMAnalysis['recommendations'] = []
    const trends = this.analyzePerformanceTrends()
    const behavior = this.analyzeUserBehavior()
    const devices = this.analyzeDeviceInsights()
    const bottlenecks = this.analyzeBottlenecks()
    
    // 성능 트렌드 기반 권장사항
    if (trends.trend === 'declining') {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: '성능 저하 감지',
        description: `성능 점수가 ${Math.abs(trends.change)}점 하락했습니다. 최근 변경사항을 검토하세요.`,
        impact: '사용자 경험 및 전환율에 직접적 영향'
      })
    }
    
    // 사용자 행동 기반 권장사항
    if (behavior.bounceRate > 50) {
      recommendations.push({
        priority: 'high',
        category: 'ux',
        title: '높은 이탈률 개선 필요',
        description: `${behavior.bounceRate}%의 높은 이탈률이 감지되었습니다. 페이지 로딩 속도와 초기 콘텐츠를 개선하세요.`,
        impact: '사용자 참여도 및 비즈니스 지표 개선'
      })
    }
    
    if (behavior.averageEngagement < 30) {
      recommendations.push({
        priority: 'medium',
        category: 'ux',
        title: '사용자 참여도 개선',
        description: `평균 참여도가 ${behavior.averageEngagement}점으로 낮습니다. 인터랙티브 요소를 추가하세요.`,
        impact: '사용자 만족도 및 체류 시간 증가'
      })
    }
    
    // 디바이스 기반 권장사항
    if (devices.lowEndDevicePercentage > 30) {
      recommendations.push({
        priority: 'high',
        category: 'technical',
        title: '저사양 디바이스 최적화',
        description: `사용자의 ${devices.lowEndDevicePercentage}%가 저사양 디바이스를 사용합니다. 번들 크기 최적화가 필요합니다.`,
        impact: '광범위한 사용자층의 접근성 개선'
      })
    }
    
    if (devices.mobileUsagePercentage > 70) {
      recommendations.push({
        priority: 'medium',
        category: 'technical',
        title: '모바일 우선 최적화',
        description: `사용자의 ${devices.mobileUsagePercentage}%가 모바일 기기를 사용합니다. 모바일 성능 최적화에 집중하세요.`,
        impact: '주요 사용자층의 경험 개선'
      })
    }
    
    // 병목 현상 기반 권장사항
    if (bottlenecks.slowestMetrics.length > 0) {
      const slowestMetric = bottlenecks.slowestMetrics[0]
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: `${slowestMetric.name} 최적화 필요`,
        description: `${slowestMetric.name}의 평균값이 ${slowestMetric.averageValue}ms로 기준치를 초과합니다.`,
        impact: 'Core Web Vitals 개선 및 SEO 향상'
      })
    }
    
    // 기본 권장사항
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        category: 'performance',
        title: '지속적인 모니터링',
        description: '현재 성능이 양호합니다. 지속적인 모니터링을 통해 성능을 유지하세요.',
        impact: '안정적인 사용자 경험 보장'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

// 성능 점수 계산기
export function calculatePerformanceScore(metrics: { [key: string]: WebVitalsMetric | null }): number {
  const weights = {
    LCP: 0.25,
    INP: 0.25,
    CLS: 0.25,
    FCP: 0.15,
    TTFB: 0.10
  }
  
  let totalScore = 0
  let totalWeight = 0
  
  Object.entries(metrics).forEach(([key, metric]) => {
    if (metric && weights[metric.name as keyof typeof weights]) {
      const weight = weights[metric.name as keyof typeof weights]
      const score = metric.rating === 'good' ? 100 : metric.rating === 'needs-improvement' ? 70 : 30
      
      totalScore += score * weight
      totalWeight += weight
    }
  })
  
  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 100
}

// 성능 벤치마크 비교
export function compareWithBenchmarks(report: PerformanceReport): {
  category: string
  performance: 'above' | 'at' | 'below'
  percentile: number
} {
  // 업계 벤치마크 (예시 데이터)
  const benchmarks = {
    'e-commerce': { LCP: 2800, INP: 250, CLS: 0.15 },
    'news': { LCP: 3200, INP: 300, CLS: 0.20 },
    'social': { LCP: 2400, INP: 200, CLS: 0.12 },
    'general': { LCP: 2500, INP: 200, CLS: 0.1 }
  }
  
  // 카테고리 추정 (URL 기반)
  const url = report.url.toLowerCase()
  let category = 'general'
  if (url.includes('shop') || url.includes('cart')) category = 'e-commerce'
  else if (url.includes('news') || url.includes('blog')) category = 'news'
  else if (url.includes('social') || url.includes('feed')) category = 'social'
  
  const benchmark = benchmarks[category as keyof typeof benchmarks]
  const coreMetrics = [report.metrics.lcp, report.metrics.inp, report.metrics.cls].filter(Boolean)
  
  if (coreMetrics.length === 0) {
    return { category, performance: 'at', percentile: 50 }
  }
  
  let betterCount = 0
  coreMetrics.forEach(metric => {
    if (metric) {
      const benchmarkValue = benchmark[metric.name as keyof typeof benchmark]
      if (metric.value <= benchmarkValue) betterCount++
    }
  })
  
  const percentage = (betterCount / coreMetrics.length) * 100
  const performance = percentage >= 70 ? 'above' : percentage >= 30 ? 'at' : 'below'
  const percentile = Math.round(percentage)
  
  return { category, performance, percentile }
}

// RUM 데이터 내보내기
export function exportRUMData(reports: PerformanceReport[], format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    const headers = [
      'timestamp', 'url', 'sessionId', 'performanceScore', 
      'lcp', 'inp', 'cls', 'fcp', 'ttfb',
      'clickCount', 'scrollDepth', 'timeOnPage', 'engagementScore',
      'isMobile', 'isLowEndDevice', 'connectionType'
    ]
    
    const rows = reports.map(report => [
      new Date(report.timestamp).toISOString(),
      report.url,
      report.sessionId,
      report.customMetrics.performanceScore,
      report.metrics.lcp?.value || '',
      report.metrics.inp?.value || '',
      report.metrics.cls?.value || '',
      report.metrics.fcp?.value || '',
      report.metrics.ttfb?.value || '',
      report.userInteractions.clickCount,
      report.userInteractions.scrollDepth,
      Math.round(report.userInteractions.timeOnPage / 1000),
      report.userInteractions.engagementScore,
      report.deviceInfo.isMobile,
      report.deviceInfo.isLowEndDevice,
      report.deviceInfo.effectiveType || report.deviceInfo.connection
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }
  
  return JSON.stringify(reports, null, 2)
}

const rumAnalytics = {
  RUMAnalyzer,
  calculatePerformanceScore,
  compareWithBenchmarks,
  exportRUMData
}

export default rumAnalytics