import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/coffee-setup',
      name: 'coffee-setup',
      component: () => import('../views/coffee-setup/CoffeeSetupView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/flavor-selection',
      name: 'flavor-selection',
      component: () => import('../views/tasting-flow/FlavorSelectionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/sensory-expression',
      name: 'sensory-expression',
      component: () => import('../views/tasting-flow/SensoryExpressionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/personal-notes',
      name: 'personal-notes',
      component: () => import('../views/tasting-flow/PersonalNotesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roaster-notes',
      name: 'roaster-notes',
      component: () => import('../views/tasting-flow/RoasterNotesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tasting-result',
      name: 'tasting-result',
      component: () => import('../views/tasting-flow/ResultView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/records',
      name: 'records',
      component: () => import('../views/RecordsListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/StatsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/auth/CallbackView.vue')
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Development mode: Skip auth for easier testing
  const isDevelopment = import.meta.env.DEV
  
  if (isDevelopment) {
    // In development, allow all routes without authentication
    next()
    return
  }
  
  // Wait for auth initialization if not already done
  if (!authStore.user && !authStore.isLoading) {
    await authStore.initialize()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const isAuthenticated = authStore.isAuthenticated
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login with return path
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } else if (requiresGuest && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
