import request from './request'

export const listOrdersApi = () => request.get('/orders')
export const createOrderApi = (data) => request.post('/orders', data)
export const getOrderApi = (orderId) => request.get(`/orders/${orderId}`)
export const payOrderApi = (orderId) => request.post(`/orders/${orderId}/pay`)
