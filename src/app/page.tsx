/**
 * @document-ref NEXTJS_PATTERNS.md#route-segment-config
 * @design-ref DESIGN_SYSTEM.md#performance-budgets
 * @compliance-check 2025-08-02 - NextJS Production Reality 패턴 적용
 */

import { Suspense } from 'react'
import HybridHomePageContent from '../components/pages/HybridHomePageContent'

// Route Segment Config - NextJS Production Reality 패턴
export const dynamic = 'auto'
export const revalidate = 3600 // 1시간 캐싱
export const runtime = 'nodejs'

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