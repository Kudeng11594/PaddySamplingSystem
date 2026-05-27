import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../pages/auth/login.vue') },
    { path: '/driver', component: () => import('../layouts/MobileLayout.vue'), meta: { requiresAuth: true }, children: [
      { path: 'create', component: () => import('../pages/driver/create.vue') },
      { path: 'query', component: () => import('../pages/driver/query.vue') },
      { path: 'queue', component: () => import('../pages/driver/queue.vue') },
    ]},
    { path: '/manager', component: () => import('../layouts/MobileLayout.vue'), meta: { requiresAuth: true }, children: [
      { path: 'dashboard', component: () => import('../pages/manager/dashboard.vue') },
    ]},
    { path: '/admin', component: () => import('../layouts/DesktopLayout.vue'), meta: { requiresAuth: true }, children: [
      { path: 'appointments', component: () => import('../pages/admin/appointments.vue') },
      { path: 'queue-board', component: () => import('../pages/admin/queue-board.vue') },
      { path: 'sampling', component: () => import('../pages/admin/sampling.vue') },
      { path: 'dashboard', component: () => import('../pages/admin/dashboard.vue') },
      { path: 'users', component: () => import('../pages/admin/users.vue') },
    ]},
    { path: '/', redirect: '/driver/create' },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.token) { next('/login'); return }
  }
  next()
})

export default router
