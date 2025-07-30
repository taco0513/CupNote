<template>
  <div class="auth-view">
    <div class="auth-container">
      <!-- Brand Header -->
      <div class="brand-header">
        <div class="brand-logo">☕</div>
        <h1 class="brand-name">CupNote</h1>
        <p class="brand-tagline">당신만의 커피 여정을 기록하세요</p>
      </div>

      <!-- Auth Forms Container -->
      <div class="auth-forms">
        <!-- Login Form -->
        <div v-if="currentView === 'login'" class="form-container">
          <LoginForm
            @login-success="handleLoginSuccess"
            @switch-to-signup="currentView = 'signup'"
            @forgot-password="currentView = 'forgot'"
          />
        </div>

        <!-- Signup Form -->
        <div v-else-if="currentView === 'signup'" class="form-container">
          <SignupForm
            @signup-success="handleSignupSuccess"
            @switch-to-login="currentView = 'login'"
          />
        </div>

        <!-- Forgot Password Form -->
        <div v-else-if="currentView === 'forgot'" class="form-container">
          <ForgotPasswordForm
            @back-to-login="currentView = 'login'"
            @reset-sent="handleResetSent"
          />
        </div>

        <!-- Success Message -->
        <div v-else-if="currentView === 'success'" class="success-container">
          <div class="success-message">
            <div class="success-icon">✅</div>
            <h2 class="success-title">{{ successMessage.title }}</h2>
            <p class="success-text">{{ successMessage.text }}</p>
            <button
              v-if="successMessage.showLogin"
              class="success-button"
              @click="currentView = 'login'"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>

      <!-- Features Preview -->
      <div class="features-preview">
        <h3 class="features-title">CupNote로 할 수 있는 것들</h3>
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-icon">☕</span>
            <div class="feature-content">
              <h4 class="feature-name">Cafe Mode</h4>
              <p class="feature-desc">간단한 테이스팅 노트</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🏠</span>
            <div class="feature-content">
              <h4 class="feature-name">Home Cafe</h4>
              <p class="feature-desc">홈카페 레시피 관리</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <div class="feature-content">
              <h4 class="feature-name">Pro Mode</h4>
              <p class="feature-desc">SCA 표준 전문 평가</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <div class="feature-content">
              <h4 class="feature-name">Analytics</h4>
              <p class="feature-desc">테이스팅 통계 분석</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LoginForm from '../../components/auth/LoginForm.vue'
import SignupForm from '../../components/auth/SignupForm.vue'
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm.vue'

// Router
const router = useRouter()
const route = useRoute()

// State
const currentView = ref('login')
const successMessage = ref({
  title: '',
  text: '',
  showLogin: false,
})

// Methods
const handleLoginSuccess = (user) => {
  console.log('Login successful:', user)

  // Redirect to original path or home
  const redirectPath = route.query.redirect || '/'
  router.push(redirectPath)
}

const handleSignupSuccess = (result) => {
  console.log('Signup successful:', result)

  successMessage.value = {
    title: '회원가입 완료!',
    text: result.message || '이메일을 확인하여 계정을 활성화해주세요.',
    showLogin: true,
  }

  currentView.value = 'success'
}

const handleResetSent = (message) => {
  successMessage.value = {
    title: '비밀번호 재설정 이메일 발송',
    text: message || '이메일을 확인하여 비밀번호를 재설정해주세요.',
    showLogin: true,
  }

  currentView.value = 'success'
}

// Initialize view based on query params
onMounted(() => {
  const view = route.query.view
  if (view === 'signup') {
    currentView.value = 'signup'
  } else if (view === 'forgot') {
    currentView.value = 'forgot'
  }
})
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-container {
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* Brand Header */
.brand-header {
  text-align: center;
  margin-bottom: 2rem;
  grid-column: 1 / -1;
}

.brand-logo {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.brand-name {
  font-size: 3rem;
  font-weight: 800;
  color: #7c5842;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.brand-tagline {
  font-size: 1.1rem;
  color: #a0796a;
  font-weight: 500;
}

/* Auth Forms */
.auth-forms {
  display: flex;
  flex-direction: column;
}

.form-container {
  width: 100%;
}

/* Success Container */
.success-container {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7c5842;
  margin-bottom: 1rem;
}

.success-text {
  color: #a0796a;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.success-button {
  background: #7c5842;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.success-button:hover {
  background: #5d3f2e;
  transform: translateY(-1px);
}

/* Features Preview */
.features-preview {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
}

.features-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c5842;
  margin-bottom: 1.5rem;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f4f0;
  transition: transform 0.2s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(124, 88, 66, 0.1);
}

.feature-content {
  flex: 1;
}

.feature-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.25rem;
}

.feature-desc {
  color: #a0796a;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 500px;
    gap: 2rem;
  }

  .features-preview {
    order: -1;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .auth-view {
    padding: 0.5rem;
  }

  .auth-container {
    gap: 1.5rem;
  }

  .brand-name {
    font-size: 2.5rem;
  }

  .brand-tagline {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .features-preview {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .feature-item {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem 1rem;
  }

  .feature-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
}
</style>
