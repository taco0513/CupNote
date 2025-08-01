'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy Cafe Step3 redirect handler
 */
export default function LegacyCafeStep3Page() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/tasting-flow/cafe/sensory-expression')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-600">새로운 카페 모드로 이동 중...</p>
      </div>
    </div>
  )
}