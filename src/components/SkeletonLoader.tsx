import React from 'react'

interface SkeletonLoaderProps {
  variant: 'card' | 'list' | 'stats' | 'achievement' | 'profile' | 'text' | 'button'
  count?: number
  className?: string
}

export default function SkeletonLoader({ variant, count = 1, className = '' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        )
      
      case 'stats':
        return (
          <div className="bg-white rounded-xl shadow-sm p-4 text-center animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        )
      
      case 'achievement':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-3 w-full"></div>
                <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="w-full bg-gray-200 rounded-full h-2"></div>
              </div>
            </div>
          </div>
        )
      
      case 'profile':
        return (
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        )
      
      case 'text':
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        )
      
      case 'button':
        return (
          <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

// Specific skeleton components for common use cases
export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    <SkeletonLoader variant="card" count={count} />
  </div>
)

export const ListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-4">
    <SkeletonLoader variant="list" count={count} />
  </div>
)

export const StatsGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SkeletonLoader variant="stats" count={count} />
  </div>
)

export const AchievementGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SkeletonLoader variant="achievement" count={count} />
  </div>
)