import request from './request'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))
const MOCK = true

let mockCartId = 3
const mockCart = [
  { id: 1, productId: 1, name: 'iPhone 15 Pro Max', price: 9999, image: 'https://picsum.photos/seed/iphone/400/400', quantity: 1 },
  { id: 2, productId: 4, name: 'Sony WH-1000XM5 耳机', price: 2299, image: 'https://picsum.photos/seed/sony/400/400', quantity: 2 }
]

export const getCartApi = async () => {
  if (MOCK) { await delay(); return { code: 200, data: [...mockCart] } }
  return request.get('/cart')
}

export const addToCartApi = async (data) => {
  if (MOCK) {
    await delay()
    const item = { id: ++mockCartId, ...data, name: '商品名', price: 99, image: 'https://picsum.photos/seed/new/400/400' }
    mockCart.push(item)
    return { code: 200, data: item }
  }
  return request.post('/cart', data)
}

export const updateCartApi = async (data) => {
  if (MOCK) { await delay(); return { code: 200, data: null } }
  return request.put('/cart', data)
}

export const removeCartApi = async (cartId) => {
  if (MOCK) { await delay(); return { code: 200, data: null } }
  return request.delete(`/cart/${cartId}`)
}
