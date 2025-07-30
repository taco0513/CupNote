import { ref } from 'vue'
import { useNotificationStore } from '../stores/notification'
import { useRouter } from 'vue-router'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  data?: any
}

export function useErrorHandler() {
  const notificationStore = useNotificationStore()
  const router = useRouter()
  
  const isHandlingError = ref(false)
  const lastError = ref<Error | null>(null)
  
  const handleError = async (error: Error | unknown, context?: ErrorContext) => {
    // Prevent recursive error handling
    if (isHandlingError.value) return
    
    isHandlingError.value = true
    
    try {
      // Convert unknown errors to Error objects
      const errorObj = error instanceof Error ? error : new Error(String(error))
      lastError.value = errorObj
      
      // Log error with context
      console.error('Error occurred:', {
        message: errorObj.message,
        stack: errorObj.stack,
        context,
        timestamp: new Date().toISOString()
      })
      
      // Categorize and handle different error types
      if (errorObj.message.includes('NetworkError') || errorObj.message.includes('fetch')) {
        handleNetworkError(errorObj, context)
      } else if (errorObj.message.includes('401') || errorObj.message.includes('Unauthorized')) {
        handleAuthError(errorObj, context)
      } else if (errorObj.message.includes('403') || errorObj.message.includes('Forbidden')) {
        handleForbiddenError(errorObj, context)
      } else if (errorObj.message.includes('404') || errorObj.message.includes('Not found')) {
        handleNotFoundError(errorObj, context)
      } else if (errorObj.message.includes('Supabase') || errorObj.message.includes('Database')) {
        handleDatabaseError(errorObj, context)
      } else if (errorObj.message.includes('Validation') || errorObj.message.includes('Invalid')) {
        handleValidationError(errorObj, context)
      } else {
        handleGenericError(errorObj, context)
      }
      
      // Report to error tracking service (if configured)
      if (import.meta.env.VITE_SENTRY_DSN) {
        // TODO: Integrate with Sentry or similar service
        // Sentry.captureException(errorObj, { extra: context })
      }
      
    } finally {
      isHandlingError.value = false
    }
  }
  
  const handleNetworkError = (error: Error, context?: ErrorContext) => {
    notificationStore.showNotification({
      type: 'error',
      title: '네트워크 연결 오류',
      message: '인터넷 연결을 확인해주세요. 문제가 계속되면 잠시 후 다시 시도해주세요.',
      duration: 5000
    })
  }
  
  const handleAuthError = (error: Error, context?: ErrorContext) => {
    notificationStore.showNotification({
      type: 'warning',
      title: '인증이 필요합니다',
      message: '다시 로그인해주세요.',
      duration: 5000
    })
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/auth/login')
    }, 1000)
  }
  
  const handleForbiddenError = (error: Error, context?: ErrorContext) => {
    notificationStore.showNotification({
      type: 'error',
      title: '접근 권한 없음',
      message: '이 작업을 수행할 권한이 없습니다.',
      duration: 5000
    })
  }
  
  const handleNotFoundError = (error: Error, context?: ErrorContext) => {
    notificationStore.showNotification({
      type: 'warning',
      title: '찾을 수 없음',
      message: '요청하신 내용을 찾을 수 없습니다.',
      duration: 5000
    })
  }
  
  const handleDatabaseError = (error: Error, context?: ErrorContext) => {
    notificationStore.showNotification({
      type: 'error',
      title: '데이터베이스 오류',
      message: '데이터 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      duration: 5000
    })
  }
  
  const handleValidationError = (error: Error, context?: ErrorContext) => {
    notificationStore.showNotification({
      type: 'warning',
      title: '입력 오류',
      message: error.message || '입력하신 정보를 다시 확인해주세요.',
      duration: 5000
    })
  }
  
  const handleGenericError = (error: Error, context?: ErrorContext) => {
    notificationStore.showNotification({
      type: 'error',
      title: '오류 발생',
      message: '예기치 않은 오류가 발생했습니다. 문제가 계속되면 고객센터에 문의해주세요.',
      duration: 5000
    })
  }
  
  // Async error wrapper
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> => {
    try {
      return await fn()
    } catch (error) {
      handleError(error, context)
      return null
    }
  }
  
  // Sync error wrapper
  const withSyncErrorHandling = <T>(
    fn: () => T,
    context?: ErrorContext
  ): T | null => {
    try {
      return fn()
    } catch (error) {
      handleError(error, context)
      return null
    }
  }
  
  return {
    handleError,
    withErrorHandling,
    withSyncErrorHandling,
    isHandlingError,
    lastError
  }
}