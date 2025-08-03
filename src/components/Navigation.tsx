/**
 * Navigation v2.0 - 하이브리드 디자인 시스템
 * Minimal Structure + Premium Visual Quality
 */
'use client'

import { useState, useEffect, useRef } from 'react'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

import { BarChart3, Settings, Plus, ArrowLeft, Trophy, User, LogIn, Coffee, ChevronDown, LogOut, Bell, HelpCircle, Shield } from 'lucide-react'

import { isFeatureEnabled } from '../config/feature-flags.config'
import { useAuth } from '../contexts/AuthContext'
import UserProfile from './auth/UserProfile'
import { NavigationGuestIndicator } from './GuestModeIndicator'

interface NavigationProps {
  showBackButton?: boolean
  backHref?: string
  currentPage?: 'home' | 'settings' | 'record' | 'detail' | 'result' | 'achievements' | 'my-records'
}

export default function Navigation({
  showBackButton = false,
  backHref,
  currentPage = 'home',
}: NavigationProps) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileDropdown])

  // 스마트 뒤로가기 경로 계산
  const getSmartBackHref = (): string => {
    if (backHref) return backHref

    // TastingFlow 경로 매핑
    if (pathname?.includes('/tasting-flow/')) {
      if (pathname.includes('/result')) return '/'
      if (pathname.includes('/personal-notes')) {
        return pathname.includes('/homecafe/') 
          ? pathname.replace('/personal-notes', '/sensory-mouthfeel')
          : pathname.replace('/personal-notes', '/sensory-expression')
      }
      if (pathname.includes('/sensory-mouthfeel')) {
        return pathname.replace('/sensory-mouthfeel', '/sensory-expression')
      }
      if (pathname.includes('/sensory-expression')) {
        return pathname.replace('/sensory-expression', '/flavor-selection')
      }
      if (pathname.includes('/flavor-selection')) {
        return pathname.includes('/homecafe/')
          ? pathname.replace('/flavor-selection', '/brew-setup')
          : pathname.replace('/flavor-selection', '/coffee-info')
      }
      if (pathname.includes('/brew-setup')) {
        return pathname.replace('/brew-setup', '/coffee-info')
      }
      if (pathname.includes('/coffee-info')) {
        return '/tasting-flow'
      }
    }

    return '/'
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const targetPath = getSmartBackHref()
    router.push(targetPath)
  }

  const isActive = (page: string) => currentPage === page

  // 관리자 권한 확인 함수
  const isAdmin = () => {
    if (!user) return false
    return user.email === 'admin@mycupnote.com' || 
           user.email?.endsWith('@mycupnote.com') ||
           user.user_metadata?.role === 'admin' ||
           process.env.NODE_ENV === 'development'
  }

  const handleAuthNavigation = (mode: 'login' | 'signup') => {
    router.push(`/auth/${mode}`)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setShowProfileDropdown(false)
      router.push('/')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  return (
    <>
      {/* 하이브리드 데스크톱 네비게이션 */}
      <nav className="hidden md:block bg-white/80 backdrop-blur-sm border-b border-coffee-200/30 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 로고 + 뒤로가기 */}
            <div className="flex items-center">
              {showBackButton && (
                <button
                  onClick={handleBackClick}
                  className="flex items-center text-coffee-600 hover:text-coffee-800 mr-6 transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">돌아가기</span>
                </button>
              )}
              <Link href="/" className="text-xl md:text-2xl font-bold text-coffee-800 hover:text-coffee-600 transition-colors">
                ☕ CupNote
              </Link>
            </div>

            {/* 오른쪽: 메뉴 + 사용자 */}
            <div className="flex items-center space-x-2">
              {/* 기록하기 버튼 - 하이브리드 프리미엄 스타일 */}
              <Link
                href={isFeatureEnabled('ENABLE_NEW_TASTING_FLOW') ? '/tasting-flow' : '/mode-selection'}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="font-medium">기록하기</span>
              </Link>
              
              {user && (
                <>
                  {/* 네비게이션 메뉴 - 하이브리드 스타일 */}
                  <Link
                    href="/achievements"
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive('achievements')
                        ? 'bg-coffee-100/80 text-coffee-800 shadow-sm backdrop-blur-sm'
                        : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50/80'
                    }`}
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="font-medium">성취</span>
                  </Link>
                  
                  <Link
                    href="/my-records"
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive('my-records')
                        ? 'bg-coffee-100/80 text-coffee-800 shadow-sm backdrop-blur-sm'
                        : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50/80'
                    }`}
                  >
                    <Coffee className="h-4 w-4 mr-1" />
                    <span className="font-medium">내 기록</span>
                  </Link>
                  
                  <Link
                    href="/settings"
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive('settings')
                        ? 'bg-coffee-100/80 text-coffee-800 shadow-sm backdrop-blur-sm'
                        : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50/80'
                    }`}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="font-medium">설정</span>
                  </Link>
                </>
              )}

              {/* 사용자 프로필 영역 - 하이브리드 스타일 */}
              <div className="relative" ref={dropdownRef}>
                {loading ? (
                  <div className="w-10 h-10 bg-coffee-100/80 rounded-full animate-pulse backdrop-blur-sm" />
                ) : user ? (
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-coffee-50/80 hover:bg-coffee-100/80 border border-coffee-200/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center shadow-sm">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-coffee-800">{user.username}</span>
                    <ChevronDown className={`h-4 w-4 text-coffee-600 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <NavigationGuestIndicator onLoginClick={() => handleAuthNavigation('login')} />
                    <button
                      onClick={() => handleAuthNavigation('signup')}
                      className="flex items-center px-4 py-2 bg-coffee-500 hover:bg-coffee-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    >
                      회원가입
                    </button>
                  </div>
                )}

                {/* 프로필 드롭다운 메뉴 */}
                {showProfileDropdown && user && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-sm border border-coffee-200/50 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-coffee-200/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center shadow-sm">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User size={20} className="text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-coffee-800">{user.username}</p>
                          <p className="text-xs text-coffee-600">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {/* 관리자 대시보드 (관리자만 표시) */}
                      {isAdmin() && (
                        <Link
                          href="/admin"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center px-4 py-3 text-coffee-700 hover:bg-coffee-50/80 transition-colors border-b border-coffee-100/50 mb-2"
                        >
                          <Shield className="h-4 w-4 mr-3 text-coffee-600" />
                          <span className="text-sm font-medium">관리자 대시보드</span>
                        </Link>
                      )}
                      
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center px-4 py-3 text-coffee-700 hover:bg-coffee-50/80 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        <span className="text-sm font-medium">내 프로필</span>
                      </Link>
                      
                      <Link
                        href="/settings"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center px-4 py-3 text-coffee-700 hover:bg-coffee-50/80 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        <span className="text-sm font-medium">설정</span>
                      </Link>
                      
                      <button
                        className="flex items-center px-4 py-3 text-coffee-700 hover:bg-coffee-50/80 transition-colors w-full"
                      >
                        <HelpCircle className="h-4 w-4 mr-3" />
                        <span className="text-sm font-medium">도움말</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-coffee-200/30 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50/80 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        <span className="text-sm font-medium">로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 하이브리드 모바일 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-coffee-200/30 shadow-lg z-50">
        <div className={`grid h-16 ${user ? 'grid-cols-4' : 'grid-cols-2'}`}>
          {/* 홈 */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center space-y-1 relative h-full w-full transition-all duration-200 ease-out ${
              currentPage === 'home' 
                ? 'text-coffee-800' 
                : 'text-coffee-400'
            } active:scale-95 active:bg-coffee-50 rounded-lg mx-1 my-1`}
          >
            <div className={`relative transition-all duration-200 ${
              currentPage === 'home' ? 'scale-110' : ''
            }`}>
              <Coffee className="h-5 w-5" />
            </div>
            <span className={`text-xs relative transition-all duration-200 ${
              currentPage === 'home' ? 'font-semibold transform scale-105' : 'font-medium'
            }`}>
              홈
            </span>
            {currentPage === 'home' && (
              <div className="absolute -top-1 w-1 h-1 bg-coffee-600 rounded-full animate-pulse" />
            )}
          </Link>

          {user && (
            <>
              {/* 내 기록 */}
              <Link
                href="/my-records"
                className={`flex flex-col items-center justify-center space-y-1 relative h-full w-full transition-all duration-200 ease-out ${
                  currentPage === 'my-records' 
                    ? 'text-coffee-800' 
                    : 'text-coffee-400'
                } active:scale-95 active:bg-coffee-50 rounded-lg mx-1 my-1`}
              >
                <div className={`relative transition-all duration-200 ${
                  currentPage === 'my-records' ? 'scale-110' : ''
                }`}>
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className={`text-xs relative transition-all duration-200 ${
                  currentPage === 'my-records' ? 'font-semibold transform scale-105' : 'font-medium'
                }`}>
                  내 기록
                </span>
                {currentPage === 'my-records' && (
                  <div className="absolute -top-1 w-1 h-1 bg-coffee-600 rounded-full animate-pulse" />
                )}
              </Link>

              {/* 기록하기 (중앙 버튼) - 하이브리드 프리미엄 */}
              <Link
                href={isFeatureEnabled('ENABLE_NEW_TASTING_FLOW') ? '/tasting-flow' : '/mode-selection'}
                className="flex flex-col items-center justify-center space-y-1 relative h-full w-full transition-all duration-200 ease-out text-white active:scale-95 rounded-lg mx-1 my-1"
              >
                <div className="absolute inset-2 bg-gradient-to-br from-coffee-500 to-coffee-600 rounded-xl shadow-xl transition-all duration-200 hover:shadow-2xl" />
                <div className="relative transition-all duration-200 z-10">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-xs relative transition-all duration-200 z-10 font-semibold">
                  작성
                </span>
              </Link>

              {/* 성취 */}
              <Link
                href="/achievements"
                className={`flex flex-col items-center justify-center space-y-1 relative h-full w-full transition-all duration-200 ease-out ${
                  currentPage === 'achievements' 
                    ? 'text-coffee-800' 
                    : 'text-coffee-400'
                } active:scale-95 active:bg-coffee-50 rounded-lg mx-1 my-1`}
              >
                <div className={`relative transition-all duration-200 ${
                  currentPage === 'achievements' ? 'scale-110' : ''
                }`}>
                  <Trophy className="h-5 w-5" />
                </div>
                <span className={`text-xs relative transition-all duration-200 ${
                  currentPage === 'achievements' ? 'font-semibold transform scale-105' : 'font-medium'
                }`}>
                  성취
                </span>
                {currentPage === 'achievements' && (
                  <div className="absolute -top-1 w-1 h-1 bg-coffee-600 rounded-full animate-pulse" />
                )}
              </Link>
            </>
          )}

          {/* 로그인 버튼 (비로그인 사용자용) */}
          {!user && !loading && (
            <button
              onClick={() => handleAuthNavigation('login')}
              className="flex flex-col items-center justify-center space-y-1 text-coffee-600 active:scale-95 active:bg-coffee-50 rounded-lg mx-1 my-1 font-medium"
            >
              <LogIn className="h-5 w-5" />
              <span className="text-xs">로그인</span>
            </button>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-5 h-5 bg-coffee-200 rounded-full animate-pulse" />
              <span className="text-xs text-coffee-400">로딩...</span>
            </div>
          )}
        </div>
      </nav>

    </>
  )
}