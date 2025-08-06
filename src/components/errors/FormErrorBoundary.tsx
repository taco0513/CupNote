'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface FormErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
}

interface FormErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * Form 전용 Error Boundary
 * 폼 검증 오류, 제출 오류 등을 처리
 */
export class FormErrorBoundary extends Component<FormErrorBoundaryProps, FormErrorBoundaryState> {
  constructor(props: FormErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    console.error('FormErrorBoundary caught an error:', error, errorInfo)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      const isValidationError = this.state.error?.message?.includes('validation') ||
                               this.state.error?.message?.includes('required')

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">
                {isValidationError ? '입력 오류' : '폼 처리 오류'}
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {isValidationError 
                  ? '입력한 정보를 다시 확인해주세요.'
                  : '폼 제출 중 오류가 발생했습니다. 다시 시도해주세요.'
                }
              </p>
              
              {/* 개발 모드에서 에러 상세 정보 */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer">
                    에러 상세 정보
                  </summary>
                  <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded">
                    {this.state.error?.message}
                  </pre>
                </details>
              )}

              <button
                onClick={this.handleReset}
                className="mt-3 inline-flex items-center text-sm text-red-800 hover:text-red-900 font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default FormErrorBoundary