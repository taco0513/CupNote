'use client'

import { useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

/**
 * Mode Entry Point
 * /tasting-flow/[mode] 접근 시 적절한 첫 번째 단계로 리다이렉트
 */
export default function ModeEntryPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as string

  useEffect(() => {
    // 유효한 모드인지 확인
    if (mode !== 'cafe' && mode !== 'homecafe') {
      router.replace('/tasting-flow')
      return
    }

    // 첫 번째 단계(coffee-info)로 리다이렉트
    router.replace(`/tasting-flow/${mode}/coffee-info`)
  }, [mode, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-500 mx-auto mb-4"></div>
        <p className="text-coffee-600">
          {mode === 'cafe' ? '카페 모드' : mode === 'homecafe' ? '홈카페 모드' : '테이스팅 플로우'}로 이동 중...
        </p>
      </div>
    </div>
  )
}