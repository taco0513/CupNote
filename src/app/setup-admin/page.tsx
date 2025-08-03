/**
 * 관리자 계정 설정 페이지
 * 최초 관리자 계정을 생성하기 위한 설정 페이지
 */
'use client'

import { useState } from 'react'

import { Shield, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import UnifiedButton from '../../components/ui/UnifiedButton'
import { supabase } from '../../lib/supabase'

interface AdminSetupForm {
  email: string
  password: string
  confirmPassword: string
  name: string
}

export default function SetupAdminPage() {
  const [form, setForm] = useState<AdminSetupForm>({
    email: 'admin@mycupnote.com',
    password: '',
    confirmPassword: '',
    name: 'CupNote Administrator'
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!form.email || !form.password || !form.confirmPassword || !form.name) {
      return '모든 필드를 입력해주세요'
    }
    
    if (form.password !== form.confirmPassword) {
      return '비밀번호가 일치하지 않습니다'
    }
    
    if (form.password.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다'
    }
    
    if (!form.email.endsWith('@mycupnote.com')) {
      return '관리자 이메일은 @mycupnote.com 도메인이어야 합니다'
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
    
    try {
      // 1. Check if admin already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const adminExists = existingUsers?.users.some(user => 
        user.email === form.email
      )
      
      if (adminExists) {
        setError('관리자 계정이 이미 존재합니다')
        setIsLoading(false)
        return
      }
      
      // 2. Create admin account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            role: 'admin',
            name: form.name,
            created_by: 'setup_page'
          }
        }
      })
      
      if (authError) {
        setError(`계정 생성 실패: ${authError.message}`)
        setIsLoading(false)
        return
      }
      
      setSuccess(true)
      
    } catch (error) {
      console.error('Admin setup error:', error)
      setError('계정 생성 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('')
    
    setForm(prev => ({
      ...prev,
      password: shuffled,
      confirmPassword: shuffled
    }))
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-coffee-800">관리자 계정 생성 완료!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-coffee-600">
              관리자 계정이 성공적으로 생성되었습니다.
            </p>
            
            <div className="bg-coffee-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold text-coffee-800 mb-2">계정 정보:</h4>
              <p className="text-sm text-coffee-600 mb-1">📧 이메일: {form.email}</p>
              <p className="text-sm text-coffee-600 mb-1">👤 이름: {form.name}</p>
              <p className="text-sm text-coffee-600">🛡️ 권한: 관리자</p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                중요 안내
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 이메일 인증을 완료해주세요</li>
                <li>• 첫 로그인 후 비밀번호를 변경하세요</li>
                <li>• 2FA 설정을 권장합니다</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3">
              <UnifiedButton 
                variant="primary"
                className="w-full"
                onClick={() => window.location.href = '/auth'}
              >
                로그인하기
              </UnifiedButton>
              
              <UnifiedButton 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/admin'}
              >
                관리자 대시보드로 이동
              </UnifiedButton>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-coffee-600" />
          </div>
          <CardTitle className="text-coffee-800">관리자 계정 설정</CardTitle>
          <p className="text-coffee-600 text-sm">
            CupNote 관리자 계정을 생성합니다
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                관리자 이메일
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="admin@mycupnote.com"
                required
              />
            </div>
            
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                관리자 이름
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="CupNote Administrator"
                required
              />
            </div>
            
            {/* 비밀번호 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-coffee-700">
                  비밀번호
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-xs text-coffee-500 hover:text-coffee-700"
                >
                  안전한 비밀번호 생성
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 pr-10"
                  placeholder="최소 8자 이상"
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
            
            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                비밀번호 확인
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
            
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {/* 제출 버튼 */}
            <UnifiedButton
              type="submit"
              variant="primary"
              size="large"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '생성 중...' : '관리자 계정 생성'}
            </UnifiedButton>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-coffee-500">
              이미 관리자 계정이 있으신가요?{' '}
              <a href="/auth" className="text-coffee-600 hover:text-coffee-800">
                로그인하기
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}