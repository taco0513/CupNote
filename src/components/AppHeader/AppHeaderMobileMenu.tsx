/**
 * AppHeader Mobile Menu Component
 */
'use client'

import { useRouter } from 'next/navigation'
import { User, Settings, HelpCircle, LogOut, X } from 'lucide-react'
import UnifiedButton from '../ui/UnifiedButton'

interface AppHeaderMobileMenuProps {
  user: any
  showMobileMenu: boolean
  setShowMobileMenu: (show: boolean) => void
  handleLogout: () => void
}

export default function AppHeaderMobileMenu({ 
  user, 
  showMobileMenu, 
  setShowMobileMenu,
  handleLogout 
}: AppHeaderMobileMenuProps) {
  const router = useRouter()

  if (!showMobileMenu) return null

  return (
    <div className="md:hidden fixed inset-0 z-50">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowMobileMenu(false)}
      />
      
      {/* 프로필 슬라이더 */}
      <div className="absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white/95 backdrop-blur-md shadow-xl animate-slide-in-right pt-safe-top">
        {/* 슬라이더 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-coffee-200/30">
          <h2 className="text-lg font-semibold text-coffee-800">프로필 메뉴</h2>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="p-2 rounded-lg hover:bg-coffee-50/80"
          >
            <X className="h-5 w-5 text-coffee-600" />
          </button>
        </div>

        {/* 프로필 슬라이더 콘텐츠 */}
        <div className="p-4 space-y-1">
          {/* 사용자 정보 섹션 */}
          {user ? (
            <div className="pb-6 border-b border-coffee-200/30 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center shadow-md">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-coffee-800">{user.username}</p>
                  <p className="text-sm text-coffee-600">{user.email}</p>
                  <p className="text-xs text-coffee-500 mt-1">⭐ Level 1 커피 입문자</p>
                  <p className="text-xs text-coffee-500">🏆 0P • 1개 기록</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-6 border-b border-coffee-200/30 mb-6">
              <button
                onClick={() => {
                  router.push('/auth')
                  setShowMobileMenu(false)
                }}
                className="w-full bg-gradient-to-r from-coffee-500 to-coffee-600 text-white py-3 rounded-xl hover:from-coffee-600 hover:to-coffee-700 transition-all duration-200 font-medium shadow-md"
              >
                로그인 / 회원가입
              </button>
            </div>
          )}

          {/* 메뉴 항목들 */}
          <div className="space-y-2">
            <button
              onClick={() => {
                router.push('/profile')
                setShowMobileMenu(false)
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-coffee-50/80 text-left transition-colors"
            >
              <User className="h-5 w-5 text-coffee-600" />
              <span className="text-coffee-800 font-medium">내 프로필</span>
            </button>

            <button
              onClick={() => {
                router.push('/settings')
                setShowMobileMenu(false)
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-coffee-50/80 text-left transition-colors"
            >
              <Settings className="h-5 w-5 text-coffee-600" />
              <span className="text-coffee-800 font-medium">설정</span>
            </button>

            <button
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-coffee-50/80 text-left transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-coffee-600" />
              <span className="text-coffee-800 font-medium">도움말</span>
            </button>

            {/* 로그아웃 (로그인된 사용자만) */}
            {user && (
              <div className="pt-4 border-t border-coffee-200/30">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50/80 text-left transition-colors"
                >
                  <LogOut className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}