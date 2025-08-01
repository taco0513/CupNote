'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy /record route redirect handler
 * 레거시 /record 경로를 새로운 TastingFlow로 리다이렉트
 */
export default function LegacyRecordPage() {
  const router = useRouter()

  useEffect(() => {
    // 새로운 TastingFlow로 리다이렉트
    router.replace('/tasting-flow')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
        <p className="text-coffee-600">새로운 테이스팅 플로우로 이동 중...</p>
      </div>
    </div>
  )
}