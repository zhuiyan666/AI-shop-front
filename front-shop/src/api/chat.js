import request from './request'

const delay = (ms) => new Promise(r => setTimeout(r, ms))

// Mock 商品数据（用于 AI 返回卡片）
const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro Max', price: 9999, image: 'https://picsum.photos/seed/iphone/300/300', category: '手机' },
  { id: 2, name: 'MacBook Pro 16"', price: 19999, image: 'https://picsum.photos/seed/macbook/300/300', category: '电脑' },
  { id: 3, name: 'AirPods Pro 2', price: 1899, image: 'https://picsum.photos/seed/airpods/300/300', category: '耳机' },
  { id: 4, name: 'Sony WH-1000XM5', price: 2299, image: 'https://picsum.photos/seed/sony/300/300', category: '耳机' },
  { id: 5, name: 'iPad Pro 13"', price: 8999, image: 'https://picsum.photos/seed/ipad/300/300', category: '平板' },
  { id: 6, name: 'Nintendo Switch', price: 2099, image: 'https://picsum.photos/seed/switch/300/300', category: '游戏' }
]

// Mock AI 回复逻辑
function generateMockReply (message) {
  const msg = message.toLowerCase()
  const cards = []
  let text = ''

  if (msg.includes('耳机') || msg.includes('headphone')) {
    const products = mockProducts.filter(p => p.category === '耳机')
    text = `我为您找到了以下耳机产品，都是热销款哦！AirPods Pro 2 音质清晰，降噪出色；Sony WH-1000XM5 是业界顶级降噪耳机。您有特别偏好吗？`
    cards.push(...products)
  } else if (msg.includes('手机') || msg.includes('iphone') || msg.includes('phone')) {
    const products = mockProducts.filter(p => p.category === '手机')
    text = `为您推荐以下手机，性能卓越！iPhone 15 Pro Max 搭载 A17 Pro 芯片，拍照能力业界领先。`
    cards.push(...products)
  } else if (msg.includes('电脑') || msg.includes('macbook') || msg.includes('laptop')) {
    const products = mockProducts.filter(p => p.category === '电脑')
    text = `MacBook Pro 16" 搭载 M3 Pro 芯片，性能强悍，续航超长，是专业人士的不二选择！`
    cards.push(...products)
  } else if (msg.includes('推荐') || msg.includes('热门') || msg.includes('好用')) {
    text = `这些都是近期最热销的爆款，由 AI 大数据分析推荐，销量与好评兼具！`
    cards.push(...mockProducts.slice(0, 4))
  } else if (msg.includes('购物车') || msg.includes('结算') || msg.includes('下单')) {
    text = `好的！您可以直接点击商品卡片上的"加入购物车"按钮，然后前往购物车页面结算。需要我帮您推荐什么产品吗？`
  } else if (msg.includes('你好') || msg.includes('hi') || msg.includes('hello') || msg.includes('帮我')) {
    text = `您好！👋 我是您的 AI 购物助手，可以帮您：\n\n• 🔍 搜索和推荐商品\n• 💡 比较不同产品的特点\n• 🛒 协助加入购物车\n• 💰 寻找最划算的选择\n\n请问您今天想购买什么？`
  } else {
    text = `感谢您的提问！我理解您的需求是"${message}"。为您推荐一些热门产品，您可以查看下方商品卡片，或者告诉我更具体的需求，我来精准推荐！`
    cards.push(...mockProducts.slice(0, 3))
  }

  return { text, cards }
}

// 模拟流式 SSE（逐字输出）
export async function chatStreamMock (message, onChunk, onProducts, onDone) {
  await delay(500)
  const { text, cards } = generateMockReply(message)

  // 先输出商品卡片
  if (cards.length > 0) {
    await delay(300)
    onProducts(cards)
  }

  // 逐字输出文本
  for (let i = 0; i < text.length; i++) {
    await delay(30 + Math.random() * 20)
    onChunk(text[i])
  }

  onDone()
}

// 真实 SSE 接口（后端就绪后使用）
export function chatStream (message, onChunk, onDone, onError) {
  const token = localStorage.getItem('token')
  const url = `${request.defaults.baseURL || 'http://localhost:8082/api'}/chat/stream?message=${encodeURIComponent(message)}`
  const es = new EventSource(url + `&token=${token}`)

  es.addEventListener('message', (e) => {
    const data = JSON.parse(e.data)
    if (data.done) {
      es.close()
      onDone()
    } else {
      onChunk(data.content || '')
    }
  })

  es.addEventListener('products', () => {
    // 可选：服务端推送商品卡片事件
  })

  es.onerror = (_err) => {
    es.close()
    onError(_err)
  }

  return () => es.close()
}

export const getChatHistoryApi = async () => {
  // MOCK: true
  await delay(300)
  return {
    code: 200,
    data: [
      { role: 'assistant', content: '您好！我是 AI 购物助手，有什么可以帮您？', products: [] }
    ]
  }
  // return request.get('/chat/history')
}
