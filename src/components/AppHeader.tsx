/**
 * @document-ref PROJECT_SPEC.md#mobile-optimization
 * @design-ref DESIGN_SYSTEM.md#touch-targets
 * @tech-ref TECH_STACK.md#nextjs-app-router
 * @compliance-check 2025-08-02 - 100% 준수 확인
 * @deviations none
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AppHeaderLogo from './AppHeader/AppHeaderLogo'
import AppHeaderActions from './AppHeader/AppHeaderActions'
import AppHeaderProfileButton from './AppHeader/AppHeaderProfileButton'
import AppHeaderMobileMenu from './AppHeader/AppHeaderMobileMenu'

interface AppHeaderProps {
  showSearch?: boolean
}

export default function AppHeader({ 
  showSearch = true
}: AppHeaderProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleSearchClick = () => {
    // 항상 검색 페이지로 이동
    router.push('/search')
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setShowMobileMenu(false)
      router.push('/')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }


  return (
    <>
      {/* Main Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm pt-safe-top" 
        data-testid="app-header"
        style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        WebkitTransform: 'translate3d(0, 0, 0)',
        transform: 'translate3d(0, 0, 0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitPerspective: 1000,
        perspective: 1000,
        willChange: 'transform',
        // iOS WKWebView specific fixes
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x pan-y',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}>
        <div className="flex items-center justify-between h-16 px-4">
          {/* 왼쪽: 로고 */}
          <AppHeaderLogo />

          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            <AppHeaderActions 
              showSearch={showSearch}
              user={user}
              handleSearchClick={handleSearchClick}
            />
            
            {/* 프로필 버튼 */}
            <AppHeaderProfileButton 
              user={user}
              setShowMobileMenu={setShowMobileMenu}
            />
          </div>
        </div>

        {/* 검색 입력창 (확장된 상태) */}
        {showSearchInput && (
          <div className="px-4 pb-3 border-t border-neutral-100">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="커피 이름, 로스터리 검색..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-warm focus:border-transparent"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
              <button
                onClick={() => setShowSearchInput(false)}
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 모바일 프로필 메뉴 */}
      <AppHeaderMobileMenu 
        user={user}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        handleLogout={handleLogout}
      />
    </>
  )
}