import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경 설정
  environment: process.env.NODE_ENV,
  
  // Edge Runtime에서는 최소한의 추적만
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.05,
  
  // 릴리스 정보
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-rc.1',
  
  // 디버그 비활성화 (Edge Runtime은 리소스 제한적)
  debug: false,
  
  // Edge Runtime 최적화
  beforeSend(event) {
    // Edge Runtime에서는 민감한 정보만 제거
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.authorization
    }
    
    return event
  }
})