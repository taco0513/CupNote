import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
    // Demo Mode Routes (Cafe Mode Only)
    {
      path: '/demo',
      name: 'demo-start',
      component: () => import('../views/tasting-flow/ModeSelectionView.vue'),
      meta: { isDemo: true }
    },
    {
      path: '/demo/coffee-info',
      name: 'demo-coffee-info',
      component: () => import('../views/tasting-flow/CoffeeInfoView.vue'),
      meta: { isDemo: true }
    },
    {
      path: '/demo/unified-flavor',
      name: 'demo-unified-flavor',
      component: () => import('../views/tasting-flow/UnifiedFlavorView.vue'),
      meta: { isDemo: true }
    },
    {
      path: '/demo/sensory-expression',
      name: 'demo-sensory-expression',
      component: () => import('../views/tasting-flow/SensoryExpressionView.vue'),
      meta: { isDemo: true }
    },
    {
      path: '/demo/personal-comment',
      name: 'demo-personal-comment',
      component: () => import('../views/tasting-flow/PersonalCommentView.vue'),
      meta: { isDemo: true }
    },
    {
      path: '/demo/roaster-notes',
      name: 'demo-roaster-notes',
      component: () => import('../views/tasting-flow/RoasterNotesView.vue'),
      meta: { isDemo: true }
    },
    {
      path: '/demo/result',
      name: 'demo-result',
      component: () => import('../views/tasting-flow/ResultView.vue'),
      meta: { isDemo: true }
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
      path: '/achievements',
      name: 'achievements',
      component: () => import('../views/AchievementsView.vue'),
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
    // Authentication Routes
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/auth/AuthView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/auth/CallbackView.vue')
    },
    // TODO: Create ResetPasswordView.vue when reset password functionality is needed
    // {
    //   path: '/auth/reset-password',
    //   name: 'reset-password',
    //   component: () => import('../views/auth/ResetPasswordView.vue')
    // },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Check if this is a demo mode route - bypass auth for demo
  const isDemo = to.matched.some(record => record.meta.isDemo)
  if (isDemo) {
    next()
    return
  }
  
  // Import auth store dynamically to avoid circular dependency
  const { useAuthStore } = await import('../stores/auth.js')
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!(authStore as any).initialized) {
    await (authStore as any).initializeAuth()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const isAuthenticated = authStore.isAuthenticated
  
  // Check mode access for protected routes
  if (requiresAuth && isAuthenticated) {
    const mode = to.query.mode || to.params.mode
    if (mode && !(authStore as any).hasAccess(mode)) {
      // Redirect to appropriate mode based on user experience
      const experience = (authStore as any).userMetadata?.coffee_experience || 'beginner'
      const redirectMode = experience === 'beginner' ? 'cafe' : 'homecafe'
      
      next({
        ...to,
        query: { ...to.query, mode: redirectMode }
      })
      return
    }
  }
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to auth page with return path
    next({
      name: 'auth',
      query: { redirect: to.fullPath }
    })
  } else if (requiresGuest && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    const redirectPath = Array.isArray(to.query.redirect) ? to.query.redirect[0] : to.query.redirect || '/'
    next(redirectPath as string)
  } else {
    next()
  }
})

export default router
