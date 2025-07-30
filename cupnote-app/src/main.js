// CupNote 스타일
import './assets/design-tokens.css'
import './assets/components.css' 
import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useUserStatsStore } from './stores/userStats'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize auth store
const authStore = useAuthStore()
authStore.initializeAuth()

// Initialize user stats if authenticated
const userStatsStore = useUserStatsStore()
if (authStore.isAuthenticated && authStore.userId) {
  userStatsStore.initializeUserStats(authStore.userId)
}

app.mount('#app')
