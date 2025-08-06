'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { Database, RefreshCw, AlertTriangle } from 'lucide-react'

interface DataErrorBoundaryProps {
  children: ReactNode
  dataType?: string // 'coffee-records', 'achievements', 'user-stats' 등
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRetry?: () => void
}

interface DataErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryAttempts: number
}

/**
 * 데이터 로딩 및 처리 전용 Error Boundary  
 * 데이터베이스 연결 오류, API 응답 오류 등을 처리
 */
export class DataErrorBoundary extends Component<DataErrorBoundaryProps, DataErrorBoundaryState> {
  constructor(props: DataErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false,
      retryAttempts: 0 
    }
  }

  static getDerivedStateFromError(error: Error): DataErrorBoundaryState {
    return {
      hasError: true,
      error,
      retryAttempts: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    console.error(`DataErrorBoundary (${this.props.dataType}) caught an error:`, error, errorInfo)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryAttempts: prevState.retryAttempts + 1
    }))

    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      const isDatabaseError = this.state.error?.message?.includes('database') ||
                             this.state.error?.message?.includes('connection')
      const isApiError = this.state.error?.message?.includes('API') ||
                        this.state.error?.message?.includes('fetch')
      
      return (
        <div className="min-h-32 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full text-center">
            <div className="mb-4">
              {isDatabaseError ? (
                <Database className="h-12 w-12 text-gray-400 mx-auto" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto" />
              )}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {this.props.dataType ? 
                `${this.props.dataType} 로딩 오류` : 
                '데이터 로딩 오류'
              }
            </h3>
            
            <p className="text-gray-600 mb-4">
              {isDatabaseError ? 
                '데이터베이스 연결에 문제가 있습니다.' :
                isApiError ?
                  'API 호출 중 오류가 발생했습니다.' :
                  '데이터를 불러오는 중 오류가 발생했습니다.'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                disabled={this.state.retryAttempts >= 3}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {this.state.retryAttempts >= 3 ? '재시도 불가' : '다시 시도'}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                새로고침
              </button>
            </div>

            {this.state.retryAttempts > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                재시도 횟수: {this.state.retryAttempts}/3
              </p>
            )}

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  개발자 정보
                </summary>
                <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-auto">
                  {this.state.error?.message}
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default DataErrorBoundary