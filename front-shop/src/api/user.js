import request from './request'

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))
const MOCK = true

export const loginApi = async (data) => {
  if (MOCK) {
    await delay(800)
    if (data.username === 'test' && data.password === '123456') {
      return { code: 200, data: { token: 'mock-token-abc123', user: { id: 1, username: 'test', nickname: '测试用户', avatar: 'https://picsum.photos/seed/avatar/100/100', email: 'test@example.com' } } }
    }
    return Promise.reject({ response: { data: { message: '用户名或密码错误' } } })
  }
  return request.post('/auth/login', data)
}

export const registerApi = async (data) => {
  if (MOCK) {
    await delay(800)
    return { code: 200, data: { message: '注册成功' } }
  }
  return request.post('/auth/register', data)
}

export const getUserInfoApi = async () => {
  if (MOCK) {
    await delay()
    return { code: 200, data: { id: 1, username: 'test', nickname: '测试用户', avatar: 'https://picsum.photos/seed/avatar/100/100' } }
  }
  return request.get('/auth/me')
}
