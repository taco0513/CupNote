/**
 * Enhanced Empty State Component
 * 매력적이고 액션 지향적인 빈 상태 UI
 */
'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  variant?: 'default' | 'coffee' | 'achievement' | 'search'
  illustration?: 'coffee-cup' | 'trophy' | 'search' | 'records' | 'custom'
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  variant = 'default',
  illustration
}: EmptyStateProps) {
  // 일러스트레이션 렌더링
  const renderIllustration = () => {
    if (icon) {
      return (
        <div className={`
          w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center
          ${variant === 'coffee' ? 'bg-gradient-to-br from-coffee-100 to-amber-50 text-coffee-500' :
            variant === 'achievement' ? 'bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-500' :
            variant === 'search' ? 'bg-gradient-to-br from-blue-100 to-sky-50 text-blue-500' :
            'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400'}
          shadow-sm
        `}>
          <div className="text-4xl">{icon}</div>
        </div>
      )
    }

    // 기본 일러스트레이션
    switch (illustration) {
      case 'coffee-cup':
        return (
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-full opacity-20 blur-xl"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-coffee-100 to-amber-50 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl">☕</span>
            </div>
          </div>
        )
      case 'trophy':
        return (
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-full opacity-20 blur-xl"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-amber-100 to-yellow-50 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl">🏆</span>
            </div>
          </div>
        )
      case 'search':
        return (
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-sky-300 rounded-full opacity-20 blur-xl"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-blue-100 to-sky-50 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl">🔍</span>
            </div>
          </div>
        )
      case 'records':
        return (
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-20 blur-xl"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-pink-50 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl">📚</span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      {/* 일러스트레이션 */}
      {renderIllustration()}
      
      {/* 타이틀 */}
      <h3 className={`
        text-xl font-bold mb-3
        ${variant === 'coffee' ? 'text-coffee-800' :
          variant === 'achievement' ? 'text-amber-800' :
          variant === 'search' ? 'text-blue-800' :
          'text-gray-800'}
      `}>
        {title}
      </h3>
      
      {/* 설명 */}
      {description && (
        <p className={`
          text-sm leading-relaxed mb-8 max-w-md mx-auto
          ${variant === 'coffee' ? 'text-coffee-600' :
            variant === 'achievement' ? 'text-amber-600' :
            variant === 'search' ? 'text-blue-600' :
            'text-gray-600'}
        `}>
          {description}
        </p>
      )}
      
      {/* 액션 버튼 */}
      {action && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {action}
        </div>
      )}
      
      {/* 추가 힌트 (선택적) */}
      {variant === 'coffee' && !action && (
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center space-x-2 text-xs text-coffee-500 bg-coffee-50 px-3 py-1.5 rounded-full">
            <span>💡</span>
            <span>Tip: 하루에 한 잔씩 기록하면 당신만의 커피 지도가 완성됩니다</span>
          </div>
        </div>
      )}
    </div>
  )
}