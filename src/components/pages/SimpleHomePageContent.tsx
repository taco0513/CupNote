/**
 * Simplified Home Page Content for debugging
 */
'use client'

import { Coffee } from 'lucide-react'

export default function SimpleHomePageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent-warm to-neutral-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Coffee className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">CupNote</h1>
          <p className="text-neutral-600 text-lg">
            누구나 전문가처럼, 그러나 자기만의 방식으로
          </p>
        </div>

        {/* Quick Actions */}
        <div className="max-w-md mx-auto space-y-4">
          <a
            href="/mode-selection"
            className="block w-full bg-accent-warm text-white py-4 px-6 rounded-xl text-center font-semibold hover:bg-accent-warm/90 transition-colors"
          >
            ☕ 새 커피 기록하기
          </a>
          
          <div className="grid grid-cols-3 gap-4">
            <a
              href="/my-records"
              className="bg-white p-4 rounded-lg text-center shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium text-neutral-700">기록</div>
            </a>
            
            <a
              href="/stats"
              className="bg-white p-4 rounded-lg text-center shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-neutral-700">통계</div>
            </a>
            
            <a
              href="/search"
              className="bg-white p-4 rounded-lg text-center shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm font-medium text-neutral-700">검색</div>
            </a>
          </div>
        </div>

        {/* Simple tip */}
        <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-lg border border-neutral-200">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-neutral-800 mb-1">커피 팁</h3>
              <p className="text-sm text-neutral-600">
                매일 같은 시간에 커피를 마시면 더 정확한 맛 평가를 할 수 있어요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}