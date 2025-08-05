// 중앙화된 에러 처리 시스템

export interface ErrorContext {
  [key: string]: string | number | boolean | null | undefined
}

export interface AppError {
  code: string
  message: string
  userMessage: string
  context?: ErrorContext
  retryable?: boolean
}

export class CupNoteError extends Error {
  public readonly code: string
  public readonly userMessage: string
  public readonly context?: ErrorContext
  public readonly retryable: boolean

  constructor(error: AppError) {
    super(error.message)
    this.name = 'CupNoteError'
    this.code = error.code
    this.userMessage = error.userMessage
    this.context = error.context
    this.retryable = error.retryable ?? false
  }
}

// 에러 코드 정의
export const ERROR_CODES = {
  // 네트워크 에러
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  OFFLINE_ERROR: 'OFFLINE_ERROR',

  // 인증 에러
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_NOT_CONFIRMED: 'AUTH_EMAIL_NOT_CONFIRMED',
  AUTH_WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  AUTH_EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',
  AUTH_INVALID_EMAIL: 'AUTH_INVALID_EMAIL',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // 데이터베이스 에러
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_CONSTRAINT_ERROR: 'DB_CONSTRAINT_ERROR',

  // 유효성 검증 에러
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // 비즈니스 로직 에러
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // 시스템 에러
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

// 에러 메시지 매핑
const ERROR_MESSAGES: Record<string, { message: string; userMessage: string; retryable: boolean }> =
  {
    [ERROR_CODES.NETWORK_ERROR]: {
      message: 'Network request failed',
      userMessage: '네트워크 연결을 확인하고 다시 시도해주세요.',
      retryable: true,
    },
    [ERROR_CODES.TIMEOUT_ERROR]: {
      message: 'Request timeout',
      userMessage: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
      retryable: true,
    },
    [ERROR_CODES.OFFLINE_ERROR]: {
      message: 'Device is offline',
      userMessage: '인터넷 연결을 확인해주세요.',
      retryable: true,
    },
    [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: {
      message: 'Invalid login credentials',
      userMessage: '이메일 또는 비밀번호가 올바르지 않습니다.',
      retryable: false,
    },
    [ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED]: {
      message: 'Email not confirmed',
      userMessage: '이메일 인증을 완료해주세요.',
      retryable: false,
    },
    [ERROR_CODES.AUTH_WEAK_PASSWORD]: {
      message: 'Password is too weak',
      userMessage: '비밀번호가 너무 간단합니다. 더 복잡한 비밀번호를 사용해주세요.',
      retryable: false,
    },
    [ERROR_CODES.AUTH_EMAIL_EXISTS]: {
      message: 'Email already exists',
      userMessage: '이미 사용 중인 이메일입니다.',
      retryable: false,
    },
    [ERROR_CODES.AUTH_INVALID_EMAIL]: {
      message: 'Invalid email format',
      userMessage: '올바른 이메일 형식을 입력해주세요.',
      retryable: false,
    },
    [ERROR_CODES.AUTH_UNAUTHORIZED]: {
      message: 'Unauthorized access',
      userMessage: '로그인이 필요합니다.',
      retryable: false,
    },
    [ERROR_CODES.DB_CONNECTION_ERROR]: {
      message: 'Database connection failed',
      userMessage: '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
      retryable: true,
    },
    [ERROR_CODES.DB_QUERY_ERROR]: {
      message: 'Database query failed',
      userMessage: '데이터 처리 중 오류가 발생했습니다.',
      retryable: true,
    },
    [ERROR_CODES.VALIDATION_ERROR]: {
      message: 'Validation failed',
      userMessage: '입력한 정보를 확인해주세요.',
      retryable: false,
    },
    [ERROR_CODES.RECORD_NOT_FOUND]: {
      message: 'Record not found',
      userMessage: '요청한 데이터를 찾을 수 없습니다.',
      retryable: false,
    },
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: {
      message: 'Rate limit exceeded',
      userMessage: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      retryable: true,
    },
    [ERROR_CODES.INTERNAL_ERROR]: {
      message: 'Internal server error',
      userMessage: '내부 서버 오류가 발생했습니다. 고객지원팀에 문의해주세요.',
      retryable: false,
    },
    [ERROR_CODES.SERVICE_UNAVAILABLE]: {
      message: 'Service temporarily unavailable',
      userMessage: '서비스가 일시적으로 중단되었습니다. 잠시 후 다시 시도해주세요.',
      retryable: true,
    },
  }

// 에러 생성 헬퍼
export function createError(
  code: keyof typeof ERROR_CODES,
  context?: Record<string, any>,
  originalError?: Error
): CupNoteError {
  const errorConfig = ERROR_MESSAGES[code]

  if (!errorConfig) {
    return new CupNoteError({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: `Unknown error code: ${code}`,
      userMessage: '알 수 없는 오류가 발생했습니다.',
      context: { originalCode: code, ...context },
      retryable: false,
    })
  }

  return new CupNoteError({
    code,
    message: originalError?.message || errorConfig.message,
    userMessage: errorConfig.userMessage,
    context: {
      ...context,
      ...(originalError && { originalError: originalError.message }),
    },
    retryable: errorConfig.retryable,
  })
}

// Supabase 에러 매핑 타입
interface SupabaseError {
  message?: string
  code?: string
  details?: string
  hint?: string
}

export function mapSupabaseError(error: SupabaseError | Error | unknown): CupNoteError {
  const message = (error as SupabaseError)?.message || 
                  (error as Error)?.message || 
                  '알 수 없는 오류가 발생했습니다.'

  // 인증 관련 에러
  if (message.includes('Invalid login credentials')) {
    return createError('AUTH_INVALID_CREDENTIALS', { supabaseError: error })
  }
  if (message.includes('Email not confirmed')) {
    return createError('AUTH_EMAIL_NOT_CONFIRMED', { supabaseError: error })
  }
  if (message.includes('Password should be at least')) {
    return createError('AUTH_WEAK_PASSWORD', { supabaseError: error })
  }
  if (message.includes('User already registered')) {
    return createError('AUTH_EMAIL_EXISTS', { supabaseError: error })
  }
  if (message.includes('Invalid email')) {
    return createError('AUTH_INVALID_EMAIL', { supabaseError: error })
  }

  // 네트워크 관련 에러
  if (message.includes('fetch') || message.includes('network')) {
    return createError('NETWORK_ERROR', { supabaseError: error })
  }
  if (message.includes('timeout')) {
    return createError('TIMEOUT_ERROR', { supabaseError: error })
  }

  // DB 관련 에러
  if (error?.code === 'PGRST116' || message.includes('not found')) {
    return createError('RECORD_NOT_FOUND', { supabaseError: error })
  }

  // 기본 처리
  return createError('INTERNAL_ERROR', { supabaseError: error }, error)
}

// 네트워크 에러 매핑
interface NetworkError {
  message?: string
  code?: string | number
  status?: number
}

export function mapNetworkError(error: NetworkError | Error | unknown): CupNoteError {
  if (error.name === 'AbortError') {
    return createError('TIMEOUT_ERROR', { networkError: error })
  }
  if (!navigator.onLine) {
    return createError('OFFLINE_ERROR', { networkError: error })
  }
  return createError('NETWORK_ERROR', { networkError: error }, error)
}

// 에러 로깅
export function logError(error: CupNoteError | Error, context?: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof CupNoteError && {
        code: error.code,
        userMessage: error.userMessage,
        context: error.context,
        retryable: error.retryable,
      }),
    },
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('CupNote Error:', error.message || 'Unknown error', logData)
  }

  // 프로덕션에서는 에러 추적 서비스로 전송
  // sendToErrorTrackingService(logData)
}

// 에러 복구 헬퍼
export function getErrorRecoveryAction(error: CupNoteError): {
  canRetry: boolean
  retryDelay?: number
  action?: string
} {
  if (!error.retryable) {
    return { canRetry: false }
  }

  switch (error.code) {
    case ERROR_CODES.NETWORK_ERROR:
    case ERROR_CODES.TIMEOUT_ERROR:
      return { canRetry: true, retryDelay: 2000, action: '다시 시도' }

    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return { canRetry: true, retryDelay: 5000, action: '잠시 후 다시 시도' }

    case ERROR_CODES.SERVICE_UNAVAILABLE:
      return { canRetry: true, retryDelay: 10000, action: '서비스 복구 대기' }

    default:
      return { canRetry: true, retryDelay: 1000, action: '다시 시도' }
  }
}
