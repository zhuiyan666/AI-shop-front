import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, registerApi, getUserInfoApi, logoutApi } from '../api/user'
import { useCartStore } from './cart'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  async function login (data) {
    const res = await loginApi(data)
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
    return res
  }

  async function register (data) {
    const res = await registerApi(data)
    return res
  }

  async function getUserInfo () {
    const res = await getUserInfoApi()
    userInfo.value = res.data
    localStorage.setItem('userInfo', JSON.stringify(res.data))
    return res
  }

  async function logout () {
    const cartStore = useCartStore()
    cartStore.resetCart()

    if (userInfo.value && userInfo.value.username) {
       try {
         await logoutApi({ username: userInfo.value.username })
       } catch (e) {
         console.warn('Logout API failed', e)
       }
    }
    
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, isLoggedIn, login, register, getUserInfo, logout }
})
