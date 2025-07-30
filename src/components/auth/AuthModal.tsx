'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        // 비밀번호 확인
        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.')
          return
        }

        // 비밀번호 길이 확인
        if (formData.password.length < 6) {
          setError('비밀번호는 최소 6자 이상이어야 합니다.')
          return
        }

        // 사용자명 확인
        if (formData.username.trim().length < 2) {
          setError('사용자명은 최소 2자 이상이어야 합니다.')
          return
        }

        await signUp(formData.email, formData.password, formData.username)

        // 회원가입 성공 메시지
        alert('회원가입이 완료되었습니다!')
      } else {
        await signIn(formData.email, formData.password)
      }

      // 성공 시 모달 닫기 및 콜백 실행
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Auth error:', error)

      // 에러 메시지 한국어화
      const errorMessage = error.message || '오류가 발생했습니다.'
      if (errorMessage.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 잘못되었습니다.')
      } else if (errorMessage.includes('User already registered')) {
        setError('이미 등록된 이메일입니다.')
      } else if (errorMessage.includes('Invalid email')) {
        setError('올바른 이메일 형식을 입력해주세요.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('') // 입력 시 에러 메시지 초기화
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: '',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'login'
              ? 'CupNote에 다시 오신 것을 환영합니다'
              : 'CupNote와 함께 커피 여정을 시작하세요'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Username (회원가입 시에만) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">사용자명</label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="사용자명을 입력하세요"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (회원가입 시에만) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? '처리중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>

          {/* Toggle Mode */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                type="button"
                onClick={toggleMode}
                className="text-amber-600 hover:text-amber-700 font-medium ml-1"
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
