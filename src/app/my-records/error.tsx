'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('My Records page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          기록을 불러오는 중 오류가 발생했습니다
        </h2>
        
        <p className="text-gray-600 mb-6">
          일시적인 문제일 수 있습니다. 다시 시도해주세요.
        </p>
        
        <button
          onClick={() => reset()}
          className="w-full px-6 py-3 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors font-medium"
        >
          다시 시도
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="w-full mt-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}