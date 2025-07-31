'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthService } from '@/lib/supabase-service'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>(
    'checking'
  )
  const [error, setError] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('achievement_definitions')
          .select('count')
          .limit(1)

        if (error) {
          setError(error.message)
          setConnectionStatus('error')
        } else {
          setConnectionStatus('connected')
        }
      } catch (err: any) {
        setError(err.message || '연결 실패')
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [])

  const testSignup = async () => {
    setLoading(true)
    try {
      // 테스트 계정으로 회원가입 시도 (직접 supabase 호출)
      const testEmail = `test${Date.now()}@example.com`
      const testPassword = 'test123456'

      console.log('Testing direct signup with:', { testEmail })

      // 직접 supabase auth 호출 (프로필 생성 없이)
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      console.log('Direct signup result:', { data, error })

      if (error) {
        throw error
      }

      setResult({
        type: 'success',
        message: `직접 가입 성공! User ID: ${data.user?.id}`,
        data,
      })
    } catch (error: any) {
      console.error('Direct signup test error:', error)
      setResult({
        type: 'error',
        message: `직접 가입 실패: ${error.message}`,
        error,
      })
    } finally {
      setLoading(false)
    }
  }

  const testSimpleSignup = async () => {
    setLoading(true)
    try {
      // AuthService를 통한 회원가입 (기존 방식)
      const testEmail = `test${Date.now()}@example.com`
      const testPassword = 'test123456'
      const testUsername = 'testuser'

      console.log('Testing AuthService signup with:', { testEmail, testUsername })

      const result = await AuthService.signUp(testEmail, testPassword, testUsername)
      console.log('AuthService signup result:', result)

      setResult({
        type: 'success',
        message: `AuthService 가입 성공! User ID: ${result.user?.id}`,
        data: result,
      })
    } catch (error: any) {
      console.error('AuthService signup test error:', error)
      setResult({
        type: 'error',
        message: `AuthService 가입 실패: ${error.message}`,
        error,
      })
    } finally {
      setLoading(false)
    }
  }

  const testAuthState = async () => {
    setLoading(true)
    try {
      const user = await supabase.auth.getUser()
      console.log('Current auth state:', user)

      setResult({
        type: 'info',
        message: `현재 인증 상태: ${user.data.user ? '로그인됨' : '비로그인'}`,
        data: user.data,
      })
    } catch (error: any) {
      setResult({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseSettings = async () => {
    setLoading(true)
    try {
      // Test 1: Check table access
      console.log('Testing table access...')
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      console.log('Profile table test:', { profiles, profileError })

      // Test 2: Try to create auth user directly with minimal data
      console.log('Testing minimal auth...')
      const testEmail = `minimal${Date.now()}@test.com`
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123',
        options: {
          emailRedirectTo: undefined,
          data: {},
        },
      })

      console.log('Minimal auth test:', { authData, authError })

      setResult({
        type: authError ? 'error' : 'success',
        message: authError ? `인증 실패: ${authError.message}` : '테스트 성공!',
        data: { profiles, profileError, authData, authError },
      })
    } catch (error: any) {
      console.error('Settings test error:', error)
      setResult({
        type: 'error',
        message: `설정 테스트 실패: ${error.message}`,
        error,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🔧 Supabase 연결 & 인증 테스트</h3>

      {/* 연결 상태 */}
      <div className="mb-4">
        {connectionStatus === 'checking' && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
            <span>연결 확인 중...</span>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            <span>✅ 연결 성공!</span>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="text-red-600">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span>❌ 연결 실패</span>
            </div>
            <p className="text-sm bg-red-50 p-2 rounded">{error}</p>
          </div>
        )}
      </div>

      {/* 테스트 버튼들 */}
      {connectionStatus === 'connected' && (
        <div className="space-x-2 mb-4">
          <button
            onClick={testSignup}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            직접 가입
          </button>

          <button
            onClick={testSimpleSignup}
            disabled={loading}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            AuthService 가입
          </button>

          <button
            onClick={testAuthState}
            disabled={loading}
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            인증 상태
          </button>

          <button
            onClick={testSupabaseSettings}
            disabled={loading}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            심화 진단
          </button>
        </div>
      )}

      {loading && <p className="text-blue-600">테스트 중...</p>}

      {result && (
        <div
          className={`mt-4 p-3 rounded ${
            result.type === 'success'
              ? 'bg-green-100 text-green-800'
              : result.type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          <p className="font-medium">{result.message}</p>
          {result.data && (
            <pre className="mt-2 text-xs overflow-auto max-h-32">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
          {result.error && (
            <pre className="mt-2 text-xs overflow-auto max-h-32">
              {JSON.stringify(result.error, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
