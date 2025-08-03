import React from 'react'

import Link from 'next/link'

import { Coffee, Search, Filter, Plus, TrendingUp, Award } from 'lucide-react'

interface EmptyStateProps {
  type: 'no-records' | 'no-search-results' | 'no-achievements' | 'no-stats'
  searchQuery?: string
  hasFilters?: boolean
  className?: string
}

const emptyStateConfigs = {
  'no-records': {
    icon: Coffee,
    title: '아직 커피 기록이 없어요',
    description: '첫 번째 커피 경험을 기록하고\n나만의 커피 여정을 시작해보세요!',
    actionText: '첫 기록 작성하기',
    actionHref: '/mode-selection',
    tips: [
      '☕ 카페에서 마신 커피도 OK',
      '🏠 집에서 내린 커피도 OK',
      '📸 사진과 함께 더 생생하게'
    ]
  },
  'no-search-results': {
    icon: Search,
    title: '검색 결과가 없어요',
    description: '다른 검색어를 시도하거나\n필터를 조정해보세요',
    tips: [
      '🔍 더 짧은 검색어 사용',
      '📝 오타가 있는지 확인',
      '🎯 필터 조건 완화'
    ]
  },
  'no-achievements': {
    icon: Award,
    title: '아직 달성한 성취가 없어요',
    description: '커피를 기록하면서\n다양한 성취를 달성해보세요!',
    actionText: '커피 기록하기',
    actionHref: '/mode-selection',
    tips: [
      '🏆 첫 기록 작성하기',
      '⭐ 5점 평가 주기',
      '📅 연속 기록 도전'
    ]
  },
  'no-stats': {
    icon: TrendingUp,
    title: '아직 통계 데이터가 없어요',
    description: '커피를 기록하면\n흥미로운 통계를 볼 수 있어요',
    actionText: '기록 시작하기',
    actionHref: '/mode-selection',
    tips: [
      '📊 선호도 패턴 발견',
      '☕ 즐겨 찾는 카페 분석',
      '🌍 원산지별 취향 파악'
    ]
  }
}

export default function EmptyState({ 
  type, 
  searchQuery, 
  hasFilters, 
  className = '' 
}: EmptyStateProps) {
  const config = emptyStateConfigs[type]
  const Icon = config.icon

  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 bg-coffee-100 rounded-full mb-6">
        <Icon className="h-10 w-10 text-coffee-600" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-coffee-800 mb-3">
        {config.title}
        {searchQuery && (
          <span className="block text-base font-normal text-coffee-600 mt-1">
            "{searchQuery}" 검색 결과
          </span>
        )}
      </h3>

      {/* Description */}
      <p className="text-coffee-600 mb-6 whitespace-pre-line max-w-sm mx-auto">
        {config.description}
      </p>

      {/* Action Button */}
      {config.actionText && config.actionHref && !hasFilters && (
        <Link
          href={config.actionHref}
          className="inline-flex items-center space-x-2 bg-coffee-600 text-white px-6 py-3 rounded-full hover:bg-coffee-700 transition-colors mb-8"
        >
          <Plus className="h-5 w-5" />
          <span>{config.actionText}</span>
        </Link>
      )}

      {/* Tips */}
      {config.tips && !hasFilters && (
        <div className="bg-coffee-50 rounded-xl p-6 max-w-sm mx-auto">
          <h4 className="text-sm font-medium text-coffee-700 mb-3">💡 시작하기 팁</h4>
          <ul className="space-y-2 text-left">
            {config.tips.map((tip, index) => (
              <li key={index} className="text-sm text-coffee-600">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clear Filters Button (for search/filter scenarios) */}
      {hasFilters && (
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center space-x-2 text-coffee-600 hover:text-coffee-700 font-medium"
        >
          <Filter className="h-4 w-4" />
          <span>필터 초기화하고 다시 시도</span>
        </button>
      )}
    </div>
  )
}