import request from './request'

export const getProductListApi = async (params = {}) => {
  return request.get('/products', { params })
}

export const getProductCategoriesApi = async () => {
  return request.get('/products/categories')
}

export const getProductDetailApi = async (id) => {
  return request.get(`/products/${id}`)
}

export const searchProductsApi = async (keyword) => {
  return request.get('/products/search', { params: { keyword } })
}
