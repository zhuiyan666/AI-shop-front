import request from './request'

export const createOrderApi = (data) => request.post('/orders', data)
export const getOrderApi = (orderId) => request.get(`/orders/${orderId}`)
export const getPayUrlApi = (orderId) => request.get(`/pay/alipay/${orderId}`)

// Mock
const delay = (ms = 500) => new Promise(r => setTimeout(r, ms))

export const createOrderMock = async (items) => {
  await delay()
  const orderId = 'ORDER' + Date.now()
  return { code: 200, data: { orderId, totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0), items } }
}

export const getPayFormMock = async (orderId, amount) => {
  await delay(300)
  // 模拟支付宝沙箱表单（真实对接时后端返回 form HTML）
  return {
    code: 200,
    data: {
      payUrl: `https://openapi.alipaydev.com/gateway.do?order=${orderId}&amount=${amount}`,
      orderId
    }
  }
}
