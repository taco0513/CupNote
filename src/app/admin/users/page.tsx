/**
 * 어드민 사용자 관리 페이지
 * 사용자 목록, 활동 통계, 계정 관리, 권한 설정
 */
'use client'

import { useState, useEffect } from 'react'

import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  Activity,
  Shield,
  Ban,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Download,
  RefreshCw,
  Clock,
  Coffee,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import UnifiedButton from '../../../components/ui/UnifiedButton'
import { logger } from '../../../lib/logger'
import { supabase } from '../../../lib/supabase'

interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
  user_metadata: {
    name?: string
    avatar_url?: string
    role?: string
  }
  // 추가 통계 데이터
  stats: {
    totalRecords: number
    averageRating: number
    lastActivity: string | null
    favoriteMode: 'cafe' | 'homecafe' | 'lab' | null
    joinedDaysAgo: number
  }
  status: 'active' | 'inactive' | 'banned'
}

interface UserFilters {
  search: string
  status: 'all' | 'active' | 'inactive' | 'banned'
  role: 'all' | 'user' | 'admin'
  dateRange: 'all' | 'today' | 'week' | 'month'
  sortBy: 'created_at' | 'last_sign_in' | 'email' | 'records_count'
  sortOrder: 'asc' | 'desc'
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  averageRecordsPerUser: number
  topUsers: Array<{
    id: string
    email: string
    recordCount: number
  }>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    averageRecordsPerUser: 0,
    topUsers: []
  })
  
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
    dateRange: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(20)

  // 사용자 데이터 로드
  const loadUsers = async () => {
    try {
      setIsLoading(true)
      
      // 사용자 기본 정보 가져오기
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        logger.error('Failed to load auth users', { error: authError })
        return
      }

      // 각 사용자의 커피 기록 통계 가져오기
      const usersWithStats: UserData[] = []
      
      for (const authUser of authUsers.users) {
        // 사용자의 커피 기록 통계
        const { data: recordsData } = await supabase
          .from('coffee_records')
          .select('id, overall_rating, created_at, mode')
          .eq('user_id', authUser.id)
        
        const totalRecords = recordsData?.length || 0
        const validRatings = recordsData?.filter(r => r.overall_rating).map(r => r.overall_rating) || []
        const averageRating = validRatings.length > 0 
          ? Math.round((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length) * 10) / 10
          : 0
        
        const lastActivity = recordsData && recordsData.length > 0 
          ? recordsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null
        
        // 가장 많이 사용한 모드
        const modeCount = recordsData?.reduce((acc, record) => {
          acc[record.mode] = (acc[record.mode] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}
        
        const favoriteMode = Object.keys(modeCount).length > 0
          ? Object.keys(modeCount).reduce((a, b) => modeCount[a] > modeCount[b] ? a : b) as UserData['stats']['favoriteMode']
          : null
        
        const joinedDaysAgo = Math.floor((Date.now() - new Date(authUser.created_at).getTime()) / (1000 * 60 * 60 * 24))
        
        // 사용자 상태 결정
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const status: UserData['status'] = 
          authUser.banned_until ? 'banned' :
          authUser.last_sign_in_at && new Date(authUser.last_sign_in_at) > weekAgo ? 'active' : 'inactive'
        
        usersWithStats.push({
          id: authUser.id,
          email: authUser.email || '',
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          email_confirmed_at: authUser.email_confirmed_at,
          user_metadata: authUser.user_metadata,
          stats: {
            totalRecords,
            averageRating,
            lastActivity,
            favoriteMode,
            joinedDaysAgo
          },
          status
        })
      }
      
      setUsers(usersWithStats)
      calculateUserStats(usersWithStats)
      
      logger.info('Users loaded successfully', { 
        totalUsers: usersWithStats.length 
      })
      
    } catch (error) {
      logger.error('Failed to load users', { error })
    } finally {
      setIsLoading(false)
    }
  }

  // 사용자 통계 계산
  const calculateUserStats = (userData: UserData[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const totalUsers = userData.length
    const activeUsers = userData.filter(u => u.status === 'active').length
    const newUsersToday = userData.filter(u => new Date(u.created_at) >= today).length
    const newUsersThisWeek = userData.filter(u => new Date(u.created_at) >= weekAgo).length
    
    const totalRecords = userData.reduce((sum, user) => sum + user.stats.totalRecords, 0)
    const averageRecordsPerUser = totalUsers > 0 ? Math.round(totalRecords / totalUsers * 10) / 10 : 0
    
    const topUsers = userData
      .filter(u => u.stats.totalRecords > 0)
      .sort((a, b) => b.stats.totalRecords - a.stats.totalRecords)
      .slice(0, 5)
      .map(u => ({
        id: u.id,
        email: u.email,
        recordCount: u.stats.totalRecords
      }))
    
    setUserStats({
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      averageRecordsPerUser,
      topUsers
    })
  }

  // 필터 적용
  useEffect(() => {
    let filtered = [...users]
    
    // 검색 필터
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        user.user_metadata.name?.toLowerCase().includes(searchTerm)
      )
    }
    
    // 상태 필터
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status)
    }
    
    // 역할 필터
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => {
        if (filters.role === 'admin') {
          return user.user_metadata.role === 'admin' || user.email.includes('admin')
        }
        return !user.user_metadata.role || user.user_metadata.role === 'user'
      })
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
      
      filtered = filtered.filter(user => new Date(user.created_at) >= cutoffDate)
    }
    
    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'last_sign_in':
          aValue = a.last_sign_in_at || ''
          bValue = b.last_sign_in_at || ''
          break
        case 'records_count':
          aValue = a.stats.totalRecords
          bValue = b.stats.totalRecords
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
    
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [users, filters])

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadUsers()
  }, [])

  // 페이지네이션
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  // 사용자 상태 색상
  const getStatusColor = (status: UserData['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'inactive': return 'text-gray-600 bg-gray-50'
      case 'banned': return 'text-red-600 bg-red-50'
    }
  }

  // 사용자 상태 아이콘
  const getStatusIcon = (status: UserData['status']) => {
    switch (status) {
      case 'active': return '🟢'
      case 'inactive': return '⚪'
      case 'banned': return '🔴'
    }
  }

  // 모드 아이콘
  const getModeIcon = (mode: UserData['stats']['favoriteMode']) => {
    switch (mode) {
      case 'cafe': return '☕'
      case 'homecafe': return '🏠'
      case 'lab': return '🧪'
      default: return '❓'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-800">사용자 관리 로딩 중...</h1>
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
          <h1 className="text-2xl font-bold text-coffee-800">사용자 관리</h1>
          <p className="text-coffee-600 mt-1">
            등록된 사용자 계정 및 활동 통계를 관리하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={loadUsers}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-coffee-500 to-coffee-600"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            사용자 초대
          </UnifiedButton>
        </div>
      </div>

      {/* 사용자 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">총 사용자</p>
                <p className="text-2xl font-bold text-coffee-800">{userStats.totalUsers}</p>
                <p className="text-xs text-green-600">
                  +{userStats.newUsersThisWeek} 이번 주
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">활성 사용자</p>
                <p className="text-2xl font-bold text-coffee-800">{userStats.activeUsers}</p>
                <p className="text-xs text-coffee-600">
                  {Math.round((userStats.activeUsers / userStats.totalUsers) * 100) || 0}% 활성률
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">신규 가입 (오늘)</p>
                <p className="text-2xl font-bold text-coffee-800">{userStats.newUsersToday}</p>
                <p className="text-xs text-coffee-600">
                  {userStats.newUsersThisWeek}명 이번 주
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">평균 기록 수</p>
                <p className="text-2xl font-bold text-coffee-800">{userStats.averageRecordsPerUser}</p>
                <p className="text-xs text-coffee-600">
                  사용자당 평균
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-coffee-500 to-coffee-600 rounded-xl flex items-center justify-center">
                <Coffee className="h-6 w-6 text-white" />
              </div>
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
                  placeholder="이메일 또는 이름으로 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as UserFilters['status'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="banned">차단됨</option>
            </select>

            {/* 역할 필터 */}
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as UserFilters['role'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 역할</option>
              <option value="user">일반 사용자</option>
              <option value="admin">관리자</option>
            </select>

            {/* 날짜 범위 */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as UserFilters['dateRange'] }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
            </select>

            {/* 정렬 */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setFilters(prev => ({ 
                  ...prev, 
                  sortBy: sortBy as UserFilters['sortBy'],
                  sortOrder: sortOrder as UserFilters['sortOrder']
                }))
              }}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="created_at-desc">가입일 (최신순)</option>
              <option value="created_at-asc">가입일 (오래된순)</option>
              <option value="last_sign_in-desc">최근 로그인</option>
              <option value="email-asc">이메일 (A-Z)</option>
              <option value="records_count-desc">기록 수 (많은순)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            사용자 목록 ({filteredUsers.length}명)
          </CardTitle>
          <UnifiedButton
            variant="outline"
            size="sm"
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV 내보내기
          </UnifiedButton>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-coffee-50 border-b border-coffee-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">사용자</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">상태</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">가입일</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">최근 활동</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">기록 수</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">평균 평점</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-coffee-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-coffee-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-coffee-800">
                            {user.user_metadata.name || user.email.split('@')[0]}
                          </div>
                          <div className="text-sm text-coffee-500">{user.email}</div>
                          {user.user_metadata.role === 'admin' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 mt-1">
                              <Shield className="h-3 w-3 mr-1" />
                              관리자
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        <span className="mr-1">{getStatusIcon(user.status)}</span>
                        {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '차단됨'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-coffee-800">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-coffee-500">
                        {user.stats.joinedDaysAgo}일 전
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.last_sign_in_at ? (
                        <div>
                          <div className="text-sm text-coffee-800">
                            {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-coffee-500">
                            {Math.floor((Date.now() - new Date(user.last_sign_in_at).getTime()) / (1000 * 60 * 60 * 24))}일 전
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">로그인 기록 없음</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-coffee-800">
                          {user.stats.totalRecords}
                        </span>
                        {user.stats.favoriteMode && (
                          <span className="text-sm" title={`선호 모드: ${user.stats.favoriteMode}`}>
                            {getModeIcon(user.stats.favoriteMode)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.stats.averageRating > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-coffee-800">
                            {user.stats.averageRating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetails(true)
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
                          <Edit className="h-4 w-4" />
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <Ban className="h-4 w-4" />
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
                {startIndex + 1}-{Math.min(startIndex + usersPerPage, filteredUsers.length)} / {filteredUsers.length}명
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

      {/* Top Users 섹션 */}
      {userStats.topUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>활발한 사용자</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userStats.topUsers.map((topUser, index) => (
                <div key={topUser.id} className="flex items-center justify-between p-3 bg-coffee-50/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-coffee-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-coffee-800">{topUser.email}</div>
                      <div className="text-sm text-coffee-600">{topUser.recordCount}개 기록</div>
                    </div>
                  </div>
                  <Coffee className="h-5 w-5 text-coffee-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}