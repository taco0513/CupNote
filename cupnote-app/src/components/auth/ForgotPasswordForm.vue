<template>
  <div class="forgot-password-form">
    <div class="form-header">
      <button class="back-button" @click="$emit('back-to-login')" :disabled="isLoading">
        ← 로그인으로 돌아가기
      </button>
      <h2 class="form-title">비밀번호 재설정</h2>
      <p class="form-subtitle">
        등록된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
      </p>
    </div>

    <form @submit.prevent="handleResetPassword" class="auth-form">
      <!-- Email Field -->
      <div class="form-field">
        <label for="email" class="field-label">이메일 주소</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="field-input"
          :class="{ error: errors.email }"
          placeholder="등록된 이메일을 입력하세요"
          required
          :disabled="isLoading"
          autocomplete="email"
        />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
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
        {{ isLoading ? '전송 중...' : '재설정 링크 전송' }}
      </button>
    </form>

    <!-- Help Section -->
    <div class="help-section">
      <h3 class="help-title">도움이 필요하신가요?</h3>
      <div class="help-content">
        <div class="help-item">
          <h4 class="help-item-title">이메일이 오지 않나요?</h4>
          <ul class="help-list">
            <li>스팸/정크 메일함을 확인해보세요</li>
            <li>이메일 주소가 올바른지 확인해보세요</li>
            <li>몇 분 후에 다시 시도해보세요</li>
          </ul>
        </div>
        
        <div class="help-item">
          <h4 class="help-item-title">계속 문제가 있나요?</h4>
          <p class="help-text">
            고객지원팀에 문의하세요: 
            <a href="mailto:support@cupnote.app" class="help-link">
              support@cupnote.app
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

// Emits
const emit = defineEmits(['back-to-login', 'reset-sent'])

// Store
const authStore = useAuthStore()

// Form data
const email = ref('')

// UI state
const errors = ref({})
const isLoading = computed(() => authStore.isLoading)

// Computed
const isFormValid = computed(() => {
  return email.value.length > 0 && isValidEmail(email.value)
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
  
  return Object.keys(errors.value).length === 0
}

const handleResetPassword = async () => {
  if (!validateForm()) return
  
  errors.value = {}
  
  try {
    const result = await authStore.resetPassword(email.value)
    
    if (result.success) {
      emit('reset-sent', result.message)
    } else {
      errors.value.general = result.error || '재설정 이메일 전송에 실패했습니다'
    }
  } catch (error) {
    console.error('Reset password error:', error)
    errors.value.general = '재설정 이메일 전송 중 오류가 발생했습니다'
  }
}
</script>

<style scoped>
.forgot-password-form {
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

.back-button {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  color: #7C5842;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.back-button:hover:not(:disabled) {
  background-color: rgba(124, 88, 66, 0.1);
}

.back-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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
  line-height: 1.5;
}

/* Form */
.auth-form {
  margin-bottom: 2rem;
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

/* Help Section */
.help-section {
  padding-top: 1.5rem;
  border-top: 1px solid #E8D5C4;
}

.help-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
  text-align: center;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.help-item {
  background: #F8F4F0;
  padding: 1rem;
  border-radius: 8px;
}

.help-item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.help-list {
  margin: 0;
  padding-left: 1.2rem;
  color: #A0796A;
  font-size: 0.85rem;
  line-height: 1.5;
}

.help-list li {
  margin-bottom: 0.25rem;
}

.help-text {
  color: #A0796A;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

.help-link {
  color: #1976D2;
  text-decoration: underline;
}

.help-link:hover {
  color: #1565C0;
}

/* Responsive */
@media (max-width: 480px) {
  .forgot-password-form {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .help-content {
    gap: 1rem;
  }
  
  .help-item {
    padding: 0.75rem;
  }
}
</style>