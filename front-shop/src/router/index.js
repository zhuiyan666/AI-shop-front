import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/home/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    component: () => import('../views/auth/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    component: () => import('../views/auth/Register.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/products',
    component: () => import('../views/product/ProductList.vue')
  },
  {
    path: '/product/:id',
    component: () => import('../views/product/ProductDetail.vue')
  },
  {
    path: '/cart',
    component: () => import('../views/cart/Cart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    component: () => import('../views/chat/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order',
    component: () => import('../views/order/Order.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pay',
    component: () => import('../views/order/Pay.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pay/result',
    component: () => import('../views/order/PayResult.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior () {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.guestOnly && token) {
    next('/')
  } else {
    next()
  }
})

export default router
