<template>
  <div class="home">
    <section class="hero-section">
      <div class="container hero-layout">
        <div class="hero-main">
          <el-carousel
            height="420px"
            indicator-position="outside"
            arrow="always"
            class="hero-carousel"
            :interval="5000"
          >
            <el-carousel-item v-for="slide in heroSlides" :key="slide.id">
              <div class="hero-slide" :style="{ backgroundImage: `url(${slide.image})` }">
                <div class="hero-overlay">
                  <div class="hero-chip">{{ slide.category }}</div>
                  <h1>{{ slide.title }}</h1>
                  <p>{{ slide.description }}</p>
                  <div class="hero-actions">
                    <el-button type="primary" size="large" @click="$router.push('/chat')">AI 推荐选购</el-button>
                    <el-button size="large" @click="goProductList(slide.keyword)">立即选购</el-button>
                  </div>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <aside class="hero-side">
          <div
            class="promo-card primary-promo"
            :style="featuredPromoImage ? { '--promo-image': `url(${featuredPromoImage})` } : {}"
            @click="$router.push('/products')"
          >
            <span class="promo-label">热卖专区</span>
            <strong>今日精选<br>高热度商品</strong>
            <small>品牌、数码、家居同步更新</small>
          </div>
          <div
            class="promo-card secondary-promo"
            :style="guidePromoImage ? { '--guide-image': `url(${guidePromoImage})` } : {}"
            @click="$router.push('/chat')"
          >
            <span class="promo-label">智能导购</span>
            <strong>一句话说需求<br>直接给你商品</strong>
            <small>更接近淘宝、京东的高转化入口</small>
          </div>
        </aside>
      </div>

      <div class="container benefit-row">
        <div class="benefit-card" v-for="item in benefits" :key="item.title">
          <span class="benefit-icon">
            <IconFont :name="item.icon" size="20px" />
          </span>
          <div class="benefit-copy">
            <strong>{{ item.title }}</strong>
            <small>{{ item.desc }}</small>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">热门分类</h2>
            <div class="section-subtitle">像主流电商首页一样，先给用户高频入口</div>
          </div>
          <el-button text class="see-all" @click="$router.push('/products')">全部分类</el-button>
        </div>

        <div class="categories">
          <div
            v-for="cat in categories"
            :key="cat.rawName"
            class="cat-card"
            :style="cat.image ? { '--cat-image': `url(${cat.image})` } : {}"
            @click="browseCategory(cat.rawName)"
          >
            <span class="cat-icon">
              <IconFont :name="cat.icon" size="20px" />
            </span>
            <div class="cat-copy">
              <span class="cat-title">{{ cat.displayName }}</span>
              <span class="cat-meta">点击查看商品</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section products-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">猜你喜欢</h2>
            <div class="section-subtitle">红白主调负责吸引点击，白底保证清爽和转化</div>
          </div>
          <el-button text class="see-all" @click="$router.push('/products')">查看更多</el-button>
        </div>

        <div v-if="loading" class="products-grid">
          <div v-for="i in 12" :key="i" class="product-skeleton"></div>
        </div>
        <div v-else class="products-area">
          <div class="products-grid">
            <ProductCard
              v-for="p in products"
              :key="p.id"
              :product="p"
              @add-cart="handleAddCart"
            />
          </div>
          <div v-if="products.length" ref="homeLoadMoreTrigger" class="home-load-more">
            <span v-if="hasMoreProducts">继续下滑加载更多商品</span>
            <span v-else>已经展示全部商品</span>
          </div>
        </div>
      </div>
    </section>
  </div>
  <el-backtop :right="28" :bottom="124">
    <div class="home-backtop">
      <span class="home-backtop-triangle">▲</span>
      <span class="home-backtop-label">回到顶部</span>
    </div>
  </el-backtop>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductCategoriesApi, getProductListApi } from '../../api/product'
import { useCartStore } from '../../store/cart'
import ProductCard from '../../components/ProductCard.vue'
import IconFont from '../../components/IconFont.vue'

const router = useRouter()
const cartStore = useCartStore()
const allProducts = ref([])
const categoryRows = ref([])
const loading = ref(true)
const HOME_PAGE_SIZE = 12
const homePage = ref(1)
const homeTotal = ref(0)
const homeLoadMoreTrigger = ref(null)

let homeObserver = null

const categoryIconMap = [
  {
    match: ['数码', '电子', '手机', '电脑'],
    icon: 'icon-electronics',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['服饰', '女装', '男装', '鞋', '箱包'],
    icon: 'icon-apparel',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['家居', '家具', '家纺'],
    icon: 'icon-furniture',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['美妆', '护肤', '个护'],
    icon: 'icon-beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['食品', '零食', '保健', '生鲜'],
    icon: 'icon-Non-staplefood',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['宠物'],
    icon: 'icon-smile-fill',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['汽车', '车'],
    icon: 'icon-auto',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['办公', '文具'],
    icon: 'icon-office-supplies-fill',
    image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['工业', '五金', '工具'],
    icon: 'icon-tool-fill',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['运动', '户外'],
    icon: 'icon-sport',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['玩具'],
    icon: 'icon-toy',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80'
  }
]

const resolveCategoryIcon = (name) => {
  const text = String(name || '')
  const matched = categoryIconMap.find((item) => item.match.some((word) => text.includes(word)))
  return matched?.icon || 'icon-category'
}

const resolveCategoryImage = (name) => {
  const text = String(name || '')
  const matched = categoryIconMap.find((item) => item.match.some((word) => text.includes(word)))
  return matched?.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
}

const categories = computed(() => {
  let level1 = categoryRows.value
    .map((p) => p.level1 || '')
    .filter(Boolean)
  level1 = [...new Set(level1)]
  level1.sort((a, b) => a.localeCompare(b, 'zh-CN'))
  return level1.slice(0, 10).map((name) => ({
    rawName: name,
    displayName: name === '综合' ? '其他' : name,
    icon: resolveCategoryIcon(name),
    image: resolveCategoryImage(name)
  }))
})

const benefits = [
  { icon: 'icon-coupons-fill', title: '限时优惠', desc: '首页入口直接承接优惠券和活动' },
  { icon: 'icon-rankinglist-fill', title: '精选推荐', desc: '先看高热度商品，减少选择成本' },
  { icon: 'icon-comments-fill', title: 'AI 导购', desc: '一句话提需求，直接返回商品结果' },
  { icon: 'icon-checkstand', title: '快速下单', desc: '更像主流电商的高转化浏览路径' }
]

const heroSlides = computed(() => {
  const source = allProducts.value.slice(0, 4)
  if (source.length) {
    return source.map((item, index) => ({
      id: item.id,
      image: item.image || item.imageUrl,
      category: item.categoryLevel1 || item.category || '精选商品',
      title: item.name,
      description: `第 ${index + 1} 波首页推荐，适合放在主视觉区域做高点击曝光。`,
      keyword: item.categoryLevel1 || item.category || item.name
    }))
  }
  return [
    {
      id: 'fallback-1',
      image: 'https://picsum.photos/seed/shop-1/1400/800',
      category: '首页推荐',
      title: '像淘宝首页一样，先把主推商品打出来',
      description: '轮播图更适合承接活动、品牌和高频类目入口。',
      keyword: '热卖'
    }
  ]
})

const featuredPromoImage = computed(() =>
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80'
)

const guidePromoImage = computed(() =>
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
)

const products = computed(() => allProducts.value)
const hasMoreProducts = computed(() => allProducts.value.length < homeTotal.value)

const loadMoreProducts = async () => {
  if (!hasMoreProducts.value) return
  const nextPage = homePage.value + 1
  try {
    const res = await getProductListApi({ page: nextPage, size: HOME_PAGE_SIZE })
    const list = res.data?.list || []
    allProducts.value = [...allProducts.value, ...list]
    homePage.value = nextPage
    homeTotal.value = res.data?.total || homeTotal.value
  } catch (_err) {
    ElMessage.warning('更多商品加载失败，请稍后再试')
  }
}

const setupHomeInfiniteScroll = async () => {
  await nextTick()
  homeObserver?.disconnect()
  if (!homeLoadMoreTrigger.value || loading.value) return

  homeObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMoreProducts()
    },
    { rootMargin: '320px 0px' }
  )

  homeObserver.observe(homeLoadMoreTrigger.value)
}

onMounted(async () => {
  const [productResult, categoryResult] = await Promise.allSettled([
    getProductListApi({ page: 1, size: HOME_PAGE_SIZE }),
    getProductCategoriesApi()
  ])

  if (productResult.status === 'fulfilled') {
    allProducts.value = productResult.value.data?.list || []
    homeTotal.value = productResult.value.data?.total || allProducts.value.length
  } else {
    allProducts.value = []
    homeTotal.value = 0
    ElMessage.warning('商品列表加载失败，请刷新后重试')
  }

  if (categoryResult.status === 'fulfilled') {
    categoryRows.value = categoryResult.value.data?.list || []
  } else {
    categoryRows.value = []
    ElMessage.warning('分类入口暂时加载失败，已先展示商品内容')
  }

  loading.value = false
  await setupHomeInfiniteScroll()
})

onBeforeUnmount(() => {
  homeObserver?.disconnect()
})

const browseCategory = (cat) => {
  router.push({ path: '/products', query: { category: cat } })
}

const goProductList = (keyword) => {
  router.push({ path: '/products', query: keyword ? { keyword } : {} })
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
.home {
  background: #ffffff;
}

.hero-section {
  padding: 20px 0;
  background: #ffffff;
  border-bottom: 1px solid rgba(255, 90, 54, 0.08);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 18px;
}

.hero-main {
  min-width: 0;
}

.hero-carousel :deep(.el-carousel__container) {
  border-radius: 28px;
  overflow: hidden;
}

.hero-carousel :deep(.el-carousel__arrow) {
  background: rgba(255, 255, 255, 0.88);
  color: #ff5a36;
}

.hero-carousel :deep(.el-carousel__indicator-button) {
  background: rgba(255, 90, 54, 0.28);
}

.hero-carousel :deep(.is-active .el-carousel__indicator-button) {
  background: #ff5a36;
}

.hero-slide {
  position: relative;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.hero-slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(58, 36, 28, 0.16);
}

.hero-overlay {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 42px 48px;
  color: #ffffff;
}

.hero-chip {
  width: fit-content;
  margin-bottom: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.hero-overlay h1 {
  max-width: 560px;
  margin: 0 0 14px;
  font-size: 40px;
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero-overlay p {
  max-width: 520px;
  margin: 0 0 24px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 14px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-actions :deep(.el-button) {
  min-width: 144px;
  height: 44px;
  border-radius: 999px !important;
  font-weight: 700;
}

.hero-actions :deep(.el-button:not(.el-button--primary)) {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.92);
  color: #e34724;
}

.hero-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.promo-card {
  position: relative;
  min-height: 200px;
  padding: 26px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 28px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
}

.promo-card > * {
  position: relative;
  z-index: 1;
}

.promo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 32px rgba(255, 79, 109, 0.16);
}

.promo-label {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.promo-card strong {
  font-size: 28px;
  line-height: 1.18;
}

.promo-card small {
  font-size: 13px;
  line-height: 1.5;
}

.primary-promo {
  background: #ff5a36;
  color: #ffffff;
  isolation: isolate;
}

.primary-promo::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--promo-image);
  background-size: cover;
  background-position: center;
  opacity: 0.7;
  mix-blend-mode: normal;
  transform: scale(1.04);
}

.primary-promo::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 114, 61, 0.42) 0%, rgba(255, 90, 54, 0.5) 100%),
    radial-gradient(circle at 78% 22%, rgba(255, 214, 171, 0.18) 0%, transparent 30%);
}

.secondary-promo {
  background: #ffffff;
  color: #3a241c;
  border: 1px solid rgba(255, 79, 109, 0.12);
  isolation: isolate;
}

.secondary-promo::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--guide-image);
  background-size: cover;
  background-position: center;
  opacity: 0.6;
  transform: scale(1.04);
}

.secondary-promo::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.56) 0%, rgba(255, 248, 245, 0.68) 100%),
    radial-gradient(circle at 82% 18%, rgba(255, 152, 114, 0.18) 0%, transparent 32%);
}

.benefit-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.benefit-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(255, 79, 109, 0.06);
}

.benefit-icon,
.cat-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 90, 54, 0.08);
  color: #ff5a36;
}

.benefit-copy,
.cat-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.benefit-copy strong,
.cat-title {
  color: #3a241c;
  font-size: 14px;
  font-weight: 700;
}

.benefit-copy small,
.cat-meta,
.section-subtitle {
  color: #a98478;
  font-size: 12px;
}

.section {
  padding: 34px 0 40px;
}

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.section-title {
  margin: 0 0 4px;
  color: #3a241c;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.see-all {
  color: #ff5a36;
  font-weight: 700;
}

.categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.cat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 18px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid rgba(255, 90, 54, 0.12);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  overflow: hidden;
  isolation: isolate;
}

.cat-card > * {
  position: relative;
  z-index: 1;
}

.cat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--cat-image);
  background-size: cover;
  background-position: center;
  opacity: 0.6;
  transform: scale(1.04);
}

.cat-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 248, 244, 0.74) 100%);
}

.cat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 90, 54, 0.34);
  box-shadow: 0 14px 28px rgba(255, 79, 109, 0.08);
}

.products-section {
  background: #ffffff;
  border-top: 1px solid rgba(255, 79, 109, 0.08);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.products-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-load-more {
  padding: 8px 0 0;
  text-align: center;
  color: #a98478;
  font-size: 13px;
}

.product-skeleton {
  height: 340px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
}

.home-backtop {
  width: 56px;
  min-height: 56px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(255, 90, 54, 0.14);
  box-shadow: 0 14px 26px rgba(255, 90, 54, 0.14);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.home-backtop:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 34px rgba(255, 90, 54, 0.18);
}

.home-backtop-triangle {
  color: #ff5a36;
  font-size: 16px;
  line-height: 1;
  transform: translateY(-1px);
}

.home-backtop-label {
  font-size: 10px;
  line-height: 1;
  color: #a45e47;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .hero-layout {
    grid-template-columns: 1fr;
  }

  .hero-side {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .benefit-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .categories {
    grid-template-columns: repeat(4, 1fr);
  }

  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .hero-overlay {
    padding: 30px 28px;
  }

  .hero-overlay h1 {
    font-size: 34px;
  }

  .hero-side {
    grid-template-columns: 1fr;
  }

  .benefit-row {
    grid-template-columns: 1fr;
  }

  .categories {
    grid-template-columns: repeat(2, 1fr);
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 14px;
  }

  .hero-section {
    padding-top: 12px;
  }

  .hero-carousel :deep(.el-carousel__container) {
    height: 360px !important;
  }

  .hero-overlay h1 {
    font-size: 28px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .categories,
  .products-grid {
    grid-template-columns: 1fr;
  }

  .home-backtop {
    width: 52px;
    height: 52px;
  }
}
</style>
