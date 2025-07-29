<template>
  <div class="signup-form">
    <div class="form-header">
      <h2 class="form-title">회원가입</h2>
      <p class="form-subtitle">CupNote와 함께 커피 여정을 시작하세요</p>
    </div>

    <form @submit.prevent="handleSignup" class="auth-form">
      <!-- Full Name Field -->
      <div class="form-field">
        <label for="fullName" class="field-label">이름</label>
        <input
          id="fullName"
          v-model="fullName"
          type="text"
          class="field-input"
          :class="{ error: errors.fullName }"
          placeholder="홍길동"
          required
          :disabled="isLoading"
        />
        <span v-if="errors.fullName" class="field-error">{{ errors.fullName }}</span>
      </div>

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
            placeholder="최소 6자 이상"
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
        <div class="password-strength">
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :class="passwordStrength.class"
              :style="{ width: passwordStrength.width }"
            ></div>
          </div>
          <span class="strength-text">{{ passwordStrength.text }}</span>
        </div>
      </div>

      <!-- Confirm Password Field -->
      <div class="form-field">
        <label for="confirmPassword" class="field-label">비밀번호 확인</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          class="field-input"
          :class="{ error: errors.confirmPassword }"
          placeholder="비밀번호를 다시 입력하세요"
          required
          :disabled="isLoading"
        />
        <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
      </div>

      <!-- Coffee Experience -->
      <div class="form-field">
        <label for="coffeeExperience" class="field-label">커피 경험 수준</label>
        <select
          id="coffeeExperience"
          v-model="coffeeExperience"
          class="field-select"
          :disabled="isLoading"
        >
          <option value="beginner">초보자 - 커피를 배우고 싶어요</option>
          <option value="intermediate">중급자 - 홈카페를 즐겨요</option>
          <option value="advanced">고급자 - 전문적인 추출을 해요</option>
          <option value="expert">전문가 - 커피 업계 종사자</option>
        </select>
      </div>

      <!-- Preferred Mode -->
      <div class="form-field">
        <label class="field-label">선호하는 사용 모드</label>
        <div class="mode-options">
          <label 
            v-for="mode in modeOptions" 
            :key="mode.value"
            class="mode-option"
            :class="{ disabled: !isModeAvailable(mode.value) }"
          >
            <input
              v-model="preferredMode"
              :value="mode.value"
              type="radio"
              class="mode-input"
              :disabled="isLoading || !isModeAvailable(mode.value)"
            />
            <div class="mode-card">
              <span class="mode-icon">{{ mode.icon }}</span>
              <span class="mode-name">{{ mode.name }}</span>
              <span class="mode-desc">{{ mode.description }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Terms Agreement -->
      <div class="form-field">
        <label class="checkbox-label">
          <input
            v-model="agreeToTerms"
            type="checkbox"
            class="checkbox-input"
            required
            :disabled="isLoading"
          />
          <span class="checkbox-text">
            <a href="#" class="link">이용약관</a> 및 
            <a href="#" class="link">개인정보처리방침</a>에 동의합니다
          </span>
        </label>
        <span v-if="errors.terms" class="field-error">{{ errors.terms }}</span>
      </div>

      <!-- Marketing Agreement -->
      <div class="form-field">
        <label class="checkbox-label">
          <input
            v-model="agreeToMarketing"
            type="checkbox"
            class="checkbox-input"
            :disabled="isLoading"
          />
          <span class="checkbox-text">
            마케팅 정보 수신에 동의합니다 (선택)
          </span>
        </label>
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
        {{ isLoading ? '가입 중...' : '회원가입' }}
      </button>
    </form>

    <!-- Login Link -->
    <div class="form-footer">
      <p class="footer-text">
        이미 계정이 있으신가요?
        <button
          type="button"
          class="link-button primary"
          @click="$emit('switch-to-login')"
          :disabled="isLoading"
        >
          로그인
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

// Emits
const emit = defineEmits(['signup-success', 'switch-to-login'])

// Store
const authStore = useAuthStore()

// Form data
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const coffeeExperience = ref('beginner')
const preferredMode = ref('cafe')
const agreeToTerms = ref(false)
const agreeToMarketing = ref(false)

// UI state
const showPassword = ref(false)
const errors = ref({})
const isLoading = computed(() => authStore.isLoading)

// Mode options
const modeOptions = [
  {
    value: 'cafe',
    name: 'Cafe Mode',
    icon: '☕',
    description: '간단한 테이스팅',
    minExperience: 'beginner'
  },
  {
    value: 'homecafe',
    name: 'Home Cafe',
    icon: '🏠',
    description: '홈카페 레시피',
    minExperience: 'intermediate'
  },
  {
    value: 'pro',
    name: 'Pro Mode',
    icon: '🎯',
    description: 'SCA 표준 전문 평가',
    minExperience: 'advanced'
  }
]

// Computed
const isFormValid = computed(() => {
  return fullName.value.length > 0 &&
         email.value.length > 0 &&
         password.value.length >= 6 &&
         confirmPassword.value === password.value &&
         agreeToTerms.value &&
         isValidEmail(email.value)
})

const passwordStrength = computed(() => {
  const score = calculatePasswordStrength(password.value)
  
  if (score === 0) return { width: '0%', class: '', text: '' }
  if (score <= 2) return { width: '25%', class: 'weak', text: '약함' }
  if (score <= 3) return { width: '50%', class: 'fair', text: '보통' }
  if (score <= 4) return { width: '75%', class: 'good', text: '좋음' }
  return { width: '100%', class: 'strong', text: '강함' }
})

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const calculatePasswordStrength = (password) => {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const isModeAvailable = (mode) => {
  const experienceOrder = ['beginner', 'intermediate', 'advanced', 'expert']
  const currentLevel = experienceOrder.indexOf(coffeeExperience.value)
  const modeOption = modeOptions.find(m => m.value === mode)
  const requiredLevel = experienceOrder.indexOf(modeOption.minExperience)
  
  return currentLevel >= requiredLevel
}

const validateForm = () => {
  errors.value = {}
  
  if (!fullName.value.trim()) {
    errors.value.fullName = '이름을 입력해주세요'
  }
  
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
  
  if (!confirmPassword.value) {
    errors.value.confirmPassword = '비밀번호 확인을 입력해주세요'
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = '비밀번호가 일치하지 않습니다'
  }
  
  if (!agreeToTerms.value) {
    errors.value.terms = '이용약관에 동의해주세요'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSignup = async () => {
  if (!validateForm()) return
  
  errors.value = {}
  
  try {
    const userData = {
      fullName: fullName.value.trim(),
      coffeeExperience: coffeeExperience.value,
      preferredMode: preferredMode.value,
      marketingAgreement: agreeToMarketing.value
    }
    
    const result = await authStore.signUp(email.value, password.value, userData)
    
    if (result.success) {
      emit('signup-success', {
        user: result.user,
        message: result.message
      })
    } else {
      errors.value.general = result.error || '회원가입에 실패했습니다'
    }
  } catch (error) {
    console.error('Signup error:', error)
    errors.value.general = '회원가입 중 오류가 발생했습니다'
  }
}

// Watch for experience level changes to update preferred mode
import { watch } from 'vue'
watch(coffeeExperience, (newExperience) => {
  if (!isModeAvailable(preferredMode.value)) {
    // Reset to cafe mode if current mode is not available
    preferredMode.value = 'cafe'
  }
})
</script>

<style scoped>
.signup-form {
  max-width: 500px;
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

/* Form Fields */
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

.field-input, .field-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.field-input:focus, .field-select:focus {
  outline: none;
  border-color: #7C5842;
}

.field-input.error, .field-select.error {
  border-color: #F44336;
}

.field-input:disabled, .field-select:disabled {
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

/* Password Strength */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: #E8D5C4;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-fill.weak { background: #F44336; }
.strength-fill.fair { background: #FF9800; }
.strength-fill.good { background: #2196F3; }
.strength-fill.strong { background: #4CAF50; }

.strength-text {
  font-size: 0.8rem;
  color: #A0796A;
}

/* Mode Options */
.mode-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.mode-option {
  cursor: pointer;
}

.mode-option.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.mode-input {
  display: none;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mode-option:not(.disabled) .mode-card:hover {
  border-color: #D4B896;
}

.mode-input:checked + .mode-card {
  border-color: #7C5842;
  background: #F8F4F0;
}

.mode-icon {
  font-size: 1.5rem;
}

.mode-name {
  font-weight: 600;
  color: #7C5842;
  min-width: 80px;
}

.mode-desc {
  font-size: 0.9rem;
  color: #A0796A;
  flex: 1;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  gap: 0.5rem;
}

.checkbox-input {
  margin-top: 0.125rem;
}

.checkbox-text {
  color: #7C5842;
  font-size: 0.9rem;
  line-height: 1.4;
}

.link {
  color: #1976D2;
  text-decoration: underline;
}

.link:hover {
  color: #1565C0;
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

.link-button {
  background: none;
  border: none;
  color: #7C5842;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
}

.link-button.primary {
  color: #1976D2;
  font-weight: 600;
}

.link-button:hover:not(:disabled) {
  color: #5D3F2E;
}

.link-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 480px) {
  .signup-form {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .mode-card {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .mode-name {
    min-width: auto;
  }
}
</style>