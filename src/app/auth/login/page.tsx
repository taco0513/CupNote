/**
 * 로그인 페이지 - /auth/login
 */

import { Suspense } from 'react'

import AuthPage from '../page'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
      </div>
    }>
      <AuthPage />
    </Suspense>
  )
}