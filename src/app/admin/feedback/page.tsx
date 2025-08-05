/**
 * 어드민 피드백 관리 페이지
 * 베타 피드백, 사용자 문의, 버그 리포트 관리
 */
'use client'

import { useState, useEffect } from 'react'

import { 
  MessageSquare, 
  Search, 
  Filter,
  Star,
  AlertTriangle,
  Bug,
  Lightbulb,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageCircle,
  Check,
  X,
  Flag,
  User,
  Calendar,
  Clock,
  Tag,
  Archive,
  Download,
  RefreshCw,
  BarChart3,
  TrendingUp
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import UnifiedButton from '../../../components/ui/UnifiedButton'
import { logger } from '../../../lib/logger'
import { supabase } from '../../../lib/supabase'

interface Feedback {
  id: string
  user_id: string | null
  type: 'bug' | 'feature' | 'improvement' | 'general' | 'complaint'
  status: 'new' | 'in_progress' | 'resolved' | 'closed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  content: string
  rating: number | null // 1-5 별점
  email: string | null
  created_at: string
  updated_at: string
  
  // 메타데이터
  metadata: {
    page: string | null
    userAgent: string | null
    deviceInfo: any
    sessionId: string | null
  }
  
  // 관리자 응답
  admin_response: string | null
  admin_user_id: string | null
  resolved_at: string | null
  
  // 사용자 정보 (조인)
  user_email?: string
  
  // 통계
  stats: {
    viewCount: number
    upvotes: number
    downvotes: number
    adminNotes: string[]
  }
}

interface FeedbackFilters {
  search: string
  type: 'all' | 'bug' | 'feature' | 'improvement' | 'general' | 'complaint'
  status: 'all' | 'new' | 'in_progress' | 'resolved' | 'closed' | 'archived'
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent'
  rating: 'all' | '5' | '4' | '3' | '2' | '1'
  dateRange: 'all' | 'today' | 'week' | 'month'
  sortBy: 'created_at' | 'updated_at' | 'priority' | 'rating'
  sortOrder: 'asc' | 'desc'
}

interface FeedbackStats {
  totalFeedback: number
  newFeedback: number
  resolvedFeedback: number
  avgRating: number
  responseTime: number // 평균 응답 시간 (시간)
  typeDistribution: {
    bug: number
    feature: number
    improvement: number
    general: number
    complaint: number
  }
  statusDistribution: {
    new: number
    in_progress: number
    resolved: number
    closed: number
    archived: number
  }
  trends: {
    thisWeek: number
    lastWeek: number
    change: number
  }
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([])
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    newFeedback: 0,
    resolvedFeedback: 0,
    avgRating: 0,
    responseTime: 0,
    typeDistribution: { bug: 0, feature: 0, improvement: 0, general: 0, complaint: 0 },
    statusDistribution: { new: 0, in_progress: 0, resolved: 0, closed: 0, archived: 0 },
    trends: { thisWeek: 0, lastWeek: 0, change: 0 }
  })
  
  const [filters, setFilters] = useState<FeedbackFilters>({
    search: '',
    type: 'all',
    status: 'all',
    priority: 'all',
    rating: 'all',
    dateRange: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [feedbackPerPage] = useState(20)
  const [adminResponse, setAdminResponse] = useState('')

  // 피드백 데이터 로드 (시뮬레이션)
  const loadFeedback = async () => {
    try {
      setIsLoading(true)
      
      // 실제 구현에서는 Supabase에서 피드백 데이터를 가져옴
      // 현재는 시뮬레이션 데이터 생성
      const simulatedFeedback: Feedback[] = Array.from({ length: 50 }, (_, i) => {
        const types: Feedback['type'][] = ['bug', 'feature', 'improvement', 'general', 'complaint']
        const statuses: Feedback['status'][] = ['new', 'in_progress', 'resolved', 'closed']
        const priorities: Feedback['priority'][] = ['low', 'medium', 'high', 'urgent']
        
        const type = types[Math.floor(Math.random() * types.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const priority = priorities[Math.floor(Math.random() * priorities.length)]
        const rating = Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : null
        
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 최근 30일
        
        return {
          id: `feedback-${i}`,
          user_id: Math.random() > 0.2 ? `user-${Math.floor(Math.random() * 100)}` : null,
          type,
          status,
          priority,
          title: generateFeedbackTitle(type),
          content: generateFeedbackContent(type),
          rating,
          email: Math.random() > 0.5 ? `user${i}@example.com` : null,
          created_at: createdAt.toISOString(),
          updated_at: createdAt.toISOString(),
          metadata: {
            page: Math.random() > 0.5 ? '/add-record' : '/',
            userAgent: 'Mozilla/5.0...',
            deviceInfo: { mobile: Math.random() > 0.5 },
            sessionId: `session-${i}`
          },
          admin_response: status === 'resolved' ? '문제가 해결되었습니다.' : null,
          admin_user_id: status === 'resolved' ? 'admin-1' : null,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          user_email: `user${i}@example.com`,
          stats: {
            viewCount: Math.floor(Math.random() * 20),
            upvotes: Math.floor(Math.random() * 10),
            downvotes: Math.floor(Math.random() * 3),
            adminNotes: []
          }
        }
      })
      
      setFeedback(simulatedFeedback)
      calculateFeedbackStats(simulatedFeedback)
      
      logger.info('Feedback data loaded successfully', { 
        totalFeedback: simulatedFeedback.length 
      })
      
    } catch (error) {
      logger.error('Failed to load feedback data', { error })
    } finally {
      setIsLoading(false)
    }
  }

  // 피드백 제목 생성 (시뮬레이션)
  const generateFeedbackTitle = (type: Feedback['type']): string => {
    const titles = {
      bug: ['로그인 오류', '이미지 업로드 실패', '평점 저장 안됨', '페이지 로딩 문제'],
      feature: ['다크모드 추가 요청', '검색 기능 개선', '알림 설정', '커피 추천 기능'],
      improvement: ['UI 개선 제안', '성능 최적화', '사용성 향상', '접근성 개선'],
      general: ['전체적으로 좋음', '사용법 문의', '기능 설명 요청', '일반 의견'],
      complaint: ['속도가 느림', '기능이 복잡함', '오류가 많음', '불편함']
    }
    const typesTitles = titles[type]
    return typesTitles[Math.floor(Math.random() * typesTitles.length)]
  }

  // 피드백 내용 생성 (시뮬레이션)
  const generateFeedbackContent = (type: Feedback['type']): string => {
    const contents = {
      bug: '버그가 발생했습니다. 재현 단계는 다음과 같습니다...',
      feature: '이런 기능이 있으면 좋겠습니다. 사용자 경험이 더 나아질 것 같아요.',
      improvement: '현재 기능을 개선하면 더 좋을 것 같습니다.',
      general: '전반적으로 잘 만들어진 앱이라고 생각합니다.',
      complaint: '이 부분이 불편합니다. 개선이 필요할 것 같아요.'
    }
    return contents[type]
  }

  // 통계 계산
  const calculateFeedbackStats = (feedbackData: Feedback[]) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    
    const totalFeedback = feedbackData.length
    const newFeedback = feedbackData.filter(f => f.status === 'new').length
    const resolvedFeedback = feedbackData.filter(f => f.status === 'resolved').length
    
    // 평균 평점
    const validRatings = feedbackData.filter(f => f.rating).map(f => f.rating!)
    const avgRating = validRatings.length > 0 
      ? Math.round((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length) * 10) / 10
      : 0

    // 평균 응답 시간 (시뮬레이션)
    const responseTime = Math.random() * 24 + 2 // 2-26시간
    
    // 타입별 분포
    const typeDistribution = feedbackData.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1
      return acc
    }, { bug: 0, feature: 0, improvement: 0, general: 0, complaint: 0 })

    // 상태별 분포
    const statusDistribution = feedbackData.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1
      return acc
    }, { new: 0, in_progress: 0, resolved: 0, closed: 0, archived: 0 })

    // 트렌드
    const thisWeek = feedbackData.filter(f => new Date(f.created_at) >= weekAgo).length
    const lastWeek = feedbackData.filter(f => 
      new Date(f.created_at) >= twoWeeksAgo && new Date(f.created_at) < weekAgo
    ).length
    const change = thisWeek - lastWeek
    
    setFeedbackStats({
      totalFeedback,
      newFeedback,
      resolvedFeedback,
      avgRating,
      responseTime,
      typeDistribution,
      statusDistribution,
      trends: { thisWeek, lastWeek, change }
    })
  }

  // 필터 적용
  useEffect(() => {
    let filtered = [...feedback]
    
    // 검색 필터
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(f => 
        f.title.toLowerCase().includes(searchTerm) ||
        f.content.toLowerCase().includes(searchTerm) ||
        f.user_email?.toLowerCase().includes(searchTerm)
      )
    }
    
    // 타입 필터
    if (filters.type !== 'all') {
      filtered = filtered.filter(f => f.type === filters.type)
    }
    
    // 상태 필터
    if (filters.status !== 'all') {
      filtered = filtered.filter(f => f.status === filters.status)
    }
    
    // 우선순위 필터
    if (filters.priority !== 'all') {
      filtered = filtered.filter(f => f.priority === filters.priority)
    }
    
    // 평점 필터
    if (filters.rating !== 'all') {
      const targetRating = parseInt(filters.rating)
      filtered = filtered.filter(f => f.rating === targetRating)
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
        default:
          cutoffDate = new Date(0)
      }
      
      filtered = filtered.filter(f => new Date(f.created_at) >= cutoffDate)
    }
    
    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'updated_at':
          aValue = a.updated_at
          bValue = b.updated_at
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
    
    setFilteredFeedback(filtered)
    setCurrentPage(1)
  }, [feedback, filters])

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadFeedback()
  }, [])

  // 페이지네이션
  const totalPages = Math.ceil(filteredFeedback.length / feedbackPerPage)
  const startIndex = (currentPage - 1) * feedbackPerPage
  const paginatedFeedback = filteredFeedback.slice(startIndex, startIndex + feedbackPerPage)

  // 타입 아이콘
  const getTypeIcon = (type: Feedback['type']) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4" />
      case 'feature': return <Lightbulb className="h-4 w-4" />
      case 'improvement': return <TrendingUp className="h-4 w-4" />
      case 'general': return <MessageSquare className="h-4 w-4" />
      case 'complaint': return <AlertTriangle className="h-4 w-4" />
    }
  }

  // 타입 색상
  const getTypeColor = (type: Feedback['type']) => {
    switch (type) {
      case 'bug': return 'text-red-600 bg-red-50 border-red-200'
      case 'feature': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'improvement': return 'text-green-600 bg-green-50 border-green-200'
      case 'general': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'complaint': return 'text-orange-600 bg-orange-50 border-orange-200'
    }
  }

  // 상태 색상
  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-50'
      case 'in_progress': return 'text-yellow-600 bg-yellow-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'closed': return 'text-gray-600 bg-gray-50'
      case 'archived': return 'text-purple-600 bg-purple-50'
    }
  }

  // 우선순위 색상
  const getPriorityColor = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'low': return 'text-gray-600 bg-gray-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'urgent': return 'text-red-600 bg-red-50'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-800">피드백 관리 로딩 중...</h1>
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
          <h1 className="text-2xl font-bold text-coffee-800">피드백 관리</h1>
          <p className="text-coffee-600 mt-1">
            사용자 피드백을 관리하고 서비스 품질을 개선하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={loadFeedback}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </UnifiedButton>
          <UnifiedButton
            variant="outline"
            size="sm"
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <Download className="h-4 w-4 mr-2" />
            리포트 내보내기
          </UnifiedButton>
        </div>
      </div>

      {/* 피드백 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">총 피드백</p>
                <p className="text-2xl font-bold text-coffee-800">{feedbackStats.totalFeedback}</p>
                <p className={`text-xs ${
                  feedbackStats.trends.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {feedbackStats.trends.change >= 0 ? '+' : ''}{feedbackStats.trends.change} 이번 주
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">신규 피드백</p>
                <p className="text-2xl font-bold text-coffee-800">{feedbackStats.newFeedback}</p>
                <p className="text-xs text-orange-600">
                  처리 대기 중
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">해결됨</p>
                <p className="text-2xl font-bold text-coffee-800">{feedbackStats.resolvedFeedback}</p>
                <p className="text-xs text-green-600">
                  {Math.round((feedbackStats.resolvedFeedback / feedbackStats.totalFeedback) * 100) || 0}% 해결률
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">평균 평점</p>
                <p className="text-2xl font-bold text-coffee-800">{feedbackStats.avgRating}</p>
                <div className="flex items-center text-xs text-yellow-600">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  사용자 만족도
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 타입별 분포 및 상태별 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-coffee-600" />
              <span>피드백 유형별 분포</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(feedbackStats.typeDistribution).map(([type, count]) => {
                const percentage = feedbackStats.totalFeedback > 0 
                  ? Math.round((count / feedbackStats.totalFeedback) * 100) 
                  : 0
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${getTypeColor(type as Feedback['type'])}`}>
                        {getTypeIcon(type as Feedback['type'])}
                      </div>
                      <span className="font-medium text-coffee-800 capitalize">
                        {type === 'bug' ? '버그' : type === 'feature' ? '기능요청' : 
                         type === 'improvement' ? '개선' : type === 'general' ? '일반' : '불만'}
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
              <TrendingUp className="h-5 w-5 text-coffee-600" />
              <span>처리 현황</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(feedbackStats.statusDistribution).map(([status, count]) => {
                const percentage = feedbackStats.totalFeedback > 0 
                  ? Math.round((count / feedbackStats.totalFeedback) * 100) 
                  : 0
                const statusName = status === 'new' ? '신규' : 
                                  status === 'in_progress' ? '처리중' :
                                  status === 'resolved' ? '해결됨' :
                                  status === 'closed' ? '종료' : '보관됨'
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status as Feedback['status'])}`}>
                        {statusName}
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
                  placeholder="제목, 내용, 이메일로 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 타입 필터 */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as FeedbackFilters['type'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 유형</option>
              <option value="bug">버그</option>
              <option value="feature">기능요청</option>
              <option value="improvement">개선</option>
              <option value="general">일반</option>
              <option value="complaint">불만</option>
            </select>

            {/* 상태 필터 */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FeedbackFilters['status'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 상태</option>
              <option value="new">신규</option>
              <option value="in_progress">처리중</option>
              <option value="resolved">해결됨</option>
              <option value="closed">종료</option>
              <option value="archived">보관됨</option>
            </select>

            {/* 우선순위 필터 */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as FeedbackFilters['priority'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 우선순위</option>
              <option value="urgent">긴급</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>

            {/* 정렬 */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setFilters(prev => ({ 
                  ...prev, 
                  sortBy: sortBy as FeedbackFilters['sortBy'],
                  sortOrder: sortOrder as FeedbackFilters['sortOrder']
                }))
              }}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="created_at-desc">최신순</option>
              <option value="created_at-asc">오래된순</option>
              <option value="priority-desc">우선순위 높은순</option>
              <option value="rating-desc">평점 높은순</option>
              <option value="updated_at-desc">최근 업데이트순</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 피드백 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            피드백 목록 ({filteredFeedback.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-coffee-50 border-b border-coffee-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">피드백</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">사용자</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">유형</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">상태</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">우선순위</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">평점</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">작성일</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-coffee-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {paginatedFeedback.map(item => (
                  <tr key={item.id} className="hover:bg-coffee-50/50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-coffee-800">{item.title}</div>
                        <div className="text-sm text-coffee-600 truncate max-w-xs">
                          {item.content}
                        </div>
                        {item.metadata.page && (
                          <div className="text-xs text-coffee-500 mt-1">
                            📄 {item.metadata.page}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-coffee-800">
                        {item.user_email || item.email || '익명'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        <span className="ml-1">
                          {item.type === 'bug' ? '버그' : item.type === 'feature' ? '기능' : 
                           item.type === 'improvement' ? '개선' : item.type === 'general' ? '일반' : '불만'}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status === 'new' ? '신규' : 
                         item.status === 'in_progress' ? '처리중' :
                         item.status === 'resolved' ? '해결됨' :
                         item.status === 'closed' ? '종료' : '보관됨'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority === 'urgent' ? '긴급' :
                         item.priority === 'high' ? '높음' :
                         item.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {item.rating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-coffee-800">
                            {item.rating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-coffee-800">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-coffee-500">
                        {new Date(item.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFeedback(item)
                            setShowFeedbackDetails(true)
                          }}
                          className="p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          className="p-2 text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
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
                {startIndex + 1}-{Math.min(startIndex + feedbackPerPage, filteredFeedback.length)} / {filteredFeedback.length}개
              </div>
              <div className="flex items-center space-x-2">
                <UnifiedButton
                  variant="outline"
                  size="sm"
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
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-coffee-500" : "border-coffee-200"}
                    >
                      {page}
                    </UnifiedButton>
                  )
                })}
                
                <UnifiedButton
                  variant="outline"
                  size="sm"
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