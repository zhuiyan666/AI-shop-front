import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/server/:id',
    component: () => import('../views/ServerDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
