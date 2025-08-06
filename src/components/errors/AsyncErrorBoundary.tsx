'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { CupNoteError, logError } from '../../lib/error-handler'

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'widget'
}

interface AsyncErrorBoundaryState {
  hasError: boolean
  error?: Error | CupNoteError
  errorInfo?: ErrorInfo
  retryCount: number
}

/**
 * 비동기 작업에 특화된 Error Boundary
 * 네트워크 오류, API 호출 실패 등을 처리
 */
export class AsyncErrorBoundary extends Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: AsyncErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false, 
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error: Error): AsyncErrorBoundaryState {
    return {
      hasError: true,
      error,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // 에러 로깅 (중앙화된 error handler 사용)
    logError(error instanceof CupNoteError ? error : new Error(error.message), 
      `AsyncErrorBoundary (${this.props.level || 'component'})`)

    // 외부 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    const maxRetries = 3
    const retryDelays = [1000, 2000, 5000] // 1초, 2초, 5초

    if (this.state.retryCount < maxRetries) {
      const delay = retryDelays[this.state.retryCount] || 5000
      
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prevState => ({ 
          hasError: false, 
          error: undefined, 
          errorInfo: undefined,
          retryCount: prevState.retryCount + 1
        }))
      }, delay)

      // UI에 재시도 중임을 표시
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isNetworkError = this.state.error?.message?.includes('fetch') || 
                            this.state.error?.message?.includes('network')
      const canRetry = this.state.retryCount < 3

      return (
        <div className={`
          ${this.props.level === 'page' ? 'min-h-screen' : 'min-h-64'} 
          flex items-center justify-center p-4
        `}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              {isNetworkError ? '📡' : '⚠️'}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isNetworkError ? '연결 오류' : '처리 오류'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {isNetworkError 
                ? '네트워크 연결을 확인하고 다시 시도해주세요.'
                : '일시적인 오류가 발생했습니다.'
              }
            </p>

            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="w-full bg-coffee-600 text-white py-2 px-4 rounded-lg hover:bg-coffee-700 transition-colors"
              >
                다시 시도 ({3 - this.state.retryCount}회 남음)
              </button>
            )}

            {this.state.retryCount >= 3 && (
              <p className="text-sm text-gray-500 mt-4">
                문제가 지속되면 새로고침하거나 고객지원팀에 문의해주세요.
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AsyncErrorBoundary