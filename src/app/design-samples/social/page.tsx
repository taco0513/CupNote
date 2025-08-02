/**
 * 소셜 기록 플랫폼 디자인 샘플
 * Instagram + Pinterest 영감 - "Share Your Coffee Story"
 */
'use client'

import Link from 'next/link'
import { ArrowLeft, Camera, Heart, MessageCircle, Share, TrendingUp, Trophy, Users } from 'lucide-react'

export default function SocialDesignSample() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link href="/design-samples" className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">샘플 선택</span>
          </Link>
          <div className="px-3 py-1 bg-purple-600/30 backdrop-blur-md rounded-full border border-purple-500/30">
            <span className="text-xs text-purple-200 font-medium">소셜</span>
          </div>
        </nav>

        {/* Social Style Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CupNote
            </h1>
            <p className="text-neutral-400 text-sm">커피 이야기를 나누어요</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-coffee-400 to-amber-400 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">Z</span>
          </div>
        </header>

        {/* Stories Style CTA */}
        <div className="mb-8">
          <button className="w-full h-24 bg-gradient-to-r from-coffee-500 via-coffee-600 to-amber-500 
                           rounded-3xl text-white text-xl font-bold shadow-2xl
                           hover:shadow-coffee-500/50 hover:scale-102 transition-all duration-300
                           relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center justify-center">
              <Camera className="h-8 w-8 mb-2" />
              <span>오늘의 커피 스토리</span>
            </div>
          </button>
        </div>

        {/* Feed Style Cards */}
        <div className="space-y-6 mb-8">
          
          {/* Trending Coffee */}
          <div className="bg-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-32 bg-gradient-to-br from-coffee-400 to-amber-500 relative">
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>트렌딩 ☕</span>
                    </h3>
                    <p className="text-white/80 text-sm">이번 주 인기 원두</p>
                  </div>
                  <div className="flex items-center space-x-1 text-white">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">112</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-300 text-sm">112명이 기록했어요</span>
                </div>
                <div className="flex space-x-3">
                  <button className="text-neutral-400 hover:text-white transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button className="text-neutral-400 hover:text-white transition-colors">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Challenge */}
          <div className="bg-gradient-to-r from-purple-900 to-coffee-900 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">주간 챌린지</h3>
                <p className="text-white/60 text-sm">새로운 로스터리 3곳 방문하기</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-white/80 mb-1">
                <span>진행률</span>
                <span>2/3</span>
              </div>
              <div className="bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-full h-2 w-2/3 transition-all duration-500"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">68명 참여 중</span>
              <div className="flex items-center space-x-1 text-amber-400">
                <Trophy className="h-3 w-3" />
                <span className="text-xs">200P 획득 가능</span>
              </div>
            </div>
          </div>

          {/* My Recent Record - Social Style */}
          <div className="bg-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-coffee-500 to-amber-500 rounded-full"></div>
                <div>
                  <span className="text-white font-medium">내 기록</span>
                  <p className="text-neutral-400 text-xs">2시간 전</p>
                </div>
                <div className="ml-auto flex items-center space-x-1 text-amber-400">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">12</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-coffee-600 to-amber-600 rounded-xl p-4 mb-3">
                <h4 className="text-white font-semibold mb-2">파나마 게이샤</h4>
                <p className="text-white/90 text-sm leading-relaxed">
                  플로럴하고 우아한 향이 인상적이었어요. 
                  jasmine과 bergamot 향이 느껴져서 마치 차를 마시는 듯한 느낌! 🌸
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-white/70">
                  <span>성수동 안테나샵</span>
                  <span>★ 4.8</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-neutral-400">
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-1 hover:text-white transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">12</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-white transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">3</span>
                  </button>
                </div>
                <button className="hover:text-white transition-colors">
                  <Share className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Community Highlights */}
          <div className="bg-neutral-800 rounded-2xl p-4 shadow-xl">
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span>커뮤니티 하이라이트</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-3">
                <div className="text-white text-sm font-medium mb-1">인기 태그</div>
                <div className="text-purple-200 text-xs">#에티오피아원두</div>
              </div>
              <div className="bg-gradient-to-br from-coffee-600/30 to-amber-600/30 rounded-xl p-3">
                <div className="text-white text-sm font-medium mb-1">핫플레이스</div>
                <div className="text-amber-200 text-xs">성수동 카페거리</div>
              </div>
            </div>
          </div>

        </div>

        {/* Social Navigation */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          <button className="p-3 bg-neutral-800 rounded-xl text-center hover:bg-neutral-700 transition-colors">
            <Camera className="h-5 w-5 mx-auto mb-1 text-purple-400" />
            <span className="text-xs text-neutral-300">스토리</span>
          </button>
          <button className="p-3 bg-neutral-800 rounded-xl text-center hover:bg-neutral-700 transition-colors">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-amber-400" />
            <span className="text-xs text-neutral-300">트렌드</span>
          </button>
          <button className="p-3 bg-neutral-800 rounded-xl text-center hover:bg-neutral-700 transition-colors">
            <Users className="h-5 w-5 mx-auto mb-1 text-green-400" />
            <span className="text-xs text-neutral-300">커뮤니티</span>
          </button>
          <button className="p-3 bg-neutral-800 rounded-xl text-center hover:bg-neutral-700 transition-colors">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
            <span className="text-xs text-neutral-300">챌린지</span>
          </button>
        </div>

        {/* Design Info */}
        <div className="p-4 bg-neutral-800/50 backdrop-blur-md rounded-2xl border border-neutral-700">
          <h4 className="font-semibold text-white mb-2">디자인 특징</h4>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• 다크 테마 기반 인터페이스</li>
            <li>• Stories 스타일 인터랙션</li>
            <li>• 강한 그래디언트와 소셜 요소</li>
            <li>• 커뮤니티 중심 콘텐츠</li>
          </ul>
        </div>

      </div>
    </main>
  )
}