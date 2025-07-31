import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경 설정
  environment: process.env.NODE_ENV,
  
  // 서버 사이드 성능 모니터링 (낮은 샘플링)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.1,
  
  // 릴리스 정보
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-rc.1',
  
  // 디버그 설정 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',
  
  // 서버 측 에러 필터링
  beforeSend(event, hint) {
    // Next.js 내부 에러 제외
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'name' in error) {
        // Next.js 라우팅 에러 제외
        if (error.name === 'NotFoundError' || error.name === 'RedirectError') {
          return null
        }
      }
    }
    
    // 민감한 정보 제거
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.authorization
      delete event.request.headers?.cookie
    }
    
    return event
  },
  
  // 통합 설정
  integrations: [
    // HTTP 요청 추적
    Sentry.httpIntegration({
      tracing: {
        // Supabase API 호출 추적
        shouldCreateSpanForRequest: (url) => {
          return url.includes('supabase') || url.includes('/api/')
        }
      }
    })
  ],
  
  // 성능 트레이싱 설정
  beforeSendTransaction(event) {
    // API 라우트와 페이지 렌더링만 추적
    if (event.transaction && (
      event.transaction.startsWith('/api/') ||
      event.transaction.startsWith('/_next/') ||
      event.transaction.includes('favicon')
    )) {
      return null
    }
    
    return event
  }
})