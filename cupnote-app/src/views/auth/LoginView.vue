<template>
  <div class="login-view">
    <div class="login-container">
      <!-- Header -->
      <header class="login-header">
        <RouterLink to="/" class="back-link">
          <span class="back-icon">←</span>
          홈으로
        </RouterLink>

        <div class="logo-section">
          <h1 class="logo">CupNote</h1>
          <p class="tagline">커피 테이스팅 노트</p>
        </div>
      </header>

      <!-- Auth Form -->
      <div class="auth-form-container">
        <div class="auth-tabs">
          <button :class="['tab-button', { active: mode === 'signin' }]" @click="mode = 'signin'">
            로그인
          </button>
          <button :class="['tab-button', { active: mode === 'signup' }]" @click="mode = 'signup'">
            회원가입
          </button>
        </div>

        <!-- Sign In Form -->
        <form v-if="mode === 'signin'" @submit.prevent="handleSignIn" class="auth-form">
          <h2 class="form-title">로그인</h2>
          <p class="form-subtitle">커피 여정을 계속해보세요</p>

          <div class="input-group">
            <label for="signin-email" class="input-label">이메일</label>
            <input
              id="signin-email"
              v-model="signInForm.email"
              type="email"
              class="input-field"
              placeholder="your@email.com"
              required
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="input-group">
            <label for="signin-password" class="input-label">비밀번호</label>
            <input
              id="signin-password"
              v-model="signInForm.password"
              type="password"
              class="input-field"
              placeholder="비밀번호를 입력하세요"
              required
              :disabled="authStore.isLoading"
            />
          </div>

          <button type="button" class="forgot-password-link" @click="showForgotPassword = true">
            비밀번호를 잊으셨나요?
          </button>

          <button
            type="submit"
            class="btn-primary"
            :disabled="authStore.isLoading || !isSignInFormValid"
          >
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            {{ authStore.isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <!-- Sign Up Form -->
        <form v-if="mode === 'signup'" @submit.prevent="handleSignUp" class="auth-form">
          <h2 class="form-title">회원가입</h2>
          <p class="form-subtitle">새로운 커피 여정을 시작하세요</p>

          <div class="input-group">
            <label for="signup-name" class="input-label">이름</label>
            <input
              id="signup-name"
              v-model="signUpForm.displayName"
              type="text"
              class="input-field"
              placeholder="표시될 이름을 입력하세요"
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="input-group">
            <label for="signup-email" class="input-label">이메일</label>
            <input
              id="signup-email"
              v-model="signUpForm.email"
              type="email"
              class="input-field"
              placeholder="your@email.com"
              required
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="input-group">
            <label for="signup-password" class="input-label">비밀번호</label>
            <input
              id="signup-password"
              v-model="signUpForm.password"
              type="password"
              class="input-field"
              placeholder="6자 이상의 비밀번호"
              required
              :disabled="authStore.isLoading"
            />
            <div class="password-strength">
              <div class="strength-bar" :class="passwordStrengthClass"></div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>

          <div class="input-group">
            <label for="signup-confirm" class="input-label">비밀번호 확인</label>
            <input
              id="signup-confirm"
              v-model="signUpForm.confirmPassword"
              type="password"
              class="input-field"
              placeholder="비밀번호를 다시 입력하세요"
              required
              :disabled="authStore.isLoading"
            />
            <div v-if="signUpForm.confirmPassword && !passwordsMatch" class="error-text">
              비밀번호가 일치하지 않습니다
            </div>
          </div>

          <button
            type="submit"
            class="btn-primary"
            :disabled="authStore.isLoading || !isSignUpFormValid"
          >
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            {{ authStore.isLoading ? '가입 중...' : '회원가입' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-text">또는</span>
        </div>

        <!-- Social Login -->
        <div class="social-login">
          <button
            type="button"
            class="btn-google"
            @click="handleGoogleSignIn"
            :disabled="authStore.isLoading"
          >
            <span class="google-icon">G</span>
            Google로 계속하기
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ authStore.error }}
        </div>

        <!-- Success Message for Sign Up -->
        <div v-if="showSignUpSuccess" class="success-message">
          <span class="success-icon">✅</span>
          회원가입이 완료되었습니다! 이메일을 확인해주세요.
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPassword" class="modal-overlay" @click="showForgotPassword = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">비밀번호 재설정</h3>
        <p class="modal-description">
          가입하신 이메일 주소를 입력하시면<br />
          비밀번호 재설정 링크를 보내드립니다.
        </p>

        <form @submit.prevent="handleForgotPassword">
          <div class="input-group">
            <label for="reset-email" class="input-label">이메일</label>
            <input
              id="reset-email"
              v-model="resetEmail"
              type="email"
              class="input-field"
              placeholder="your@email.com"
              required
              :disabled="authStore.isLoading"
            />
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn-secondary"
              @click="showForgotPassword = false"
              :disabled="authStore.isLoading"
            >
              취소
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="authStore.isLoading || !resetEmail"
            >
              {{ authStore.isLoading ? '전송 중...' : '전송' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const mode = ref('signin') // 'signin' | 'signup'
const showForgotPassword = ref(false)
const showSignUpSuccess = ref(false)
const resetEmail = ref('')

const signInForm = ref({
  email: '',
  password: '',
})

const signUpForm = ref({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// Computed
const isSignInFormValid = computed(() => {
  return signInForm.value.email && signInForm.value.password
})

const isSignUpFormValid = computed(() => {
  return signUpForm.value.email && signUpForm.value.password.length >= 6 && passwordsMatch.value
})

const passwordsMatch = computed(() => {
  return signUpForm.value.password === signUpForm.value.confirmPassword
})

const passwordStrength = computed(() => {
  const password = signUpForm.value.password
  let score = 0

  if (password.length >= 6) score += 1
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1

  return score
})

const passwordStrengthClass = computed(() => {
  const score = passwordStrength.value
  if (score <= 1) return 'weak'
  if (score <= 2) return 'medium'
  if (score <= 3) return 'strong'
  return 'very-strong'
})

const passwordStrengthText = computed(() => {
  const score = passwordStrength.value
  if (score === 0) return ''
  if (score <= 1) return '약함'
  if (score <= 2) return '보통'
  if (score <= 3) return '강함'
  return '매우 강함'
})

// Methods
const handleSignIn = async () => {
  try {
    await authStore.signIn(signInForm.value.email, signInForm.value.password)

    // Redirect to original destination or home
    const redirect = router.currentRoute.value.query.redirect as string | undefined
    router.push(redirect || '/')
  } catch (error) {
    // Error is handled by the store
    console.error('Sign in failed:', error)
  }
}

const handleSignUp = async () => {
  try {
    await authStore.signUp(
      signUpForm.value.email,
      signUpForm.value.password,
      signUpForm.value.displayName,
    )

    showSignUpSuccess.value = true

    // Switch to sign in mode after delay
    setTimeout(() => {
      mode.value = 'signin'
      showSignUpSuccess.value = false
      signInForm.value.email = signUpForm.value.email
    }, 3000)
  } catch (error) {
    console.error('Sign up failed:', error)
  }
}

const handleGoogleSignIn = async () => {
  try {
    await authStore.signInWithGoogle()
    // OAuth will redirect automatically
  } catch (error) {
    console.error('Google sign in failed:', error)
  }
}

const handleForgotPassword = async () => {
  try {
    await authStore.resetPassword(resetEmail.value)
    showForgotPassword.value = false
    resetEmail.value = ''

    // Show success message
    alert('비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.')
  } catch (error) {
    console.error('Password reset failed:', error)
  }
}

// Clear errors when switching modes
watch(mode, () => {
  authStore.clearError()
  showSignUpSuccess.value = false
})

// Clear errors when form changes
watch(
  [signInForm, signUpForm],
  () => {
    authStore.clearError()
  },
  { deep: true },
)
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

/* Header */
.login-header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #7c5842;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #5d3f2e;
}

.back-icon {
  font-size: 1.2rem;
}

.logo-section {
  text-align: center;
}

.logo {
  font-size: 2.5rem;
  font-weight: 900;
  color: #7c5842;
  margin: 0 0 0.25rem 0;
}

.tagline {
  color: #a0796a;
  margin: 0;
}

/* Auth Form */
.auth-form-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(124, 88, 66, 0.15);
  border: 1px solid #f0e8dc;
}

.auth-tabs {
  display: flex;
  background: #f8f4f0;
  border-radius: 12px;
  padding: 0.25rem;
  margin-bottom: 2rem;
}

.tab-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  color: #a0796a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  background: white;
  color: #7c5842;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(124, 88, 66, 0.1);
}

.auth-form {
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.5rem;
  text-align: center;
}

.form-subtitle {
  color: #a0796a;
  text-align: center;
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-weight: 500;
  color: #7c5842;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background: white;
}

.input-field:focus {
  outline: none;
  border-color: #7c5842;
  box-shadow: 0 0 0 3px rgba(124, 88, 66, 0.1);
}

.input-field:disabled {
  background: #f8f4f0;
  cursor: not-allowed;
}

.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e8d5c4;
  transition: all 0.3s ease;
}

.strength-bar.weak {
  background: #ef4444;
  width: 25%;
}

.strength-bar.medium {
  background: #f59e0b;
  width: 50%;
}

.strength-bar.strong {
  background: #10b981;
  width: 75%;
}

.strength-bar.very-strong {
  background: #059669;
  width: 100%;
}

.strength-text {
  font-size: 0.8rem;
  color: #666;
  min-width: 60px;
}

.forgot-password-link {
  background: none;
  border: none;
  color: #7c5842;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  margin-bottom: 1.5rem;
  display: block;
  width: fit-content;
}

.forgot-password-link:hover {
  color: #5d3f2e;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-google {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #7c5842, #a0796a);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #7c5842;
  border: 2px solid #e8d5c4;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #d4b896;
  background: #f8f4f0;
}

.btn-google {
  background: white;
  color: #333;
  border: 2px solid #e5e7eb;
  margin-bottom: 1rem;
}

.btn-google:hover:not(:disabled) {
  border-color: #d1d5db;
  background: #f9fafb;
}

.google-icon {
  width: 20px;
  height: 20px;
  background: #4285f4;
  color: white;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e8d5c4;
}

.divider-text {
  background: white;
  padding: 0 1rem;
  color: #a0796a;
  font-size: 0.9rem;
}

/* Messages */
.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.error-text {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.5rem;
  text-align: center;
}

.modal-description {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions .btn-secondary,
.modal-actions .btn-primary {
  flex: 1;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    max-width: 100%;
  }

  .auth-form-container {
    padding: 1.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>
