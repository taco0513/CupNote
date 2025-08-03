/**
 * 어드민 대시보드 레이아웃 - 하이브리드 디자인 시스템
 * Role-based 접근 제어 및 관리자 전용 네비게이션
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Coffee, 
  BarChart3, 
  Settings, 
  Shield, 
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent } from '../../components/ui/Card'
import UnifiedButton from '../../components/ui/UnifiedButton'
import { logger } from '../../lib/logger'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: number
  description: string
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // 관리자 권한 확인
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!user) {
          logger.warn('Admin access attempted without authentication')
          router.push('/auth/login')
          return
        }

        // 실제 구현에서는 Supabase RLS 정책으로 관리자 권한 확인
        // 현재는 개발용으로 모든 인증된 사용자에게 허용
        const isAdmin = user.email === 'admin@cupnote.app' || 
                       user.user_metadata?.role === 'admin' ||
                       process.env.NODE_ENV === 'development'

        if (!isAdmin) {
          logger.error('Unauthorized admin access attempt', { 
            userId: user.id, 
            email: user.email 
          })
          router.push('/')
          return
        }

        setIsAuthorized(true)
        logger.info('Admin dashboard access granted', { 
          userId: user.id, 
          email: user.email 
        })
      } catch (error) {
        logger.error('Admin access check failed', { error })
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [user, router])

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/admin',
      description: '전체 시스템 현황 및 주요 지표'
    },
    {
      id: 'users',
      label: '사용자 관리',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users',
      badge: 12, // 신규 가입자 수
      description: '사용자 계정, 활동 통계, 권한 관리'
    },
    {
      id: 'records',
      label: '커피 기록',
      icon: <Coffee className="h-5 w-5" />,
      href: '/admin/records',
      description: '전체 커피 기록 조회 및 콘텐츠 관리'
    },
    {
      id: 'analytics',
      label: '성능 모니터링',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/admin/analytics',
      description: '실시간 성능, 사용자 행동, 시스템 상태'
    },
    {
      id: 'feedback',
      label: '피드백 관리',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/admin/feedback',
      badge: 5, // 미처리 피드백 수
      description: '베타 피드백, 사용자 문의, 버그 리포트'
    },
    {
      id: 'settings',
      label: '시스템 설정',
      icon: <Settings className="h-5 w-5" />,
      href: '/admin/settings',
      description: '공지사항, 앱 설정, 콘텐츠 관리'
    }
  ]

  const handleSignOut = async () => {
    try {
      logger.info('Admin logout initiated', { userId: user?.id })
      await signOut()
      router.push('/')
    } catch (error) {
      logger.error('Admin logout failed', { error })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-coffee-50 flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/30 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-coffee-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-coffee-600">관리자 권한을 확인하고 있습니다...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // 리다이렉트 진행 중
  }

  return (
    <div className="min-h-screen bg-coffee-50">
      {/* 사이드바 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm border-r border-coffee-200/50 shadow-lg">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-coffee-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-coffee-500 to-coffee-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-coffee-800">CupNote Admin</h1>
                <p className="text-xs text-coffee-500">관리자 대시보드</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-coffee-100/50 transition-colors"
            >
              <X className="h-5 w-5 text-coffee-600" />
            </button>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  router.push(item.href)
                  setSidebarOpen(false) // 모바일에서 메뉴 닫기
                }}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group relative ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-md'
                    : 'hover:bg-coffee-100/50 text-coffee-700 hover:text-coffee-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`transition-colors ${
                    activeTab === item.id ? 'text-white' : 'text-coffee-500 group-hover:text-coffee-600'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activeTab === item.id
                            ? 'bg-white/20 text-white'
                            : 'bg-coffee-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      activeTab === item.id ? 'text-white/80' : 'text-coffee-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* 하단 사용자 정보 */}
          <div className="p-4 border-t border-coffee-100/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-coffee-800 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-coffee-500">관리자</p>
              </div>
            </div>
            <UnifiedButton
              variant="outline"
              size="small"
              onClick={handleSignOut}
              className="w-full border-coffee-200 text-coffee-600 hover:bg-coffee-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </UnifiedButton>
          </div>
        </div>
      </div>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 메인 콘텐츠 */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* 상단 헤더 */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-coffee-200/50 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-coffee-100/50 transition-colors"
              >
                <Menu className="h-5 w-5 text-coffee-600" />
              </button>
              <h1 className="text-xl font-bold text-coffee-800">
                {navigationItems.find(item => item.id === activeTab)?.label || '대시보드'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* 알림 버튼 */}
              <button className="relative p-2 rounded-lg hover:bg-coffee-100/50 transition-colors">
                <Bell className="h-5 w-5 text-coffee-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* 실시간 상태 표시 */}
              <div className="flex items-center space-x-2 text-sm text-coffee-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>실시간 연결</span>
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}