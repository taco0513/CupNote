/**
 * 통합 인증 페이지 - 로그인/회원가입
 */
'use client'

import { useState, useEffect, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Coffee, Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, LogOut } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import UnifiedButton from '../../components/ui/UnifiedButton'
import { useAuth } from '../../contexts/AuthContext'
import { logger } from '../../lib/logger'
import { supabase } from '../../lib/supabase'
import { AuthService } from '../../lib/supabase-service'

type AuthMode = 'login' | 'signup' | 'reset'

interface AuthForm {
  email: string
  password: string
  name: string
  confirmPassword: string
}

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signIn, signUp, logout } = useAuth()
  
  const [mode, setMode] = useState<AuthMode>('login')
  const [form, setForm] = useState<AuthForm>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // URL에서 모드 확인
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'signup') {
      setMode('signup')
    }
  }, [searchParams])

  // 로그인된 사용자 리다이렉트 (강제 접근 시 제외)
  useEffect(() => {
    if (user && !searchParams.get('force')) {
      const redirect = searchParams.get('redirect') || '/'
      router.push(redirect)
    }
  }, [user, router, searchParams])

  const validateForm = () => {
    if (!form.email) {
      return '이메일을 입력해주세요'
    }
    
    if (mode === 'reset') {
      // 비밀번호 재설정 모드에서는 이메일만 필요
      return null
    }
    
    if (!form.password) {
      return '비밀번호를 입력해주세요'
    }
    
    if (mode === 'signup') {
      if (!form.name) {
        return '이름을 입력해주세요'
      }
      
      if (form.password !== form.confirmPassword) {
        return '비밀번호가 일치하지 않습니다'
      }
      
      if (form.password.length < 6) {
        return '비밀번호는 최소 6자 이상이어야 합니다'
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setIsLoading(true)
    setError('')
    setMessage('')
    
    try {
      if (mode === 'reset') {
        await AuthService.resetPassword(form.email)
        setMessage('비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.')
        setTimeout(() => {
          setMode('login')
          setMessage('')
        }, 5000)
      } else if (mode === 'login') {
        const result = await signIn(form.email, form.password)
        
        if (result.error) {
          setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
        } else {
          logger.info('User logged in successfully', { email: form.email })
          
          // 관리자 계정인지 확인
          const isAdmin = form.email === 'admin@mycupnote.com' || 
                         form.email.endsWith('@mycupnote.com')
          
          if (isAdmin) {
            router.push('/admin')
          } else {
            router.push('/')
          }
        }
      } else {
        const result = await signUp(form.email, form.password, {
          name: form.name
        })
        
        if (result.error) {
          if (result.error.message.includes('already registered')) {
            setError('이미 가입된 이메일입니다. 로그인을 시도해주세요.')
          } else {
            setError('회원가입에 실패했습니다. 다시 시도해주세요.')
          }
        } else {
          setMessage('회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.')
          logger.info('User signed up successfully', { email: form.email })
        }
      }
    } catch (error) {
      logger.error('Auth error', { error, mode })
      setError('인증 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (newMode?: AuthMode) => {
    if (newMode) {
      setMode(newMode)
    } else {
      setMode(mode === 'login' ? 'signup' : 'login')
    }
    setError('')
    setMessage('')
    setForm({
      email: form.email, // 이메일은 유지
      password: '',
      name: '',
      confirmPassword: ''
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      setMessage('로그아웃되었습니다.')
    } catch (error) {
      setError('로그아웃 중 오류가 발생했습니다.')
    }
  }

  // 이미 로그인된 사용자 처리
  if (user && !searchParams.get('force')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-coffee-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-coffee-800">CupNote</h1>
            <p className="text-coffee-600 text-sm">이미 로그인되어 있습니다</p>
          </div>

          <Card className="shadow-xl border-coffee-100">
            <CardHeader className="text-center">
              <CardTitle className="text-coffee-800">
                로그인됨
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-coffee-400 to-coffee-500 rounded-full flex items-center justify-center shadow-sm">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-coffee-800">{user.username}</p>
                    <p className="text-xs text-coffee-600">{user.email}</p>
                  </div>
                </div>
                
                {/* 에러/성공 메시지 */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                
                {message && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 text-sm">{message}</p>
                  </div>
                )}
                
                {/* 로그아웃 버튼 */}
                <UnifiedButton
                  onClick={handleLogout}
                  variant="secondary"
                  size="large"
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>로그아웃</span>
                  </div>
                </UnifiedButton>
                
                {/* 홈으로 돌아가기 */}
                <button
                  onClick={() => router.push('/')}
                  className="text-coffee-500 hover:text-coffee-700 font-medium text-sm transition-colors"
                >
                  ← 홈으로 돌아가기
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-coffee-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Coffee className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-coffee-800">CupNote</h1>
          <p className="text-coffee-600 text-sm">
            {mode === 'login' ? '커피 기록 여정을 계속하세요' : 
             mode === 'signup' ? '커피 기록 여정을 시작하세요' :
             '비밀번호를 재설정하세요'}
          </p>
        </div>

        <Card className="shadow-xl border-coffee-100">
          <CardHeader className="text-center">
            <CardTitle className="text-coffee-800">
              {mode === 'login' ? '로그인' : 
               mode === 'signup' ? '회원가입' : 
               '비밀번호 재설정'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 회원가입시 이름 */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-2">
                    이름
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                      placeholder="이름을 입력하세요"
                      required={mode === 'signup'}
                    />
                  </div>
                </div>
              )}
              
              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                    placeholder="이메일을 입력하세요"
                    data-testid="email-input"
                    required
                  />
                </div>
              </div>
              
              {/* 비밀번호 - 재설정 모드에서는 숨김 */}
              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-2">
                    비밀번호
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-10 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                      placeholder={mode === 'signup' ? '최소 6자 이상' : '비밀번호를 입력하세요'}
                      data-testid="password-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-400 hover:text-coffee-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              
              {/* 회원가입시 비밀번호 확인 */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-2">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                      placeholder="비밀번호를 다시 입력하세요"
                      required={mode === 'signup'}
                    />
                  </div>
                </div>
              )}
              
              {/* 에러/성공 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm">{message}</p>
                </div>
              )}
              
              {/* 제출 버튼 */}
              <UnifiedButton
                type="submit"
                variant="primary"
                size="large"
                disabled={isLoading}
                className="w-full bg-coffee-500 hover:bg-coffee-600"
                data-testid="auth-submit-button"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{mode === 'login' ? '로그인 중...' : mode === 'signup' ? '가입 중...' : '전송 중...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>{mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '이메일 보내기'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </UnifiedButton>
            </form>
            
            {/* 모드 전환 */}
            <div className="mt-6 text-center">
              {mode === 'reset' ? (
                <>
                  <p className="text-coffee-600 text-sm">비밀번호가 기억나셨나요?</p>
                  <button
                    onClick={() => switchMode('login')}
                    className="text-coffee-500 hover:text-coffee-700 font-medium text-sm mt-1 transition-colors"
                  >
                    로그인으로 돌아가기
                  </button>
                </>
              ) : (
                <>
                  <p className="text-coffee-600 text-sm">
                    {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                  </p>
                  <button
                    onClick={() => switchMode()}
                    className="text-coffee-500 hover:text-coffee-700 font-medium text-sm mt-1 transition-colors"
                  >
                    {mode === 'login' ? '회원가입하기' : '로그인하기'}
                  </button>
                  
                  {mode === 'login' && (
                    <div className="mt-3">
                      <button
                        onClick={() => switchMode('reset')}
                        className="text-coffee-400 hover:text-coffee-600 text-sm transition-colors"
                      >
                        비밀번호를 잊으셨나요?
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* 홈으로 돌아가기 */}
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-coffee-400 hover:text-coffee-600 text-sm transition-colors"
              >
                ← 홈으로 돌아가기
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* 관리자 계정 안내 */}
        <div className="mt-6 text-center">
          <p className="text-coffee-500 text-xs">
            관리자 계정을 생성하려면{' '}
            <a href="/setup-admin" className="text-coffee-600 hover:text-coffee-800 underline">
              관리자 설정
            </a>
            을 이용하세요
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}