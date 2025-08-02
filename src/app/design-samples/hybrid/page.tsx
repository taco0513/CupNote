/**
 * 미니멀 + 프리미엄 하이브리드 디자인 샘플
 * 디자인팀 추천 버전 - "Simple Elegance"
 */
'use client'

import Link from 'next/link'
import { ArrowLeft, Coffee, Star, TrendingUp, Sparkles, Award } from 'lucide-react'

export default function HybridDesignSample() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-coffee-50 to-neutral-50 px-4 py-6">
      <div className="max-w-sm mx-auto">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link href="/design-samples" className="flex items-center space-x-2 text-coffee-600 hover:text-coffee-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">샘플 선택</span>
          </Link>
          <div className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full border border-coffee-200/30 shadow-sm">
            <span className="text-xs text-coffee-700 font-medium">하이브리드 ✨</span>
          </div>
        </nav>

        {/* Elegant Header - 미니멀의 단순함 + 프리미엄의 품질감 */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center shadow-lg">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-coffee-800">오늘의 커피</h1>
          </div>
          <p className="text-coffee-600">간단하고 우아하게</p>
        </header>

        {/* Premium Main Action with Minimal Design */}
        <div className="mb-12">
          <button className="w-full h-18 bg-white/90 backdrop-blur-sm border border-coffee-200/50 
                           rounded-2xl shadow-lg hover:shadow-xl text-coffee-800 text-lg font-semibold
                           hover:scale-102 transition-all duration-200 group relative overflow-hidden">
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-coffee-400/5 to-coffee-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative flex items-center justify-center space-x-3 py-4">
              <div className="w-10 h-10 bg-coffee-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <span>새 커피 기록하기</span>
            </div>
          </button>
        </div>

        {/* Clean Stats with Subtle Premium Touch */}
        <div className="mb-12">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-coffee-100/50 shadow-sm">
              <div className="text-2xl font-bold text-coffee-700 mb-1">7</div>
              <div className="text-xs text-coffee-600">이번 주</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-coffee-100/50 shadow-sm">
              <div className="text-2xl font-bold text-coffee-700 mb-1">23</div>
              <div className="text-xs text-coffee-600">총 기록</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-coffee-100/50 shadow-sm">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-2xl font-bold text-coffee-700">4.2</span>
                <Star className="h-4 w-4 text-amber-400 fill-current" />
              </div>
              <div className="text-xs text-coffee-600">평균 평점</div>
            </div>
          </div>
        </div>

        {/* Minimal Recent Record with Premium Feel */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-coffee-800 mb-4">최근 기록</h3>
          <div className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-coffee-400 to-coffee-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-coffee-800">블루보틀 블렌드</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <span className="text-sm font-medium text-coffee-700">4.8</span>
                  </div>
                </div>
                <p className="text-coffee-600 text-sm leading-relaxed mb-2">
                  산뜻하고 상큼한 맛이었어요. 아침에 마시기 딱 좋은 느낌이었습니다.
                </p>
                <div className="text-xs text-coffee-500">
                  카페 모모 • 어제
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Achievement */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-coffee-100/80 to-amber-50/80 backdrop-blur-sm rounded-2xl p-4 border border-coffee-200/30 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-coffee-800">커피 여정 23일째!</h4>
                <p className="text-coffee-600 text-sm">새로운 성취를 달성했어요 ✨</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Navigation with Premium Touch */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button className="p-4 bg-white/70 backdrop-blur-sm border border-coffee-200/30 rounded-2xl text-center hover:bg-white/90 hover:shadow-md transition-all duration-200">
            <Coffee className="h-6 w-6 mx-auto mb-2 text-coffee-600" />
            <span className="text-sm text-coffee-700 font-medium">기록</span>
          </button>
          <button className="p-4 bg-white/70 backdrop-blur-sm border border-coffee-200/30 rounded-2xl text-center hover:bg-white/90 hover:shadow-md transition-all duration-200">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-coffee-600" />
            <span className="text-sm text-coffee-700 font-medium">통계</span>
          </button>
          <button className="p-4 bg-white/70 backdrop-blur-sm border border-coffee-200/30 rounded-2xl text-center hover:bg-white/90 hover:shadow-md transition-all duration-200">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-coffee-600" />
            <span className="text-sm text-coffee-700 font-medium">탐색</span>
          </button>
        </div>

        {/* Design Philosophy */}
        <div className="p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-coffee-200/30 shadow-sm">
          <h4 className="font-semibold text-coffee-800 mb-3 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-coffee-500" />
            <span>하이브리드 디자인 철학</span>
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-coffee-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-coffee-600 text-xs">1</span>
              </div>
              <div>
                <div className="font-medium text-coffee-800">미니멀의 단순함</div>
                <div className="text-coffee-600">한 번에 하나의 액션, 명확한 정보 계층</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-coffee-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-coffee-600 text-xs">2</span>
              </div>
              <div>
                <div className="font-medium text-coffee-800">프리미엄의 품질감</div>
                <div className="text-coffee-600">글래스 효과, 부드러운 그라데이션, 섬세한 그림자</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-coffee-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-coffee-600 text-xs">3</span>
              </div>
              <div>
                <div className="font-medium text-coffee-800">균형잡힌 경험</div>
                <div className="text-coffee-600">직관적 사용성과 시각적 매력의 조화</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-coffee-50/50 rounded-xl">
            <p className="text-coffee-700 text-sm text-center font-medium">
              🎯 MVP에 최적화된 디자인팀 추천 버전
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}