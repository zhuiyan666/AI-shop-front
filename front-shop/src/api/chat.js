import request from './request'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export async function chatStreamMock(message, onChunk, onProducts, onDone) {
  const res = await request.post('/chat/reply', { message })
  const text = res?.data?.content || ''
  const products = res?.data?.products || []

  if (products.length > 0) {
    await delay(150)
    onProducts(products)
  }

  for (let i = 0; i < text.length; i++) {
    await delay(18)
    onChunk(text[i])
  }

  onDone()
}

export const getChatHistoryApi = async () => {
  return request.get('/chat/history')
}
