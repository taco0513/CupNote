/**
 * 내 기록 페이지 - 하이브리드 디자인 시스템 (App Router Optimized)
 * 목록과 분석을 통합한 커피 기록 관리 중심
 */
import { Suspense } from 'react'
import type { Metadata } from 'next'

import MyRecordsPageContent from '../../components/pages/MyRecordsPageContent'

// Route Segment Config
export const dynamic = 'force-dynamic' // Needs auth state and user data
export const revalidate = 0 // Always fresh for user data

// Enhanced metadata for better SEO
export const metadata: Metadata = {
  title: '내 기록 - CupNote',
  description: '나만의 커피 기록을 확인하고 분석해보세요. 맛 평가, 통계, 트렌드를 한눈에 볼 수 있습니다.',
  keywords: ['커피 기록', '맛 평가', '커피 통계', '테이스팅 노트', '개인 기록'],
  openGraph: {
    title: '내 기록 - CupNote',
    description: '나만의 커피 기록을 확인하고 분석해보세요.',
    type: 'website',
  },
  robots: {
    index: false, // Private user data
    follow: false,
  }
}

// Server Component - the main page component
export default function MyRecordsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-500 mx-auto mb-4"></div>
          <p className="text-coffee-600">기록을 불러오는 중...</p>
        </div>
      </div>
    }>
      <MyRecordsPageContent />
    </Suspense>
  )
}