/**
 * Content Security Policy Configuration
 * 
 * CupNote 애플리케이션의 보안 정책을 정의합니다.
 * XSS, Code Injection, Data Injection 공격을 방어합니다.
 * 
 * @version 1.0.0
 * @since 2025-08-06
 */

// ========================================
// CSP 정책 설정
// ========================================

export interface CSPConfig {
  'default-src': string[]
  'script-src': string[]
  'style-src': string[]
  'img-src': string[]
  'font-src': string[]
  'connect-src': string[]
  'media-src': string[]
  'object-src': string[]
  'base-uri': string[]
  'form-action': string[]
  'frame-ancestors': string[]
  'frame-src': string[]
  'manifest-src': string[]
  'worker-src': string[]
}

// 개발 환경용 CSP (더 관대함)
export const CSP_CONFIG_DEVELOPMENT: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // HMR을 위해 개발 환경에서 허용
    "'unsafe-inline'", // 개발 도구를 위해 허용
    'https://vercel.live',
    'https://cdn.vercel-insights.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Tailwind CSS 인라인 스타일 허용
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:', // Base64 이미지 허용
    'blob:', // 동적 생성 이미지 허용
    'https:', // HTTPS 이미지 소스 허용
    'https://*.supabase.co', // Supabase Storage
    'https://avatars.githubusercontent.com', // GitHub 아바타
  ],
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co', // Supabase API
    'https://vercel.live',
    'https://vitals.vercel-analytics.com',
    'wss://*.supabase.co', // Supabase Realtime WebSocket
  ],
  'media-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.supabase.co',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': [
    "'self'",
    'https://www.youtube.com', // 유튜브 임베드 (필요시)
  ],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
}

// 프로덕션 환경용 CSP (더 엄격함)
export const CSP_CONFIG_PRODUCTION: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Nonce나 Hash 기반 스크립트만 허용 (더 안전)
    'https://cdn.vercel-insights.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Tailwind는 불가피하게 인라인 필요
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'https://*.supabase.co',
    'https://avatars.githubusercontent.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://vitals.vercel-analytics.com',
    'wss://*.supabase.co',
  ],
  'media-src': [
    "'self'",
    'https://*.supabase.co',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'self'"],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
}

// ========================================
// CSP 헤더 생성
// ========================================

export function generateCSPHeader(config: CSPConfig): string {
  return Object.entries(config)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// ========================================
// 환경별 CSP 설정 
// ========================================

export function getCSPConfig(): CSPConfig {
  const isDevelopment = process.env.NODE_ENV === 'development'
  return isDevelopment ? CSP_CONFIG_DEVELOPMENT : CSP_CONFIG_PRODUCTION
}

export function getCSPHeader(): string {
  return generateCSPHeader(getCSPConfig())
}

// ========================================
// CSP 위반 리포팅
// ========================================

export interface CSPViolationReport {
  'document-uri': string
  referrer: string
  'violated-directive': string
  'original-policy': string
  disposition: string
  'blocked-uri': string
  'line-number': number
  'source-file': string
  'status-code': number
}

export function handleCSPViolation(report: CSPViolationReport) {
  console.warn('🚨 CSP Violation:', {
    directive: report['violated-directive'],
    blockedUri: report['blocked-uri'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number']
  })

  // 프로덕션에서는 에러 추적 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorTrackingService({
    //   type: 'csp_violation',
    //   ...report
    // })
  }
}

// ========================================
// 추가 보안 헤더들
// ========================================

export const SECURITY_HEADERS = {
  // XSS 보호
  'X-XSS-Protection': '1; mode=block',
  
  // MIME 타입 스니핑 방지  
  'X-Content-Type-Options': 'nosniff',
  
  // 클릭재킹 방지
  'X-Frame-Options': 'DENY',
  
  // HTTPS 강제 (1년)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Referrer 정책
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (구 Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()'
  ].join(', '),

  // Cross-Origin 정책
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// ========================================
// Next.js 설정용 헬퍼
// ========================================

export function getSecurityHeaders() {
  return [
    {
      key: 'Content-Security-Policy',
      value: getCSPHeader(),
    },
    ...Object.entries(SECURITY_HEADERS).map(([key, value]) => ({
      key,
      value,
    })),
  ]
}

// ========================================
// CSP 테스트 및 검증
// ========================================

export function validateCSPConfig(config: CSPConfig): {
  valid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // unsafe-inline 체크
  if (config['script-src'].includes("'unsafe-inline'")) {
    warnings.push("script-src contains 'unsafe-inline' which reduces XSS protection")
  }

  if (config['script-src'].includes("'unsafe-eval'")) {
    warnings.push("script-src contains 'unsafe-eval' which allows code evaluation")
  }

  // default-src 체크
  if (!config['default-src'] || config['default-src'].length === 0) {
    errors.push("default-src directive is required")
  }

  // object-src 체크 (보안상 'none'이 권장)
  if (!config['object-src'].includes("'none'")) {
    warnings.push("object-src should be set to 'none' for better security")
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  }
}

export default {
  getCSPConfig,
  getCSPHeader,
  getSecurityHeaders,
  validateCSPConfig,
  handleCSPViolation,
}