'use client'

import { useEffect, useState } from 'react'

import { BarChart3, TrendingUp, Coffee, Calendar, Award, Star, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { useNotification } from '../../contexts/NotificationContext'
import { QueryOptimizer } from '../../lib/query-optimizer'
import { CoffeeRecord } from '../../types/coffee'

interface AnalyticsData {
  totalRecords: number
  averageRating: number
  mostFrequentMode: string
  favoriteRoastery: string
  favoriteOrigin: string
  monthlyTrend: Array<{ month: string; count: number }>
  ratingDistribution: Array<{ rating: number; count: number }>
  modeDistribution: Array<{ mode: string; count: number }>
  topFlavors: Array<{ flavor: string; count: number }>
  recentActivity: Array<{ date: string; count: number }>
}

export default function CoffeeAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { error } = useNotification()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load all records for analysis
      const result = await QueryOptimizer.getPaginatedRecords({
        page: 1,
        pageSize: 1000, // Get all records for analytics
        sortBy: 'created_at',
        sortOrder: 'desc'
      })

      const records = result.data

      if (records.length === 0) {
        setAnalytics({
          totalRecords: 0,
          averageRating: 0,
          mostFrequentMode: '',
          favoriteRoastery: '',
          favoriteOrigin: '',
          monthlyTrend: [],
          ratingDistribution: [],
          modeDistribution: [],
          topFlavors: [],
          recentActivity: []
        })
        return
      }

      // Calculate analytics
      const analyticsData = calculateAnalytics(records)
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      error('통계 데이터 로드 실패', '잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (records: CoffeeRecord[]): AnalyticsData => {
    // Basic metrics
    const totalRecords = records.length
    const ratingsWithValues = records.filter(r => r.rating && r.rating > 0)
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingsWithValues.length
      : 0

    // Mode analysis
    const modeCount = records.reduce((acc, record) => {
      const mode = record.mode || record.tasteMode || 'unknown'
      acc[mode] = (acc[mode] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostFrequentMode = Object.entries(modeCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''

    // Roastery analysis
    const roasteryCount = records.reduce((acc, record) => {
      if (record.roastery) {
        acc[record.roastery] = (acc[record.roastery] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    const favoriteRoastery = Object.entries(roasteryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''

    // Origin analysis
    const originCount = records.reduce((acc, record) => {
      if (record.origin) {
        acc[record.origin] = (acc[record.origin] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    const favoriteOrigin = Object.entries(originCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''

    // Monthly trend (last 6 months)
    const now = new Date()
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = date.toISOString().slice(0, 7) // YYYY-MM
      const count = records.filter(record => 
        record.date.startsWith(monthStr)
      ).length
      
      monthlyTrend.push({
        month: date.toLocaleDateString('ko-KR', { month: 'short' }),
        count
      })
    }

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: records.filter(r => r.rating === rating).length
    }))

    // Mode distribution
    const modeDistribution = Object.entries(modeCount).map(([mode, count]) => ({
      mode: getModeDisplayName(mode),
      count
    }))

    // Top flavors from taste descriptions
    const flavors = records
      .map(r => r.taste)
      .join(' ')
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(word => word.length > 1)
    
    const flavorCount = flavors.reduce((acc, flavor) => {
      acc[flavor] = (acc[flavor] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topFlavors = Object.entries(flavorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([flavor, count]) => ({ flavor, count }))

    // Recent activity (last 7 days)
    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = records.filter(record => record.date === dateStr).length
      
      recentActivity.push({
        date: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
        count
      })
    }

    return {
      totalRecords,
      averageRating,
      mostFrequentMode: getModeDisplayName(mostFrequentMode),
      favoriteRoastery,
      favoriteOrigin,
      monthlyTrend,
      ratingDistribution,
      modeDistribution,
      topFlavors,
      recentActivity
    }
  }

  const getModeDisplayName = (mode: string): string => {
    switch (mode) {
      case 'cafe': return 'Cafe Mode'
      case 'homecafe': return 'HomeCafe Mode'
      case 'lab': return 'Lab Mode'
      case 'simple': return '편하게'
      case 'expert': return '전문가'
      default: return mode
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-background rounded-xl p-6 border border-border animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-background rounded-xl p-6 border border-border animate-pulse">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics || analytics.totalRecords === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          아직 분석할 데이터가 없어요
        </h3>
        <p className="text-foreground-secondary mb-6">
          커피 기록을 추가하면 여기에서 다양한 통계를 확인할 수 있어요
        </p>
        <a
          href="/mode-selection"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Coffee className="h-5 w-5 mr-2" />
          첫 기록 추가하기
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">총 기록</p>
              <p className="text-2xl font-bold text-foreground">{analytics.totalRecords}</p>
            </div>
            <Coffee className="h-8 w-8 text-coffee-500" />
          </div>
        </div>

        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">평균 평점</p>
              <p className="text-2xl font-bold text-foreground">
                {analytics.averageRating.toFixed(1)}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">선호 모드</p>
              <p className="text-lg font-semibold text-foreground">{analytics.mostFrequentMode}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">이번 주</p>
              <p className="text-2xl font-bold text-foreground">
                {analytics.recentActivity.reduce((sum, day) => sum + day.count, 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-background rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            월별 기록 추이
          </h3>
          <div className="space-y-3">
            {analytics.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-coffee-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(10, (month.count / Math.max(...analytics.monthlyTrend.map(m => m.count), 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-6 text-right">
                    {month.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-background rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            평점 분포
          </h3>
          <div className="space-y-3">
            {analytics.ratingDistribution.map((rating) => (
              <div key={rating.rating} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-foreground-secondary">{rating.rating}★</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(10, (rating.count / Math.max(...analytics.ratingDistribution.map(r => r.count), 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-6 text-right">
                    {rating.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Distribution */}
        <div className="bg-background rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            모드별 사용량
          </h3>
          <div className="space-y-3">
            {analytics.modeDistribution.map((mode, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">{mode.mode}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(10, (mode.count / Math.max(...analytics.modeDistribution.map(m => m.count), 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-6 text-right">
                    {mode.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className="bg-background rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            선호도 Top
          </h3>
          <div className="space-y-4">
            {analytics.favoriteRoastery && (
              <div>
                <p className="text-sm text-foreground-secondary mb-1">선호 로스터리</p>
                <p className="font-medium text-foreground">{analytics.favoriteRoastery}</p>
              </div>
            )}
            
            {analytics.favoriteOrigin && (
              <div>
                <p className="text-sm text-foreground-secondary mb-1">선호 원산지</p>
                <p className="font-medium text-foreground">{analytics.favoriteOrigin}</p>
              </div>
            )}

            {analytics.topFlavors.length > 0 && (
              <div>
                <p className="text-sm text-foreground-secondary mb-2">자주 언급한 맛</p>
                <div className="flex flex-wrap gap-1">
                  {analytics.topFlavors.slice(0, 5).map((flavor, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-coffee-100 text-coffee-700 rounded-full text-xs"
                    >
                      {flavor.flavor} ({flavor.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-background rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          최근 7일 활동
        </h3>
        <div className="flex items-end justify-between space-x-2">
          {analytics.recentActivity.map((day, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div
                className="bg-coffee-500 rounded-t min-h-[4px] w-8 transition-all duration-300"
                style={{
                  height: `${Math.max(4, (day.count / Math.max(...analytics.recentActivity.map(d => d.count), 1)) * 60)}px`
                }}
              />
              <span className="text-xs text-foreground-secondary">{day.date}</span>
              <span className="text-xs font-medium text-foreground">{day.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Analytics CTA */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              AI 고급 분석 대시보드
            </h3>
            <p className="text-sm text-purple-600 mb-4">
              맛 프로파일 레이더 차트, 계절별 취향 변화, AI 추천 시스템으로 더 깊은 인사이트를 얻어보세요.
            </p>
            <Link href="/my-records">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md">
                고급 분석 보기 →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}