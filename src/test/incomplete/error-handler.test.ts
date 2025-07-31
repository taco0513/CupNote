import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createError, formatError, ErrorType } from '../error-handler'

describe('error-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('createError', () => {
    it('should create validation error with correct properties', () => {
      const error = createError(
        ErrorType.VALIDATION,
        'Invalid input',
        'INVALID_COFFEE_NAME',
        { field: 'coffeeName' }
      )

      expect(error).toMatchObject({
        type: ErrorType.VALIDATION,
        message: 'Invalid input',
        code: 'INVALID_COFFEE_NAME',
        context: { field: 'coffeeName' },
        timestamp: expect.any(Date),
      })
    })

    it('should create authentication error', () => {
      const error = createError(
        ErrorType.AUTHENTICATION,
        'User not authenticated',
        'AUTH_REQUIRED'
      )

      expect(error.type).toBe(ErrorType.AUTHENTICATION)
      expect(error.message).toBe('User not authenticated')
      expect(error.code).toBe('AUTH_REQUIRED')
    })

    it('should create network error with context', () => {
      const error = createError(
        ErrorType.NETWORK,
        'Failed to connect',
        'CONNECTION_FAILED',
        { url: 'https://api.example.com', status: 500 }
      )

      expect(error.type).toBe(ErrorType.NETWORK)
      expect(error.context).toEqual({ url: 'https://api.example.com', status: 500 })
    })

    it('should create storage error', () => {
      const error = createError(
        ErrorType.STORAGE,
        'Failed to save record',
        'STORAGE_WRITE_FAILED'
      )

      expect(error.type).toBe(ErrorType.STORAGE)
      expect(error.message).toBe('Failed to save record')
    })

    it('should create unknown error', () => {
      const error = createError(
        ErrorType.UNKNOWN,
        'Something went wrong',
        'UNKNOWN_ERROR'
      )

      expect(error.type).toBe(ErrorType.UNKNOWN)
      expect(error.message).toBe('Something went wrong')
    })

    it('should create error without context', () => {
      const error = createError(
        ErrorType.VALIDATION,
        'Simple validation error',
        'SIMPLE_ERROR'
      )

      expect(error.context).toBeUndefined()
    })
  })

  describe('formatError', () => {
    it('should format validation error with user-friendly message', () => {
      const error = createError(
        ErrorType.VALIDATION,
        'Coffee name is required',
        'COFFEE_NAME_REQUIRED',
        { field: 'coffeeName' }
      )

      const formatted = formatError(error)

      expect(formatted).toMatchObject({
        title: '입력 오류',
        message: 'Coffee name is required',
        severity: 'error',
        code: 'COFFEE_NAME_REQUIRED',
        context: { field: 'coffeeName' },
      })
    })

    it('should format authentication error', () => {
      const error = createError(
        ErrorType.AUTHENTICATION,
        'Please log in',
        'LOGIN_REQUIRED'
      )

      const formatted = formatError(error)

      expect(formatted).toMatchObject({
        title: '인증 오류',
        message: 'Please log in',
        severity: 'error',
        code: 'LOGIN_REQUIRED',
      })
    })

    it('should format network error with warning severity', () => {
      const error = createError(
        ErrorType.NETWORK,
        'Connection timeout',
        'TIMEOUT',
        { retryCount: 3 }
      )

      const formatted = formatError(error)

      expect(formatted).toMatchObject({
        title: '네트워크 오류',
        message: 'Connection timeout',
        severity: 'warning',
        code: 'TIMEOUT',
        context: { retryCount: 3 },
      })
    })

    it('should format storage error', () => {
      const error = createError(
        ErrorType.STORAGE,
        'Quota exceeded',
        'QUOTA_EXCEEDED'
      )

      const formatted = formatError(error)

      expect(formatted).toMatchObject({
        title: '저장소 오류',
        message: 'Quota exceeded',
        severity: 'error',
        code: 'QUOTA_EXCEEDED',
      })
    })

    it('should format unknown error', () => {
      const error = createError(
        ErrorType.UNKNOWN,
        'Unexpected error occurred',
        'UNKNOWN'
      )

      const formatted = formatError(error)

      expect(formatted).toMatchObject({
        title: '알 수 없는 오류',
        message: 'Unexpected error occurred',
        severity: 'error',
        code: 'UNKNOWN',
      })
    })

    it('should handle error without context', () => {
      const error = createError(
        ErrorType.VALIDATION,
        'Simple error',
        'SIMPLE'
      )

      const formatted = formatError(error)

      expect(formatted.context).toBeUndefined()
    })

    it('should provide fallback for missing message', () => {
      const error = {
        type: ErrorType.VALIDATION,
        message: '',
        code: 'EMPTY_MESSAGE',
        timestamp: new Date(),
      }

      const formatted = formatError(error as any)

      expect(formatted.message).toBe('오류가 발생했습니다.')
    })
  })

  describe('error logging', () => {
    it('should log error when formatting', () => {
      const error = createError(
        ErrorType.VALIDATION,
        'Test error for logging',
        'LOG_TEST'
      )

      formatError(error)

      expect(console.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          type: ErrorType.VALIDATION,
          message: 'Test error for logging',
          code: 'LOG_TEST',
        })
      )
    })

    it('should log network errors as warnings', () => {
      const error = createError(
        ErrorType.NETWORK,
        'Network warning',
        'NETWORK_WARNING'
      )

      formatError(error)

      expect(console.warn).toHaveBeenCalledWith(
        'Network error occurred:',
        expect.objectContaining({
          type: ErrorType.NETWORK,
          message: 'Network warning',
        })
      )
    })
  })

  describe('error types coverage', () => {
    it('should have all error types defined', () => {
      expect(ErrorType.VALIDATION).toBe('VALIDATION')
      expect(ErrorType.AUTHENTICATION).toBe('AUTHENTICATION')
      expect(ErrorType.NETWORK).toBe('NETWORK')
      expect(ErrorType.STORAGE).toBe('STORAGE')
      expect(ErrorType.UNKNOWN).toBe('UNKNOWN')
    })

    it('should handle all error types in formatting', () => {
      const errorTypes = [
        ErrorType.VALIDATION,
        ErrorType.AUTHENTICATION,
        ErrorType.NETWORK,
        ErrorType.STORAGE,
        ErrorType.UNKNOWN,
      ]

      errorTypes.forEach(type => {
        const error = createError(type, `Test ${type}`, `${type}_TEST`)
        const formatted = formatError(error)
        expect(formatted.title).toBeTruthy()
        expect(formatted.severity).toMatch(/^(error|warning|info)$/)
      })
    })
  })
})