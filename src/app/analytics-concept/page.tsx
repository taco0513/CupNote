/**
 * 고급 분석 대시보드 - 디자인 컨셉 페이지
 * Chart.js를 사용한 인터랙티브 데이터 시각화
 */
'use client'

import { useState } from 'react'
import { TrendingUp, Coffee, Calendar, Brain, ChevronRight, Sparkles, BarChart3, Target } from 'lucide-react'
import Navigation from '../../components/Navigation'
import { Card, CardContent } from '../../components/ui/Card'
import PageLayout from '../../components/ui/PageLayout'
import PageHeader from '../../components/ui/PageHeader'
import FlavorRadarChart from '../../components/charts/FlavorRadarChart'
import InsightCard from '../../components/analytics/InsightCard'

// 샘플 데이터
const flavorProfileData = {
  labels: ['산미', '향미', '쓴맛', '단맛', '바디', '아로마'],
  currentMonth: [4.2, 3.8, 2.1, 3.5, 2.9, 4.3],
  lastMonth: [3.9, 3.2, 2.5, 4.0, 3.1, 3.8]
}

const roasteryTrends = [
  { name: '블루보틀', rating: 4.5, count: 12, trend: 'up', change: 0.3 },
  { name: '테라로사', rating: 4.2, count: 8, trend: 'stable', change: 0 },
  { name: '프리츠', rating: 3.8, count: 6, trend: 'down', change: -0.2 },
  { name: '앤썸', rating: 4.0, count: 5, trend: 'up', change: 0.1 },
  { name: '센터커피', rating: 4.3, count: 4, trend: 'new', change: 0 }
]

const seasonalPreferences = {
  spring: { 
    keywords: ['플로럴', '라이트', '에티오피아'],
    avgRating: 4.3,
    recordCount: 28,
    topOrigin: '에티오피아'
  },
  summer: { 
    keywords: ['과일향', '산미↑', '콜드브루'],
    avgRating: 4.1,
    recordCount: 35,
    topOrigin: '케냐'
  },
  fall: { 
    keywords: ['너티', '미디엄', '콜롬비아'],
    avgRating: 4.0,
    recordCount: 31,
    topOrigin: '콜롬비아'
  },
  winter: { 
    keywords: ['초콜릿', '바디감↑', '다크로스트'],
    avgRating: 3.9,
    recordCount: 24,
    topOrigin: '브라질'
  }
}

const aiRecommendations = {
  profile: "밝은 산미와 플로럴 노트를 선호하시는군요! 특히 아침에 마시는 싱글 오리진을 좋아하시네요.",
  cafes: [
    { name: '블루보틀 성수', match: 92, reason: '에티오피아 싱글 오리진 전문' },
    { name: '센터커피', match: 88, reason: '라이트 로스팅 특화' },
    { name: '커피 리브레', match: 85, reason: '다양한 아프리카 원두' }
  ],
  beans: [
    { name: '에티오피아 코케 허니', match: 95, roastery: '블루보틀' },
    { name: '콜롬비아 게이샤', match: 91, roastery: '테라로사' },
    { name: '케냐 AA', match: 87, roastery: '프리츠' }
  ]
}

export default function AnalyticsConceptPage() {
  const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('spring')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  return (
    <>
      <Navigation showBackButton currentPage="analytics" />
      
      <PageLayout showHeader={false}>
        <div className="max-w-7xl mx-auto">
          {/* 페이지 헤더 */}
          <PageHeader 
            title="고급 분석 대시보드"
            description="AI가 분석한 당신의 커피 취향 인사이트"
            icon={<BarChart3 className="h-6 w-6" />}
          />

          {/* AI 인사이트 카드 - 최상단에 배치 */}
          <InsightCard className="mb-8" />

          {/* 분석 요약 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-coffee-100 to-amber-50 border-coffee-200/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Coffee className="h-5 w-5 text-coffee-600" />
                  <span className="text-xs text-green-600 font-medium">+12%</span>
                </div>
                <div className="text-2xl font-bold text-coffee-800">118</div>
                <div className="text-xs text-coffee-600">총 기록</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">↑ 0.3</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">4.2</div>
                <div className="text-xs text-blue-600">평균 평점</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">플로럴</span>
                </div>
                <div className="text-2xl font-bold text-purple-800">87%</div>
                <div className="text-xs text-purple-600">취향 매치</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">연속</span>
                </div>
                <div className="text-2xl font-bold text-green-800">7일</div>
                <div className="text-xs text-green-600">기록 스트릭</div>
              </CardContent>
            </Card>
          </div>

          {/* 맛 프로파일 레이더 차트 */}
          <Card className="mb-8 bg-white/90 backdrop-blur-sm border-coffee-200/40 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-coffee-800 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  나의 맛 프로파일
                </h3>
                <div className="flex space-x-2">
                  {['week', 'month', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period as 'week' | 'month' | 'year')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-coffee-500 text-white'
                          : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200'
                      }`}
                    >
                      {period === 'week' ? '주간' : period === 'month' ? '월간' : '연간'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 레이더 차트 */}
              <div className="relative h-64 md:h-80 flex items-center justify-center">
                <FlavorRadarChart
                  data={{
                    labels: flavorProfileData.labels,
                    values: flavorProfileData.currentMonth
                  }}
                  previousData={{
                    labels: flavorProfileData.labels,
                    values: flavorProfileData.lastMonth
                  }}
                  size={320}
                  strokeColor="rgb(139, 69, 19)"
                  fillColor="rgba(139, 69, 19, 0.15)"
                  previousStrokeColor="rgb(217, 119, 6)"
                  previousFillColor="rgba(217, 119, 6, 0.08)"
                />
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-sm mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-coffee-500 rounded-full"></div>
                  <span className="text-coffee-700">이번 {selectedPeriod === 'week' ? '주' : selectedPeriod === 'month' ? '달' : '해'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-coffee-700">지난 {selectedPeriod === 'week' ? '주' : selectedPeriod === 'month' ? '달' : '해'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* 로스터리별 선호도 트렌드 */}
            <Card className="bg-white/90 backdrop-blur-sm border-coffee-200/40 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-coffee-800 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  로스터리 선호도 트렌드
                </h3>
                
                <div className="space-y-4">
                  {roasteryTrends.map((roastery) => (
                    <div key={roastery.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-coffee-800">{roastery.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-2 w-2 rounded-full ${
                                  i < Math.floor(roastery.rating) 
                                    ? 'bg-amber-400' 
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-coffee-700">{roastery.rating}</span>
                          {roastery.trend === 'up' && (
                            <span className="text-xs text-green-600">↑ +{roastery.change}</span>
                          )}
                          {roastery.trend === 'down' && (
                            <span className="text-xs text-red-600">↓ {roastery.change}</span>
                          )}
                          {roastery.trend === 'new' && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">NEW</span>
                          )}
                        </div>
                      </div>
                      <div className="relative h-2 bg-coffee-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full transition-all duration-500"
                          style={{ width: `${(roastery.rating / 5) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-coffee-600">
                        {roastery.count}잔 기록
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 계절별 취향 변화 */}
            <Card className="bg-white/90 backdrop-blur-sm border-coffee-200/40 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-coffee-800 mb-6 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  계절별 취향 변화
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {(['spring', 'summer', 'fall', 'winter'] as const).map((season) => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        selectedSeason === season
                          ? 'bg-gradient-to-br from-coffee-100 to-amber-50 border-2 border-coffee-400 shadow-md'
                          : 'bg-white border-2 border-coffee-200 hover:border-coffee-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {season === 'spring' && '🌸'}
                        {season === 'summer' && '☀️'}
                        {season === 'fall' && '🍂'}
                        {season === 'winter' && '❄️'}
                      </div>
                      <div className="text-xs font-medium text-coffee-700">
                        {season === 'spring' && '봄'}
                        {season === 'summer' && '여름'}
                        {season === 'fall' && '가을'}
                        {season === 'winter' && '겨울'}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="bg-coffee-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">평균 평점</span>
                    <span className="font-semibold text-coffee-800">
                      ⭐ {seasonalPreferences[selectedSeason].avgRating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">기록 수</span>
                    <span className="font-semibold text-coffee-800">
                      {seasonalPreferences[selectedSeason].recordCount}잔
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">선호 원산지</span>
                    <span className="font-semibold text-coffee-800">
                      {seasonalPreferences[selectedSeason].topOrigin}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-coffee-200/50">
                    <div className="text-sm text-coffee-600 mb-2">주요 키워드</div>
                    <div className="flex flex-wrap gap-2">
                      {seasonalPreferences[selectedSeason].keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-3 py-1 bg-white rounded-full text-xs font-medium text-coffee-700 border border-coffee-200"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI 추천 시스템 */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-6 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI가 분석한 당신의 취향
              </h3>
              
              <div className="bg-white/80 rounded-xl p-4 mb-6">
                <p className="text-purple-700 leading-relaxed">
                  "{aiRecommendations.profile}"
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* 추천 카페 */}
                <div>
                  <h4 className="font-medium text-purple-700 mb-3 flex items-center">
                    <Coffee className="h-4 w-4 mr-2" />
                    추천 카페
                  </h4>
                  <div className="space-y-2">
                    {aiRecommendations.cafes.map((cafe) => (
                      <div
                        key={cafe.name}
                        className="bg-white/80 rounded-lg p-3 flex items-center justify-between hover:bg-white transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="font-medium text-purple-800">{cafe.name}</div>
                          <div className="text-xs text-purple-600">{cafe.reason}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-purple-700">{cafe.match}%</span>
                          <ChevronRight className="h-4 w-4 text-purple-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 추천 원두 */}
                <div>
                  <h4 className="font-medium text-purple-700 mb-3 flex items-center">
                    <Coffee className="h-4 w-4 mr-2" />
                    추천 원두
                  </h4>
                  <div className="space-y-2">
                    {aiRecommendations.beans.map((bean) => (
                      <div
                        key={bean.name}
                        className="bg-white/80 rounded-lg p-3 flex items-center justify-between hover:bg-white transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="font-medium text-purple-800">{bean.name}</div>
                          <div className="text-xs text-purple-600">{bean.roastery}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-purple-700">{bean.match}%</span>
                          <ChevronRight className="h-4 w-4 text-purple-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg">
                  더 많은 추천 보기
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </>
  )
}