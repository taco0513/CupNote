/**
 * 어드민 메인 대시보드 페이지
 * 시스템 전체 현황, 성능 지표, 주요 통계, 실시간 모니터링
 */
'use client'

import { useState, useEffect } from 'react'

import { 
  Users, 
  Coffee, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare, 
  Calendar,
  Activity,
  Database,
  Clock,
  Star,
  Eye,
  Download,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react'

import PerformanceDashboard from '../../components/performance/PerformanceDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import UnifiedButton from '../../components/ui/UnifiedButton'
import { useAuth } from '../../contexts/AuthContext'
import usePerformanceMonitoring from '../../hooks/usePerformanceMonitoring'
import { logger } from '../../lib/logger'
import { supabase } from '../../lib/supabase'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRecords: number
  todayRecords: number
  averageRating: number
  totalFeedback: number
  unreadFeedback: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  performanceScore: number
}

interface RecentActivity {
  id: string
  type: 'user_signup' | 'coffee_record' | 'feedback' | 'system_alert'
  message: string
  timestamp: number
  severity?: 'info' | 'warning' | 'error'
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  badge?: number
  color: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRecords: 0,
    todayRecords: 0,
    averageRating: 0,
    totalFeedback: 0,
    unreadFeedback: 0,
    systemHealth: 'good',
    performanceScore: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [showPerformanceDetails, setShowPerformanceDetails] = useState(false)
  
  const { 
    performanceScore, 
    hasMetrics, 
    isInitialized,
    latestAlerts,
    hasAlerts
  } = usePerformanceMonitoring({
    autoInit: true,
    enableLogging: false,
    enableAnomalyDetection: true
  })

  // 대시보드 통계 로드
  const loadDashboardStats = async () => {
    try {
      setIsLoading(true)
      
      // 사용자 통계
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, created_at, last_sign_in_at')
      
      if (userError) throw userError
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const totalUsers = userData?.length || 0
      const activeUsers = userData?.filter(u => 
        u.last_sign_in_at && new Date(u.last_sign_in_at) > weekAgo
      ).length || 0

      // 커피 기록 통계
      const { data: recordsData, error: recordsError } = await supabase
        .from('coffee_records')
        .select('id, created_at, overall_rating')
      
      if (recordsError) throw recordsError
      
      const totalRecords = recordsData?.length || 0
      const todayRecords = recordsData?.filter(r => 
        new Date(r.created_at) >= today
      ).length || 0
      
      const validRatings = recordsData?.filter(r => r.overall_rating).map(r => r.overall_rating) || []
      const averageRating = validRatings.length > 0 
        ? Math.round((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length) * 10) / 10
        : 0

      // 피드백 통계 (실제 구현에서는 feedback 테이블에서 가져옴)
      const totalFeedback = Math.floor(Math.random() * 50) + 20 // 임시 데이터
      const unreadFeedback = Math.floor(Math.random() * 10) + 2 // 임시 데이터
      
      // 시스템 상태 평가
      const systemHealth = evaluateSystemHealth(performanceScore, totalUsers, totalRecords)
      
      setStats({
        totalUsers,
        activeUsers,
        totalRecords,
        todayRecords,
        averageRating,
        totalFeedback,
        unreadFeedback,
        systemHealth,
        performanceScore: performanceScore || 85 // 기본값
      })
      
      // 최근 활동 생성 (실제 구현에서는 활동 로그 테이블에서)
      generateRecentActivity(totalUsers, totalRecords, todayRecords)
      
      setLastUpdated(new Date())
      logger.info('Admin dashboard stats loaded', { 
        totalUsers, 
        totalRecords, 
        averageRating 
      })
      
    } catch (error) {
      logger.error('Failed to load dashboard stats', { error })
    } finally {
      setIsLoading(false)
    }
  }

  // 시스템 상태 평가
  const evaluateSystemHealth = (perfScore: number, users: number, records: number): DashboardStats['systemHealth'] => {
    if (perfScore >= 90 && users > 0 && records > 0) return 'excellent'
    if (perfScore >= 75 && users >= 0) return 'good'
    if (perfScore >= 60) return 'warning'
    return 'critical'
  }

  // 최근 활동 생성 (임시 데이터)
  const generateRecentActivity = (users: number, records: number, todayRecords: number) => {
    const activities: RecentActivity[] = []
    const now = Date.now()
    
    // 최근 가입
    if (users > 0) {
      activities.push({
        id: '1',
        type: 'user_signup',
        message: `새로운 사용자가 가입했습니다`,
        timestamp: now - Math.random() * 3600000, // 1시간 이내
        severity: 'info'
      })
    }
    
    // 오늘 기록
    if (todayRecords > 0) {
      activities.push({
        id: '2',
        type: 'coffee_record',
        message: `오늘 ${todayRecords}개의 새로운 커피 기록이 추가되었습니다`,
        timestamp: now - Math.random() * 7200000, // 2시간 이내
        severity: 'info'
      })
    }
    
    // 성능 알림
    if (hasAlerts && latestAlerts.length > 0) {
      activities.push({
        id: '3',
        type: 'system_alert',
        message: latestAlerts[0].message,
        timestamp: latestAlerts[0].timestamp,
        severity: latestAlerts[0].severity === 'error' ? 'error' : 'warning'
      })
    }
    
    // 피드백
    activities.push({
      id: '4',
      type: 'feedback',
      message: '새로운 베타 피드백이 도착했습니다',
      timestamp: now - Math.random() * 14400000, // 4시간 이내
      severity: 'info'
    })
    
    setRecentActivity(activities.sort((a, b) => b.timestamp - a.timestamp))
  }

  // 빠른 작업 정의
  const quickActions: QuickAction[] = [
    {
      id: 'users',
      title: '사용자 관리',
      description: '사용자 계정 및 활동 관리',
      icon: <Users className="h-6 w-6" />,
      href: '/admin/users',
      badge: stats.activeUsers,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'records',
      title: '커피 기록',
      description: '전체 커피 기록 및 통계',
      icon: <Coffee className="h-6 w-6" />,
      href: '/admin/records',
      badge: stats.todayRecords,
      color: 'from-coffee-500 to-coffee-600'
    },
    {
      id: 'feedback',
      title: '피드백 관리',
      description: '사용자 피드백 및 문의',
      icon: <MessageSquare className="h-6 w-6" />,
      href: '/admin/feedback',
      badge: stats.unreadFeedback,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'analytics',
      title: '성능 분석',
      description: '시스템 성능 및 모니터링',
      icon: <Activity className="h-6 w-6" />,
      href: '/admin/analytics',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadDashboardStats()
  }, [])

  // 성능 점수 업데이트
  useEffect(() => {
    if (isInitialized && hasMetrics) {
      setStats(prev => ({
        ...prev,
        performanceScore: performanceScore || prev.performanceScore
      }))
    }
  }, [performanceScore, isInitialized, hasMetrics])

  const getSystemHealthColor = () => {
    switch (stats.systemHealth) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getSystemHealthIcon = () => {
    switch (stats.systemHealth) {
      case 'excellent': return '🚀'
      case 'good': return '✅'
      case 'warning': return '⚠️'
      case 'critical': return '🚨'
    }
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup': return <Users className="h-4 w-4" />
      case 'coffee_record': return <Coffee className="h-4 w-4" />
      case 'feedback': return <MessageSquare className="h-4 w-4" />
      case 'system_alert': return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getActivityColor = (severity?: RecentActivity['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-coffee-600'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-800">대시보드 로딩 중...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <h1 className="text-2xl font-bold text-coffee-800">관리자 대시보드</h1>
          <p className="text-coffee-600 mt-1">
            CupNote 시스템 전체 현황을 한눈에 확인하세요
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-coffee-500">
            마지막 업데이트: {lastUpdated.toLocaleTimeString()}
          </div>
          <UnifiedButton
            variant="outline"
            size="small"
            onClick={loadDashboardStats}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </UnifiedButton>
        </div>
      </div>

      {/* 시스템 상태 개요 */}
      <Card className={`border-2 ${getSystemHealthColor()}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getSystemHealthIcon()}</div>
              <div>
                <h3 className="text-lg font-semibold">시스템 상태</h3>
                <p className="text-sm opacity-80">
                  전체적인 시스템 건강 상태: {stats.systemHealth}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.performanceScore}/100</div>
              <div className="text-sm opacity-80">성능 점수</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-600">총 사용자</p>
                <p className="text-2xl font-bold text-coffee-800">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">
                  +{stats.activeUsers} 활성 (7일)
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
                <p className="text-sm text-coffee-600">커피 기록</p>
                <p className="text-2xl font-bold text-coffee-800">{stats.totalRecords}</p>
                <p className="text-xs text-green-600">
                  +{stats.todayRecords} 오늘
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
                <p className="text-2xl font-bold text-coffee-800">{stats.averageRating}</p>
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
                <p className="text-sm text-coffee-600">피드백</p>
                <p className="text-2xl font-bold text-coffee-800">{stats.totalFeedback}</p>
                <p className="text-xs text-red-600">
                  {stats.unreadFeedback} 미처리
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 작업 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-coffee-600" />
            <span>빠른 작업</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map(action => (
              <UnifiedButton
                key={action.id}
                variant="ghost"
                className="h-auto p-4 justify-start"
                onClick={() => window.location.href = action.href}
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-coffee-800">{action.title}</h3>
                      {action.badge && action.badge > 0 && (
                        <span className="px-2 py-1 bg-coffee-500 text-white text-xs rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-coffee-600">{action.description}</p>
                  </div>
                </div>
              </UnifiedButton>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 및 성능 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-coffee-600" />
              <span>최근 활동</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-coffee-50/50 rounded-lg">
                    <div className={`${getActivityColor(activity.severity)} mt-0.5`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-coffee-800">{activity.message}</p>
                      <p className="text-xs text-coffee-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-coffee-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>최근 활동이 없습니다</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 성능 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-coffee-600" />
                <span>성능 모니터링</span>
              </div>
              <UnifiedButton
                variant="ghost"
                size="small"
                onClick={() => setShowPerformanceDetails(!showPerformanceDetails)}
                className="text-coffee-600 hover:bg-coffee-50"
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPerformanceDetails ? '숨기기' : '자세히'}
              </UnifiedButton>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-coffee-600">전체 성능 점수</span>
                <span className="text-2xl font-bold text-coffee-800">{stats.performanceScore}/100</span>
              </div>
              
              {hasAlerts && latestAlerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-coffee-700">🚨 성능 알림</h4>
                  {latestAlerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className={`p-2 rounded text-xs ${
                      alert.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {alert.message}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-coffee-600">모니터링 상태</span>
                <span className={`font-medium ${isInitialized ? 'text-green-600' : 'text-gray-500'}`}>
                  {isInitialized ? '활성' : '비활성'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 성능 대시보드 */}
      {showPerformanceDetails && (
        <Card>
          <CardHeader>
            <CardTitle>실시간 성능 대시보드</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceDashboard 
              enableRealTimeMonitoring={true}
              showAdvancedMetrics={true}
              showUserInteractions={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}