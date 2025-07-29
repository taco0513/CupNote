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
    // Tasting Flow Routes
    {
      path: '/mode-selection',
      name: 'mode-selection',
      component: () => import('../views/tasting-flow/ModeSelectionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/coffee-info',
      name: 'coffee-info',
      component: () => import('../views/tasting-flow/CoffeeInfoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/home-cafe',
      name: 'home-cafe',
      component: () => import('../views/tasting-flow/HomeCafeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pro-brewing',
      name: 'pro-brewing', 
      component: () => import('../views/tasting-flow/ProBrewingView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/qc-measurement',
      name: 'qc-measurement',
      component: () => import('../views/tasting-flow/QcMeasurementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pro-qc-report',
      name: 'pro-qc-report',
      component: () => import('../views/tasting-flow/ProQcReportView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/unified-flavor',
      name: 'unified-flavor',
      component: () => import('../views/tasting-flow/UnifiedFlavorView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/sensory-expression',
      name: 'sensory-expression',
      component: () => import('../views/tasting-flow/SensoryExpressionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/sensory-slider',
      name: 'sensory-slider',
      component: () => import('../views/tasting-flow/SensorySliderView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/personal-comment',
      name: 'personal-comment',
      component: () => import('../views/tasting-flow/PersonalCommentView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roaster-notes',
      name: 'roaster-notes',
      component: () => import('../views/tasting-flow/RoasterNotesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('../views/tasting-flow/ResultView.vue'),
      meta: { requiresAuth: true }
    },
    // Legacy route redirects for backward compatibility
    {
      path: '/coffee-setup',
      redirect: '/mode-selection'
    },
    {
      path: '/flavor-selection',
      redirect: '/unified-flavor'
    },
    {
      path: '/personal-notes',
      redirect: '/personal-comment'
    },
    {
      path: '/experimental-data',
      redirect: '/pro-brewing'
    },
    {
      path: '/tasting-result',
      redirect: '/result'
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
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboard.vue'),
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
