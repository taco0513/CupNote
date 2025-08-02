'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy HomeCafe Mode redirect handler
 * 레거시 /record/homecafe 경로를 새로운 TastingFlow HomeCafe 모드로 리다이렉트
 */
export default function LegacyHomeCafeModePage() {
  const router = useRouter()

  useEffect(() => {
    // 새로운 TastingFlow HomeCafe 모드로 리다이렉트
    router.replace('/tasting-flow/homecafe/coffee-info')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-500 mx-auto mb-4"></div>
        <p className="text-coffee-600">새로운 홈카페 모드로 이동 중...</p>
      </div>
    </div>
  )
}