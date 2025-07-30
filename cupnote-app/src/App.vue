<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import NotificationToast from './components/common/NotificationToast.vue'

const authStore = useAuthStore()
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <h1 class="app-title">
          ☕ CupNote
          <span class="subtitle">나의 커피 감각 저널</span>
        </h1>

        <nav class="main-nav">
          <RouterLink to="/" class="nav-link">홈</RouterLink>
          <RouterLink to="/about" class="nav-link">소개</RouterLink>

          <!-- Authenticated User Navigation -->
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/records" class="nav-link">기록</RouterLink>
            <RouterLink to="/stats" class="nav-link">통계</RouterLink>
            <RouterLink to="/admin" class="nav-link admin-link">📊 관리자</RouterLink>
            <RouterLink to="/profile" class="nav-link">프로필</RouterLink>
          </template>

          <!-- Guest Navigation -->
          <template v-else>
            <RouterLink to="/auth/login" class="nav-link auth-link">로그인</RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <!-- 실제 라우터 뷰 -->
        <RouterView />
      </div>
    </main>

    <!-- 알림 토스트 -->
    <NotificationToast />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
}

.app-header {
  background: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.3);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.app-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subtitle {
  font-size: 0.9rem;
  font-weight: 400;
  opacity: 0.9;
  margin-left: 0.5rem;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.nav-link.auth-link {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-link.auth-link:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.nav-link.admin-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.nav-link.admin-link:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.main-content {
  padding: 2rem 0;
  min-height: calc(100vh - 80px);
}

@media (max-width: 768px) {
  .app-header .container {
    flex-direction: column;
    gap: 1rem;
  }

  .app-title {
    font-size: 1.5rem;
    text-align: center;
  }

  .subtitle {
    display: block;
    margin-left: 0;
    margin-top: 0.25rem;
  }

  .main-nav {
    justify-content: center;
  }
}
</style>
