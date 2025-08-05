/**
 * Global Not Found UI for App Router
 * Displays when a route is not found
 */
'use client'

import Link from 'next/link'
import { Home, Search, Coffee } from 'lucide-react'

import UnifiedButton from '../components/ui/UnifiedButton'
import { Card, CardContent } from '../components/ui/Card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center p-4">
      <Card variant="default" className="max-w-md w-full bg-white/90 backdrop-blur-sm border border-coffee-200/50 shadow-lg">
        <CardContent className="p-8 text-center">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-8xl font-bold text-coffee-200 select-none">404</div>
            <Coffee className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-coffee-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-coffee-800 mb-4">
            페이지를 찾을 수 없어요
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            URL을 다시 확인하거나 홈에서 다시 시작해보세요.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <UnifiedButton
                variant="primary"
                size="large"
                className="w-full bg-gradient-to-r from-coffee-500 to-coffee-600 hover:from-coffee-600 hover:to-coffee-700"
              >
                <Home className="h-4 w-4 mr-2" />
                홈으로 돌아가기
              </UnifiedButton>
            </Link>

            <Link href="/my-records" className="block">
              <UnifiedButton
                variant="secondary"
                size="large"
                className="w-full border-coffee-300 hover:bg-coffee-50"
              >
                <Coffee className="h-4 w-4 mr-2" />
                내 기록 보기
              </UnifiedButton>
            </Link>

            <Link href="/search" className="block">
              <UnifiedButton
                variant="ghost"
                size="large"
                className="w-full text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50"
              >
                <Search className="h-4 w-4 mr-2" />
                검색하기
              </UnifiedButton>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            계정이나 기록에 문제가 있다면{' '}
            <Link href="/settings" className="text-coffee-600 hover:text-coffee-700 underline">
              설정
            </Link>
            에서 확인해보세요.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}