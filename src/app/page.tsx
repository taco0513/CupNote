'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import CoffeeList from '@/components/CoffeeList'
import SupabaseTest from '@/components/SupabaseTest'
import AuthModal from '@/components/auth/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { LogIn, Coffee, TrendingUp, Award } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    // 온보딩 완료 여부 체크
    const onboardingCompleted = localStorage.getItem('cupnote-onboarding-completed')

    if (!onboardingCompleted) {
      router.push('/onboarding')
    }
  }, [router])

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // 인증 성공 시 페이지 새로고침 또는 상태 업데이트
    window.location.reload()
  }

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">로딩 중...</p>
        </div>
      </div>
    )
  }
  return (
    <>
      <main className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        <Navigation currentPage="home" />

        {user ? (
          // 로그인된 사용자를 위한 대시보드
          <>
            {/* 사용자 환영 메시지 */}
            <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-2">
                    안녕하세요, {user.username}님! ☕
                  </h1>
                  <p className="text-coffee-600">
                    Level {user.level} • {user.total_points} 포인트
                  </p>
                </div>
                <Link
                  href="/mode-selection"
                  className="bg-coffee-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-coffee-700 transition-colors text-sm md:text-base font-medium"
                >
                  새 기록 작성
                </Link>
              </div>
            </section>

            {/* 빠른 통계 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <Coffee className="h-8 w-8 text-coffee-600 mx-auto mb-2" />
                <h3 className="font-bold text-coffee-800">총 기록</h3>
                <p className="text-2xl font-bold text-coffee-600">5개</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-bold text-coffee-800">평균 평점</h3>
                <p className="text-2xl font-bold text-green-600">4.0</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-bold text-coffee-800">달성 성취</h3>
                <p className="text-2xl font-bold text-yellow-600">12개</p>
              </div>
            </section>

            {/* 최근 기록 섹션 */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-4 md:mb-6">
                최근 커피 기록
              </h2>
              <CoffeeList />
            </section>
          </>
        ) : (
          // 비로그인 사용자를 위한 랜딩 페이지
          <>
            {/* 히어로 섹션 */}
            <section className="text-center mb-12 md:mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-coffee-800 mb-4 md:mb-6">
                ☕ CupNote
              </h1>
              <p className="text-xl md:text-2xl text-coffee-600 mb-8 md:mb-10 px-4 max-w-3xl mx-auto">
                누구나 전문가처럼, 그러나 자기만의 방식으로<br />
                커피를 기록하고 나눌 수 있는 공간
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full sm:w-auto bg-coffee-600 text-white px-8 py-4 rounded-full hover:bg-coffee-700 transition-colors text-lg font-medium"
                >
                  지금 시작하기
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full sm:w-auto flex items-center justify-center border-2 border-coffee-600 text-coffee-600 px-8 py-4 rounded-full hover:bg-coffee-50 transition-colors text-lg font-medium"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  로그인
                </button>
              </div>
            </section>

            {/* 기능 소개 섹션 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-coffee-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-8 w-8 text-coffee-600" />
                </div>
                <h3 className="text-xl font-bold text-coffee-800 mb-2">쉬운 기록</h3>
                <p className="text-coffee-600">
                  직관적인 인터페이스로 누구나 쉽게 커피 경험을 기록할 수 있어요
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-coffee-800 mb-2">성장 추적</h3>
                <p className="text-coffee-600">
                  Match Score로 커피 감각의 발달 과정을 시각적으로 확인하세요
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-coffee-800 mb-2">성취 시스템</h3>
                <p className="text-coffee-600">
                  다양한 성취를 달성하며 커피 여정을 더욱 재미있게 만들어요
                </p>
              </div>
            </section>

            {/* 데모 섹션 */}
            <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-4">
                무료로 시작해보세요
              </h2>
              <p className="text-coffee-600 mb-6">
                회원가입 후 바로 커피 기록을 시작할 수 있습니다
              </p>
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-coffee-600 text-white px-8 py-3 rounded-full hover:bg-coffee-700 transition-colors text-lg font-medium"
              >
                계정 만들기
              </button>
            </section>
          </>
        )}
        
        {/* Supabase 연결 테스트 (개발용) */}
        <SupabaseTest />
      </main>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </>
  )
}
