<template>
  <div class="home">
    <!-- Hero Banner 轮播 -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-text fade-in-up">
          <div class="hero-badge">🤖 AI 智能购物助手</div>
          <h1 class="hero-title">
            用对话方式
            <br />
            <span class="gradient-text">探索你想要的一切</span>
          </h1>
          <p class="hero-desc">通过 AI 聊天，轻松发现、比较、购买心仪商品。支持语义搜索，让购物更智能。</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" class="hero-btn-primary" @click="$router.push('/chat')">
              💬 与 AI 对话购物
            </el-button>
            <el-button size="large" class="hero-btn-secondary" @click="$router.push('/products')">
              浏览全部商品 →
            </el-button>
          </div>
          <div class="hero-stats">
            <div class="stat"><span class="stat-num">10万+</span><span class="stat-label">精选商品</span></div>
            <div class="stat-div"></div>
            <div class="stat"><span class="stat-num">98%</span><span class="stat-label">好评率</span></div>
            <div class="stat-div"></div>
            <div class="stat"><span class="stat-num">24h</span><span class="stat-label">AI在线</span></div>
          </div>
        </div>
        <div class="hero-visual fade-in-up" style="animation-delay:0.2s">
          <div class="chat-preview glass-card">
            <div class="chat-header">
              <span class="dot green"></span>
              <span style="font-size:13px;color:#94a3b8">AI 购物助手</span>
            </div>
            <div class="chat-msgs">
              <div class="msg ai">
                <span class="msg-avatar">🤖</span>
                <div class="msg-bubble">你好！我是 AI 购物助手，帮你找到最适合的商品 ✨</div>
              </div>
              <div class="msg user">
                <div class="msg-bubble">我想买一款降噪耳机，预算2000左右</div>
              </div>
              <div class="msg ai">
                <span class="msg-avatar">🤖</span>
                <div class="msg-bubble">为你推荐 Sony WH-1000XM5，业界顶级降噪，¥2299，口碑极佳 🎧</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 商品分类 -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">商品分类</h2>
        <div class="categories">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="cat-card glass-card"
            @click="browseCategory(cat.name)"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门商品 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门商品</h2>
          <el-button text class="see-all" @click="$router.push('/products')">查看全部 →</el-button>
        </div>
        <div v-if="loading" class="products-grid">
          <div v-for="i in 8" :key="i" class="product-skeleton glass-card"></div>
        </div>
        <div v-else class="products-grid">
          <ProductCard
            v-for="p in products"
            :key="p.id"
            :product="p"
            @add-cart="handleAddCart"
          />
        </div>
      </div>
    </section>

    <!-- AI 功能介绍 -->
    <section class="section features-section">
      <div class="container">
        <h2 class="section-title" style="text-align:center">为什么选择 AIShop</h2>
        <div class="features">
          <div v-for="f in features" :key="f.title" class="feature-card glass-card">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProductListApi } from '../../api/product'
import { useCartStore } from '../../store/cart'
import ProductCard from '../../components/ProductCard.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()
const products = ref([])
const allProducts = ref([])
const loading = ref(true)

const categoryIcons = {
  '手机数码': '📱',
  '电脑平板': '💻',
  '音频设备': '🎧',
  '家用电器': '🏠',
  '运动服饰': '👟',
  '美妆护肤': '💄',
  '食品保健': '🥗',
  '宠物用品': '🐾',
  '汽车用品': '🚗',
  '办公文具': '📚',
  '家居生活': '🛋️',
  '珠宝配饰': '💍',
  '玩具派对': '🎉',
  '工业用品': '🛠️'
}

const categories = computed(() => {
  return [...new Set(allProducts.value.map((p) => p.category).filter(Boolean))]
    .slice(0, 12)
    .map((name) => ({ name, icon: categoryIcons[name] || '🛍️' }))
})

const features = [
  { icon: '🤖', title: 'AI 语义搜索', desc: '用自然语言描述需求，AI 精准理解并推荐匹配商品' },
  { icon: '💬', title: '对话式购物', desc: '像聊天一样购物，AI 助手全程陪伴，解答疑问' },
  { icon: '🛒', title: '一键加购', desc: '聊天中直接加入购物车，无需跳转，极致流畅' },
  { icon: '🔒', title: '安全支付', desc: '支付宝沙箱安全支付，交易有保障' }
]

onMounted(async () => {
  const res = await getProductListApi({})
  allProducts.value = res.data?.list || []
  products.value = allProducts.value.slice(0, 8)
  loading.value = false
})

const browseCategory = (cat) => {
  router.push({ path: '/products', query: { category: cat } })
}

const handleAddCart = async (product) => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  await cartStore.addToCart(product)
}
</script>

<style scoped>
.home { }

/* ——— Hero ——— */
.hero {
  position: relative;
  min-height: 580px;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 70% 50%, rgba(99,102,241,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 40% 60% at 20% 80%, rgba(236,72,153,0.12) 0%, transparent 70%);
}
.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px 60px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  color: #818cf8;
  margin-bottom: 20px;
}
.hero-title {
  font-size: 52px;
  font-weight: 800;
  line-height: 1.15;
  color: #e2e8f0;
  margin-bottom: 16px;
  letter-spacing: -1px;
}
.hero-desc { color: #94a3b8; font-size: 17px; line-height: 1.6; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }
.hero-btn-primary {
  height: 52px; padding: 0 32px; font-size: 16px; font-weight: 600;
  background: linear-gradient(135deg, #6366f1, #ec4899) !important;
  border: none !important; border-radius: 12px !important;
}
.hero-btn-secondary {
  height: 52px; padding: 0 28px; font-size: 16px;
  background: transparent !important;
  border: 1px solid rgba(99,102,241,0.4) !important;
  color: #e2e8f0 !important; border-radius: 12px !important;
}
.hero-stats { display: flex; align-items: center; gap: 24px; }
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-num { font-size: 22px; font-weight: 700; color: #818cf8; }
.stat-label { font-size: 12px; color: #64748b; }
.stat-div { width: 1px; height: 36px; background: rgba(99,102,241,0.2); }

/* Chat 预览 */
.chat-preview {
  padding: 20px;
  max-width: 380px;
  animation: float 5s ease-in-out infinite;
}
.chat-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.green { background: #22c55e; }
.chat-msgs { display: flex; flex-direction: column; gap: 12px; }
.msg { display: flex; gap: 8px; align-items: flex-end; }
.msg.user { flex-direction: row-reverse; }
.msg-avatar { font-size: 22px; flex-shrink: 0; }
.msg-bubble {
  font-size: 13px;
  line-height: 1.5;
  padding: 10px 14px;
  border-radius: 12px;
  max-width: 240px;
}
.msg.ai .msg-bubble {
  background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.2);
  color: #e2e8f0;
  border-radius: 4px 12px 12px 12px;
}
.msg.user .msg-bubble {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border-radius: 12px 4px 12px 12px;
}

/* ——— Sections ——— */
.section { padding: 60px 0; }
.container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
.section-title { font-size: 28px; font-weight: 700; color: #e2e8f0; margin-bottom: 28px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.section-header .section-title { margin-bottom: 0; }
.see-all { color: #818cf8 !important; font-size: 14px !important; }

/* 分类 */
.categories {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
}
.cat-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 20px 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border-radius: 12px;
}
.cat-card:hover {
  transform: translateY(-6px);
  border-color: rgba(99,102,241,0.5);
  background: rgba(99,102,241,0.1);
}
.cat-icon { font-size: 32px; }
.cat-name { font-size: 13px; color: #94a3b8; }

/* 商品 Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.product-skeleton {
  height: 320px;
  background: linear-gradient(90deg, rgba(26,26,46,0.8) 25%, rgba(99,102,241,0.07) 50%, rgba(26,26,46,0.8) 75%);
  background-size: 200% auto;
  animation: shimmer 1.5s linear infinite;
  border-radius: 12px;
}

/* Features */
.features-section { background: rgba(26,26,46,0.3); }
.features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 12px;
}
.feature-card { padding: 32px 24px; text-align: center; transition: all 0.25s; }
.feature-card:hover { transform: translateY(-6px); border-color: rgba(99,102,241,0.4); }
.feature-icon { font-size: 40px; margin-bottom: 16px; }
.feature-card h3 { font-size: 17px; font-weight: 600; color: #e2e8f0; margin-bottom: 10px; }
.feature-card p { font-size: 14px; color: #64748b; line-height: 1.6; }
</style>
