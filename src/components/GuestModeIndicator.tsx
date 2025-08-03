import React from 'react'

import Link from 'next/link'

import { UserX, LogIn, AlertCircle } from 'lucide-react'

interface GuestModeIndicatorProps {
  variant?: 'banner' | 'inline' | 'card' | 'minimal'
  className?: string
  onLoginClick?: () => void
}

export default function GuestModeIndicator({ 
  variant = 'banner', 
  className = '',
  onLoginClick
}: GuestModeIndicatorProps) {
  
  const handleLoginClick = (e: React.MouseEvent) => {
    if (onLoginClick) {
      e.preventDefault()
      onLoginClick()
    }
  }

  switch (variant) {
    case 'banner':
      return (
        <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 ${className}`}>
          <div className="flex items-start space-x-3">
            <UserX className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 mb-1">
                게스트 모드로 사용 중입니다
              </p>
              <p className="text-xs text-amber-700 mb-2">
                로그인하면 모든 기록이 안전하게 저장되고 다른 기기에서도 접근할 수 있어요.
              </p>
              {onLoginClick ? (
                <button
                  onClick={handleLoginClick}
                  className="inline-flex items-center space-x-1 text-xs font-medium text-amber-700 hover:text-amber-800"
                >
                  <LogIn className="h-3 w-3" />
                  <span>지금 로그인하기</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1 text-xs font-medium text-amber-700 hover:text-amber-800"
                >
                  <LogIn className="h-3 w-3" />
                  <span>지금 로그인하기</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )

    case 'inline':
      return (
        <div className={`inline-flex items-center space-x-2 text-amber-600 ${className}`}>
          <UserX className="h-4 w-4" />
          <span className="text-sm font-medium">게스트 모드</span>
          <span className="text-xs text-amber-500">(로컬 저장)</span>
        </div>
      )

    case 'card':
      return (
        <div className={`bg-white rounded-xl shadow-sm border border-amber-200 p-6 ${className}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <UserX className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 text-center mb-2">
            게스트 모드
          </h3>
          <p className="text-sm text-neutral-600 text-center mb-4">
            현재 게스트로 사용 중입니다.
            로그인하여 더 많은 기능을 사용해보세요!
          </p>
          <div className="space-y-2 text-left">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-neutral-600">
                게스트 모드에서는 기록이 이 기기에만 저장됩니다
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-neutral-600">
                브라우저 데이터를 삭제하면 기록이 사라질 수 있어요
              </p>
            </div>
          </div>
          {onLoginClick ? (
            <button
              onClick={handleLoginClick}
              className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>로그인하기</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="block w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              로그인하기
            </Link>
          )}
        </div>
      )

    case 'minimal':
      return (
        <div className={`flex items-center space-x-1.5 text-amber-600 ${className}`}>
          <UserX className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">게스트</span>
        </div>
      )

    default:
      return null
  }
}

// Navigation bar guest indicator
export function NavigationGuestIndicator({ onLoginClick }: { onLoginClick?: () => void }) {
  return (
    <div className="flex items-center space-x-3 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
      <UserX className="h-4 w-4 text-amber-600" />
      <span className="text-sm font-medium text-amber-700">게스트</span>
      {onLoginClick && (
        <>
          <span className="text-amber-300">|</span>
          <button
            onClick={onLoginClick}
            className="text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            로그인
          </button>
        </>
      )}
    </div>
  )
}