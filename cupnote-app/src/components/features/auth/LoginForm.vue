<template>
  <div class="login-form">
    <div class="form-header">
      <h2 class="form-title">로그인</h2>
      <p class="form-subtitle">CupNote에서 당신만의 커피 여정을 계속하세요</p>
    </div>

    <form @submit.prevent="handleLogin" class="auth-form">
      <!-- Email Field -->
      <div class="form-field">
        <label for="email" class="field-label">이메일</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="field-input"
          :class="{ error: errors.email }"
          placeholder="example@email.com"
          required
          :disabled="isLoading"
        />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>

      <!-- Password Field -->
      <div class="form-field">
        <label for="password" class="field-label">비밀번호</label>
        <div class="password-field">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="field-input"
            :class="{ error: errors.password }"
            placeholder="비밀번호를 입력하세요"
            required
            :disabled="isLoading"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
            :disabled="isLoading"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
        <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
      </div>

      <!-- Remember Me -->
      <div class="form-options">
        <label class="checkbox-label">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="checkbox-input"
            :disabled="isLoading"
          />
          <span class="checkbox-text">로그인 상태 유지</span>
        </label>
        <button
          type="button"
          class="link-button"
          @click="$emit('forgot-password')"
          :disabled="isLoading"
        >
          비밀번호를 잊으셨나요?
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="errors.general" class="error-message">
        {{ errors.general }}
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="submit-button"
        :disabled="isLoading || !isFormValid"
      >
        <span v-if="isLoading" class="loading-spinner">⏳</span>
        {{ isLoading ? '로그인 중...' : '로그인' }}
      </button>
    </form>

    <!-- Sign Up Link -->
    <div class="form-footer">
      <p class="footer-text">
        아직 계정이 없으신가요?
        <button
          type="button"
          class="link-button primary"
          @click="$emit('switch-to-signup')"
          :disabled="isLoading"
        >
          회원가입
        </button>
      </p>
    </div>

    <!-- Demo Account -->
    <div class="demo-section">
      <p class="demo-text">체험해보고 싶으시다면:</p>
      <button
        type="button"
        class="demo-button"
        @click="loginAsDemo"
        :disabled="isLoading"
      >
        데모 계정으로 로그인
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

// Emits
const emit = defineEmits(['login-success', 'switch-to-signup', 'forgot-password'])

// Store
const authStore = useAuthStore()

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// UI state
const errors = ref({})
const isLoading = computed(() => authStore.isLoading)

// Computed
const isFormValid = computed(() => {
  return email.value.length > 0 && 
         password.value.length >= 6 &&
         isValidEmail(email.value)
})

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateForm = () => {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = '이메일을 입력해주세요'
  } else if (!isValidEmail(email.value)) {
    errors.value.email = '유효한 이메일 주소를 입력해주세요'
  }
  
  if (!password.value) {
    errors.value.password = '비밀번호를 입력해주세요'
  } else if (password.value.length < 6) {
    errors.value.password = '비밀번호는 최소 6자 이상이어야 합니다'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  errors.value = {}
  
  try {
    const result = await authStore.signIn(email.value, password.value)
    
    if (result.success) {
      emit('login-success', result.user)
    } else {
      errors.value.general = result.error || '로그인에 실패했습니다'
    }
  } catch (error) {
    console.error('Login error:', error)
    errors.value.general = '로그인 중 오류가 발생했습니다'
  }
}

const loginAsDemo = async () => {
  email.value = 'demo@cupnote.app'
  password.value = 'demo123!'
  await handleLogin()
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
}

/* Header */
.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #A0796A;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Form */
.auth-form {
  margin-bottom: 1.5rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.field-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.field-input:focus {
  outline: none;
  border-color: #7C5842;
}

.field-input.error {
  border-color: #F44336;
}

.field-input:disabled {
  background-color: #F5F5F5;
  cursor: not-allowed;
}

/* Password Field */
.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-input {
  margin-right: 0.5rem;
}

.checkbox-text {
  color: #7C5842;
}

.link-button {
  background: none;
  border: none;
  color: #7C5842;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
}

.link-button:hover:not(:disabled) {
  color: #5D3F2E;
}

.link-button.primary {
  color: #1976D2;
  font-weight: 600;
}

.link-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Error Messages */
.field-error {
  display: block;
  color: #F44336;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.error-message {
  background: #FFEBEE;
  border: 1px solid #FFCDD2;
  border-radius: 8px;
  padding: 0.75rem;
  color: #C62828;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 0.75rem;
  background: #7C5842;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #5D3F2E;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background: #CCC;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Footer */
.form-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #E8D5C4;
}

.footer-text {
  color: #A0796A;
  font-size: 0.9rem;
}

/* Demo Section */
.demo-section {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E8D5C4;
}

.demo-text {
  color: #A0796A;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.demo-button {
  background: #E3F2FD;
  color: #1976D2;
  border: 1px solid #BBDEFB;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-button:hover:not(:disabled) {
  background: #BBDEFB;
}

.demo-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 480px) {
  .login-form {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>