'use client'

import React from 'react'

import { usePerformanceSummary } from '../../hooks/usePerformanceMonitoring'

interface PerformanceIndicatorProps {
  className?: string
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function PerformanceIndicator({ 
  className, 
  showDetails = false,
  size = 'md'
}: PerformanceIndicatorProps) {
  const { score, rating, isInitialized, hasData, coreWebVitals } = usePerformanceSummary()
  
  if (!isInitialized || !hasData) {
    return null
  }
  
  const getColorClass = () => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }
  
  const getEmoji = () => {
    switch (rating) {
      case 'good': return '✅'
      case 'needs-improvement': return '⚠️'
      case 'poor': return '❌'
      default: return '📊'
    }
  }
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1 text-xs'
      case 'lg': return 'px-4 py-3 text-lg'
      default: return 'px-3 py-2 text-sm'
    }
  }
  
  const getRatingText = () => {
    switch (rating) {
      case 'good': return '좋음'
      case 'needs-improvement': return '개선 필요'
      case 'poor': return '나쁨'
      default: return '알 수 없음'
    }
  }
  
  if (!showDetails) {
    // 간단한 표시 모드
    return (
      <div className={`inline-flex items-center gap-1 rounded-full border ${getColorClass()} ${getSizeClasses()} ${className}`}>
        <span>{getEmoji()}</span>
        <span className="font-medium">{score}</span>
      </div>
    )
  }
  
  // 상세 표시 모드
  return (
    <div className={`rounded-lg border-2 ${getColorClass()} ${className}`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getEmoji()}</span>
          <div>
            <div className="font-semibold">성능 점수</div>
            <div className="text-xs opacity-75">{getRatingText()}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{score}</div>
          <div className="text-xs opacity-75">/100</div>
        </div>
      </div>
      
      {/* Core Web Vitals 요약 */}
      <div className="border-t border-current border-opacity-20 px-3 py-2">
        <div className="text-xs font-medium mb-1">Core Web Vitals</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">LCP</div>
            <div className={coreWebVitals.lcp ? (
              coreWebVitals.lcp.rating === 'good' ? 'text-green-600' :
              coreWebVitals.lcp.rating === 'needs-improvement' ? 'text-yellow-600' :
              'text-red-600'
            ) : 'text-gray-400'}>
              {coreWebVitals.lcp ? `${coreWebVitals.lcp.value}ms` : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">INP</div>
            <div className={coreWebVitals.inp ? (
              coreWebVitals.inp.rating === 'good' ? 'text-green-600' :
              coreWebVitals.inp.rating === 'needs-improvement' ? 'text-yellow-600' :
              'text-red-600'
            ) : 'text-gray-400'}>
              {coreWebVitals.inp ? `${coreWebVitals.inp.value}ms` : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">CLS</div>
            <div className={coreWebVitals.cls ? (
              coreWebVitals.cls.rating === 'good' ? 'text-green-600' :
              coreWebVitals.cls.rating === 'needs-improvement' ? 'text-yellow-600' :
              'text-red-600'
            ) : 'text-gray-400'}>
              {coreWebVitals.cls ? coreWebVitals.cls.value.toFixed(3) : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}