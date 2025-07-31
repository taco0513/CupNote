'use client'

import { Coffee } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullscreen?: boolean
  overlay?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

export default function LoadingSpinner({
  size = 'md',
  text = '로딩 중...',
  fullscreen = false,
  overlay = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <Coffee className={`${sizeClasses[size]} text-coffee-600 animate-bounce`} />
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-coffee-200 border-t-coffee-600 rounded-full animate-spin`}
        />
      </div>
      {text && <p className={`${textSizeClasses[size]} text-coffee-600 font-medium`}>{text}</p>}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
        {content}
      </div>
    )
  }

  return content
}

// 인라인 로딩 스피너 (버튼 등에 사용)
export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div
      className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}
    />
  )
}

// 스켈레톤 로딩 컴포넌트
export function SkeletonLoader({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded h-4 mb-3 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

// 카드 스켈레톤
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border border-coffee-100 animate-pulse ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

// 리스트 스켈레톤
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}
