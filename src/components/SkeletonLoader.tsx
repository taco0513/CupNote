/**
 * Skeleton Loader Component - 하이브리드 디자인 시스템
 * 미니멀 구조 + 프리미엄 애니메이션
 */
import React from 'react'

interface SkeletonLoaderProps {
  variant: 'card' | 'list' | 'stats' | 'achievement' | 'profile' | 'text' | 'button' | 'coffee-card' | 'analytics'
  count?: number
  className?: string
}

export default function SkeletonLoader({ variant, count = 1, className = '' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-coffee-200/30 p-6 animate-pulse">
            <div className="aspect-video bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-xl mb-4 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg mb-2 shimmer"></div>
            <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg mb-4 w-2/3 shimmer"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg shimmer"></div>
              <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-3/4 shimmer"></div>
            </div>
          </div>
        )
      
      case 'coffee-card':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-coffee-200/30 p-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-xl flex-shrink-0 shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-3/4 shimmer"></div>
                <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-1/2 shimmer"></div>
                <div className="flex items-center space-x-2 mt-3">
                  <div className="h-3 w-3 bg-coffee-200 rounded-full shimmer"></div>
                  <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-1/4 shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-coffee-200/30 p-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-lg flex-shrink-0 shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-3/4 shimmer"></div>
                <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-1/2 shimmer"></div>
                <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-1/4 shimmer"></div>
              </div>
            </div>
          </div>
        )
      
      case 'stats':
        return (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-coffee-200/30 p-4 text-center animate-pulse">
            <div className="w-10 h-10 bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-xl mx-auto mb-3 shimmer"></div>
            <div className="h-6 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-16 mx-auto mb-2 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-24 mx-auto shimmer"></div>
          </div>
        )
      
      case 'achievement':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-coffee-200/30 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl flex-shrink-0 shimmer"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-32 shimmer"></div>
                  <div className="h-5 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-full w-20 shimmer"></div>
                </div>
                <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg mb-3 w-full shimmer"></div>
                <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg mb-3 w-3/4 shimmer"></div>
                <div className="w-full bg-coffee-100 rounded-full h-2">
                  <div className="h-2 bg-gradient-to-r from-coffee-300 to-coffee-400 rounded-full w-1/3 shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'profile':
        return (
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-full mx-auto mb-4 shimmer"></div>
            <div className="h-6 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-32 mx-auto mb-2 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-48 mx-auto shimmer"></div>
          </div>
        )
      
      case 'analytics':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-coffee-200/30 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-32 shimmer"></div>
              <div className="h-8 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-24 shimmer"></div>
            </div>
            <div className="h-48 bg-gradient-to-r from-coffee-50 to-coffee-100 rounded-xl shimmer"></div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg shimmer"></div>
              <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg shimmer"></div>
              <div className="h-3 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg shimmer"></div>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-full shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-5/6 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-lg w-4/6 shimmer"></div>
          </div>
        )
      
      case 'button':
        return (
          <div className="h-12 bg-gradient-to-r from-coffee-200 to-coffee-300 rounded-xl animate-pulse shimmer"></div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={index > 0 ? 'mt-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

// Named exports for convenience
export function CardSkeleton({ count = 1, className = '' }: { count?: number; className?: string }) {
  return <SkeletonLoader variant="card" count={count} className={className} />
}

export function ListSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return <SkeletonLoader variant="list" count={count} className={className} />
}

export function StatsSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader key={index} variant="stats" />
      ))}
    </div>
  )
}

export function AchievementSkeleton({ count = 2, className = '' }: { count?: number; className?: string }) {
  return <SkeletonLoader variant="achievement" count={count} className={className} />
}

export function ProfileSkeleton({ className = '' }: { className?: string }) {
  return <SkeletonLoader variant="profile" className={className} />
}

export function CoffeeCardSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return <SkeletonLoader variant="coffee-card" count={count} className={className} />
}

export function AnalyticsSkeleton({ count = 2, className = '' }: { count?: number; className?: string }) {
  return <SkeletonLoader variant="analytics" count={count} className={className} />
}

export function TextSkeleton({ className = '' }: { className?: string }) {
  return <SkeletonLoader variant="text" className={className} />
}

export function ButtonSkeleton({ className = '' }: { className?: string }) {
  return <SkeletonLoader variant="button" className={className} />
}

export function CardGridSkeleton({ count = 6, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader key={index} variant="card" />
      ))}
    </div>
  )
}

export function StatsGridSkeleton({ className = '' }: { className?: string }) {
  return <StatsSkeleton count={3} className={className} />
}

export function AchievementGridSkeleton({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader key={index} variant="achievement" />
      ))}
    </div>
  )
}