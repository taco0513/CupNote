/**
 * Loading UI for Settings Page
 * Shows skeleton layout while settings are being loaded
 */
import { Settings, Database, Bell, Coffee } from 'lucide-react'

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      {/* Page Header Skeleton */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-coffee-200 rounded-lg animate-pulse flex items-center justify-center">
            <Settings className="h-4 w-4 text-coffee-300" />
          </div>
          <div>
            <div className="w-16 h-6 bg-coffee-200 rounded animate-pulse mb-2"></div>
            <div className="w-32 h-4 bg-coffee-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Settings Sections Skeleton */}
      <div className="px-6 space-y-6">
        {/* App Settings Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-coffee-200 rounded animate-pulse flex items-center justify-center">
              <Coffee className="h-3 w-3 text-coffee-300" />
            </div>
            <div className="w-24 h-5 bg-coffee-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="w-32 h-4 bg-coffee-200 rounded animate-pulse mb-2"></div>
                  <div className="w-48 h-3 bg-coffee-100 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-6 bg-coffee-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-coffee-200 rounded animate-pulse flex items-center justify-center">
              <Bell className="h-3 w-3 text-coffee-300" />
            </div>
            <div className="w-20 h-5 bg-coffee-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="w-28 h-4 bg-coffee-200 rounded animate-pulse mb-2"></div>
                  <div className="w-40 h-3 bg-coffee-100 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-6 bg-coffee-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-coffee-200 rounded animate-pulse flex items-center justify-center">
              <Database className="h-3 w-3 text-coffee-300" />
            </div>
            <div className="w-20 h-5 bg-coffee-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-coffee-50/50 rounded-lg border border-coffee-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-24 h-4 bg-coffee-200 rounded animate-pulse mb-2"></div>
                    <div className="w-36 h-3 bg-coffee-100 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-8 bg-coffee-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/90 backdrop-blur-sm border border-coffee-200/50 rounded-full px-4 py-2 shadow-lg flex items-center space-x-2">
          <Settings className="h-4 w-4 text-coffee-600 animate-pulse" />
          <span className="text-sm text-coffee-600">설정을 불러오는 중...</span>
        </div>
      </div>
    </div>
  )
}