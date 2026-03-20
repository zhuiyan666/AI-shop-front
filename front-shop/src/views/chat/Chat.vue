<template>
  <div class="chat-page">
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <div class="ai-logo"><IconFont name="icon-robot" size="28px" /></div>
        <div>
          <div class="ai-title">AI 购物助手</div>
          <div class="ai-subtitle">智能推荐 · 实时对话</div>
        </div>
      </div>

      <div class="sidebar-tips">
        <div class="tip-title">你可以这样问</div>
        <div
          v-for="tip in tips"
          :key="tip"
          class="tip-item"
          @click="sendMessage(tip)"
        >{{ tip }}</div>
      </div>

      <div class="sidebar-actions">
        <el-button class="history-btn" plain @click="startNewConversation">开启新对话</el-button>
        <el-button class="history-btn" plain @click="openHistoryPanel">查看聊天记录</el-button>
        <el-button class="history-btn" type="danger" plain @click="deleteConversation">删除对话</el-button>
      </div>
    </div>

    <div class="chat-main">
      <div ref="msgListEl" class="msg-list">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['msg-row', msg.role]"
        >
          <div v-if="msg.role === 'assistant'" class="msg-avatar assistant-avatar"><IconFont name="icon-robot" size="18px" /></div>
          <div class="msg-bubble-wrap">
            <div :class="['msg-bubble', msg.role]">
              <template v-if="msg.role === 'assistant'">
                <div class="msg-content msg-content-markdown" v-html="renderMarkdown(msg.content)"></div>
                <span v-if="msg.typing" class="cursor"></span>
              </template>
              <template v-else>{{ msg.content }}</template>
            </div>

            <div v-if="msg.products && msg.products.length && !msg.typing" class="product-cards">
              <div
                v-for="product in msg.products"
                :key="product.id"
                class="mini-card"
                @click="goToProduct(product)"
              >
                <img :src="product.image || product.imageUrl || product.img" :alt="product.name" class="mini-card-img" />
                <div class="mini-card-info">
                  <div class="mini-card-name">{{ product.name }}</div>
                  <div class="mini-card-price">¥{{ Number(product.price || 0).toLocaleString() }}</div>
                </div>
                <el-button
                  size="small"
                  type="primary"
                  class="mini-add-btn"
                  @click.stop="addToCart(product)"
                >加入购物车</el-button>
              </div>
            </div>
          </div>

          <div v-if="msg.role === 'user'" class="msg-avatar user-avatar">
            {{ userInitial }}
          </div>
        </div>

        <div v-if="loading && !currentTyping" class="msg-row assistant">
          <div class="msg-avatar assistant-avatar"><IconFont name="icon-robot" size="18px" /></div>
          <div class="thinking-bubble">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <div class="chat-input-bar">
        <div v-if="quickReplies.length" class="quick-replies">
          <div class="quick-replies-title">建议下一步</div>
          <div class="quick-replies-list">
            <el-button
              v-for="item in quickReplies"
              :key="item"
              size="small"
              plain
              class="quick-reply-btn"
              @click="sendMessage(item)"
            >
              {{ item }}
            </el-button>
          </div>
        </div>
        <el-input
          v-model="inputText"
          placeholder="问我任何购物问题..."
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
          <IconFont name="icon-sendinquiry-fill" size="18px" />
        </el-button>
      </div>
    </div>

    <el-drawer v-model="historyVisible" title="聊天记录" size="38%">
      <div v-if="historyLoading" class="history-loading">加载中...</div>
      <div v-else-if="!historyItems.length" class="history-empty">暂无聊天记录</div>
      <div v-else class="history-list">
        <div
          v-for="(item, idx) in historyItems"
          :key="idx"
          class="history-item"
          :class="item.role"
        >
          <div class="history-head">
            <span class="history-role">{{ item.role === 'user' ? '我' : '助手' }}</span>
            <span class="history-time">{{ formatTime(item.createdAt) }}</span>
          </div>
          <div class="history-content history-content-markdown" v-html="renderMarkdown(item.content)"></div>
          <div v-if="item.products && item.products.length" class="history-products">
            推荐商品 {{ item.products.length }} 个
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import IconFont from '../../components/IconFont.vue'
import { useCartStore } from '../../store/cart'
import { useUserStore } from '../../store/user'
import { chatStreamMock, deleteChatHistoryApi, getChatHistoryApi, newConversationApi } from '../../api/chat'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const inputText = ref('')
const loading = ref(false)
const msgListEl = ref(null)
const currentTyping = ref(false)
const messages = ref([])
const quickReplies = ref([])
const historyVisible = ref(false)
const historyLoading = ref(false)
const historyItems = ref([])
const cartSyncing = ref(false)
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})
md.enable(['table'])

const userInitial = computed(() =>
  (userStore.userInfo?.nickname || userStore.userInfo?.username || 'U')[0].toUpperCase()
)

const tips = [
  '推荐热门耳机',
  '我想买手机，预算 5000 以内',
  '有什么好用的电脑吗？',
  '帮我找最划算的商品'
]

onMounted(async () => {
  try {
    const list = await loadHistory(60)
    if (list.length) {
      messages.value = list.map(m => ({ ...m, products: m.products || [] }))
      refreshQuickRepliesByMessages()
    } else {
      messages.value = [{
        role: 'assistant',
        content: '你好，我是 AI 购物助手。告诉我你的预算、品类和用途，我会帮你精准推荐。',
        products: []
      }]
      refreshQuickRepliesByMessages()
    }
  } catch {
    messages.value = [{
      role: 'assistant',
      content: '你好，我是 AI 购物助手。告诉我你的预算、品类和用途，我会帮你精准推荐。',
      products: []
    }]
    refreshQuickRepliesByMessages()
  }
  await scrollToBottom()
})

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
  quickReplies.value = []
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
        aiMsg.products = products || []
        scrollToBottom()
      },
      () => {
        aiMsg.typing = false
        loading.value = false
        currentTyping.value = false
        quickReplies.value = buildQuickReplies(aiMsg.content, aiMsg.products)
        loadHistory(100)
        syncCartBadge()
      }
    )
  } catch {
    aiMsg.content = '抱歉，AI 助手暂时无法回复，请稍后再试。'
    aiMsg.typing = false
    loading.value = false
    quickReplies.value = buildQuickReplies(aiMsg.content, aiMsg.products)
    syncCartBadge()
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

function goToProduct (product) {
  if (!product || !product.id) return
  router.push('/product/' + product.id)
}

async function loadHistory (limit = 40) {
  historyLoading.value = true
  try {
    const res = await getChatHistoryApi(limit)
    const list = Array.isArray(res?.data) ? res.data : []
    historyItems.value = list.map(m => ({ ...m, products: m.products || [] }))
    return historyItems.value
  } finally {
    historyLoading.value = false
  }
}

async function openHistoryPanel () {
  historyVisible.value = true
  await loadHistory(100)
}

async function startNewConversation () {
  try {
    const res = await newConversationApi()
    const list = Array.isArray(res?.data) ? res.data : []
    messages.value = list.length
      ? list.map(m => ({ ...m, products: m.products || [] }))
      : [{
          role: 'assistant',
          content: '你好，我是 AI 购物助手。告诉我你的预算、品类和用途，我会帮你精准推荐。',
          products: []
        }]
    refreshQuickRepliesByMessages()
    await scrollToBottom()
    ElMessage.success('已开启新对话')
  } catch {
    ElMessage.error('开启新对话失败')
  }
}

async function deleteConversation () {
  try {
    await ElMessageBox.confirm('确认删除当前账号下的全部聊天记录吗？该操作不可恢复。', '删除对话', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteChatHistoryApi()
    await startNewConversation()
    historyItems.value = []
    ElMessage.success('聊天记录已删除')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

function formatTime (value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString()
}

function refreshQuickRepliesByMessages () {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    const msg = messages.value[i]
    if (msg.role === 'assistant') {
      quickReplies.value = buildQuickReplies(msg.content, msg.products)
      return
    }
  }
  quickReplies.value = []
}

function buildQuickReplies (content, products = []) {
  const set = new Set()
  const text = String(content || '')
  const patterns = [
    /你可以(?:继续)?这样说[：:]\s*[“"]?([^”"\n]+)[”"]?/g,
    /你可以(?:继续)?说[：:]\s*[“"]?([^”"\n]+)[”"]?/g
  ]

  for (const regex of patterns) {
    let m
    while ((m = regex.exec(text)) !== null) {
      const line = String(m[1] || '')
      const one = sanitizeReplyText(line)
      if (one) {
        set.add(one)
      }
      const parts = line.split(/[/；;]| 或 /)
      for (const part of parts) {
        const item = sanitizeReplyText(part)
        if (item) {
          set.add(item)
        }
      }
    }
  }

  if (Array.isArray(products) && products.length) {
    set.add('介绍第一个商品')
    set.add('把第一个加入购物车')
    set.add('哪个评分最高')
    set.add('哪个更便宜')
  }
  return Array.from(set).slice(0, 6)
}

function sanitizeReplyText (text) {
  if (!text) return ''
  const s = String(text)
    .replace(/[“”"]/g, '')
    .replace(/。+$/g, '')
    .trim()
  if (!s || s.length > 42) return ''
  return s
}

function renderMarkdown (text) {
  const source = String(text || '')
  const html = md.render(source)
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  })
}

async function syncCartBadge () {
  if (!userStore.isLoggedIn || cartSyncing.value) return
  cartSyncing.value = true
  try {
    await cartStore.fetchCart({ silent: true })
  } catch {
    // ignore badge sync error
  } finally {
    cartSyncing.value = false
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 64px);
  background: var(--bg-base);
  overflow: hidden;
}

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
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
  color: var(--primary-light);
}

.history-btn {
  width: 100%;
  height: 42px;
  margin: 0 !important;
  justify-content: flex-start !important;
  padding: 0 14px !important;
  border-radius: 12px !important;
  font-size: 13px;
}

.sidebar-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}

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
  font-size: 18px;
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

.msg-content {
  white-space: pre-line;
}

.msg-content-markdown {
  white-space: normal;
}

.msg-content-markdown :deep(p) {
  margin: 0.35em 0;
}

.msg-content-markdown :deep(p:first-child) {
  margin-top: 0;
}

.msg-content-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.msg-content-markdown :deep(strong) {
  font-weight: 700;
}

.msg-content-markdown :deep(ul),
.msg-content-markdown :deep(ol) {
  margin: 0.4em 0 0.4em 1.2em;
  padding: 0;
}

.msg-content-markdown :deep(li) {
  margin: 0.2em 0;
}

.msg-content-markdown :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  background: rgba(148, 163, 184, 0.18);
  border-radius: 4px;
  padding: 0.05em 0.35em;
}

.msg-content-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5em 0;
  font-size: 13px;
}

.msg-content-markdown :deep(th),
.msg-content-markdown :deep(td) {
  border: 1px solid var(--border);
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}

.msg-content-markdown :deep(th) {
  background: rgba(148, 163, 184, 0.14);
  font-weight: 700;
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

.product-cards {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.product-cards::-webkit-scrollbar { height: 4px; }

.mini-card {
  flex-shrink: 0;
  width: 170px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition);
  cursor: pointer;
}

.mini-card:hover {
  border-color: var(--primary);
  transform: translateY(-3px);
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

.chat-input-bar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px 12px;
  padding: 16px 24px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
}

.quick-replies {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-replies-title {
  font-size: 12px;
  color: var(--text-muted);
}

.quick-replies-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-reply-btn {
  border-radius: 16px !important;
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

.history-loading,
.history-empty {
  color: var(--text-muted);
  font-size: 14px;
  padding: 8px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg-card2);
}

.history-item.user {
  border-left: 3px solid var(--primary);
}

.history-item.assistant {
  border-left: 3px solid var(--accent);
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.history-role {
  font-size: 12px;
  color: var(--text-secondary);
}

.history-time {
  font-size: 12px;
  color: var(--text-muted);
}

.history-content {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
}

.history-content-markdown :deep(p) {
  margin: 0.3em 0;
}

.history-content-markdown :deep(p:first-child) {
  margin-top: 0;
}

.history-content-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.history-content-markdown :deep(strong) {
  font-weight: 700;
}

.history-content-markdown :deep(ul),
.history-content-markdown :deep(ol) {
  margin: 0.35em 0 0.35em 1.1em;
  padding: 0;
}

.history-content-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.45em 0;
  font-size: 13px;
}

.history-content-markdown :deep(th),
.history-content-markdown :deep(td) {
  border: 1px solid var(--border);
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}

.history-content-markdown :deep(th) {
  background: rgba(148, 163, 184, 0.14);
  font-weight: 700;
}

.history-products {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .chat-sidebar { display: none; }
}
</style>

