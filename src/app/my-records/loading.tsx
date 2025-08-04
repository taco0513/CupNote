/**
 * Loading UI for My Records Page
 * Shows skeleton layout while records are being loaded
 */
import { Coffee, BarChart3, List } from 'lucide-react'

export default function MyRecordsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      {/* Page Header Skeleton */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-coffee-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="w-24 h-6 bg-coffee-200 rounded animate-pulse mb-2"></div>
            <div className="w-40 h-4 bg-coffee-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-4 md:p-6 shadow-md">
              <div className="flex items-center lg:items-start lg:flex-col">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-coffee-200 rounded-xl animate-pulse"></div>
                <div className="ml-4 lg:ml-0 lg:mt-4 flex-1">
                  <div className="w-8 h-6 lg:w-12 lg:h-8 bg-coffee-200 rounded animate-pulse mb-2"></div>
                  <div className="w-16 h-4 bg-coffee-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="px-6 mb-6">
        <div className="flex space-x-2 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-coffee-200/30">
          <div className="flex-1 h-12 bg-coffee-200 rounded-lg animate-pulse flex items-center justify-center">
            <List className="h-5 w-5 text-coffee-300" />
          </div>
          <div className="flex-1 h-12 bg-coffee-100 rounded-lg animate-pulse flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-coffee-200" />
          </div>
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="px-6">
        <div className="lg:flex lg:gap-8">
          {/* Desktop Sidebar Skeleton */}
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-6 shadow-lg">
              <div className="w-32 h-6 bg-coffee-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                <div className="w-full h-12 bg-coffee-100 rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 bg-coffee-100 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="w-full h-10 bg-coffee-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="w-48 h-8 bg-coffee-200 rounded animate-pulse mb-2"></div>
                <div className="w-64 h-4 bg-coffee-100 rounded animate-pulse"></div>
              </div>
              <div className="flex space-x-3">
                <div className="w-24 h-10 bg-coffee-100 rounded-lg animate-pulse"></div>
                <div className="w-32 h-10 bg-coffee-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="lg:hidden mb-6">
              <div className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-4">
                <div className="w-full h-10 bg-coffee-100 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Coffee List Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-4 shadow-md">
                  <div className="w-full h-32 bg-coffee-100 rounded-lg animate-pulse mb-4"></div>
                  <div className="w-3/4 h-5 bg-coffee-200 rounded animate-pulse mb-2"></div>
                  <div className="w-1/2 h-4 bg-coffee-100 rounded animate-pulse mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-4 bg-coffee-100 rounded animate-pulse"></div>
                    <div className="w-12 h-6 bg-coffee-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/90 backdrop-blur-sm border border-coffee-200/50 rounded-full px-4 py-2 shadow-lg flex items-center space-x-2">
          <Coffee className="h-4 w-4 text-coffee-600 animate-pulse" />
          <span className="text-sm text-coffee-600">기록을 불러오는 중...</span>
        </div>
      </div>
    </div>
  )
}