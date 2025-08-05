/**
 * 어드민 성능 분석 페이지
 * 실시간 성능 모니터링, 시스템 상태, 사용자 행동 분석
 */
'use client'

import { useState, useEffect } from 'react'

import { 
  Activity, 
  TrendingUp, 
  Zap,
  Monitor,
  Database,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Coffee,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Settings
} from 'lucide-react'

import PerformanceDashboard from '../../../components/performance/PerformanceDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import UnifiedButton from '../../../components/ui/UnifiedButton'
import { usePerformanceMonitoring } from '../../../hooks/usePerformanceMonitoring'
import { logger } from '../../../lib/logger'
import { getBundleMonitor } from '../../../lib/performance/bundle-monitor'

interface SystemMetrics {
  cpu: { usage: number; cores: number }
  memory: { used: number; total: number; percentage: number }
  network: { latency: number; throughput: number }
  storage: { used: number; total: number; percentage: number }
  uptime: number
  errors: { count: number; rate: number }
}

interface UserAnalytics {
  totalSessions: number
  activeUsers: number
  avgSessionDuration: number
  bounceRate: number
  pageViews: number
  topPages: Array<{
    path: string
    views: number
    avgDuration: number
  }>
  userFlow: Array<{
    source: string
    target: string
    count: number
  }>
}

interface PerformanceInsights {
  webVitals: {
    lcp: { score: number; trend: 'up' | 'down' | 'stable' }
    inp: { score: number; trend: 'up' | 'down' | 'stable' }
    cls: { score: number; trend: 'up' | 'down' | 'stable' }
  }
  bundleSize: { current: number; previous: number; change: number }
  apiPerformance: Array<{
    endpoint: string
    avgResponseTime: number
    errorRate: number
    requestCount: number
  }>
  criticalIssues: Array<{
    id: string
    type: 'performance' | 'error' | 'availability'
    severity: 'high' | 'medium' | 'low'
    message: string
    timestamp: number
    affected: number
  }>
}

export default function AdminAnalyticsPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, cores: 0 },
    memory: { used: 0, total: 0, percentage: 0 },
    network: { latency: 0, throughput: 0 },
    storage: { used: 0, total: 0, percentage: 0 },
    uptime: 0,
    errors: { count: 0, rate: 0 }
  })
  
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
    totalSessions: 0,
    activeUsers: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    pageViews: 0,
    topPages: [],
    userFlow: []
  })
  
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsights>({
    webVitals: {
      lcp: { score: 0, trend: 'stable' },
      inp: { score: 0, trend: 'stable' },
      cls: { score: 0, trend: 'stable' }
    },
    bundleSize: { current: 0, previous: 0, change: 0 },
    apiPerformance: [],
    criticalIssues: []
  })
  
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'users' | 'system' | 'alerts'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const { 
    performanceScore, 
    hasMetrics, 
    isInitialized,
    latestAlerts,
    hasAlerts,
    rumAnalysis,
    benchmarkComparison
  } = usePerformanceMonitoring({
    autoInit: true,
    enableLogging: false,
    enableAnomalyDetection: true,
    reportInterval: 10000 // 10초마다 업데이트
  })

  // 시스템 메트릭 로드 (시뮬레이션)
  const loadSystemMetrics = () => {
    // 실제 구현에서는 서버 API에서 가져옴
    const simulatedMetrics: SystemMetrics = {
      cpu: { 
        usage: Math.random() * 30 + 20, // 20-50% 사용률
        cores: navigator.hardwareConcurrency || 4 
      },
      memory: {
        used: Math.random() * 2000 + 1000, // 1-3GB
        total: 4096,
        percentage: 0
      },
      network: {
        latency: Math.random() * 50 + 20, // 20-70ms
        throughput: Math.random() * 100 + 50 // 50-150 Mbps
      },
      storage: {
        used: Math.random() * 10000 + 5000, // 5-15GB
        total: 50000,
        percentage: 0
      },
      uptime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // 최대 7일
      errors: {
        count: Math.floor(Math.random() * 10),
        rate: Math.random() * 0.1 // 0-0.1%
      }
    }
    
    simulatedMetrics.memory.percentage = (simulatedMetrics.memory.used / simulatedMetrics.memory.total) * 100
    simulatedMetrics.storage.percentage = (simulatedMetrics.storage.used / simulatedMetrics.storage.total) * 100
    
    setSystemMetrics(simulatedMetrics)
  }

  // 사용자 분석 데이터 로드 (시뮬레이션)
  const loadUserAnalytics = () => {
    const simulatedAnalytics: UserAnalytics = {
      totalSessions: Math.floor(Math.random() * 500 + 200),
      activeUsers: Math.floor(Math.random() * 50 + 20),
      avgSessionDuration: Math.random() * 300 + 120, // 2-7분
      bounceRate: Math.random() * 0.3 + 0.2, // 20-50%
      pageViews: Math.floor(Math.random() * 2000 + 1000),
      topPages: [
        { path: '/', views: Math.floor(Math.random() * 500 + 200), avgDuration: Math.random() * 60 + 30 },
        { path: '/records', views: Math.floor(Math.random() * 300 + 100), avgDuration: Math.random() * 120 + 60 },
        { path: '/add-record', views: Math.floor(Math.random() * 200 + 50), avgDuration: Math.random() * 180 + 120 },
        { path: '/my-records', views: Math.floor(Math.random() * 150 + 50), avgDuration: Math.random() * 90 + 45 },
        { path: '/settings', views: Math.floor(Math.random() * 100 + 20), avgDuration: Math.random() * 30 + 15 }
      ],
      userFlow: [
        { source: 'Home', target: 'Records', count: Math.floor(Math.random() * 100 + 50) },
        { source: 'Home', target: 'Add Record', count: Math.floor(Math.random() * 80 + 30) },
        { source: 'Records', target: 'Add Record', count: Math.floor(Math.random() * 60 + 20) },
        { source: 'Records', target: 'My Records', count: Math.floor(Math.random() * 40 + 15) }
      ]
    }
    
    setUserAnalytics(simulatedAnalytics)
  }

  // 성능 인사이트 로드
  const loadPerformanceInsights = () => {
    const bundleMonitor = getBundleMonitor()
    const latestBundleMetrics = bundleMonitor?.getLatestMetrics()
    
    const insights: PerformanceInsights = {
      webVitals: {
        lcp: { 
          score: performanceScore || Math.random() * 40 + 60, 
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' 
        },
        inp: { 
          score: Math.random() * 30 + 70, 
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' 
        },
        cls: { 
          score: Math.random() * 20 + 80, 
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' 
        }
      },
      bundleSize: {
        current: latestBundleMetrics?.bundleSize.total || Math.random() * 500 + 800,
        previous: Math.random() * 500 + 750,
        change: 0
      },
      apiPerformance: [
        {
          endpoint: '/api/auth/login',
          avgResponseTime: Math.random() * 100 + 50,
          errorRate: Math.random() * 0.02,
          requestCount: Math.floor(Math.random() * 1000 + 500)
        },
        {
          endpoint: '/api/coffee-records',
          avgResponseTime: Math.random() * 200 + 100,
          errorRate: Math.random() * 0.01,
          requestCount: Math.floor(Math.random() * 2000 + 1000)
        },
        {
          endpoint: '/api/users/me',
          avgResponseTime: Math.random() * 50 + 25,
          errorRate: Math.random() * 0.005,
          requestCount: Math.floor(Math.random() * 500 + 200)
        }
      ],
      criticalIssues: latestAlerts?.map((alert, index) => ({
        id: `alert-${index}`,
        type: 'performance' as const,
        severity: alert.severity === 'error' ? 'high' as const : 'medium' as const,
        message: alert.message,
        timestamp: alert.timestamp,
        affected: Math.floor(Math.random() * 100 + 10)
      })) || []
    }
    
    insights.bundleSize.change = insights.bundleSize.current - insights.bundleSize.previous
    
    setPerformanceInsights(insights)
  }

  // 모든 데이터 로드
  const loadAllData = () => {
    setIsLoading(true)
    try {
      loadSystemMetrics()
      loadUserAnalytics()
      loadPerformanceInsights()
      setLastUpdated(new Date())
      logger.info('Admin analytics data loaded')
    } catch (error) {
      logger.error('Failed to load analytics data', { error })
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadAllData()
  }, [])

  // 성능 점수 업데이트시 인사이트 다시 로드
  useEffect(() => {
    if (isInitialized && hasMetrics) {
      loadPerformanceInsights()
    }
  }, [performanceScore, isInitialized, hasMetrics])

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      loadAllData()
    }, 30000) // 30초마다
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  // 시스템 상태 색상
  const getSystemStatusColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600 bg-green-50'
    if (percentage < 80) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // 트렌드 아이콘
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'stable': return '➡️'
    }
  }

  // 업타임 포맷
  const formatUptime = (uptime: number) => {
    const days = Math.floor((Date.now() - uptime) / (1000 * 60 * 60 * 24))
    return `${days}일`
  }

  // 바이트 포맷
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (isLoading && !hasMetrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-800">성능 분석 로딩 중...</h1>
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
          <h1 className="text-2xl font-bold text-coffee-800">성능 분석</h1>
          <p className="text-coffee-600 mt-1">
            실시간 시스템 성능과 사용자 행동을 모니터링하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-coffee-500">
            마지막 업데이트: {lastUpdated.toLocaleTimeString()}
          </div>
          <UnifiedButton
            variant={autoRefresh ? "primary" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-500 hover:bg-green-600" : "border-coffee-200 text-coffee-600"}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? '자동 새로고침' : '수동 새로고침'}
          </UnifiedButton>
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={loadAllData}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </UnifiedButton>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-coffee-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: '개요', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'performance', label: '성능', icon: <Zap className="h-4 w-4" /> },
          { id: 'users', label: '사용자', icon: <Users className="h-4 w-4" /> },
          { id: 'system', label: '시스템', icon: <Monitor className="h-4 w-4" /> },
          { id: 'alerts', label: '알림', icon: <AlertTriangle className="h-4 w-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-coffee-600 shadow-sm'
                : 'text-coffee-600 hover:text-coffee-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 핵심 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-coffee-600">성능 점수</p>
                    <p className="text-2xl font-bold text-coffee-800">{performanceScore || 85}/100</p>
                    <p className="text-xs text-green-600">
                      {getTrendIcon(performanceInsights.webVitals.lcp.trend)} Core Web Vitals
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-coffee-600">활성 사용자</p>
                    <p className="text-2xl font-bold text-coffee-800">{userAnalytics.activeUsers}</p>
                    <p className="text-xs text-coffee-600">
                      {userAnalytics.totalSessions}개 세션
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
                    <p className="text-sm text-coffee-600">시스템 상태</p>
                    <p className="text-2xl font-bold text-coffee-800">
                      {systemMetrics.errors.count === 0 ? '정상' : '주의'}
                    </p>
                    <p className="text-xs text-coffee-600">
                      업타임 {formatUptime(systemMetrics.uptime)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r rounded-xl flex items-center justify-center ${
                    systemMetrics.errors.count === 0 
                      ? 'from-green-500 to-green-600' 
                      : 'from-yellow-500 to-yellow-600'
                  }`}>
                    {systemMetrics.errors.count === 0 ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-coffee-600">번들 크기</p>
                    <p className="text-2xl font-bold text-coffee-800">
                      {Math.round(performanceInsights.bundleSize.current)}KB
                    </p>
                    <p className={`text-xs ${
                      performanceInsights.bundleSize.change < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {performanceInsights.bundleSize.change > 0 ? '+' : ''}
                      {Math.round(performanceInsights.bundleSize.change)}KB
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 핵심 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-coffee-600" />
                  <span>리소스 사용량</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">CPU</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-coffee-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            systemMetrics.cpu.usage < 50 ? 'bg-green-500' : 
                            systemMetrics.cpu.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${systemMetrics.cpu.usage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-coffee-800 w-12">
                        {Math.round(systemMetrics.cpu.usage)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">메모리</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-coffee-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            systemMetrics.memory.percentage < 50 ? 'bg-green-500' : 
                            systemMetrics.memory.percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${systemMetrics.memory.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-coffee-800 w-12">
                        {Math.round(systemMetrics.memory.percentage)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">저장소</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-coffee-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            systemMetrics.storage.percentage < 50 ? 'bg-green-500' : 
                            systemMetrics.storage.percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${systemMetrics.storage.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-coffee-800 w-12">
                        {Math.round(systemMetrics.storage.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5 text-coffee-600" />
                  <span>인기 페이지</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAnalytics.topPages.slice(0, 5).map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-coffee-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm text-coffee-800">{page.path}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-coffee-800">{page.views}</div>
                        <div className="text-xs text-coffee-500">{Math.round(page.avgDuration)}초</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 성능 탭 */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <PerformanceDashboard 
            enableRealTimeMonitoring={true}
            showAdvancedMetrics={true}
            showUserInteractions={true}
          />
        </div>
      )}

      {/* 사용자 탭 */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-coffee-800">{userAnalytics.totalSessions}</div>
                <div className="text-sm text-coffee-600">총 세션</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-coffee-800">{Math.round(userAnalytics.avgSessionDuration)}초</div>
                <div className="text-sm text-coffee-600">평균 세션 시간</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-coffee-800">{Math.round(userAnalytics.bounceRate * 100)}%</div>
                <div className="text-sm text-coffee-600">이탈률</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-coffee-800">{userAnalytics.pageViews}</div>
                <div className="text-sm text-coffee-600">페이지뷰</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>사용자 플로우</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userAnalytics.userFlow.map((flow, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-coffee-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-coffee-800">{flow.source}</span>
                      <span className="text-coffee-400">→</span>
                      <span className="text-sm font-medium text-coffee-800">{flow.target}</span>
                    </div>
                    <div className="text-sm font-bold text-coffee-600">{flow.count}명</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 시스템 탭 */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>시스템 리소스</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">CPU ({systemMetrics.cpu.cores} 코어)</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSystemStatusColor(systemMetrics.cpu.usage)}`}>
                      {Math.round(systemMetrics.cpu.usage)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">메모리</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSystemStatusColor(systemMetrics.memory.percentage)}`}>
                      {formatBytes(systemMetrics.memory.used * 1024 * 1024)} / {formatBytes(systemMetrics.memory.total * 1024 * 1024)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">저장소</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSystemStatusColor(systemMetrics.storage.percentage)}`}>
                      {formatBytes(systemMetrics.storage.used * 1024 * 1024)} / {formatBytes(systemMetrics.storage.total * 1024 * 1024)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>네트워크 & 연결</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">레이턴시</span>
                    <span className="text-sm font-medium text-coffee-800">{Math.round(systemMetrics.network.latency)}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">처리량</span>
                    <span className="text-sm font-medium text-coffee-800">{Math.round(systemMetrics.network.throughput)} Mbps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">업타임</span>
                    <span className="text-sm font-medium text-coffee-800">{formatUptime(systemMetrics.uptime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-600">에러율</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      systemMetrics.errors.rate < 0.01 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {(systemMetrics.errors.rate * 100).toFixed(3)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API 성능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-coffee-50 border-b border-coffee-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-coffee-700">엔드포인트</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-coffee-700">평균 응답시간</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-coffee-700">에러율</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-coffee-700">요청 수</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-coffee-100">
                    {performanceInsights.apiPerformance.map(api => (
                      <tr key={api.endpoint} className="hover:bg-coffee-50/50">
                        <td className="py-3 px-4 text-sm font-medium text-coffee-800">{api.endpoint}</td>
                        <td className="py-3 px-4 text-sm text-coffee-600">{Math.round(api.avgResponseTime)}ms</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            api.errorRate < 0.01 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                          }`}>
                            {(api.errorRate * 100).toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-coffee-600">{api.requestCount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 알림 탭 */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>중요 이슈</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  performanceInsights.criticalIssues.length === 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {performanceInsights.criticalIssues.length}개 이슈
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceInsights.criticalIssues.length > 0 ? (
                <div className="space-y-3">
                  {performanceInsights.criticalIssues.map(issue => (
                    <div key={issue.id} className={`p-4 rounded-lg border-l-4 ${
                      issue.severity === 'high' ? 'bg-red-50 border-red-400' :
                      issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <AlertTriangle className={`h-4 w-4 ${
                              issue.severity === 'high' ? 'text-red-600' :
                              issue.severity === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                            <span className={`text-sm font-medium ${
                              issue.severity === 'high' ? 'text-red-800' :
                              issue.severity === 'medium' ? 'text-yellow-800' :
                              'text-blue-800'
                            }`}>
                              {issue.type} · {issue.severity}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            issue.severity === 'high' ? 'text-red-700' :
                            issue.severity === 'medium' ? 'text-yellow-700' :
                            'text-blue-700'
                          }`}>
                            {issue.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs opacity-75">
                            <span>{new Date(issue.timestamp).toLocaleString()}</span>
                            <span>{issue.affected}명 영향</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-coffee-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>현재 중요한 이슈가 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>

          {hasAlerts && (
            <Card>
              <CardHeader>
                <CardTitle>성능 경고</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestAlerts?.slice(0, 10).map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'error' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
                    }`}>
                      <p className={`text-sm ${
                        alert.severity === 'error' ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {alert.message}
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}