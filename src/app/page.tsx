'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import CoffeeList from '@/components/CoffeeList'
import SupabaseTest from '@/components/SupabaseTest'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 온보딩 완료 여부 체크
    const onboardingCompleted = localStorage.getItem('cupnote-onboarding-completed')

    if (!onboardingCompleted) {
      router.push('/onboarding')
    }
  }, [router])
  return (
    <main className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
      <Navigation currentPage="home" />

      {/* 히어로 섹션 */}
      <section className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-coffee-800 mb-3 md:mb-4">☕ CupNote</h1>
        <p className="text-lg md:text-xl text-coffee-600 mb-6 md:mb-8 px-4">
          나만의 커피 여정을 기록하는 온라인 커피 일기
        </p>
        <Link
          href="/mode-selection"
          className="inline-block bg-coffee-600 text-white px-6 md:px-8 py-3 rounded-full hover:bg-coffee-700 transition-colors text-base md:text-lg font-medium"
        >
          첫 커피 기록하기
        </Link>
      </section>

      {/* 최근 기록 섹션 */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-4 md:mb-6">
          최근 커피 기록
        </h2>
        <CoffeeList />
      </section>
      
      {/* Supabase 연결 테스트 (개발용) */}
      <SupabaseTest />
    </main>
  )
}
