'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import AuthModal from './AuthModal'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  showModal?: boolean
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/',
  showModal = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      if (showModal) {
        setShowAuthModal(true)
      } else {
        router.push(redirectTo)
      }
    }
  }, [user, loading, requireAuth, router, redirectTo, showModal])

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // 인증 성공 후 현재 페이지 유지
  }

  const handleAuthCancel = () => {
    setShowAuthModal(false)
    router.push(redirectTo)
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-coffee-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 인증 필요한데 로그인되지 않은 경우
  if (requireAuth && !user) {
    if (showModal) {
      return (
        <>
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-coffee-100">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-6xl mb-4">☕</div>
                <h1 className="text-2xl font-bold text-coffee-800 mb-4">로그인이 필요해요</h1>
                <p className="text-coffee-600 mb-6">이 기능을 사용하려면 먼저 로그인해주세요</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-coffee-600 text-white px-6 py-3 rounded-lg hover:bg-coffee-700 transition-colors font-medium"
                >
                  로그인하기
                </button>
                <button
                  onClick={() => router.push(redirectTo)}
                  className="w-full mt-3 text-coffee-600 hover:text-coffee-800 transition-colors"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          </div>

          <AuthModal
            isOpen={showAuthModal}
            onClose={handleAuthCancel}
            onSuccess={handleAuthSuccess}
            initialMode="login"
          />
        </>
      )
    }

    return null // 리다이렉트 처리됨
  }

  // 정상적으로 접근 가능한 경우
  return <>{children}</>
}
