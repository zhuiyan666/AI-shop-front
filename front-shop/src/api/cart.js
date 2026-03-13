import request from './request'

export const getCartApi = async () => {
  return request.get('/cart')
}

export const addToCartApi = async (data) => {
  return request.post('/cart', data)
}

export const updateCartApi = async (data) => {
  return request.put('/cart', data)
}

export const removeCartApi = async ({ cartId, productId } = {}) => {
  return request.delete('/cart', { params: { cartId, productId } })
}
