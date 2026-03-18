import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, err => Promise.reject(err))

request.interceptors.response.use(
  res => {
    const body = res.data
    if (body && typeof body === 'object' && 'code' in body && body.code !== 200) {
      const err = new Error(body.message || '请求失败')
      err.response = { status: res.status, data: body }
      return Promise.reject(err)
    }
    return body
  },
  err => {
    const msg = err.response?.data?.message || err.message || '请求失败'
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      const path = window.location.pathname || ''
      const inAuthPage = path.startsWith('/login') || path.startsWith('/register')
      if (!inAuthPage) {
        window.history.pushState({}, '', '/login')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    } else {
      ElMessage.error(msg)
    }
    return Promise.reject(err)
  }
)

export default request
