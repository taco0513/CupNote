/**
 * Global Error UI for App Router
 * Handles errors in page components and shows recovery options
 */
'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import UnifiedButton from '../components/ui/UnifiedButton'
import { Card, CardContent } from '../components/ui/Card'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Router Error:', error)
    
    // Send to Sentry if available
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center p-4">
      <Card variant="default" className="max-w-md w-full bg-white/90 backdrop-blur-sm border border-red-200/50 shadow-lg">
        <CardContent className="p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            앗, 문제가 발생했어요
          </h1>

          {/* Error Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            예상치 못한 오류가 발생했습니다. 
            잠시 후 다시 시도하거나 홈으로 돌아가세요.
          </p>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                개발자 정보 (클릭하여 펼치기)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-700 break-all">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.digest && (
                  <div>
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <UnifiedButton
              variant="primary"
              size="large"
              onClick={reset}
              className="w-full bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </UnifiedButton>

            <Link href="/" className="block">
              <UnifiedButton
                variant="secondary"
                size="large"
                className="w-full border-coffee-300 hover:bg-coffee-50"
              >
                <Home className="h-4 w-4 mr-2" />
                홈으로 돌아가기
              </UnifiedButton>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            문제가 계속 발생한다면{' '}
            <a 
              href="mailto:support@mycupnote.com" 
              className="text-coffee-600 hover:text-coffee-700 underline"
            >
              지원팀에 문의
            </a>
            해주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}