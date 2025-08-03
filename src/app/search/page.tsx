/**
 * @document-ref SEARCH_SYSTEM.md#search-interface-design
 * @design-ref DESIGN_SYSTEM.md#page-layouts
 * @compliance-check 2025-08-02 - 검색 페이지 구현
 */

import { Suspense } from 'react'

import dynamicImport from 'next/dynamic'

// Route Segment Config
export const dynamic = 'auto'
export const revalidate = 0 // 검색은 항상 최신 데이터
export const runtime = 'nodejs'

// Server Component로 유지하고 Client Component는 dynamic import
const SearchPageContent = dynamicImport(() => import('../../components/pages/SearchPageContent'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-neutral-50">
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-12 bg-coffee-200 rounded-lg animate-pulse"></div>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 bg-coffee-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-coffee-50 to-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}