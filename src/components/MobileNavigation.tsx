'use client'

import { useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Home, Trophy, BarChart3, Settings, Plus, User, LogIn, Coffee } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  matchPaths?: string[]
}

export default function MobileNavigation() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  // 기본 네비게이션 아이템들
  const baseNavItems: NavItem[] = [
    {
      href: '/',
      icon: <Home className="h-5 w-5" />,
      label: '홈',
      matchPaths: ['/'],
    },
  ]

  // 인증된 사용자를 위한 네비게이션 아이템들
  const authenticatedNavItems: NavItem[] = [
    {
      href: '/my-records',
      icon: <Coffee className="h-5 w-5" />,
      label: '내 기록',
      matchPaths: ['/my-records', '/records', '/stats'],
    },
    {
      href: '/mode-selection',
      icon: <Plus className="h-6 w-6" />,
      label: '작성',
      matchPaths: ['/mode-selection', '/record', '/result'],
    },
    {
      href: '/achievements',
      icon: <Trophy className="h-5 w-5" />,
      label: '성취',
      matchPaths: ['/achievements'],
    },
    {
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      label: '설정',
      matchPaths: ['/settings'],
    },
  ]

  // 사용자 상태에 따라 네비게이션 아이템 결정
  const navItems = user ? [...baseNavItems, ...authenticatedNavItems] : baseNavItems

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => {
        if (path === '/') {
          return pathname === path
        }
        return pathname.startsWith(path)
      })
    }
    return pathname === item.href
  }

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border md:hidden z-50 safe-area-inset shadow-lg"
        data-testid="mobile-navigation"
      >
        <div className={`grid h-16 ${user ? 'grid-cols-5' : 'grid-cols-2'}`}>
          {navItems.map(item => {
            const active = isActive(item)
            const isRecordButton = item.href === '/mode-selection'

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center space-y-1 relative h-full w-full
                  transition-all duration-200 ease-out touch-target
                  ${isRecordButton 
                    ? 'text-primary-foreground' 
                    : active 
                      ? 'text-foreground' 
                      : 'text-foreground-muted'
                  }
                  active:scale-95 active:bg-secondary/20 rounded-lg mx-1 my-1
                `}
              >
                {isRecordButton && (
                  <div className="absolute inset-2 bg-gradient-to-br from-primary to-primary-hover rounded-xl shadow-xl transition-all duration-200" />
                )}
                <div
                  className={`relative transition-all duration-200 ${
                    active && !isRecordButton ? 'scale-110 animate-bounce-once' : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span className={`text-xs relative transition-all duration-200 ${
                  active ? 'font-medium transform scale-105' : ''
                }`}>
                  {item.label}
                </span>
                
                {/* 활성 상태 인디케이터 */}
                {active && !isRecordButton && (
                  <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </Link>
            )
          })}

          {/* 로그인 버튼 (비로그인 사용자용) */}
          {!user && !loading && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex flex-col items-center justify-center space-y-1 text-accent"
            >
              <LogIn className="h-5 w-5" />
              <span className="text-xs">로그인</span>
            </button>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-5 h-5 bg-secondary rounded-full animate-pulse" />
              <span className="text-xs text-foreground-muted">로딩...</span>
            </div>
          )}
        </div>
      </nav>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="login"
      />
    </>
  )
}
