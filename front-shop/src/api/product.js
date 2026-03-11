import request from './request'

// ======================== Mock 数据（后端未就绪时使用）========================
const MOCK = true
const delay = (ms = 500) => new Promise(r => setTimeout(r, ms))

const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro Max', price: 9999, originalPrice: 12999, image: 'https://picsum.photos/seed/iphone/400/400', category: '手机数码', sales: 2341, rating: 4.9, stock: 100, tags: ['热卖', '新品'] },
  { id: 2, name: '华为 Mate 60 Pro', price: 6999, originalPrice: 8999, image: 'https://picsum.photos/seed/huawei/400/400', category: '手机数码', sales: 3210, rating: 4.8, stock: 50, tags: ['热卖'] },
  { id: 3, name: 'MacBook Pro 14"', price: 14999, originalPrice: 18999, image: 'https://picsum.photos/seed/macbook/400/400', category: '电脑平板', sales: 890, rating: 4.9, stock: 30, tags: ['新品'] },
  { id: 4, name: 'Sony WH-1000XM5 耳机', price: 2299, originalPrice: 2999, image: 'https://picsum.photos/seed/sony/400/400', category: '音频设备', sales: 1567, rating: 4.7, stock: 200, tags: ['热卖'] },
  { id: 5, name: 'iPad Pro 12.9" M2', price: 8999, originalPrice: 10999, image: 'https://picsum.photos/seed/ipad/400/400', category: '电脑平板', sales: 1234, rating: 4.8, stock: 80, tags: [] },
  { id: 6, name: '戴森吹风机 HD15', price: 3199, originalPrice: 3999, image: 'https://picsum.photos/seed/dyson/400/400', category: '家用电器', sales: 4567, rating: 4.6, stock: 150, tags: ['热卖'] },
  { id: 7, name: 'Nike Air Max 2024', price: 1299, originalPrice: 1599, image: 'https://picsum.photos/seed/nike/400/400', category: '运动服饰', sales: 2890, rating: 4.5, stock: 300, tags: [] },
  { id: 8, name: '三星 OLED 65" 电视', price: 12999, originalPrice: 19999, image: 'https://picsum.photos/seed/samsung/400/400', category: '影音娱乐', sales: 567, rating: 4.7, stock: 20, tags: ['优惠'] },
]

export const getProductListApi = async (params = {}) => {
  if (MOCK) {
    await delay()
    let list = [...mockProducts]
    if (params.category) list = list.filter(p => p.category === params.category)
    if (params.keyword) list = list.filter(p => p.name.includes(params.keyword))
    return { code: 200, data: { list, total: list.length } }
  }
  return request.get('/products', { params })
}

export const getProductDetailApi = async (id) => {
  if (MOCK) {
    await delay()
    const product = mockProducts.find(p => p.id === Number(id))
    return { code: 200, data: { ...product, description: '这是一款非常出色的产品，采用最新技术，提供卓越的使用体验。拥有高性能处理器、精美工艺外观以及丰富的功能配置。', images: [product?.image, 'https://picsum.photos/seed/detail1/400/400', 'https://picsum.photos/seed/detail2/400/400'] } }
  }
  return request.get(`/products/${id}`)
}

export const searchProductsApi = async (keyword) => {
  if (MOCK) {
    await delay(300)
    const list = mockProducts.filter(p => p.name.includes(keyword) || p.category.includes(keyword))
    return { code: 200, data: { list, total: list.length } }
  }
  return request.get('/products/search', { params: { keyword } })
}
