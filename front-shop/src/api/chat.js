import request from './request'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export async function chatStreamMock(message, onChunk, onProducts, onDone) {
  const res = await request.post('/chat/reply', { message })
  const text = res?.data?.content || ''
  const products = res?.data?.products || []

  // Faster UX: reveal text in chunks first, then show product cards.
  const len = text.length
  let chunkSize = 4
  let pace = 8
  if (len > 800) {
    chunkSize = 16
    pace = 2
  } else if (len > 300) {
    chunkSize = 10
    pace = 4
  } else if (len > 120) {
    chunkSize = 6
    pace = 6
  }
  for (let i = 0; i < len; i += chunkSize) {
    await delay(pace)
    onChunk(text.slice(i, i + chunkSize))
  }

  if (products.length > 0) {
    await delay(40)
    onProducts(products)
  }

  onDone()
}

export const getChatHistoryApi = async (limit = 40) => {
  return request.get('/chat/history', { params: { limit } })
}

export const newConversationApi = async () => {
  return request.post('/chat/new')
}

export const deleteChatHistoryApi = async () => {
  return request.delete('/chat/history')
}
