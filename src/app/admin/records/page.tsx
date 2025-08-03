/**
 * 어드민 커피 기록 관리 페이지
 * 전체 커피 기록 조회, 통계 분석, 콘텐츠 관리, 품질 모니터링
 */
'use client'

import { useState, useEffect } from 'react'

import { 
  Coffee, 
  Search, 
  Filter,
  TrendingUp,
  Calendar,
  Star,
  Map,
  Users,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  Award,
  AlertTriangle,
  Image as ImageIcon,
  Tag,
  MapPin,
  Heart
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import UnifiedButton from '../../../components/ui/UnifiedButton'
import { logger } from '../../../lib/logger'
import { supabase } from '../../../lib/supabase'

interface CoffeeRecord {
  id: string
  user_id: string
  mode: 'cafe' | 'homecafe' | 'lab'
  created_at: string
  updated_at: string
  
  // 기본 정보
  coffee_name: string
  roaster: string | null
  origin: string | null
  processing_method: string | null
  roast_level: string | null
  
  // 평가
  overall_rating: number
  aroma_notes: string[]
  flavor_notes: string[]
  personal_notes: string | null
  
  // 위치 및 환경
  location: string | null
  cafe_name: string | null
  brewing_method: string | null
  
  // 이미지
  image_url: string | null
  
  // 사용자 정보 (조인)
  user_email?: string
  
  // 통계 데이터
  stats: {
    viewCount: number
    likeCount: number
    commentCount: number
    isPublic: boolean
    qualityScore: number
  }
}

interface RecordFilters {
  search: string
  mode: 'all' | 'cafe' | 'homecafe' | 'lab'
  rating: 'all' | '5' | '4-5' | '3-4' | '1-3'
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year'
  hasImage: 'all' | 'yes' | 'no'
  sortBy: 'created_at' | 'overall_rating' | 'coffee_name' | 'user_email'
  sortOrder: 'asc' | 'desc'
}

interface RecordStats {
  totalRecords: number
  recordsToday: number
  recordsThisWeek: number
  recordsThisMonth: number
  averageRating: number
  modeDistribution: {
    cafe: number
    homecafe: number
    lab: number
  }
  topRoasters: Array<{
    name: string
    count: number
    averageRating: number
  }>
  topOrigins: Array<{
    name: string
    count: number
    averageRating: number
  }>
  qualityMetrics: {
    highQuality: number // 4.5+ 평점
    lowQuality: number // 3.0 미만 평점
    withImages: number
    withDetailedNotes: number
  }
}

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<CoffeeRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<CoffeeRecord[]>([])
  const [recordStats, setRecordStats] = useState<RecordStats>({
    totalRecords: 0,
    recordsToday: 0,
    recordsThisWeek: 0,
    recordsThisMonth: 0,
    averageRating: 0,
    modeDistribution: { cafe: 0, homecafe: 0, lab: 0 },
    topRoasters: [],
    topOrigins: [],
    qualityMetrics: {
      highQuality: 0,
      lowQuality: 0,
      withImages: 0,
      withDetailedNotes: 0
    }
  })
  
  const [filters, setFilters] = useState<RecordFilters>({
    search: '',
    mode: 'all',
    rating: 'all',
    dateRange: 'all',
    hasImage: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<CoffeeRecord | null>(null)
  const [showRecordDetails, setShowRecordDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(20)

  // 커피 기록 데이터 로드
  const loadRecords = async () => {
    try {
      setIsLoading(true)
      
      // 커피 기록과 사용자 정보 조인하여 가져오기
      const { data: recordsData, error: recordsError } = await supabase
        .from('coffee_records')
        .select(`
          *,
          users(email)
        `)
        .order('created_at', { ascending: false })
      
      if (recordsError) {
        logger.error('Failed to load coffee records', { error: recordsError })
        return
      }

      // 기록 데이터 변환 및 통계 계산
      const processedRecords: CoffeeRecord[] = recordsData?.map(record => ({
        ...record,
        user_email: record.users?.email,
        stats: {
          viewCount: Math.floor(Math.random() * 100), // 임시 데이터
          likeCount: Math.floor(Math.random() * 20),
          commentCount: Math.floor(Math.random() * 5),
          isPublic: Math.random() > 0.3,
          qualityScore: calculateQualityScore(record)
        }
      })) || []
      
      setRecords(processedRecords)
      calculateRecordStats(processedRecords)
      
      logger.info('Coffee records loaded successfully', { 
        totalRecords: processedRecords.length 
      })
      
    } catch (error) {
      logger.error('Failed to load coffee records', { error })
    } finally {
      setIsLoading(false)
    }
  }

  // 기록 품질 점수 계산
  const calculateQualityScore = (record: any): number => {
    let score = 0
    
    // 기본 정보 완성도 (40점)
    if (record.coffee_name) score += 10
    if (record.roaster) score += 10
    if (record.origin) score += 10
    if (record.overall_rating) score += 10
    
    // 상세 정보 (30점)
    if (record.aroma_notes?.length > 0) score += 10
    if (record.flavor_notes?.length > 0) score += 10
    if (record.personal_notes && record.personal_notes.length > 20) score += 10
    
    // 이미지 및 위치 (20점)
    if (record.image_url) score += 10
    if (record.location || record.cafe_name) score += 10
    
    // 평점 품질 (10점)
    if (record.overall_rating >= 4.5) score += 10
    else if (record.overall_rating >= 4) score += 7
    else if (record.overall_rating >= 3) score += 5
    
    return Math.min(100, score)
  }

  // 통계 계산
  const calculateRecordStats = (recordsData: CoffeeRecord[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const totalRecords = recordsData.length
    const recordsToday = recordsData.filter(r => new Date(r.created_at) >= today).length
    const recordsThisWeek = recordsData.filter(r => new Date(r.created_at) >= weekAgo).length
    const recordsThisMonth = recordsData.filter(r => new Date(r.created_at) >= monthAgo).length
    
    // 평균 평점
    const validRatings = recordsData.filter(r => r.overall_rating).map(r => r.overall_rating)
    const averageRating = validRatings.length > 0 
      ? Math.round((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length) * 10) / 10
      : 0

    // 모드별 분포
    const modeDistribution = recordsData.reduce((acc, record) => {
      acc[record.mode] = (acc[record.mode] || 0) + 1
      return acc
    }, { cafe: 0, homecafe: 0, lab: 0 })

    // 상위 로스터리
    const roasterCounts = recordsData
      .filter(r => r.roaster)
      .reduce((acc, record) => {
        const roaster = record.roaster!
        if (!acc[roaster]) {
          acc[roaster] = { count: 0, totalRating: 0, validRatings: 0 }
        }
        acc[roaster].count++
        if (record.overall_rating) {
          acc[roaster].totalRating += record.overall_rating
          acc[roaster].validRatings++
        }
        return acc
      }, {} as Record<string, { count: number; totalRating: number; validRatings: number }>)

    const topRoasters = Object.entries(roasterCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        averageRating: data.validRatings > 0 ? Math.round((data.totalRating / data.validRatings) * 10) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 상위 원산지
    const originCounts = recordsData
      .filter(r => r.origin)
      .reduce((acc, record) => {
        const origin = record.origin!
        if (!acc[origin]) {
          acc[origin] = { count: 0, totalRating: 0, validRatings: 0 }
        }
        acc[origin].count++
        if (record.overall_rating) {
          acc[origin].totalRating += record.overall_rating
          acc[origin].validRatings++
        }
        return acc
      }, {} as Record<string, { count: number; totalRating: number; validRatings: number }>)

    const topOrigins = Object.entries(originCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        averageRating: data.validRatings > 0 ? Math.round((data.totalRating / data.validRatings) * 10) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 품질 지표
    const qualityMetrics = {
      highQuality: recordsData.filter(r => r.overall_rating >= 4.5).length,
      lowQuality: recordsData.filter(r => r.overall_rating > 0 && r.overall_rating < 3.0).length,
      withImages: recordsData.filter(r => r.image_url).length,
      withDetailedNotes: recordsData.filter(r => 
        r.personal_notes && r.personal_notes.length > 20
      ).length
    }
    
    setRecordStats({
      totalRecords,
      recordsToday,
      recordsThisWeek,
      recordsThisMonth,
      averageRating,
      modeDistribution,
      topRoasters,
      topOrigins,
      qualityMetrics
    })
  }

  // 필터 적용
  useEffect(() => {
    let filtered = [...records]
    
    // 검색 필터
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(record => 
        record.coffee_name.toLowerCase().includes(searchTerm) ||
        record.roaster?.toLowerCase().includes(searchTerm) ||
        record.origin?.toLowerCase().includes(searchTerm) ||
        record.cafe_name?.toLowerCase().includes(searchTerm) ||
        record.user_email?.toLowerCase().includes(searchTerm)
      )
    }
    
    // 모드 필터
    if (filters.mode !== 'all') {
      filtered = filtered.filter(record => record.mode === filters.mode)
    }
    
    // 평점 필터
    if (filters.rating !== 'all') {
      switch (filters.rating) {
        case '5':
          filtered = filtered.filter(record => record.overall_rating === 5)
          break
        case '4-5':
          filtered = filtered.filter(record => record.overall_rating >= 4)
          break
        case '3-4':
          filtered = filtered.filter(record => record.overall_rating >= 3 && record.overall_rating < 4)
          break
        case '1-3':
          filtered = filtered.filter(record => record.overall_rating < 3)
          break
      }
    }
    
    // 날짜 범위 필터
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let cutoffDate: Date
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          cutoffDate = new Date(0)
      }
      
      filtered = filtered.filter(record => new Date(record.created_at) >= cutoffDate)
    }
    
    // 이미지 필터
    if (filters.hasImage !== 'all') {
      if (filters.hasImage === 'yes') {
        filtered = filtered.filter(record => record.image_url)
      } else {
        filtered = filtered.filter(record => !record.image_url)
      }
    }
    
    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'coffee_name':
          aValue = a.coffee_name
          bValue = b.coffee_name
          break
        case 'overall_rating':
          aValue = a.overall_rating || 0
          bValue = b.overall_rating || 0
          break
        case 'user_email':
          aValue = a.user_email || ''
          bValue = b.user_email || ''
          break
        default:
          aValue = a.created_at
          bValue = b.created_at
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredRecords(filtered)
    setCurrentPage(1)
  }, [records, filters])

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadRecords()
  }, [])

  // 페이지네이션
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage)

  // 모드 아이콘
  const getModeIcon = (mode: CoffeeRecord['mode']) => {
    switch (mode) {
      case 'cafe': return '☕'
      case 'homecafe': return '🏠'
      case 'lab': return '🧪'
    }
  }

  // 모드 이름
  const getModeName = (mode: CoffeeRecord['mode']) => {
    switch (mode) {
      case 'cafe': return '카페'
      case 'homecafe': return '홈카페'
      case 'lab': return '랩'
    }
  }

  // 품질 점수 색상
  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-800">커피 기록 관리 로딩 중...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-coffee-200 rounded mb-2"></div>
                <div className="h-8 bg-coffee-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-800">커피 기록 관리</h1>
          <p className="text-coffee-600 mt-1">
            사용자들의 커피 기록을 관리하고 콘텐츠 품질을 모니터링하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <UnifiedButton
            variant="outline"
            size="small"
            onClick={loadRecords}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </UnifiedButton>
          <UnifiedButton
            variant="outline"
            size="small"
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <Download className="h-4 w-4 mr-2" />
            데이터 내보내기
          </UnifiedButton>
        </div>
      </div>

      {/* 기록 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">총 기록 수</p>
                <p className="text-2xl font-bold text-coffee-800">{recordStats.totalRecords}</p>
                <p className="text-xs text-green-600">
                  +{recordStats.recordsToday} 오늘
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-coffee-500 to-coffee-600 rounded-xl flex items-center justify-center">
                <Coffee className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">평균 평점</p>
                <p className="text-2xl font-bold text-coffee-800">{recordStats.averageRating}</p>
                <div className="flex items-center text-xs text-yellow-600">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  5점 만점
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">이번 주 기록</p>
                <p className="text-2xl font-bold text-coffee-800">{recordStats.recordsThisWeek}</p>
                <p className="text-xs text-coffee-600">
                  {recordStats.recordsThisMonth}개 이번 달
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">고품질 기록</p>
                <p className="text-2xl font-bold text-coffee-800">{recordStats.qualityMetrics.highQuality}</p>
                <p className="text-xs text-coffee-600">
                  4.5+ 평점
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 모드별 분포 및 품질 지표 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-coffee-600" />
              <span>모드별 분포</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(recordStats.modeDistribution).map(([mode, count]) => {
                const percentage = recordStats.totalRecords > 0 
                  ? Math.round((count / recordStats.totalRecords) * 100) 
                  : 0
                return (
                  <div key={mode} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getModeIcon(mode as CoffeeRecord['mode'])}</span>
                      <span className="font-medium text-coffee-800">
                        {getModeName(mode as CoffeeRecord['mode'])}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-coffee-100 rounded-full h-2">
                        <div 
                          className="bg-coffee-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-coffee-600 w-12">
                        {count}개
                      </span>
                      <span className="text-xs text-coffee-500 w-8">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-coffee-600" />
              <span>콘텐츠 품질 지표</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{recordStats.qualityMetrics.highQuality}</div>
                <div className="text-sm text-green-700">고품질 기록</div>
                <div className="text-xs text-green-600">4.5+ 평점</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{recordStats.qualityMetrics.lowQuality}</div>
                <div className="text-sm text-red-700">저품질 기록</div>
                <div className="text-xs text-red-600">3.0 미만 평점</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{recordStats.qualityMetrics.withImages}</div>
                <div className="text-sm text-blue-700">이미지 포함</div>
                <div className="text-xs text-blue-600">
                  {Math.round((recordStats.qualityMetrics.withImages / recordStats.totalRecords) * 100) || 0}%
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{recordStats.qualityMetrics.withDetailedNotes}</div>
                <div className="text-sm text-purple-700">상세 노트</div>
                <div className="text-xs text-purple-600">20자 이상</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 인기 로스터리 및 원산지 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coffee className="h-5 w-5 text-coffee-600" />
              <span>인기 로스터리</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recordStats.topRoasters.length > 0 ? (
                recordStats.topRoasters.map((roaster, index) => (
                  <div key={roaster.name} className="flex items-center justify-between p-3 bg-coffee-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-coffee-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-coffee-800">{roaster.name}</div>
                        <div className="text-sm text-coffee-600">{roaster.count}개 기록</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{roaster.averageRating}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-coffee-500">
                  <Coffee className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>로스터리 데이터가 없습니다</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-coffee-600" />
              <span>인기 원산지</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recordStats.topOrigins.length > 0 ? (
                recordStats.topOrigins.map((origin, index) => (
                  <div key={origin.name} className="flex items-center justify-between p-3 bg-coffee-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-coffee-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-coffee-800">{origin.name}</div>
                        <div className="text-sm text-coffee-600">{origin.count}개 기록</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{origin.averageRating}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-coffee-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>원산지 데이터가 없습니다</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* 검색 */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                <input
                  type="text"
                  placeholder="커피명, 로스터리, 원산지로 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 모드 필터 */}
            <select
              value={filters.mode}
              onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value as RecordFilters['mode'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 모드</option>
              <option value="cafe">카페</option>
              <option value="homecafe">홈카페</option>
              <option value="lab">랩</option>
            </select>

            {/* 평점 필터 */}
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value as RecordFilters['rating'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 평점</option>
              <option value="5">5점</option>
              <option value="4-5">4-5점</option>
              <option value="3-4">3-4점</option>
              <option value="1-3">1-3점</option>
            </select>

            {/* 이미지 필터 */}
            <select
              value={filters.hasImage}
              onChange={(e) => setFilters(prev => ({ ...prev, hasImage: e.target.value as RecordFilters['hasImage'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">이미지 전체</option>
              <option value="yes">이미지 있음</option>
              <option value="no">이미지 없음</option>
            </select>

            {/* 정렬 */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setFilters(prev => ({ 
                  ...prev, 
                  sortBy: sortBy as RecordFilters['sortBy'],
                  sortOrder: sortOrder as RecordFilters['sortOrder']
                }))
              }}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="created_at-desc">최신순</option>
              <option value="created_at-asc">오래된순</option>
              <option value="overall_rating-desc">평점 높은순</option>
              <option value="overall_rating-asc">평점 낮은순</option>
              <option value="coffee_name-asc">커피명 (A-Z)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 기록 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            커피 기록 ({filteredRecords.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-coffee-50 border-b border-coffee-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">커피 정보</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">사용자</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">모드</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">평점</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">품질</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">작성일</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-coffee-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {paginatedRecords.map(record => (
                  <tr key={record.id} className="hover:bg-coffee-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {record.image_url && (
                          <div className="w-10 h-10 bg-coffee-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-coffee-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-coffee-800">{record.coffee_name}</div>
                          <div className="text-sm text-coffee-600">
                            {record.roaster && `${record.roaster} · `}
                            {record.origin && `${record.origin}`}
                          </div>
                          {record.cafe_name && (
                            <div className="text-xs text-coffee-500">📍 {record.cafe_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-coffee-800">{record.user_email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getModeIcon(record.mode)}</span>
                        <span className="text-sm text-coffee-700">{getModeName(record.mode)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {record.overall_rating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-coffee-800">
                            {record.overall_rating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getQualityScoreColor(record.stats.qualityScore)}`}>
                        {record.stats.qualityScore}점
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-coffee-800">
                        {new Date(record.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-coffee-500">
                        {new Date(record.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowRecordDetails(true)
                          }}
                          className="p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          className="p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </UnifiedButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-coffee-200">
              <div className="text-sm text-coffee-600">
                {startIndex + 1}-{Math.min(startIndex + recordsPerPage, filteredRecords.length)} / {filteredRecords.length}개
              </div>
              <div className="flex items-center space-x-2">
                <UnifiedButton
                  variant="outline"
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="border-coffee-200"
                >
                  이전
                </UnifiedButton>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (page > totalPages) return null
                  
                  return (
                    <UnifiedButton
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="small"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-coffee-500" : "border-coffee-200"}
                    >
                      {page}
                    </UnifiedButton>
                  )
                })}
                
                <UnifiedButton
                  variant="outline"
                  size="small"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="border-coffee-200"
                >
                  다음
                </UnifiedButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}