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
    // Feature flag가 비활성화되면 리다이렉트 처리 안함
    if (!FEATURE_FLAGS.REDIRECT_OLD_ROUTES) return

    // Lab mode 리다이렉트
    if (pathname.includes('/record/lab')) {
      const newPath = pathname.replace('/record/lab', '/record/homecafe')
      console.log(`🔄 Redirecting Lab mode: ${pathname} → ${newPath}`)
      router.replace(newPath)
      return
    }

    // Pro mode 리다이렉트  
    if (pathname.includes('/record/pro')) {
      const newPath = pathname.replace('/record/pro', '/record/homecafe')
      console.log(`🔄 Redirecting Pro mode: ${pathname} → ${newPath}`)
      router.replace(newPath)
      return
    }

    // 새로운 TastingFlow가 활성화된 경우에만 처리
    if (FEATURE_FLAGS.ENABLE_NEW_TASTING_FLOW) {
      // 구 라우트 → 신 라우트 매핑
      const routeMapping: Record<string, string> = {
        '/record/cafe/step1': '/tasting-flow/cafe/coffee-info',
        '/record/cafe/step2': '/tasting-flow/cafe/flavor-selection',
        '/record/cafe/step3': '/tasting-flow/cafe/sensory-expression',
        '/record/cafe/step4': '/tasting-flow/cafe/sensory-mouthfeel',
        '/record/cafe/step5': '/tasting-flow/cafe/personal-notes',
        '/record/cafe/step6': '/tasting-flow/cafe/personal-notes',
        '/record/cafe/step7': '/tasting-flow/cafe/result',
        
        '/record/homecafe/step1': '/tasting-flow/homecafe/coffee-info',
        '/record/homecafe/step2': '/tasting-flow/homecafe/brew-setup',
        '/record/homecafe/step3': '/tasting-flow/homecafe/flavor-selection',
        '/record/homecafe/step4': '/tasting-flow/homecafe/sensory-expression',
        '/record/homecafe/step5': '/tasting-flow/homecafe/sensory-mouthfeel',
        '/record/homecafe/step6': '/tasting-flow/homecafe/personal-notes',
        '/record/homecafe/step7': '/tasting-flow/homecafe/personal-notes',
        '/record/homecafe/step8': '/tasting-flow/homecafe/result',
      }

      const newPath = routeMapping[pathname]
      if (newPath) {
        console.log(`🔄 Redirecting to new TastingFlow: ${pathname} → ${newPath}`)
        router.replace(newPath)
        return
      }
    }
  }, [pathname, router])

  return <>{children}</>
}

// 라우트 검증 유틸리티
export const isValidTastingRoute = (pathname: string): boolean => {
  // 새로운 TastingFlow 라우트 패턴
  const newRoutePattern = /^\/tasting-flow\/(cafe|homecafe)\/(coffee-info|brew-setup|flavor-selection|sensory-expression|sensory-mouthfeel|personal-notes|result)$/
  
  // 구 라우트 패턴 (마이그레이션 중에만 유효)
  const oldRoutePattern = /^\/record\/(cafe|homecafe)\/step\d+$/
  
  if (FEATURE_FLAGS.ENABLE_NEW_TASTING_FLOW) {
    return newRoutePattern.test(pathname)
  } else {
    return oldRoutePattern.test(pathname)
  }
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