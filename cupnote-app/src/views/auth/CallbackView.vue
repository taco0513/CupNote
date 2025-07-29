<template>
  <div class="callback-view">
    <div class="callback-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2 class="loading-title">로그인 처리 중...</h2>
        <p class="loading-description">잠시만 기다려주세요</p>
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="error-content">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">로그인에 실패했습니다</h3>
        <p class="error-description">{{ error }}</p>
        <RouterLink to="/auth/login" class="btn-primary">
          다시 시도하기
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const error = ref('')

onMounted(async () => {
  try {
    // Initialize auth if not already done
    if (!authStore.initialized) {
      await authStore.initializeAuth()
    }
    
    // Wait for auth state to settle
    setTimeout(() => {
      if (authStore.isAuthenticated) {
        // Redirect to home or original destination
        const redirectPath = route.query.redirect || '/'
        router.push(redirectPath)
      } else {
        error.value = '로그인 처리 중 오류가 발생했습니다.'
      }
    }, 2000)
  } catch (err) {
    console.error('Callback error:', err)
    error.value = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
  }
})
</script>

<style scoped>
.callback-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.callback-container {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.loading-content {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 8px 32px rgba(124, 88, 66, 0.15);
  border: 1px solid #F0E8DC;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #E8D5C4;
  border-top-color: #7C5842;
  border-radius: 50%;
  margin: 0 auto 2rem;
  animation: spin 1s linear infinite;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.loading-description {
  color: #A0796A;
  margin: 0;
}

.error-content {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 8px 32px rgba(124, 88, 66, 0.15);
  border: 1px solid #F0E8DC;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.error-description {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>