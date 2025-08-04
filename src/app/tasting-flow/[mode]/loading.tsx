/**
 * Loading UI for Tasting Flow Mode
 * Shows while switching between tasting flow steps
 */
import { Coffee, Clock } from 'lucide-react'

export default function TastingFlowLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-neutral-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        {/* Animated Coffee Cup */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Coffee className="h-10 w-10 text-white" />
          </div>
          
          {/* Steam animation */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-0.5 h-8 bg-gradient-to-t from-coffee-300 via-coffee-200 to-transparent animate-pulse"></div>
              <div className="w-0.5 h-6 bg-gradient-to-t from-coffee-400 via-coffee-300 to-transparent animate-pulse delay-150"></div>
              <div className="w-0.5 h-7 bg-gradient-to-t from-coffee-300 via-coffee-200 to-transparent animate-pulse delay-300"></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-coffee-800 mb-3">
          테이스팅 준비 중
        </h2>
        
        <p className="text-coffee-600 mb-6">
          최적의 기록 환경을 준비하고 있어요
        </p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Clock className="h-4 w-4 text-coffee-400" />
          <span className="text-sm text-coffee-500">잠시만 기다려주세요</span>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-coffee-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-coffee-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-coffee-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  )
}