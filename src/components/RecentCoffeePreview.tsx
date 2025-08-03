'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Coffee, Calendar, MapPin, Star, ArrowRight } from 'lucide-react'

// import LazyImage from './LazyImage' // 임시로 주석 처리
import EmptyState from './EmptyState'
import { ListSkeleton } from './SkeletonLoader'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { QueryOptimizer } from '../lib/query-optimizer'
import { CoffeeRecord } from '../types/coffee'

const PREVIEW_LIMIT = 4 // 홈페이지에는 최근 4개만 표시

export default function RecentCoffeePreview() {
  const [recentRecords, setRecentRecords] = useState<CoffeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { error } = useNotification()

  useEffect(() => {
    loadRecentRecords()
  }, [user])

  const loadRecentRecords = async () => {
    try {
      setLoading(true)
      
      // QueryOptimizer를 사용하여 최근 기록만 가져오기
      const result = await QueryOptimizer.getPaginatedRecords({
        page: 1,
        pageSize: PREVIEW_LIMIT,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })
      
      setRecentRecords(result.data)
    } catch (err) {
      console.error('Failed to load recent records:', err)
      error('최근 기록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const formatMode = (mode: string) => {
    const modeMap: { [key: string]: string } = {
      'cafe': '☕ 카페',
      'homecafe': '🏠 홈카페', 
      'lab': '🧪 랩'
    }
    return modeMap[mode] || mode
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return <ListSkeleton count={PREVIEW_LIMIT} />
  }

  if (recentRecords.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <EmptyState type="no-records" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 최근 기록 카드들 */}
      {recentRecords.map((record) => (
        <Link 
          key={record.id} 
          href={`/coffee/${record.id}`}
          className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
        >
          <div className="flex space-x-4">
            {/* 커피 이미지 */}
            <div className="w-16 h-16 flex-shrink-0">
              {record.image_url ? (
                <img
                  src={record.image_url}
                  alt={record.coffee_name || '커피 이미지'}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-coffee-100 rounded-lg flex items-center justify-center">
                  <Coffee className="h-8 w-8 text-coffee-400" />
                </div>
              )}
            </div>

            {/* 기록 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* 커피명 */}
                  <h3 className="font-medium text-coffee-800 truncate">
                    {record.coffee_name || '이름 없는 커피'}
                  </h3>
                  
                  {/* 로스터리 & 날짜 */}
                  <div className="flex items-center space-x-3 mt-1 text-sm text-coffee-600">
                    {record.roastery && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{record.roastery}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(record.created_at)}</span>
                    </span>
                  </div>

                  {/* 모드 & 평점 */}
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs bg-coffee-100 text-coffee-700 px-2 py-1 rounded-full">
                      {formatMode(record.mode)}
                    </span>
                    {record.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-coffee-600">{record.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}

      {/* 모든 기록 보기 버튼 */}
      <Link
        href="/records"
        className="block w-full p-4 bg-coffee-50 hover:bg-coffee-100 rounded-xl transition-colors group"
      >
        <div className="flex items-center justify-center space-x-2 text-coffee-700">
          <span className="font-medium">모든 커피 기록 보기</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  )
}