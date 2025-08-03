'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

/**
 * Legacy Step4 redirect handler
 */
export default function LegacyStep4Page() {
  const router = useRouter()

  useEffect(() => {
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