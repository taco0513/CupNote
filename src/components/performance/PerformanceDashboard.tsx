'use client'

import React, { useState, useEffect } from 'react'

import { PerformanceReport, WebVitalsMetric, analyzePerformance, loadPerformanceHistory, getCurrentMetrics } from '../../lib/performance/web-vitals'

interface PerformanceDashboardProps {
  className?: string
}

// 성능 지표 카드 컴포넌트
function MetricCard({ metric }: { metric: WebVitalsMetric }) {
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

// 성능 히스토리 컴포넌트
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
          
          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <span>Device: {report.deviceInfo.viewport.width}×{report.deviceInfo.viewport.height}</span>
            <span>Connection: {report.deviceInfo.connection}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [currentMetrics, setCurrentMetrics] = useState<WebVitalsMetric[]>([])
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceReport[]>([])
  const [activeTab, setActiveTab] = useState<'current' | 'analysis' | 'history'>('current')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // 현재 메트릭 로드
    const loadCurrentMetrics = () => {
      const metrics = getCurrentMetrics()
      setCurrentMetrics(metrics)
    }
    
    // 히스토리 로드
    const history = loadPerformanceHistory()
    setPerformanceHistory(history)
    
    // 초기 메트릭 로드
    loadCurrentMetrics()
    setIsLoading(false)
    
    // 주기적으로 업데이트
    const interval = setInterval(loadCurrentMetrics, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  const tabs = [
    { id: 'current' as const, label: '현재 지표', count: currentMetrics.length },
    { id: 'analysis' as const, label: '성능 분석', count: null },
    { id: 'history' as const, label: '히스토리', count: performanceHistory.length }
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
                  <MetricCard key={metric.name} metric={metric} />
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
      </div>
      
      {/* 푸터 정보 */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t">
        성능 지표는 Google의 Core Web Vitals 기준을 따릅니다. 
        <br />
        데이터는 브라우저 로컬에 저장되며 외부로 전송되지 않습니다.
      </div>
    </div>
  )
}