'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

/**
 * Legacy Cafe Mode redirect handler
 * 레거시 /record/cafe 경로를 새로운 TastingFlow Cafe 모드로 리다이렉트
 */
export default function LegacyCafeModePage() {
  const router = useRouter()

  useEffect(() => {
    // 새로운 TastingFlow Cafe 모드로 리다이렉트
    router.replace('/tasting-flow/cafe/coffee-info')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-500 mx-auto mb-4"></div>
        <p className="text-coffee-600">새로운 카페 모드로 이동 중...</p>
      </div>
    </div>
  )
}