'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BarChart3, Settings, Plus, ArrowLeft, Trophy, User, LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/components/auth/AuthModal'
import UserProfile from '@/components/auth/UserProfile'

interface NavigationProps {
  showBackButton?: boolean
  backHref?: string
  currentPage?: 'home' | 'stats' | 'settings' | 'record' | 'detail' | 'result' | 'achievements'
}

export default function Navigation({
  showBackButton = false,
  backHref = '/',
  currentPage = 'home',
}: NavigationProps) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  const isActive = (page: string) => currentPage === page

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <nav className="flex items-center justify-between mb-4 md:mb-8 bg-white rounded-xl p-3 md:p-4 shadow-sm border border-coffee-100">
      <div className="flex items-center">
        {showBackButton && (
          <Link
            href={backHref}
            className="flex items-center text-coffee-600 hover:text-coffee-800 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            돌아가기
          </Link>
        )}
        <Link href="/" className="text-xl md:text-2xl font-bold text-coffee-800">
          ☕ CupNote
        </Link>
      </div>

      {/* 데스크톱 네비게이션 - 모바일에서는 숨김 */}
      <div className="hidden md:flex items-center space-x-2">
        {user && (
          <>
            <Link
              href="/achievements"
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive('achievements')
                  ? 'bg-coffee-100 text-coffee-800'
                  : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50'
              }`}
            >
              <Trophy className="h-4 w-4 mr-1" />
              성취
            </Link>
            <Link
              href="/stats"
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive('stats')
                  ? 'bg-coffee-100 text-coffee-800'
                  : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              통계
            </Link>
            <Link
              href="/settings"
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive('settings')
                  ? 'bg-coffee-100 text-coffee-800'
                  : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50'
              }`}
            >
              <Settings className="h-4 w-4 mr-1" />
              설정
            </Link>
            <Link
              href="/mode-selection"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('record')
                  ? 'bg-coffee-700 text-white'
                  : 'bg-coffee-600 text-white hover:bg-coffee-700'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              기록하기
            </Link>
          </>
        )}

        {/* 인증 영역 */}
        <div className="relative">
          {loading ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          ) : user ? (
            <button
              onClick={() => setShowUserProfile(!showUserProfile)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-amber-600" />
                )}
              </div>
              <span className="text-sm font-medium text-amber-800">{user.username}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center px-3 py-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50 rounded-lg transition-colors"
              >
                <LogIn className="h-4 w-4 mr-1" />
                로그인
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
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
