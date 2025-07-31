import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  CupNoteError,
  ERROR_CODES,
  createError,
  mapSupabaseError,
  mapNetworkError,
  logError,
  getErrorRecoveryAction,
  type AppError,
} from '../error-handler'

// Mock console and navigator
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
}

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Test Browser)',
  onLine: true,
}

// Mock window.location
const mockLocation = {
  href: 'https://test.example.com/path',
}

// Setup global mocks
vi.stubGlobal('console', mockConsole)
vi.stubGlobal('navigator', mockNavigator)
vi.stubGlobal('window', { location: mockLocation })

describe('CupNoteError', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should create error with all properties', () => {
    const errorConfig: AppError = {
      code: 'TEST_ERROR',
      message: 'Test error occurred',
      userMessage: '테스트 오류가 발생했습니다',
      context: { testId: 123 },
      retryable: true,
    }

    const error = new CupNoteError(errorConfig)

    expect(error.name).toBe('CupNoteError')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.message).toBe('Test error occurred')
    expect(error.userMessage).toBe('테스트 오류가 발생했습니다')
    expect(error.context).toEqual({ testId: 123 })
    expect(error.retryable).toBe(true)
  })

  it('should default retryable to false', () => {
    const errorConfig: AppError = {
      code: 'TEST_ERROR',
      message: 'Test error',
      userMessage: 'Test error message',
    }

    const error = new CupNoteError(errorConfig)
    expect(error.retryable).toBe(false)
  })

  it('should extend Error correctly', () => {
    const error = new CupNoteError({
      code: 'TEST_ERROR',
      message: 'Test error',
      userMessage: 'Test error message',
    })

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(CupNoteError)
    expect(error.stack).toBeDefined()
  })
})

describe('ERROR_CODES', () => {
  it('should contain all expected error codes', () => {
    const expectedCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'OFFLINE_ERROR',
      'AUTH_INVALID_CREDENTIALS', 
      'AUTH_EMAIL_NOT_CONFIRMED',
      'AUTH_WEAK_PASSWORD',
      'AUTH_EMAIL_EXISTS',
      'AUTH_INVALID_EMAIL',
      'AUTH_UNAUTHORIZED',
      'DB_CONNECTION_ERROR',
      'DB_QUERY_ERROR',
      'DB_CONSTRAINT_ERROR',
      'VALIDATION_ERROR',
      'INVALID_INPUT',
      'RECORD_NOT_FOUND',
      'INSUFFICIENT_PERMISSIONS',
      'RATE_LIMIT_EXCEEDED',
      'INTERNAL_ERROR',
      'SERVICE_UNAVAILABLE',
    ]

    expectedCodes.forEach(code => {
      expect(ERROR_CODES).toHaveProperty(code)
      expect(ERROR_CODES[code as keyof typeof ERROR_CODES]).toBe(code)
    })
  })
})

describe('createError', () => {
  it('should create error with known code', () => {
    const error = createError('NETWORK_ERROR', { url: 'https://api.test.com' })

    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.message).toBe('Network request failed')
    expect(error.userMessage).toBe('네트워크 연결을 확인하고 다시 시도해주세요.')
    expect(error.retryable).toBe(true)
    expect(error.context).toEqual({ url: 'https://api.test.com' })
  })

  it('should handle unknown error code', () => {
    const error = createError('UNKNOWN_CODE' as any)

    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.message).toBe('Unknown error code: UNKNOWN_CODE')
    expect(error.userMessage).toBe('알 수 없는 오류가 발생했습니다.')
    expect(error.retryable).toBe(false)
    expect(error.context).toEqual({ originalCode: 'UNKNOWN_CODE' })
  })

  it('should include original error in context', () => {
    const originalError = new Error('Original error message')
    const error = createError('NETWORK_ERROR', { extra: 'data' }, originalError)

    expect(error.message).toBe('Original error message')
    expect(error.context).toEqual({
      extra: 'data',
      originalError: 'Original error message',
    })
  })

  it('should fallback to default message when original error has no message', () => {
    const originalError = new Error()
    const error = createError('NETWORK_ERROR', undefined, originalError)

    expect(error.message).toBe('Network request failed')
    expect(error.context).toEqual({
      originalError: '',
    })
  })

  it('should handle context merging correctly', () => {
    const originalError = new Error('Test error')
    const error = createError(
      'AUTH_INVALID_CREDENTIALS',
      { userId: 'user123', attempt: 3 },
      originalError
    )

    expect(error.context).toEqual({
      userId: 'user123',
      attempt: 3,
      originalError: 'Test error',
    })
  })
})

describe('mapSupabaseError', () => {
  it('should map invalid credentials error', () => {
    const supabaseError = { message: 'Invalid login credentials' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('AUTH_INVALID_CREDENTIALS')
    expect(error.userMessage).toBe('이메일 또는 비밀번호가 올바르지 않습니다.')
  })

  it('should map email not confirmed error', () => {
    const supabaseError = { message: 'Email not confirmed' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('AUTH_EMAIL_NOT_CONFIRMED')
    expect(error.userMessage).toBe('이메일 인증을 완료해주세요.')
  })

  it('should map weak password error', () => {
    const supabaseError = { message: 'Password should be at least 6 characters' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('AUTH_WEAK_PASSWORD')
    expect(error.userMessage).toBe('비밀번호가 너무 간단합니다. 더 복잡한 비밀번호를 사용해주세요.')
  })

  it('should map email exists error', () => {
    const supabaseError = { message: 'User already registered' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('AUTH_EMAIL_EXISTS') 
    expect(error.userMessage).toBe('이미 사용 중인 이메일입니다.')
  })

  it('should map invalid email error', () => {
    const supabaseError = { message: 'Invalid email format' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('AUTH_INVALID_EMAIL')
    expect(error.userMessage).toBe('올바른 이메일 형식을 입력해주세요.')
  })

  it('should map network errors', () => {
    const supabaseError = { message: 'Failed to fetch' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('NETWORK_ERROR')
  })

  it('should map timeout errors', () => {
    const supabaseError = { message: 'Request timeout exceeded' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('TIMEOUT_ERROR')
  })

  it('should map record not found errors', () => {
    const supabaseError = { code: 'PGRST116', message: 'Record not found' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('RECORD_NOT_FOUND')
  })

  it('should handle undefined error', () => {
    const error = mapSupabaseError(undefined)

    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.context).toEqual({ supabaseError: undefined })
  })

  it('should handle error without message', () => {
    const supabaseError = { code: 'UNKNOWN' }
    const error = mapSupabaseError(supabaseError)

    expect(error.code).toBe('INTERNAL_ERROR')
  })

  it('should include supabase error in context', () => {
    const supabaseError = { 
      message: 'Invalid login credentials',
      code: 'AUTH_ERROR',
      details: 'Additional details'
    }
    const error = mapSupabaseError(supabaseError)

    expect(error.context).toEqual({ supabaseError })
  })
})

describe('mapNetworkError', () => {
  beforeEach(() => {
    // Reset navigator.onLine
    mockNavigator.onLine = true
  })

  it('should map AbortError to timeout', () => {
    const networkError = { name: 'AbortError', message: 'Request aborted' }
    const error = mapNetworkError(networkError)

    expect(error.code).toBe('TIMEOUT_ERROR')
    expect(error.context).toEqual({ networkError })
  })

  it('should map offline errors', () => {
    mockNavigator.onLine = false
    const networkError = { name: 'NetworkError', message: 'Network failed' }
    const error = mapNetworkError(networkError)

    expect(error.code).toBe('OFFLINE_ERROR')
  })

  it('should map generic network errors', () => {
    const networkError = { name: 'TypeError', message: 'Failed to fetch' }
    const error = mapNetworkError(networkError)

    expect(error.code).toBe('NETWORK_ERROR')
  })

  it('should include network error in context', () => {
    const networkError = { 
      name: 'NetworkError',
      message: 'Connection failed',
      stack: 'Error stack trace'
    }
    const error = mapNetworkError(networkError)

    expect(error.context).toEqual({ networkError })
  })
})

describe('logError', () => {
  beforeEach(() => {
    // Mock process.env
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should log CupNoteError in development', () => {
    const error = createError('NETWORK_ERROR', { testData: 'value' })
    logError(error, 'Test context')

    expect(mockConsole.error).toHaveBeenCalledWith('CupNote Error:', expect.objectContaining({
      timestamp: expect.any(String),
      context: 'Test context',
      error: expect.objectContaining({
        name: 'CupNoteError',
        message: 'Network request failed',
        code: 'NETWORK_ERROR',
        userMessage: '네트워크 연결을 확인하고 다시 시도해주세요.',
        context: { testData: 'value' },
        retryable: true,
      }),
      userAgent: 'Mozilla/5.0 (Test Browser)',
      url: 'https://test.example.com/path',
    }))
  })

  it('should log regular Error in development', () => {
    const error = new Error('Regular error')
    logError(error, 'Test context')

    expect(mockConsole.error).toHaveBeenCalledWith('CupNote Error:', expect.objectContaining({
      timestamp: expect.any(String),
      context: 'Test context',
      error: expect.objectContaining({
        name: 'Error',
        message: 'Regular error',
        stack: expect.any(String),
      }),
      userAgent: 'Mozilla/5.0 (Test Browser)',
      url: 'https://test.example.com/path',
    }))
  })

  it('should not log in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    
    const error = createError('NETWORK_ERROR')
    logError(error)

    expect(mockConsole.error).not.toHaveBeenCalled()
  })

  it('should handle missing context', () => {
    const error = createError('NETWORK_ERROR')
    logError(error)

    expect(mockConsole.error).toHaveBeenCalledWith('CupNote Error:', expect.objectContaining({
      context: undefined,
    }))
  })

  it('should include timestamp in ISO format', () => {
    const error = createError('NETWORK_ERROR')
    logError(error)

    const logCall = mockConsole.error.mock.calls[0][1]
    expect(logCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })
})

describe('getErrorRecoveryAction', () => {
  it('should return no retry for non-retryable errors', () => {
    const error = createError('AUTH_INVALID_CREDENTIALS')
    const recovery = getErrorRecoveryAction(error)

    expect(recovery.canRetry).toBe(false)
    expect(recovery.retryDelay).toBeUndefined()
    expect(recovery.action).toBeUndefined()
  })

  it('should return network error recovery action', () => {
    const error = createError('NETWORK_ERROR')
    const recovery = getErrorRecoveryAction(error)

    expect(recovery.canRetry).toBe(true)
    expect(recovery.retryDelay).toBe(2000)
    expect(recovery.action).toBe('다시 시도')
  })

  it('should return timeout error recovery action', () => {
    const error = createError('TIMEOUT_ERROR')
    const recovery = getErrorRecoveryAction(error)

    expect(recovery.canRetry).toBe(true)
    expect(recovery.retryDelay).toBe(2000)
    expect(recovery.action).toBe('다시 시도')
  })

  it('should return rate limit recovery action', () => {
    const error = createError('RATE_LIMIT_EXCEEDED')
    const recovery = getErrorRecoveryAction(error)

    expect(recovery.canRetry).toBe(true)
    expect(recovery.retryDelay).toBe(5000)
    expect(recovery.action).toBe('잠시 후 다시 시도')
  })

  it('should return service unavailable recovery action', () => {
    const error = createError('SERVICE_UNAVAILABLE')
    const recovery = getErrorRecoveryAction(error)

    expect(recovery.canRetry).toBe(true)
    expect(recovery.retryDelay).toBe(10000)
    expect(recovery.action).toBe('서비스 복구 대기')
  })

  it('should return default recovery action for unknown retryable error', () => {
    // Create a custom retryable error by manipulating the error object
    const error = createError('DB_CONNECTION_ERROR')
    const recovery = getErrorRecoveryAction(error)

    expect(recovery.canRetry).toBe(true)
    expect(recovery.retryDelay).toBe(1000)
    expect(recovery.action).toBe('다시 시도')
  })

  it('should handle edge cases with error code matching', () => {
    // Test that exact error code matching works
    const codes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR', 
      'RATE_LIMIT_EXCEEDED',
      'SERVICE_UNAVAILABLE'
    ]

    codes.forEach(code => {
      const error = createError(code as keyof typeof ERROR_CODES)
      const recovery = getErrorRecoveryAction(error)
      expect(recovery.canRetry).toBe(true)
      expect(recovery.retryDelay).toBeGreaterThan(0)
      expect(recovery.action).toBeDefined()
    })
  })
})

describe('Error messages validation', () => {
  it('should have Korean user messages for all error codes', () => {
    const koreanRegex = /[가-힣]/
    
    Object.values(ERROR_CODES).forEach(code => {
      const error = createError(code)
      expect(error.userMessage).toMatch(koreanRegex)
    })
  })

  it('should have consistent retryable settings', () => {
    // Network-related errors should be retryable
    const retryableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR', 
      'OFFLINE_ERROR',
      'DB_CONNECTION_ERROR',
      'DB_QUERY_ERROR',
      'RATE_LIMIT_EXCEEDED',
      'SERVICE_UNAVAILABLE'
    ]

    retryableErrors.forEach(code => {
      const error = createError(code as keyof typeof ERROR_CODES)
      expect(error.retryable).toBe(true)
    })

    // Auth and validation errors should not be retryable
    const nonRetryableErrors = [
      'AUTH_INVALID_CREDENTIALS',
      'AUTH_EMAIL_NOT_CONFIRMED', 
      'AUTH_WEAK_PASSWORD',
      'AUTH_EMAIL_EXISTS',
      'AUTH_INVALID_EMAIL',
      'AUTH_UNAUTHORIZED',
      'VALIDATION_ERROR',
      'RECORD_NOT_FOUND',
      'INTERNAL_ERROR'
    ]

    nonRetryableErrors.forEach(code => {
      const error = createError(code as keyof typeof ERROR_CODES)
      expect(error.retryable).toBe(false)
    })
  })
})

describe('Integration scenarios', () => {
  it('should handle complex error mapping and recovery flow', () => {
    // Simulate a network error from Supabase
    const supabaseNetworkError = {
      message: 'Failed to fetch from database',
      code: 'NETWORK_ERROR',
      details: 'Connection timeout'
    }

    const mappedError = mapSupabaseError(supabaseNetworkError)
    expect(mappedError.code).toBe('NETWORK_ERROR')

    const recovery = getErrorRecoveryAction(mappedError)
    expect(recovery.canRetry).toBe(true)
    expect(recovery.retryDelay).toBe(2000)

    // Should log in development
    logError(mappedError, 'Database connection test')
    expect(mockConsole.error).toHaveBeenCalled()
  })

  it('should handle error chain with context preservation', () => {
    const originalError = new Error('Connection refused')
    const context = { endpoint: '/api/coffee-records', userId: 'user123' }
    
    const cupnoteError = createError('NETWORK_ERROR', context, originalError)
    
    expect(cupnoteError.message).toBe('Connection refused')
    expect(cupnoteError.context).toEqual({
      ...context,
      originalError: 'Connection refused'
    })

    const networkMappedError = mapNetworkError(cupnoteError)
    expect(networkMappedError.context).toEqual({ networkError: cupnoteError })
  })
})