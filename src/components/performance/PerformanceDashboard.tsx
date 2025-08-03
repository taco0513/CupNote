'use client'

import React, { useState, useEffect } from 'react'

import sentryIntegration from '../../lib/performance/sentry-integration'
import { PerformanceReport, WebVitalsMetric, analyzePerformance, loadPerformanceHistory, getCurrentMetrics } from '../../lib/performance/web-vitals'

interface PerformanceDashboardProps {
  className?: string
  enableRealTimeMonitoring?: boolean
  showAdvancedMetrics?: boolean
  showUserInteractions?: boolean
}

// RUM 메트릭 카드 컴포넌트 (확장된 버전)
function MetricCard({ metric, showAdvanced = false }: { metric: WebVitalsMetric; showAdvanced?: boolean }) {
  const getEmoji = () => {
    switch (metric.rating) {
      case 'good': return '✅'
      case 'needs-improvement': return '⚠️'
      case 'poor': return '❌'
      default: return '📊'
    }
  }
  
  const getColorClass = () => {
    switch (metric.rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }
  
  const getDescription = () => {
    switch (metric.name) {
      case 'LCP': return 'Largest Contentful Paint - 주요 콘텐츠 로딩 시간'
      case 'INP': return 'Interaction to Next Paint - 다음 페인트까지 상호작용 시간'
      case 'CLS': return 'Cumulative Layout Shift - 레이아웃 변경 정도'
      case 'FCP': return 'First Contentful Paint - 첫 콘텐츠 표시 시간'
      case 'TTFB': return 'Time to First Byte - 서버 응답 시간'
      default: return metric.name
    }
  }
  
  const getUnit = () => {
    return metric.name === 'CLS' ? '' : 'ms'
  }
  
  return (
    <div className={`p-4 rounded-lg border-2 ${getColorClass()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getEmoji()}</span>
          <h3 className="font-semibold text-lg">{metric.name}</h3>
        </div>
        <span className="text-2xl font-bold">
          {metric.value}{getUnit()}
        </span>
      </div>
      <p className="text-sm opacity-75 mb-2">{getDescription()}</p>
      <div className="flex justify-between text-sm">
        <span>Rating: {metric.rating}</span>
        <span>Delta: +{metric.delta}{getUnit()}</span>
      </div>
      
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
          {metric.sessionId && (
            <div className="flex justify-between">
              <span className="text-gray-500">Session:</span>
              <span className="font-mono">{metric.sessionId.slice(-8)}</span>
            </div>
          )}
          {metric.navigationType && (
            <div className="flex justify-between">
              <span className="text-gray-500">Navigation:</span>
              <span>{metric.navigationType}</span>
            </div>
          )}
          {metric.effectiveConnectionType && (
            <div className="flex justify-between">
              <span className="text-gray-500">Connection:</span>
              <span>{metric.effectiveConnectionType}</span>
            </div>
          )}
          {metric.deviceMemory && (
            <div className="flex justify-between">
              <span className="text-gray-500">Memory:</span>
              <span>{metric.deviceMemory}MB</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 성능 분석 결과 컴포넌트
function PerformanceAnalysis({ metrics }: { metrics: WebVitalsMetric[] }) {
  const analysis = analyzePerformance(metrics)
  
  if (metrics.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">성능 데이터가 아직 수집되지 않았습니다.</p>
        <p className="text-sm text-gray-500 mt-2">페이지를 사용하면 자동으로 수집됩니다.</p>
      </div>
    )
  }
  
  const getScoreColor = () => {
    if (analysis.score >= 90) return 'text-green-600'
    if (analysis.score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  return (
    <div className="space-y-4">
      {/* 전체 점수 */}
      <div className="text-center p-6 bg-white rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold mb-2">성능 점수</h3>
        <div className={`text-4xl font-bold ${getScoreColor()}`}>
          {analysis.score}/100
        </div>
        <p className="text-sm text-gray-600 mt-2 capitalize">
          전체 평가: {analysis.overall}
        </p>
      </div>
      
      {/* 문제점 */}
      {analysis.issues.length > 0 && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">🚨 발견된 문제점</h4>
          <ul className="space-y-1">
            {analysis.issues.map((issue, index) => (
              <li key={index} className="text-sm text-red-700">• {issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 개선 권장사항 */}
      {analysis.recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 개선 권장사항</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-700">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// RUM 성능 히스토리 컴포넌트 (확장된 버전)
function PerformanceHistory({ reports }: { reports: PerformanceReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">성능 히스토리가 없습니다.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {reports.slice(0, 5).map((report, index) => (
        <div key={report.timestamp} className="p-4 bg-white border-2 border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">
              {new Date(report.timestamp).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              {report.url.split('/').pop() || 'Home'}
            </span>
          </div>
          
          <div className="grid grid-cols-5 gap-2 text-sm">
            {Object.entries(report.metrics).map(([key, metric]) => (
              <div key={key} className="text-center">
                <div className="font-semibold">{key.toUpperCase()}</div>
                <div className={`text-xs ${
                  metric?.rating === 'good' ? 'text-green-600' :
                  metric?.rating === 'needs-improvement' ? 'text-yellow-600' :
                  metric?.rating === 'poor' ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {metric ? `${metric.value}${metric.name === 'CLS' ? '' : 'ms'}` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Device: {report.deviceInfo.viewport.width}×{report.deviceInfo.viewport.height}</span>
              <span>Connection: {report.deviceInfo.connection}</span>
            </div>
            {report.sessionId && (
              <div className="flex justify-between">
                <span>Session: {report.sessionId.slice(-8)}</span>
                <span>Score: {report.customMetrics.performanceScore}/100</span>
              </div>
            )}
            {report.userInteractions && (
              <div className="flex justify-between">
                <span>Clicks: {report.userInteractions.clickCount}</span>
                <span>Engagement: {report.userInteractions.engagementScore}/100</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// 실시간 사용자 상호작용 컴포넌트
function UserInteractionMetrics({ report }: { report: PerformanceReport | null }) {
  if (!report?.userInteractions) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">사용자 상호작용 데이터가 없습니다.</p>
      </div>
    )
  }
  
  const interactions = report.userInteractions
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{interactions.clickCount}</div>
        <div className="text-sm text-blue-700">클릭 수</div>
      </div>
      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{interactions.scrollDepth}%</div>
        <div className="text-sm text-green-700">스크롤 깊이</div>
      </div>
      <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">{Math.round(interactions.timeOnPage / 1000)}s</div>
        <div className="text-sm text-purple-700">체류 시간</div>
      </div>
      <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">{interactions.engagementScore}/100</div>
        <div className="text-sm text-orange-700">참여도</div>
      </div>
    </div>
  )
}

// 성능 예산 상태 컴포넌트
function PerformanceBudgetStatus({ report }: { report: PerformanceReport | null }) {
  if (!report?.budgetStatus) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">성능 예산 데이터가 없습니다.</p>
      </div>
    )
  }
  
  const budget = report.budgetStatus
  
  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border-2 ${
        budget.isWithinBudget 
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">
            {budget.isWithinBudget ? '✅ 예산 내' : '⚠️ 예산 초과'}
          </h4>
          <span className="text-2xl font-bold">{budget.budgetScore}/100</span>
        </div>
        
        {!budget.isWithinBudget && budget.exceededMetrics.length > 0 && (
          <div>
            <p className="text-sm mb-2">초과된 메트릭:</p>
            <ul className="space-y-1">
              {budget.exceededMetrics.map((metric, index) => (
                <li key={index} className="text-sm">• {metric}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// 실시간 성능 인사이트 컴포넌트
function RealTimeInsights({ reports }: { reports: PerformanceReport[] }) {
  if (reports.length < 2) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">비교할 데이터가 충분하지 않습니다.</p>
      </div>
    )
  }
  
  const current = reports[0]
  const previous = reports[1]
  const insights: Array<{ type: 'improvement' | 'regression' | 'neutral'; message: string }> = []
  
  // 성능 점수 비교
  const scoreDiff = current.customMetrics.performanceScore - previous.customMetrics.performanceScore
  if (Math.abs(scoreDiff) > 5) {
    insights.push({
      type: scoreDiff > 0 ? 'improvement' : 'regression',
      message: `성능 점수가 ${scoreDiff > 0 ? '+' : ''}${scoreDiff}점 변화했습니다`
    })
  }
  
  // 사용자 참여도 비교
  if (current.userInteractions && previous.userInteractions) {
    const engagementDiff = current.userInteractions.engagementScore - previous.userInteractions.engagementScore
    if (Math.abs(engagementDiff) > 10) {
      insights.push({
        type: engagementDiff > 0 ? 'improvement' : 'regression',
        message: `사용자 참여도가 ${engagementDiff > 0 ? '+' : ''}${engagementDiff}점 변화했습니다`
      })
    }
  }
  
  // 디바이스 성능 비교
  if (current.deviceInfo.isLowEndDevice && !previous.deviceInfo.isLowEndDevice) {
    insights.push({
      type: 'neutral',
      message: '낮은 사양 디바이스에서 접속했습니다'
    })
  }
  
  return (
    <div className="space-y-3">
      {insights.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">특별한 변화가 감지되지 않았습니다.</p>
        </div>
      ) : (
        insights.map((insight, index) => (
          <div key={index} className={`p-3 rounded-lg border-l-4 ${
            insight.type === 'improvement' ? 'bg-green-50 border-green-400 text-green-800' :
            insight.type === 'regression' ? 'bg-red-50 border-red-400 text-red-800' :
            'bg-blue-50 border-blue-400 text-blue-800'
          }`}>
            <p className="text-sm">{insight.message}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default function PerformanceDashboard({ 
  className, 
  enableRealTimeMonitoring = true,
  showAdvancedMetrics = false,
  showUserInteractions = true
}: PerformanceDashboardProps) {
  const [currentMetrics, setCurrentMetrics] = useState<WebVitalsMetric[]>([])
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceReport[]>([])
  const [activeTab, setActiveTab] = useState<'current' | 'analysis' | 'history' | 'interactions' | 'budget' | 'insights'>('current')
  const [isLoading, setIsLoading] = useState(true)
  const [latestReport, setLatestReport] = useState<PerformanceReport | null>(null)
  
  useEffect(() => {
    // 현재 메트릭 로드
    const loadCurrentMetrics = () => {
      const metrics = getCurrentMetrics()
      setCurrentMetrics(metrics)
    }
    
    // 히스토리 로드
    const history = loadPerformanceHistory()
    setPerformanceHistory(history)
    
    // 최신 리포트 설정
    if (history.length > 0) {
      setLatestReport(history[0])
    }
    
    // 초기 메트릭 로드
    loadCurrentMetrics()
    setIsLoading(false)
    
    // 주기적으로 업데이트 (실시간 모니터링 활성화 시)
    let interval: NodeJS.Timeout | null = null
    if (enableRealTimeMonitoring) {
      interval = setInterval(() => {
        loadCurrentMetrics()
        const updatedHistory = loadPerformanceHistory()
        setPerformanceHistory(updatedHistory)
        if (updatedHistory.length > 0) {
          setLatestReport(updatedHistory[0])
        }
      }, 3000) // 3초마다 업데이트
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [enableRealTimeMonitoring])
  
  const tabs = [
    { id: 'current' as const, label: '현재 지표', count: currentMetrics.length },
    { id: 'analysis' as const, label: '성능 분석', count: null },
    { id: 'history' as const, label: '히스토리', count: performanceHistory.length },
    ...(showUserInteractions ? [{ id: 'interactions' as const, label: '사용자 상호작용', count: null }] : []),
    { id: 'budget' as const, label: '성능 예산', count: null },
    { id: 'insights' as const, label: '실시간 인사이트', count: null }
  ]
  
  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🚀 성능 대시보드</h2>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      <div className="min-h-[400px]">
        {activeTab === 'current' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">현재 성능 지표</h3>
            {currentMetrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMetrics.map(metric => (
                  <MetricCard key={metric.name} metric={metric} showAdvanced={showAdvancedMetrics} />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">아직 성능 데이터가 수집되지 않았습니다.</p>
                <p className="text-sm text-gray-500 mt-2">페이지를 사용하면 자동으로 수집됩니다.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">성능 분석</h3>
            <PerformanceAnalysis metrics={currentMetrics} />
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">성능 히스토리 (최근 5개)</h3>
            <PerformanceHistory reports={performanceHistory} />
          </div>
        )}
        
        {activeTab === 'interactions' && showUserInteractions && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">사용자 상호작용</h3>
            <UserInteractionMetrics report={latestReport} />
          </div>
        )}
        
        {activeTab === 'budget' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">성능 예산 상태</h3>
            <PerformanceBudgetStatus report={latestReport} />
          </div>
        )}
        
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">실시간 인사이트</h3>
            <RealTimeInsights reports={performanceHistory} />
          </div>
        )}
      </div>
      
      {/* 푸터 정보 */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t space-y-2">
        <div>
          성능 지표는 Google의 Core Web Vitals 기준을 따릅니다.
        </div>
        <div className="flex justify-center items-center space-x-4 text-xs">
          <span className={`px-2 py-1 rounded ${
            enableRealTimeMonitoring ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {enableRealTimeMonitoring ? '✅ 실시간 모니터링 활성' : '⏸️ 실시간 모니터링 비활성'}
          </span>
          {latestReport?.sessionId && (
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
              세션: {latestReport.sessionId.slice(-8)}
            </span>
          )}
          {process.env.NODE_ENV === 'production' && (
            <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">
              프로덕션 RUM 활성
            </span>
          )}
        </div>
        <div>
          데이터는 브라우저 로컬 및 Sentry에 저장됩니다.
        </div>
      </div>
    </div>
  )
}