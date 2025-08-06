'use client'

import { useEffect } from 'react'

import { useRouter, usePathname } from 'next/navigation'

import { FEATURE_FLAGS, LEGACY_MODE_MAPPING } from '../config'

/**
 * Route Guard Component
 * TastingFlow 마이그레이션을 위한 라우트 가드
 * 
 * 주요 기능:
 * 1. 구 라우트 → 신 라우트 리다이렉트
 * 2. Lab Mode → HomeCafe Mode 리다이렉트
 * 3. Feature Flag 기반 라우트 제어
 */
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 레거시 /record 라우트를 새로운 TastingFlow로 리다이렉트
    // 이제 모든 레거시 페이지가 자체적으로 리다이렉트하므로 여기서는 간단한 처리만
    
    // Lab/Pro mode 쿼리 파라미터가 있는 경우 HomeCafe로 변경
    if (pathname.includes('mode=lab') || pathname.includes('mode=pro')) {
      const url = new URL(window.location.href)
      url.searchParams.set('mode', 'homecafe')
      router.replace(url.pathname + url.search)
      return
    }
  }, [pathname, router])

  return <>{children}</>
}

// 라우트 검증 유틸리티
export const isValidTastingRoute = (pathname: string): boolean => {
  // 새로운 TastingFlow 라우트 패턴만 유효
  const newRoutePattern = /^\/tasting-flow\/(cafe|homecafe)\/(coffee-info|brew-setup|flavor-selection|sensory-expression|sensory-mouthfeel|personal-notes|result)$/
  
  return newRoutePattern.test(pathname)
}

// 마이그레이션 배너 컴포넌트
export const MigrationBanner = () => {
  if (!FEATURE_FLAGS.SHOW_MIGRATION_BANNER) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            새로운 테이스팅 플로우를 테스트하고 있습니다. 문제가 있으면 피드백을 남겨주세요!
            <a href="/feedback" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-2">
              피드백 남기기
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}