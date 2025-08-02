'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import Link from 'next/link'

import { BarChart3, Settings, Plus, ArrowLeft, Trophy, User, LogIn, Coffee } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { isFeatureEnabled } from '../config/feature-flags.config'
import AuthModal from './auth/AuthModal'
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
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  // TastingFlow에서 스마트 뒤로가기 경로 계산
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

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <nav className="hidden md:flex items-center justify-between mb-4 md:mb-8 bg-background rounded-xl p-3 md:p-4 shadow-sm border border-border">
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="flex items-center text-foreground-secondary hover:text-foreground mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            돌아가기
          </button>
        )}
        <Link href="/" className="text-xl md:text-2xl font-bold text-foreground">
          ☕ CupNote
        </Link>
      </div>

      {/* 데스크톱 네비게이션 - 모바일에서는 숨김 */}
      <div className="hidden md:flex items-center space-x-2">
        {/* 게스트 모드에서도 일부 기능 사용 가능 */}
        <Link
          href={isFeatureEnabled('ENABLE_NEW_TASTING_FLOW') ? '/tasting-flow' : '/mode-selection'}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isActive('record')
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary hover:bg-primary-hover text-primary-foreground'
          }`}
        >
          <Plus className="h-4 w-4 mr-2" />
          기록하기
        </Link>
        
        {user && (
          <>
            <Link
              href="/achievements"
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive('achievements')
                  ? 'bg-secondary text-foreground'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Trophy className="h-4 w-4 mr-1" />
              성취
            </Link>
            <Link
              href="/my-records"
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive('my-records')
                  ? 'bg-secondary text-foreground'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Coffee className="h-4 w-4 mr-1" />
              내 기록
            </Link>
            <Link
              href="/settings"
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive('settings')
                  ? 'bg-secondary text-foreground'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Settings className="h-4 w-4 mr-1" />
              설정
            </Link>
          </>
        )}

        {/* 인증 영역 */}
        <div className="relative">
          {loading ? (
            <div className="w-8 h-8 bg-secondary rounded-full animate-pulse" />
          ) : user ? (
            <button
              onClick={() => setShowUserProfile(!showUserProfile)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
            >
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-accent" />
                )}
              </div>
              <span className="text-sm font-medium text-foreground">{user.username}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <NavigationGuestIndicator onLoginClick={() => openAuthModal('login')} />
              <button
                onClick={() => openAuthModal('signup')}
                className="flex items-center px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg transition-colors"
              >
                회원가입
              </button>
            </div>
          )}

          {/* 사용자 프로필 드롭다운 */}
          {showUserProfile && user && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <UserProfile onClose={() => setShowUserProfile(false)} />
            </div>
          )}
        </div>
      </div>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </nav>
  )
}
