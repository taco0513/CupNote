'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StatsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // 새로운 통합 페이지로 리디렉트 (분석 탭으로)
    router.replace('/my-records?tab=stats')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
        <p className="text-coffee-600">페이지를 이동하는 중...</p>
      </div>
    </div>
  )
}