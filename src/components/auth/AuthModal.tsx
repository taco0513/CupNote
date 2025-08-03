'use client'

import { useState, useEffect } from 'react'

import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import { mapSupabaseError, logError } from '../../lib/error-handler'
import Alert from '../ui/Alert'
import UnifiedButton from '../ui/UnifiedButton'
import UnifiedInput from '../ui/UnifiedInput'
import UnifiedModal from '../ui/UnifiedModal'

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
  const { success, error: showError } = useNotification()
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

  // initialMode가 변경될 때마다 mode 업데이트
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError('')
      setFormData({
        email: '',
        password: '',
        username: '',
        confirmPassword: '',
      })
    }
  }, [isOpen, initialMode])

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

        // 회원가입 성공 알림
        success('회원가입 완료', '환영합니다! 로그인되었습니다.')
      } else {
        await signIn(formData.email, formData.password)
        success('로그인 성공', `안녕하세요! 다시 만나서 반가워요.`)
      }

      // 성공 시 모달 닫기 및 콜백 실행
      onSuccess()
      onClose()
    } catch (error: unknown) {
      // 개선된 에러 처리
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'AuthModal')

      // 사용자에게 에러 표시
      setError(mappedError.userMessage)
      showError('인증 오류', mappedError.userMessage)
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
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? '로그인' : '회원가입'}
      size="small"
    >
      <div className="mb-4">
        <p className="text-coffee-600">
          {mode === 'login'
            ? 'CupNote에 다시 오신 것을 환영합니다'
            : 'CupNote와 함께 커피 여정을 시작하세요'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Username (회원가입 시에만) */}
        {mode === 'signup' && (
          <UnifiedInput
            label="사용자명"
            icon={<User size={20} />}
            value={formData.username}
            onChange={e => handleInputChange('username', e.target.value)}
            placeholder="사용자명을 입력하세요"
            required
            fullWidth
          />
        )}

        {/* Email */}
        <UnifiedInput
          label="이메일"
          icon={<Mail size={20} />}
          type="email"
          value={formData.email}
          onChange={e => handleInputChange('email', e.target.value)}
          placeholder="이메일을 입력하세요"
          required
          fullWidth
        />

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">비밀번호</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-coffee-400">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              className="block w-full pl-10 pr-10 px-3 py-2 bg-white/80 backdrop-blur-sm border border-coffee-200/50 rounded-xl text-coffee-900 placeholder-coffee-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-coffee-500 focus:border-coffee-500 shadow-sm focus:shadow-md transition-all duration-200"
              placeholder="비밀번호를 입력하세요"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-coffee-400 hover:text-coffee-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password (회원가입 시에만) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1">비밀번호 확인</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-coffee-400">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                className="block w-full pl-10 pr-10 px-3 py-2 bg-white/80 backdrop-blur-sm border border-coffee-200/50 rounded-xl text-coffee-900 placeholder-coffee-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-coffee-500 focus:border-coffee-500 shadow-sm focus:shadow-md transition-all duration-200"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-coffee-400 hover:text-coffee-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <UnifiedButton
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
        >
          {mode === 'login' ? '로그인' : '회원가입'}
        </UnifiedButton>

        {/* Toggle Mode */}
        <div className="text-center pt-4 border-t border-coffee-100/50">
          <p className="text-coffee-600">
            {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button
              type="button"
              onClick={toggleMode}
              className="text-coffee-500 hover:text-coffee-600 font-medium ml-1 transition-colors"
            >
              {mode === 'login' ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>
      </form>
    </UnifiedModal>
  )
}
