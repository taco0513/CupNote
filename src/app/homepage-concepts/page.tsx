/**
 * 데스크탑 홈페이지 3가지 컨셉 디자인
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Coffee, Star, Award, ChevronRight, Sparkles, ArrowRight, Target, BarChart3, Trophy, Clock, Users, Smartphone, TrendingUp, ChevronLeft, Home } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import UnifiedButton from '../../components/ui/UnifiedButton'

export default function HomepageConceptsPage() {
  const [currentConcept, setCurrentConcept] = useState<1 | 2 | 3>(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50">
      {/* 네비게이션 헤더 */}
      <div className="bg-white border-b border-coffee-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-coffee-700 hover:text-coffee-800">
                <Home className="h-5 w-5" />
                <span>홈으로</span>
              </Link>
              <span className="text-coffee-400">|</span>
              <h1 className="text-xl font-semibold text-coffee-800">홈페이지 컨셉 디자인</h1>
            </div>
            
            {/* 컨셉 선택 버튼 */}
            <div className="flex space-x-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentConcept(num as 1 | 2 | 3)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentConcept === num
                      ? 'bg-coffee-500 text-white shadow-lg'
                      : 'bg-white text-coffee-600 hover:bg-coffee-100 border border-coffee-200'
                  }`}
                >
                  컨셉 {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 컨셉 1: 미니멀 센터 포커스 */}
      {currentConcept === 1 && (
        <div className="py-16">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              컨셉 1: 미니멀 센터 포커스
            </span>
            <p className="text-coffee-600">깔끔하고 집중된 중앙 정렬 디자인</p>
          </div>
          
          <div className="max-w-5xl mx-auto px-4">
            {/* 메인 히어로 */}
            <div className="text-center mb-16">
              <div className="inline-block p-4 bg-coffee-100 rounded-full mb-6">
                <Coffee className="h-12 w-12 text-coffee-600" />
              </div>
              
              <h1 className="text-6xl font-bold text-coffee-800 mb-6">
                당신의 커피 이야기를
                <span className="block text-coffee-600 mt-2">기록하고 성장하세요</span>
              </h1>
              
              <p className="text-xl text-coffee-600 max-w-2xl mx-auto mb-8">
                매일의 커피 경험을 기록하고, AI가 분석한 당신만의 취향을 발견하세요
              </p>
              
              <div className="flex gap-4 justify-center mb-12">
                <UnifiedButton variant="primary" size="large" className="bg-coffee-500 hover:bg-coffee-600 px-8 py-4">
                  <Coffee className="h-5 w-5 mr-2" />
                  무료로 시작하기
                </UnifiedButton>
                <UnifiedButton variant="outline" size="large" className="border-coffee-300 px-8 py-4">
                  구경하기
                </UnifiedButton>
              </div>
              
              {/* 신뢰 지표 */}
              <div className="flex items-center justify-center space-x-8 text-coffee-600">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>1,000+ 사용자</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                  <span className="ml-1">5.0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>2024 베스트앱</span>
                </div>
              </div>
            </div>
            
            {/* 3가지 핵심 기능 */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: <Target />, title: "간단한 기록", desc: "2분이면 충분한 쉬운 기록" },
                { icon: <BarChart3 />, title: "AI 분석", desc: "개인화된 취향 분석과 추천" },
                { icon: <Trophy />, title: "성장 추적", desc: "나의 커피 여정을 한눈에" }
              ].map((item, i) => (
                <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-coffee-100 rounded-full flex items-center justify-center text-coffee-600">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-coffee-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-coffee-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 컨셉 2: 사이드 바이 사이드 */}
      {currentConcept === 2 && (
        <div className="py-16">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              컨셉 2: 사이드 바이 사이드
            </span>
            <p className="text-coffee-600">텍스트와 비주얼의 균형잡힌 2단 레이아웃</p>
          </div>
          
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 gap-16 items-center min-h-[600px]">
              {/* 왼쪽: 텍스트 */}
              <div>
                <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  <span>커피 기록의 새로운 기준</span>
                </div>
                
                <h1 className="text-5xl font-bold text-coffee-800 leading-tight mb-6">
                  전문가처럼
                  <span className="block text-coffee-600">커피를 기록하고</span>
                  <span className="block text-coffee-600">분석하세요</span>
                </h1>
                
                <p className="text-xl text-coffee-600 mb-8">
                  CupNote는 단순한 기록을 넘어, AI가 당신의 커피 취향을 분석하고 
                  개인화된 추천을 제공하는 스마트한 커피 컴패니언입니다.
                </p>
                
                <div className="flex gap-4 mb-8">
                  <UnifiedButton variant="primary" size="large" className="bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700">
                    지금 시작하기
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </UnifiedButton>
                  <UnifiedButton variant="outline" size="large">
                    더 알아보기
                  </UnifiedButton>
                </div>
                
                {/* 특징 리스트 */}
                <div className="space-y-3">
                  {[
                    "✅ 3가지 전문화된 기록 모드",
                    "✅ AI 기반 맛 프로파일 분석",
                    "✅ 30+ 성취 배지 시스템",
                    "✅ 오프라인 지원 PWA"
                  ].map((item, i) => (
                    <div key={i} className="text-coffee-700">{item}</div>
                  ))}
                </div>
              </div>
              
              {/* 오른쪽: 비주얼 */}
              <div className="relative">
                {/* 메인 앱 스크린 */}
                <div className="bg-gradient-to-br from-coffee-100 to-amber-100 rounded-3xl p-8 shadow-2xl">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-coffee-500 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <Coffee className="h-6 w-6" />
                        <span className="font-semibold">CupNote</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {/* 차트 미리보기 */}
                      <div className="mb-4">
                        <div className="h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <div className="w-20 h-20 border-4 border-purple-300 rounded-full"></div>
                        </div>
                      </div>
                      {/* 스탯 */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-coffee-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-coffee-700">118</div>
                          <div className="text-xs text-coffee-600">총 기록</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-amber-700">4.5</div>
                          <div className="text-xs text-amber-600">평균</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-700">7일</div>
                          <div className="text-xs text-green-600">연속</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 플로팅 카드들 */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium">레벨 업!</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">취향 분석</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 컨셉 3: 풀 와이드 이머시브 */}
      {currentConcept === 3 && (
        <div className="py-16">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              컨셉 3: 풀 와이드 이머시브
            </span>
            <p className="text-coffee-600">몰입감 있는 풀스크린 경험</p>
          </div>
          
          {/* 풀 와이드 히어로 */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-coffee-600/10 via-amber-600/10 to-coffee-600/10"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 py-20">
              <div className="text-center mb-16">
                <h1 className="text-7xl font-bold mb-6">
                  <span className="text-coffee-800">커피의 모든 순간을</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-coffee-600 to-amber-600 mt-2">
                    특별하게 기록하세요
                  </span>
                </h1>
                
                <p className="text-2xl text-coffee-600 max-w-3xl mx-auto mb-12">
                  당신의 커피 여정을 함께하는 가장 스마트한 동반자, CupNote
                </p>
                
                <div className="flex gap-6 justify-center">
                  <UnifiedButton 
                    variant="primary" 
                    size="large" 
                    className="bg-gradient-to-r from-coffee-500 to-amber-500 hover:from-coffee-600 hover:to-amber-600 px-10 py-5 text-lg shadow-xl"
                  >
                    <Sparkles className="h-6 w-6 mr-2" />
                    무료로 시작하기
                  </UnifiedButton>
                  <UnifiedButton 
                    variant="outline" 
                    size="large"
                    className="border-2 border-coffee-400 px-10 py-5 text-lg hover:bg-coffee-50"
                  >
                    <Coffee className="h-6 w-6 mr-2" />
                    둘러보기
                  </UnifiedButton>
                </div>
              </div>
              
              {/* 인터랙티브 카드 그리드 */}
              <div className="grid grid-cols-4 gap-6 mb-16">
                {[
                  { icon: <Coffee />, title: "3-Mode", value: "기록 시스템", color: "from-blue-400 to-blue-600" },
                  { icon: <BarChart3 />, title: "AI", value: "취향 분석", color: "from-purple-400 to-purple-600" },
                  { icon: <Trophy />, title: "30+", value: "배지 시스템", color: "from-amber-400 to-amber-600" },
                  { icon: <Users />, title: "1000+", value: "활성 사용자", color: "from-green-400 to-green-600" }
                ].map((item, i) => (
                  <Card key={i} className="group hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <CardContent className="p-6 text-center relative">
                      <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white`}>
                        {item.icon}
                      </div>
                      <div className="text-2xl font-bold text-coffee-800">{item.title}</div>
                      <div className="text-sm text-coffee-600">{item.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* 3D 스타일 앱 프리뷰 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-coffee-100 via-amber-50 to-coffee-100 rounded-3xl p-12 shadow-2xl">
                  <div className="grid grid-cols-3 gap-8">
                    {/* 스크린 1 */}
                    <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-coffee-400 to-coffee-500 p-3 text-white text-center text-sm font-medium">
                          홈 화면
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="h-20 bg-gradient-to-br from-coffee-100 to-amber-100 rounded-xl"></div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="h-12 bg-coffee-100 rounded"></div>
                            <div className="h-12 bg-amber-100 rounded"></div>
                            <div className="h-12 bg-green-100 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 스크린 2 - 중앙 강조 */}
                    <div className="transform scale-110 z-10">
                      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3 text-white text-center text-sm font-medium">
                          AI 분석
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-purple-300 rounded-full"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 bg-purple-100 rounded-full"></div>
                            <div className="h-2 bg-blue-100 rounded-full w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 스크린 3 */}
                    <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 text-white text-center text-sm font-medium">
                          기록 작성
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex space-x-1 justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                            ))}
                          </div>
                          <div className="space-y-2">
                            <div className="h-8 bg-green-100 rounded"></div>
                            <div className="h-16 bg-green-50 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 컨셉 설명 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-coffee-800 mb-3">
              {currentConcept === 1 && "컨셉 1: 미니멀 센터 포커스"}
              {currentConcept === 2 && "컨셉 2: 사이드 바이 사이드"}
              {currentConcept === 3 && "컨셉 3: 풀 와이드 이머시브"}
            </h3>
            <div className="prose text-coffee-700">
              {currentConcept === 1 && (
                <ul className="space-y-2">
                  <li>✨ 깔끔하고 집중된 중앙 정렬 레이아웃</li>
                  <li>📱 모바일 친화적이고 반응형 디자인</li>
                  <li>🎯 핵심 메시지에 집중하는 구조</li>
                  <li>💼 전문적이고 신뢰감 있는 인상</li>
                </ul>
              )}
              {currentConcept === 2 && (
                <ul className="space-y-2">
                  <li>⚖️ 텍스트와 비주얼의 균형잡힌 배치</li>
                  <li>📊 앱 기능을 시각적으로 잘 표현</li>
                  <li>🎨 다이나믹한 레이아웃과 플로팅 요소</li>
                  <li>📈 정보 전달과 시각적 매력 동시 충족</li>
                </ul>
              )}
              {currentConcept === 3 && (
                <ul className="space-y-2">
                  <li>🌟 몰입감 있는 풀스크린 경험</li>
                  <li>🎭 그라데이션과 3D 효과로 현대적 느낌</li>
                  <li>🚀 혁신적이고 프리미엄한 브랜드 이미지</li>
                  <li>🎪 인터랙티브한 요소로 사용자 참여 유도</li>
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}