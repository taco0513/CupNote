/**
 * Global Loading UI for App Router
 * Displays during navigation between routes
 */
import { Coffee } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Coffee icon with animated steam */}
          <Coffee className="h-12 w-12 text-coffee-600 mx-auto mb-4" />
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-6 bg-gradient-to-t from-transparent via-coffee-300 to-transparent animate-pulse"></div>
            <div className="w-1 h-4 bg-gradient-to-t from-transparent via-coffee-400 to-transparent animate-pulse delay-150 absolute left-1"></div>
            <div className="w-1 h-5 bg-gradient-to-t from-transparent via-coffee-300 to-transparent animate-pulse delay-300 absolute -left-1"></div>
          </div>
        </div>
        
        {/* Animated loading text */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-coffee-600 font-medium">로딩 중</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-coffee-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-coffee-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-coffee-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
          
          {/* Subtle progress bar */}
          <div className="w-48 h-1 bg-coffee-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-coffee-400 to-coffee-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}