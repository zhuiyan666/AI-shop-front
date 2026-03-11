<template>
  <div class="chat-page">
    <!-- 侧边历史栏 -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <div class="ai-logo">🤖</div>
        <div>
          <div class="ai-title">AI 购物助手</div>
          <div class="ai-subtitle">智能推荐 · 实时对话</div>
        </div>
      </div>
      <div class="sidebar-tips">
        <div class="tip-title">试试这样问我：</div>
        <div
          v-for="tip in tips"
          :key="tip"
          class="tip-item"
          @click="sendMessage(tip)"
        >{{ tip }}</div>
      </div>
    </div>

    <!-- 主聊天区 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <div ref="msgListEl" class="msg-list">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['msg-row', msg.role]"
        >
          <div v-if="msg.role === 'assistant'" class="msg-avatar">🤖</div>
          <div class="msg-bubble-wrap">
            <div :class="['msg-bubble', msg.role]">
              <template v-if="msg.role === 'assistant'">
                <span v-html="formatContent(msg.content)"></span>
                <span v-if="msg.typing" class="cursor"></span>
              </template>
              <template v-else>{{ msg.content }}</template>
            </div>
            <!-- 商品卡片横向滚动 -->
            <div v-if="msg.products && msg.products.length" class="product-cards">
              <div
                v-for="product in msg.products"
                :key="product.id"
                class="mini-card"
              >
                <img :src="product.image" :alt="product.name" class="mini-card-img" />
                <div class="mini-card-info">
                  <div class="mini-card-name">{{ product.name }}</div>
                  <div class="mini-card-price">¥{{ product.price.toLocaleString() }}</div>
                </div>
                <el-button
                  size="small"
                  type="primary"
                  class="mini-add-btn"
                  @click="addToCart(product)"
                >加入购物车</el-button>
              </div>
            </div>
          </div>
          <div v-if="msg.role === 'user'" class="msg-avatar user-avatar">
            {{ userInitial }}
          </div>
        </div>

        <!-- AI 输入中 loading -->
        <div v-if="loading && !currentTyping" class="msg-row assistant">
          <div class="msg-avatar">🤖</div>
          <div class="thinking-bubble">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="chat-input-bar">
        <el-input
          v-model="inputText"
          placeholder="问我任何关于购物的问题..."
          class="chat-input"
          size="large"
          @keydown.enter.exact.prevent="handleSend"
        />
        <el-button
          type="primary"
          class="send-btn"
          :disabled="!inputText.trim() || loading"
          @click="handleSend"
        >
          <el-icon><Promotion /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { useCartStore } from '../../store/cart'
import { useUserStore } from '../../store/user'
import { chatStreamMock, getChatHistoryApi } from '../../api/chat'

const cartStore = useCartStore()
const userStore = useUserStore()

const inputText = ref('')
const loading = ref(false)
const msgListEl = ref(null)
const currentTyping = ref(false)
const messages = ref([])

const userInitial = computed(() =>
  (userStore.userInfo?.nickname || userStore.userInfo?.username || 'U')[0].toUpperCase()
)

const tips = [
  '推荐热门耳机',
  '我想买手机，价格在 5000 以内',
  '有什么好用的电脑吗？',
  '帮我找最划算的产品'
]

onMounted(async () => {
  try {
    const res = await getChatHistoryApi()
    if (res.data && res.data.length) {
      messages.value = res.data.map(m => ({ ...m, products: m.products || [] }))
    } else {
      messages.value = [{ role: 'assistant', content: '您好！👋 我是 AI 购物助手，告诉我您想买什么，我来精准推荐！', products: [] }]
    }
  } catch {
    messages.value = [{ role: 'assistant', content: '您好！👋 我是 AI 购物助手，告诉我您想买什么，我来精准推荐！', products: [] }]
  }
  await scrollToBottom()
})

function formatContent (text) {
  return text.replace(/\n/g, '<br/>')
}

async function scrollToBottom () {
  await nextTick()
  if (msgListEl.value) {
    msgListEl.value.scrollTop = msgListEl.value.scrollHeight
  }
}

async function sendMessage (text) {
  if (!text.trim() || loading.value) return
  const userMsg = { role: 'user', content: text, products: [] }
  messages.value.push(userMsg)
  await scrollToBottom()

  loading.value = true
  currentTyping.value = false

  const aiMsg = { role: 'assistant', content: '', products: [], typing: true }
  messages.value.push(aiMsg)

  try {
    await chatStreamMock(
      text,
      (char) => {
        currentTyping.value = true
        aiMsg.content += char
        scrollToBottom()
      },
      (products) => {
        aiMsg.products = products
        scrollToBottom()
      },
      () => {
        aiMsg.typing = false
        loading.value = false
        currentTyping.value = false
      }
    )
  } catch (e) {
    aiMsg.content = '抱歉，AI 助手暂时无法回复，请稍后再试。'
    aiMsg.typing = false
    loading.value = false
  }
}

function handleSend () {
  const text = inputText.value.trim()
  inputText.value = ''
  sendMessage(text)
}

function addToCart (product) {
  cartStore.addToCart(product)
}
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 64px);
  background: var(--bg-base);
  overflow: hidden;
}

/* 侧边栏 */
.chat-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ai-logo {
  font-size: 36px;
  filter: drop-shadow(0 0 12px rgba(99,102,241,0.6));
}
.ai-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.ai-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}
.tip-title {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tip-item {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  margin-bottom: 8px;
  transition: var(--transition);
}
.tip-item:hover {
  background: rgba(99,102,241,0.1);
  border-color: var(--primary);
  color: var(--primary-light);
}

/* 聊天主区 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 消息行 */
.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;
}
.msg-row.user {
  flex-direction: row-reverse;
  margin-left: auto;
}
.msg-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.user-avatar {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}
.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.msg-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.8;
  max-width: 100%;
  word-break: break-word;
}
.msg-bubble.assistant {
  background: var(--bg-card2);
  border: 1px solid var(--border);
  border-top-left-radius: 4px;
  color: var(--text-primary);
}
.msg-bubble.user {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-top-right-radius: 4px;
  color: #fff;
}

/* 打字光标 */
.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--primary-light);
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 0.8s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* loading 气泡 */
.thinking-bubble {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-card2);
  border: 1px solid var(--border);
  padding: 14px 20px;
  border-radius: 16px;
  border-top-left-radius: 4px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  animation: bounce 1.2s infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* 商品迷你卡片 */
.product-cards {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.product-cards::-webkit-scrollbar { height: 4px; }
.mini-card {
  flex-shrink: 0;
  width: 160px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition);
}
.mini-card:hover {
  border-color: var(--primary);
  transform: translateY(-3px);
  box-shadow: var(--shadow-glow);
}
.mini-card-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}
.mini-card-info {
  padding: 8px 10px;
}
.mini-card-name {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mini-card-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  margin: 2px 0 6px;
}
.mini-add-btn {
  width: calc(100% - 20px) !important;
  margin: 0 10px 10px;
  border-radius: 6px !important;
}

/* 输入框区域 */
.chat-input-bar {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
}
.chat-input {
  flex: 1;
}
.send-btn {
  width: 52px !important;
  height: 44px !important;
  border-radius: var(--radius-sm) !important;
  font-size: 20px;
}

@media (max-width: 768px) {
  .chat-sidebar { display: none; }
}
</style>
