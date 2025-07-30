'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Trophy, BarChart3, Settings, Plus, User, LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/components/auth/AuthModal'

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
      href: '/achievements',
      icon: <Trophy className="h-5 w-5" />,
      label: '성취',
      matchPaths: ['/achievements'],
    },
    {
      href: '/mode-selection',
      icon: <Plus className="h-6 w-6" />,
      label: '기록',
      matchPaths: ['/mode-selection', '/record', '/result'],
    },
    {
      href: '/stats',
      icon: <BarChart3 className="h-5 w-5" />,
      label: '통계',
      matchPaths: ['/stats'],
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-200 md:hidden z-50">
        <div className={`grid h-16 ${user ? 'grid-cols-5' : 'grid-cols-2'}`}>
          {navItems.map(item => {
            const active = isActive(item)
            const isRecordButton = item.href === '/mode-selection'

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center space-y-1 relative
                  ${isRecordButton ? 'text-white' : active ? 'text-coffee-800' : 'text-coffee-400'}
                `}
              >
                {isRecordButton && (
                  <div className="absolute inset-2 bg-coffee-600 rounded-xl shadow-lg" />
                )}
                <div
                  className={`relative ${active && !isRecordButton ? 'scale-110' : ''} transition-transform`}
                >
                  {item.icon}
                </div>
                <span className={`text-xs relative ${active ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* 로그인 버튼 (비로그인 사용자용) */}
          {!user && !loading && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex flex-col items-center justify-center space-y-1 text-amber-600"
            >
              <LogIn className="h-5 w-5" />
              <span className="text-xs">로그인</span>
            </button>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">로딩...</span>
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
