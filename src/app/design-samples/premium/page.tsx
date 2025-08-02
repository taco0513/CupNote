/**
 * 프리미엄 커피 경험 디자인 샘플
 * Apple HIG + Tesla 영감 - "Craft & Precision"
 */
'use client'

import Link from 'next/link'
import { ArrowLeft, Coffee, Star, Award, Sparkles } from 'lucide-react'

export default function PremiumDesignSample() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 px-4 py-6">
      <div className="max-w-sm mx-auto">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link href="/design-samples" className="flex items-center space-x-2 text-coffee-600 hover:text-coffee-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">샘플 선택</span>
          </Link>
          <div className="px-3 py-1 bg-white/60 backdrop-blur-md rounded-full border border-coffee-200/50">
            <span className="text-xs text-coffee-700 font-medium">프리미엄</span>
          </div>
        </nav>

        {/* Premium Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-coffee-500" />
            <h1 className="text-3xl font-bold text-coffee-800">CupNote</h1>
            <Sparkles className="h-6 w-6 text-coffee-500" />
          </div>
          <p className="text-coffee-600 font-medium">정성스러운 커피 기록</p>
        </header>

        {/* Glass Effect Main CTA */}
        <div className="mb-12">
          <button className="w-full h-20 bg-white/80 backdrop-blur-lg border border-coffee-200/50 
                           rounded-3xl shadow-2xl text-coffee-800 text-xl font-semibold
                           hover:scale-102 hover:shadow-coffee-500/20 transition-all duration-300
                           relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-coffee-400/10 to-coffee-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <span>새로운 커피 경험</span>
            </div>
          </button>
        </div>

        {/* Premium Statistics Cards */}
        <div className="mb-12 grid grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-coffee-200/30 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Coffee className="h-5 w-5 text-coffee-500" />
              <span className="text-sm text-coffee-600 font-medium">이번 달</span>
            </div>
            <div className="text-3xl font-bold text-coffee-700 mb-1">12</div>
            <div className="text-xs text-coffee-500">+3 지난 달 대비</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-coffee-200/30 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="text-sm text-coffee-600 font-medium">평균 평점</span>
            </div>
            <div className="text-3xl font-bold text-coffee-700 mb-1">4.8</div>
            <div className="flex items-center">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= 4 ? 'text-amber-400 fill-current' : 'text-amber-200'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Premium Recent Record */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-coffee-200/50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-coffee-800 text-lg">블루보틀 블렌드</h3>
                <p className="text-coffee-600 text-sm">스페셜티 커피</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="text-sm font-medium text-coffee-700">4.8</span>
                </div>
              </div>
            </div>
            <p className="text-coffee-700 mb-4 leading-relaxed">
              산뜻하고 깔끔한 뒷맛이 인상적이었습니다. 
              시트러스 노트가 은은하게 느껴져요.
            </p>
            <div className="flex items-center justify-between text-xs text-coffee-500">
              <span>홍대 블루보틀</span>
              <span>2시간 전</span>
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-amber-100 to-coffee-100 rounded-2xl p-4 border border-amber-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-coffee-800">커피 탐험가</h4>
                <p className="text-coffee-600 text-sm">5개 로스터리 방문 완료!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Navigation */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button className="p-4 bg-white/60 backdrop-blur-md border border-coffee-200/30 rounded-2xl text-center hover:bg-white/80 transition-all duration-200 shadow-lg">
            <Coffee className="h-6 w-6 mx-auto mb-2 text-coffee-600" />
            <span className="text-sm text-coffee-700 font-medium">기록</span>
          </button>
          <button className="p-4 bg-white/60 backdrop-blur-md border border-coffee-200/30 rounded-2xl text-center hover:bg-white/80 transition-all duration-200 shadow-lg">
            <Star className="h-6 w-6 mx-auto mb-2 text-coffee-600" />
            <span className="text-sm text-coffee-700 font-medium">분석</span>
          </button>
          <button className="p-4 bg-white/60 backdrop-blur-md border border-coffee-200/30 rounded-2xl text-center hover:bg-white/80 transition-all duration-200 shadow-lg">
            <Award className="h-6 w-6 mx-auto mb-2 text-coffee-600" />
            <span className="text-sm text-coffee-700 font-medium">성취</span>
          </button>
        </div>

        {/* Design Info */}
        <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-coffee-200/30">
          <h4 className="font-semibold text-coffee-800 mb-2">디자인 특징</h4>
          <ul className="text-sm text-coffee-600 space-y-1">
            <li>• 글래스모피즘 효과 (backdrop-blur)</li>
            <li>• 큰 터치 영역 (72px 높이)</li>
            <li>• 그래디언트 배경과 섀도우</li>
            <li>• 부드러운 호버 애니메이션</li>
          </ul>
        </div>

      </div>
    </main>
  )
}