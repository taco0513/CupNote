// CupNote 스타일 시스템
import './assets/styles/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useUserStatsStore } from './stores/userStats'
import { useGoalsStore } from './stores/goals'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize auth store
const authStore = useAuthStore()
authStore.initializeAuth()

// Initialize user stats and goals if authenticated
const userStatsStore = useUserStatsStore()
const goalsStore = useGoalsStore()
if (authStore.isAuthenticated && authStore.userId) {
  userStatsStore.initializeUserStats(authStore.userId)
  goalsStore.initializeGoals(authStore.userId)
}

app.mount('#app')
