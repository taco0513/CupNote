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
    {
      path: '/coffee-setup',
      name: 'coffee-setup',
      component: () => import('../views/coffee-setup/CoffeeSetupView.vue'),
    },
    {
      path: '/flavor-selection',
      name: 'flavor-selection',
      component: () => import('../views/tasting-flow/FlavorSelectionView.vue'),
    },
    {
      path: '/sensory-expression',
      name: 'sensory-expression',
      component: () => import('../views/tasting-flow/SensoryExpressionView.vue'),
    },
    {
      path: '/personal-notes',
      name: 'personal-notes',
      component: () => import('../views/tasting-flow/PersonalNotesView.vue'),
    },
    {
      path: '/roaster-notes',
      name: 'roaster-notes',
      component: () => import('../views/tasting-flow/RoasterNotesView.vue'),
    },
  ],
})

export default router
