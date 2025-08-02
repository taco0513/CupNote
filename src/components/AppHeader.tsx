/**
 * @document-ref PROJECT_SPEC.md#mobile-optimization
 * @design-ref DESIGN_SYSTEM.md#touch-targets
 * @tech-ref TECH_STACK.md#nextjs-app-router
 * @compliance-check 2025-08-02 - 100% 준수 확인
 * @deviations none
 */
'use client'

import { useState } from 'react'
import { Search, Bell, User, Settings, Menu, X, Coffee, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface AppHeaderProps {
  showSearch?: boolean
}

export default function AppHeader({ 
  showSearch = true
}: AppHeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleSearchClick = () => {
    // 항상 검색 페이지로 이동
    router.push('/search')
  }


  return (
    <>
      {/* Main Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* 왼쪽: 로고 & 앱 이름 */}
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-warm to-neutral-600 rounded-lg flex items-center justify-center">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-neutral-800">CupNote</h1>
            </div>
          </div>

          {/* 오른쪽: 에센셜 버튼들만 */}
          <div className="flex items-center space-x-2">
            {/* 검색 버튼 */}
            {showSearch && (
              <button
                onClick={handleSearchClick}
                className="p-2 rounded-lg hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                aria-label="검색"
              >
                <Search className="h-5 w-5 text-neutral-600" />
              </button>
            )}

            {/* 햄버거 메뉴 */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 rounded-lg hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
              aria-label="메뉴"
            >
              <Menu className="h-5 w-5 text-neutral-600" />
            </button>
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

      {/* 모바일 메뉴 오버레이 */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* 메뉴 패널 */}
          <div className="absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-xl">
            {/* 메뉴 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-800">메뉴</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-neutral-50"
              >
                <X className="h-5 w-5 text-neutral-600" />
              </button>
            </div>

            {/* 메뉴 아이템들 */}
            <div className="p-4 space-y-1">
              {/* 사용자 프로필 섹션 */}
              {user ? (
                <div className="pb-4 border-b border-neutral-100 mb-4">
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 text-left"
                  >
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{user.username}</p>
                      <p className="text-sm text-neutral-500">레벨 {user.level} • 프로필 보기</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="pb-4 border-b border-neutral-100 mb-4">
                  <button
                    onClick={() => {
                      router.push('/login')
                      setShowMobileMenu(false)
                    }}
                    className="w-full bg-neutral-600 text-white py-3 rounded-lg hover:bg-neutral-700 transition-colors font-medium"
                  >
                    로그인 / 회원가입
                  </button>
                </div>
              )}

              {/* 주요 메뉴들 */}
              <button
                onClick={() => {
                  router.push('/my-records')
                  setShowMobileMenu(false)
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 text-left"
              >
                <Coffee className="h-5 w-5 text-neutral-600" />
                <span className="text-neutral-800">내 기록</span>
              </button>

              <button
                onClick={() => {
                  router.push('/stats')
                  setShowMobileMenu(false)
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 text-left"
              >
                <TrendingUp className="h-5 w-5 text-neutral-600" />
                <span className="text-neutral-800">통계</span>
              </button>

              {/* 알림 (로그인된 사용자만) */}
              {user && (
                <button
                  onClick={() => {
                    router.push('/notifications')
                    setShowMobileMenu(false)
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 text-left"
                >
                  <div className="relative">
                    <Bell className="h-5 w-5 text-neutral-600" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </div>
                  <span className="text-neutral-800">알림</span>
                </button>
              )}

              <button
                onClick={() => {
                  router.push('/settings')
                  setShowMobileMenu(false)
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 text-left"
              >
                <Settings className="h-5 w-5 text-neutral-600" />
                <span className="text-neutral-800">설정</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}