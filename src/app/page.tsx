'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import CoffeeList from '@/components/CoffeeList'

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Navigation currentPage="home" />

      {/* 히어로 섹션 */}
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold text-coffee-800 mb-4">☕ CupNote</h1>
        <p className="text-xl text-coffee-600 mb-8">나만의 커피 여정을 기록하는 온라인 커피 일기</p>
        <Link
          href="/record"
          className="inline-block bg-coffee-600 text-white px-8 py-3 rounded-full hover:bg-coffee-700 transition-colors text-lg font-medium"
        >
          첫 커피 기록하기
        </Link>
      </section>

      {/* 최근 기록 섹션 */}
      <section>
        <h2 className="text-3xl font-bold text-coffee-800 mb-6">최근 커피 기록</h2>
        <CoffeeList />
      </section>
    </main>
  )
}
