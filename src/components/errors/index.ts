/**
 * Error Boundaries Index
 * 
 * Centralized exports for all error boundary components
 * 세분화된 에러 처리를 위한 전용 Error Boundary 컴포넌트들
 */

export { ErrorBoundary } from './ErrorBoundary'
export { default as AsyncErrorBoundary } from './AsyncErrorBoundary'
export { default as FormErrorBoundary } from './FormErrorBoundary'
export { default as DataErrorBoundary } from './DataErrorBoundary'

// Error Boundary 타입들
export interface ErrorBoundaryConfig {
  level: 'page' | 'component' | 'widget'
  dataType?: string
  maxRetries?: number
  fallbackUI?: 'minimal' | 'detailed' | 'custom'
}

// 에러 경계 래퍼 유틸리티
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  config: ErrorBoundaryConfig
) {
  const WrappedComponent = (props: P) => {
    const { level, dataType } = config

    if (level === 'page') {
      return (
        <ErrorBoundary>
          <Component {...props} />
        </ErrorBoundary>
      )
    }

    if (dataType) {
      return (
        <DataErrorBoundary dataType={dataType}>
          <Component {...props} />
        </DataErrorBoundary>
      )
    }

    return (
      <AsyncErrorBoundary level={level}>
        <Component {...props} />
      </AsyncErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}