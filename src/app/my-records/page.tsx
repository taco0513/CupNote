/**
 * 내 기록 페이지 - 하이브리드 디자인 시스템
 * 목록과 분석을 통합한 커피 기록 관리 중심
 */
'use client'

import { useState, useEffect, Suspense } from 'react'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

import { List, BarChart3, Coffee, Plus, Filter, Search, TrendingUp, Calendar } from 'lucide-react'

import CoffeeAnalytics from '../../components/analytics/CoffeeAnalytics'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import OptimizedCoffeeList from '../../components/OptimizedCoffeeList'
import { Card, CardContent } from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import PageLayout from '../../components/ui/PageLayout'
import UnifiedButton from '../../components/ui/UnifiedButton'
import EmptyState from '../../components/ui/EmptyState'

function MyRecordsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list')
  const [quickStats, setQuickStats] = useState({
    total: 0,
    thisMonth: 0,
    avgRating: 0,
    lastRecord: null as any
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'stats') {
      setActiveTab('stats')
    } else {
      setActiveTab('list')
    }
  }, [searchParams])

  useEffect(() => {
    // 빠른 통계 로드
    const loadQuickStats = () => {
      try {
        const stored = localStorage.getItem('coffeeRecords')
        if (stored) {
          const records = JSON.parse(stored)
          const now = new Date()
          const thisMonth = records.filter((r: any) => {
            const recordDate = new Date(r.date)
            return recordDate.getMonth() === now.getMonth() && 
                   recordDate.getFullYear() === now.getFullYear()
          }).length
          
          const avgRating = records.length > 0
            ? records.reduce((sum: number, r: any) => sum + (r.overall || 0), 0) / records.length
            : 0
          
          setQuickStats({
            total: records.length,
            thisMonth,
            avgRating,
            lastRecord: records.length > 0 ? records[0] : null
          })
        }
      } catch (error) {
        console.error('Failed to load quick stats:', error)
      }
    }

    loadQuickStats()
  }, [])

  const handleTabChange = (newTab: 'list' | 'stats') => {
    setActiveTab(newTab)
    const url = new URL(window.location.href)
    if (newTab === 'stats') {
      url.searchParams.set('tab', 'stats')
    } else {
      url.searchParams.delete('tab')
    }
    router.replace(url.pathname + url.search, { scroll: false })
  }

  return (
    <ProtectedRoute>
      <Navigation showBackButton currentPage="my-records" />
      <PageLayout>
        {/* 하이브리드 디자인 페이지 헤더 */}
        <PageHeader 
          title="내 기록"
          description="커피 기록을 보고 분석해보세요"
          icon={<Coffee className="h-6 w-6" />}
        />

        {/* 빠른 통계 대시보드 - 데스크탑 최적화 */}
        {quickStats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {/* 총 기록 */}
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all hover:scale-105 group">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center lg:items-start lg:flex-col">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <Coffee className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="ml-4 lg:ml-0 lg:mt-4">
                    <div className="text-2xl lg:text-3xl font-bold text-coffee-800 mb-1">{quickStats.total}</div>
                    <div className="text-sm lg:text-base text-coffee-600">총 기록</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 이번 달 */}
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all hover:scale-105 group">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center lg:items-start lg:flex-col">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <Calendar className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="ml-4 lg:ml-0 lg:mt-4">
                    <div className="text-2xl lg:text-3xl font-bold text-coffee-800 mb-1">{quickStats.thisMonth}</div>
                    <div className="text-sm lg:text-base text-coffee-600">이번 달</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 평균 평점 */}
            <Card variant="default" className="bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all hover:scale-105 group">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center lg:items-start lg:flex-col">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <TrendingUp className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="ml-4 lg:ml-0 lg:mt-4">
                    <div className="text-2xl lg:text-3xl font-bold text-coffee-800 mb-1">{quickStats.avgRating.toFixed(1)}</div>
                    <div className="text-sm lg:text-base text-coffee-600">평균 평점</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 마지막 기록 - 데스크탑에서만 표시 */}
            <Card variant="default" className="hidden xl:block bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-md hover:shadow-lg transition-all hover:scale-105 group">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center lg:items-start lg:flex-col">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <Coffee className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="ml-4 lg:ml-0 lg:mt-4">
                    <div className="text-sm lg:text-base font-bold text-coffee-800 mb-1 truncate max-w-[150px]">
                      {quickStats.lastRecord?.coffeeName || '-'}
                    </div>
                    <div className="text-sm lg:text-base text-coffee-600">최근 기록</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 새 기록 추가 버튼 */}
            <Card variant="default" className="bg-gradient-to-br from-coffee-500 to-coffee-700 border border-coffee-400/30 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group">
              <CardContent className="p-4 lg:p-6">
                <Link href="/mode-selection" className="flex items-center lg:items-start lg:flex-col h-full">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <Plus className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="ml-4 lg:ml-0 lg:mt-4">
                    <div className="text-base lg:text-lg font-bold text-white mb-1">새 기록</div>
                    <div className="text-sm text-white/90">추가하기</div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 하이브리드 탭 네비게이션 */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-coffee-200/30 shadow-sm">
            <button
              onClick={() => handleTabChange('list')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-md'
                  : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50/80'
              }`}
            >
              <List className="h-4 w-4" />
              <span>목록</span>
            </button>
            <button
              onClick={() => handleTabChange('stats')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-md'
                  : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50/80'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>분석</span>
            </button>
          </div>
        </div>

        {/* 탭 콘텐츠 - 데스크탑 최적화 레이아웃 */}
        <div className="lg:flex lg:gap-8">
          {/* 데스크탑 사이드바 - 검색 및 필터 */}
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-lg sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-coffee-800 mb-4">검색 및 필터</h3>
                
                {/* 검색 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-coffee-700 mb-2">검색</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                    <input
                      type="text"
                      placeholder="커피 이름, 로스터리, 원산지..."
                      className="w-full pl-10 pr-4 py-3 bg-white border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* 빠른 필터 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">기간</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-3 py-2 text-sm bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors">오늘</button>
                      <button className="px-3 py-2 text-sm bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors">이번 주</button>
                      <button className="px-3 py-2 text-sm bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors">이번 달</button>
                      <button className="px-3 py-2 text-sm bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors">전체</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">모드</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2 rounded text-coffee-600 focus:ring-coffee-400" />
                        <span className="text-sm">☕ Cafe Mode</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2 rounded text-coffee-600 focus:ring-coffee-400" />
                        <span className="text-sm">🏠 HomeCafe Mode</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">평점</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">최소</span>
                      <input type="range" min="1" max="5" className="flex-1" />
                      <span className="text-sm">5점</span>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors">
                    필터 적용
                  </button>
                  <button className="w-full py-2 text-coffee-600 border border-coffee-300 rounded-lg hover:bg-coffee-50 transition-colors">
                    초기화
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1">
            {activeTab === 'list' && (
              <div>
                {/* 목록 헤더 - 데스크탑 향상 */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-coffee-800">커피 기록 목록</h2>
                    <p className="text-base text-coffee-600 mt-2">지금까지 기록한 모든 커피들을 확인하세요</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UnifiedButton
                      variant="secondary"
                      size="medium"
                      className="hidden lg:flex border-coffee-300 hover:bg-coffee-50"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      고급 필터
                    </UnifiedButton>
                    <UnifiedButton
                      variant="primary"
                      size="medium"
                      onClick={() => router.push('/mode-selection')}
                      className="bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      새 기록 추가
                    </UnifiedButton>
                  </div>
                </div>

                {/* 모바일용 검색 및 필터 - lg 이하에서만 표시 */}
                <Card variant="default" className="lg:hidden bg-white/70 backdrop-blur-sm border border-coffee-200/30 shadow-sm mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                        <input
                          type="text"
                          placeholder="커피 이름, 로스터리, 원산지 검색..."
                          className="w-full pl-10 pr-4 py-2 bg-white/50 border border-coffee-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent"
                        />
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-coffee-50/80 hover:bg-coffee-100/80 text-coffee-700 rounded-lg border border-coffee-200/50 transition-colors">
                        <Filter className="h-4 w-4" />
                        <span>필터</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* 커피 목록 - 데스크탑에서 더 큰 그리드 */}
                <div className="lg:pr-4">
                  <OptimizedCoffeeList />
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                {/* 분석 헤더 - 데스크탑 향상 */}
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-coffee-800">통계 분석</h2>
                  <p className="text-base text-coffee-600 mt-2">커피 기록을 통해 나의 취향과 패턴을 분석해보세요</p>
                </div>

                {/* 분석 컴포넌트 - 데스크탑에서 더 넓은 레이아웃 */}
                <div className="lg:pr-4">
                  <CoffeeAnalytics />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 첫 기록 안내 - 기록이 없을 때 */}
        {quickStats.total === 0 && (
          <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
            <CardContent>
              <EmptyState
                title="아직 기록이 없어요"
                description="첫 번째 커피를 기록해보세요! 간단한 경험부터 전문적인 커핑까지 다양한 방식으로 기록할 수 있어요."
                variant="coffee"
                illustration="coffee-cup"
                action={
                  <Link href="/mode-selection">
                    <UnifiedButton
                      variant="primary"
                      size="large"
                      className="bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700 shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      첫 기록 시작하기
                    </UnifiedButton>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        )}
      </PageLayout>
    </ProtectedRoute>
  )
}

export default function MyRecordsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-8 w-8 text-coffee-400 animate-pulse mx-auto mb-4" />
          <p className="text-coffee-600">기록을 불러오는 중...</p>
        </div>
      </div>
    }>
      <MyRecordsPageContent />
    </Suspense>
  )
}