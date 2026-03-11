import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:9090/api',
  timeout: 15000
})

// Mock 数据
const MOCK = true
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// 获取所有服务器列表
export const getServersApi = async () => {
  if (MOCK) {
    await delay()
    return { code: 200, data: [] } // 由 store 初始化 Mock 数据
  }
  return request.get('/servers').then(r => r.data)
}

// 获取单个服务器详情
export const getServerDetailApi = async (id) => {
  if (MOCK) {
    await delay()
    return { code: 200, data: null } // 由 store 查找
  }
  return request.get(`/servers/${id}`).then(r => r.data)
}

// 获取服务器心跳历史
export const getHeartbeatHistoryApi = async (id, limit = 30) => {
  if (MOCK) {
    await delay()
    const now = Date.now()
    return {
      code: 200,
      data: Array.from({ length: limit }, (_, i) => ({
        timestamp: new Date(now - (limit - 1 - i) * 5000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Math.floor(Math.random() * 80) + 10,
        memory: Math.floor(Math.random() * 60) + 20,
        latency: Math.floor(Math.random() * 50) + 5
      }))
    }
  }
  return request.get(`/servers/${id}/heartbeat`, { params: { limit } }).then(r => r.data)
}
