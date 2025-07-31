'use client'

import { useState, useEffect, useMemo } from 'react'
import { CoffeeRecord } from '@/types/coffee'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Star,
  Coffee,
  Calendar,
  PieChart,
  Target,
} from 'lucide-react'

// 통계 분석 유틸리티 함수들
const analyzeRecords = (records: CoffeeRecord[]) => {
  if (records.length === 0) return null

  // 기본 통계
  const totalRecords = records.length
  const averageRating = records.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRecords

  // 월별 기록 수
  const monthlyData = records.reduce(
    (acc, record) => {
      const month = new Date(record.date).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 원산지별 분포
  const originData = records.reduce(
    (acc, record) => {
      const origin = record.origin || '알 수 없음'
      acc[origin] = (acc[origin] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 로스팅 레벨별 분포
  const roastData = records.reduce(
    (acc, record) => {
      const roast = record.roastLevel || '알 수 없음'
      acc[roast] = (acc[roast] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 모드별 분포
  const modeData = records.reduce(
    (acc, record) => {
      const mode = record.mode || 'Cafe'
      acc[mode] = (acc[mode] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 평점 분포
  const ratingDistribution = records.reduce(
    (acc, record) => {
      if (record.rating !== undefined) {
        const rating = Math.floor(record.rating)
        acc[rating] = (acc[rating] || 0) + 1
      }
      return acc
    },
    {} as Record<number, number>
  )

  // 최고/최저 평점 커피
  const sortedByRating = [...records].sort((a, b) => (b.rating || 0) - (a.rating || 0))
  const topRatedCoffee = sortedByRating[0]
  const lowestRatedCoffee = sortedByRating[sortedByRating.length - 1]

  // 가장 많이 방문한 카페/로스터리
  const roasteryData = records.reduce(
    (acc, record) => {
      if (record.roastery) {
        acc[record.roastery] = (acc[record.roastery] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  const favoriteRoastery = Object.entries(roasteryData).sort(([, a], [, b]) => b - a)[0]

  return {
    totalRecords,
    averageRating,
    monthlyData,
    originData,
    roastData,
    modeData,
    ratingDistribution,
    topRatedCoffee,
    lowestRatedCoffee,
    favoriteRoastery,
    roasteryData,
  }
}

// 차트 컴포넌트들
const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = 'coffee-600',
}: {
  icon: any
  title: string
  value: string | number
  subtitle?: string
  color?: string
}) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-coffee-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-coffee-600">{title}</p>
        <p className={`text-xl md:text-2xl font-bold text-${color} mt-1`}>{value}</p>
        {subtitle && <p className="text-xs text-coffee-500 mt-1">{subtitle}</p>}
      </div>
      <Icon className={`h-6 w-6 md:h-8 md:w-8 text-${color}`} />
    </div>
  </div>
)

const BarChart = ({
  data,
  title,
  maxItems = 5,
}: {
  data: Record<string, number>
  title: string
  maxItems?: number
}) => {
  const sortedData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxItems)

  const maxValue = Math.max(...sortedData.map(([, value]) => value))

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-coffee-100">
      <h3 className="text-base md:text-lg font-semibold text-coffee-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {sortedData.map(([key, value]) => (
          <div key={key} className="flex items-center">
            <div className="w-20 text-sm text-coffee-600 truncate">{key}</div>
            <div className="flex-1 mx-3">
              <div className="bg-coffee-100 rounded-full h-2">
                <div
                  className="bg-coffee-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-8 text-sm font-medium text-coffee-700">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const MonthlyChart = ({ data }: { data: Record<string, number> }) => {
  const sortedData = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  const maxValue = Math.max(...sortedData.map(([, value]) => value))

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-coffee-100">
      <h3 className="text-base md:text-lg font-semibold text-coffee-800 mb-4">월별 기록 추세</h3>
      <div className="flex items-end space-x-2 h-40">
        {sortedData.map(([month, count]) => (
          <div key={month} className="flex-1 flex flex-col items-center">
            <div
              className="bg-coffee-400 rounded-t w-full transition-all duration-300 hover:bg-coffee-500"
              style={{ height: `${(count / maxValue) * 120}px` }}
            />
            <div className="text-xs text-coffee-600 mt-2 transform -rotate-45">
              {month.slice(5)}
            </div>
            <div className="text-xs font-bold text-coffee-700">{count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const [records, setRecords] = useState<CoffeeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecords = () => {
      try {
        const stored = localStorage.getItem('coffeeRecords')
        if (stored) {
          const parsedRecords = JSON.parse(stored)
          setRecords(parsedRecords)
        }
      } catch (error) {
        console.error('Failed to load records:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [])

  const stats = useMemo(() => analyzeRecords(records), [records])

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-50 flex items-center justify-center">
        <div className="animate-pulse text-coffee-600">통계를 불러오는 중...</div>
      </div>
    )
  }

  if (!stats || records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
          <Navigation showBackButton currentPage="stats" />
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-6 md:mb-8">
            ☕ 커피 통계
          </h1>
          <div className="bg-white rounded-xl p-12 shadow-sm border border-coffee-100 text-center">
            <Coffee className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-coffee-700 mb-2">
              아직 기록된 커피가 없어요
            </h2>
            <p className="text-coffee-500 mb-6">
              첫 번째 커피를 기록하고 나만의 커피 여정을 시작해보세요!
            </p>
            <a
              href="/record"
              className="inline-flex items-center px-6 py-3 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors"
            >
              <Coffee className="h-5 w-5 mr-2" />첫 커피 기록하기
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
          <Navigation showBackButton currentPage="stats" />

        {/* 헤더 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-2">☕ 커피 통계</h1>
          <p className="text-base md:text-lg text-coffee-600">
            나만의 커피 여정을 데이터로 살펴보세요
          </p>
        </div>

        {/* 주요 통계 카드들 */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatCard icon={Coffee} title="총 기록 수" value={stats.totalRecords} subtitle="잔" />
          <StatCard
            icon={Star}
            title="평균 평점"
            value={stats.averageRating.toFixed(1)}
            subtitle="/ 5.0"
            color="yellow-500"
          />
          <StatCard
            icon={Target}
            title="최고 평점"
            value={stats.topRatedCoffee.rating || 0}
            subtitle={stats.topRatedCoffee.coffeeName}
            color="green-500"
          />
          <StatCard
            icon={TrendingUp}
            title="이번 달 기록"
            value={Object.entries(stats.monthlyData).slice(-1)[0]?.[1] || 0}
            subtitle="잔"
            color="blue-500"
          />
        </div>

        {/* 차트 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <MonthlyChart data={stats.monthlyData} />
          <BarChart data={stats.ratingDistribution} title="평점 분포" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <BarChart data={stats.originData} title="원산지별 분포" />
          <BarChart data={stats.roastData} title="로스팅 레벨 분포" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <BarChart data={stats.modeData} title="모드별 분포" />
          <BarChart data={stats.roasteryData} title="로스터리/카페 순위" />
        </div>

        {/* 인사이트 카드 */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-coffee-100">
          <h3 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            나만의 커피 인사이트
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-coffee-700 mb-2">🏆 베스트 커피</h4>
              <p className="text-sm text-coffee-600 mb-1">
                <strong>{stats.topRatedCoffee.coffeeName}</strong> ({stats.topRatedCoffee.rating}점)
              </p>
              <p className="text-xs text-coffee-500">
                {stats.topRatedCoffee.roastery} • {stats.topRatedCoffee.origin}
              </p>
            </div>
            {stats.favoriteRoastery && (
              <div>
                <h4 className="font-medium text-coffee-700 mb-2">❤️ 단골 로스터리</h4>
                <p className="text-sm text-coffee-600 mb-1">
                  <strong>{stats.favoriteRoastery[0]}</strong>
                </p>
                <p className="text-xs text-coffee-500">{stats.favoriteRoastery[1]}번 방문</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
