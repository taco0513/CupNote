'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy HomeCafe Step3 redirect handler
 */
export default function LegacyHomeCafeStep3Page() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/tasting-flow/homecafe/flavor-selection')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600">새로운 홈카페 모드로 이동 중...</p>
      </div>
    </div>
  )
}