'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Cafe Mode - 새로운 4단계 구조로 리다이렉트
export default function CafeModePage() {
  const router = useRouter()

  useEffect(() => {
    // 새로운 카페 모드 첫 번째 단계로 리다이렉트
    router.push('/record/cafe/step1')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-600">카페 모드로 이동 중...</p>
      </div>
    </div>
  )
}