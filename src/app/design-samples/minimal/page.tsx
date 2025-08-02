/**
 * 미니멀 저널링 디자인 샘플
 * Meta Design 영감 - "Focus on What Matters"
 */
'use client'

import Link from 'next/link'
import { ArrowLeft, Coffee, BookOpen, TrendingUp } from 'lucide-react'

export default function MinimalDesignSample() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="max-w-sm mx-auto">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link href="/design-samples" className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">샘플 선택</span>
          </Link>
          <div className="px-3 py-1 bg-neutral-200 rounded-full">
            <span className="text-xs text-neutral-700 font-medium">미니멀</span>
          </div>
        </nav>

        {/* Simple Header */}
        <header className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">오늘의 커피</h1>
          <p className="text-neutral-600 text-sm">간단하고 명확하게</p>
        </header>

        {/* Main Action - Large and Clear */}
        <div className="mb-12">
          <button className="w-full h-16 bg-coffee-500 hover:bg-coffee-600 text-white rounded-2xl text-lg font-medium transition-colors duration-200 shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <Coffee className="h-5 w-5" />
              <span>새 커피 기록하기</span>
            </div>
          </button>
        </div>

        {/* Recent Record - Only One */}
        <div className="mb-12">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-coffee-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Coffee className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800 mb-1">어제의 기록</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  산뜻하고 상큼한 맛이었어요. 
                  아침에 마시기 딱 좋은 느낌이었습니다.
                </p>
                <div className="mt-2 text-xs text-neutral-500">
                  카페 모모 • 어제
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Stats */}
        <div className="mb-12">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-coffee-600 mb-1">7</div>
              <div className="text-xs text-neutral-600">이번 주</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-coffee-600 mb-1">23</div>
              <div className="text-xs text-neutral-600">총 기록</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-coffee-600 mb-1">4.2</div>
              <div className="text-xs text-neutral-600">평균 평점</div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mb-8">
          <div className="text-center p-4 bg-coffee-50 rounded-xl border border-coffee-100">
            <p className="text-coffee-700 text-sm">
              커피 여정 23일째! 계속해보세요 ✨
            </p>
          </div>
        </div>

        {/* Simple Navigation */}
        <div className="grid grid-cols-3 gap-3">
          <button className="p-4 bg-white border border-neutral-200 rounded-xl text-center hover:bg-neutral-50 transition-colors">
            <BookOpen className="h-5 w-5 mx-auto mb-2 text-neutral-600" />
            <span className="text-xs text-neutral-700">기록</span>
          </button>
          <button className="p-4 bg-white border border-neutral-200 rounded-xl text-center hover:bg-neutral-50 transition-colors">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-neutral-600" />
            <span className="text-xs text-neutral-700">통계</span>
          </button>
          <button className="p-4 bg-white border border-neutral-200 rounded-xl text-center hover:bg-neutral-50 transition-colors">
            <Coffee className="h-5 w-5 mx-auto mb-2 text-neutral-600" />
            <span className="text-xs text-neutral-700">탐색</span>
          </button>
        </div>

        {/* Design Info */}
        <div className="mt-8 p-4 bg-neutral-100 rounded-xl">
          <h4 className="font-medium text-neutral-800 mb-2">디자인 특징</h4>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• 한 번에 하나의 액션만 강조</li>
            <li>• 충분한 여백과 간격</li>
            <li>• 4개 핵심 컬러만 사용</li>
            <li>• 인지 부담 최소화</li>
          </ul>
        </div>

      </div>
    </main>
  )
}