/**
 * @document-ref NEXTJS_PATTERNS.md#route-segment-config
 * @design-ref DESIGN_SYSTEM.md#performance-budgets
 * @compliance-check 2025-08-02 - NextJS Production Reality 패턴 적용
 */

import { Suspense } from 'react'

import HybridHomePageContent from '../components/pages/HybridHomePageContent'

// Route Segment Config - NextJS Production Reality 패턴 (App Router Optimized)
export const dynamic = 'force-static' // Static generation for landing page
export const revalidate = 21600 // 6시간 캐싱 (더 긴 캐싱으로 성능 향상)
export const runtime = 'nodejs'

// Enhanced metadata for better SEO and performance
export const metadata = {
  title: 'CupNote - 나만의 커피 여정',
  description: '누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간. 스페셜티 커피 애호가를 위한 개인화된 커피 기록 & 커뮤니티 플랫폼',
  keywords: ['커피 일기', '테이스팅 노트', '스페셜티 커피', '커피 기록', 'PWA'],
  alternates: {
    canonical: 'https://mycupnote.com'
  }
}

// NextJS Production Reality 패턴 - Server Component 우선
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
      </div>
    }>
      <HybridHomePageContent />
    </Suspense>
  )
}