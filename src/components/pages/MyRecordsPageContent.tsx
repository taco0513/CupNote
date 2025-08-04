/**
 * Client-side My Records Page Content
 * Extracted from page.tsx for better App Router optimization
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

import { List, BarChart3, Coffee, Plus, Filter, Search, TrendingUp, Calendar } from 'lucide-react'

import CoffeeAnalytics from '../analytics/CoffeeAnalytics'
import ProtectedRoute from '../auth/ProtectedRoute'
import Navigation from '../Navigation'
import CoffeeList from '../CoffeeList'
import { Card, CardContent } from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import PageLayout from '../ui/PageLayout'
import UnifiedButton from '../ui/UnifiedButton'
import EmptyState from '../ui/EmptyState'

export default function MyRecordsPageContent() {
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
    // 빠른 통계 로드 - Supabase에서만 가져오기
    const loadQuickStats = async () => {
      try {
        const { SupabaseStorage } = await import('../../lib/supabase-storage')
        const records = await SupabaseStorage.getRecords()
        
        if (records && records.length > 0) {
          const now = new Date()
          const thisMonth = records.filter((r: any) => {
            const recordDate = new Date(r.date)
            return recordDate.getMonth() === now.getMonth() && 
                   recordDate.getFullYear() === now.getFullYear()
          }).length
          
          const avgRating = records.reduce((sum: number, r: any) => sum + (r.overall || 0), 0) / records.length
          
          setQuickStats({
            total: records.length,
            thisMonth,
            avgRating,
            lastRecord: records[0]
          })
        } else {
          // 기록이 없으면 빈 상태로 설정
          setQuickStats({
            total: 0,
            thisMonth: 0,
            avgRating: 0,
            lastRecord: null
          })
        }
      } catch (error) {
        console.error('Failed to load quick stats:', error)
        // 에러 시에도 빈 상태로 설정
        setQuickStats({
          total: 0,
          thisMonth: 0,
          avgRating: 0,
          lastRecord: null
        })
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
              <CardContent className="p-4 md:p-6">
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
              <CardContent className="p-4 md:p-6">
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
              <CardContent className="p-4 md:p-6">
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
              <CardContent className="p-4 md:p-6">
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
              <CardContent className="p-4 md:p-6">
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

        {/* 하이브리드 탭 네비게이션 - 새로운 디자인 토큰 적용 */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-coffee-200/30 shadow-sm">
            <button
              onClick={() => handleTabChange('list')}
              className={`btn-base filter-btn ${activeTab === 'list' ? 'filter-btn-active' : 'filter-btn-inactive'} flex-1`}
            >
              <List className="icon" />
              <span className={activeTab === 'list' ? 'text-on-dark' : 'text-high-contrast'}>목록</span>
            </button>
            <button
              onClick={() => handleTabChange('stats')}
              className={`btn-base filter-btn ${activeTab === 'stats' ? 'filter-btn-active' : 'filter-btn-inactive'} flex-1`}
            >
              <BarChart3 className="icon" />
              <span className={activeTab === 'stats' ? 'text-on-dark' : 'text-high-contrast'}>분석</span>
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
                      <button className="btn-base filter-btn filter-btn-inactive btn-xs">오늘</button>
                      <button className="btn-base filter-btn filter-btn-inactive btn-xs">이번 주</button>
                      <button className="btn-base filter-btn filter-btn-inactive btn-xs">이번 달</button>
                      <button className="btn-base filter-btn filter-btn-active btn-xs">전체</button>
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

                  <button className="btn-base btn-primary w-full">
                    필터 적용
                  </button>
                  <button className="btn-base btn-secondary w-full">
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
                      <button className="btn-base filter-btn filter-btn-inactive btn-sm">
                        <Filter className="h-4 w-4" />
                        <span>필터</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* 커피 목록 - 데스크탑에서 더 큰 그리드 */}
                <div className="lg:pr-4">
                  <CoffeeList />
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
          <div className="space-y-6 md:space-y-8">
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
          
          {/* AI 고급 분석 대시보드 CTA - 기록이 없어도 표시 */}
          <Card variant="default" className="bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-sm border border-purple-200/50 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    AI 고급 분석 대시보드 (Beta)
                  </h3>
                  <p className="text-sm text-purple-600 mb-4">
                    맛 프로파일 레이더 차트와 AI 추천 시스템을 미리 체험해보세요. 기록이 쌓이면 더 정확한 분석이 가능해요!
                  </p>
                  <Link href="/analytics-concept">
                    <UnifiedButton
                      variant="primary"
                      size="medium"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
                    >
                      고급 분석 체험하기 →
                    </UnifiedButton>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </PageLayout>
    </ProtectedRoute>
  )
}