import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경 설정
  environment: process.env.NODE_ENV,
  
  // 성능 모니터링
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 세션 리플레이 (사용자 인터랙션 기록)
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Web Vitals 자동 계측
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration({
      // Web Vitals 자동 수집
      enableInp: true,
    }),
  ],
  
  // 릴리스 정보
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-rc.1',
  
  // 디버그 설정 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',
  
  // 에러 필터링
  beforeSend(event, hint) {
    // 개발 환경에서는 콘솔 에러는 제외
    if (process.env.NODE_ENV === 'development') {
      if (event.exception) {
        const error = hint.originalException
        if (error && error.toString().includes('Non-Error promise rejection')) {
          return null
        }
      }
    }
    
    // 민감한 정보 제거
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.authorization
    }
    
    return event
  },
  
  // 성능 모니터링 설정
  beforeSendTransaction(event) {
    // 너무 짧은 트랜잭션은 제외
    if (event.start_timestamp && event.timestamp) {
      const duration = event.timestamp - event.start_timestamp
      if (duration < 0.01) { // 10ms 미만
        return null
      }
    }
    
    return event
  }
})