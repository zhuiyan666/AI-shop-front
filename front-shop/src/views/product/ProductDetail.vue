<template>
  <div class="detail-page">
    <div v-if="product" class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/products' }">商品</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-main">
        <div class="img-section">
          <div class="main-img-wrap">
            <img :src="activeImage" :alt="product.name" class="main-img" />
          </div>
          <div class="thumb-list">
            <img
              v-for="(img, i) in gallery"
              :key="i"
              :src="img"
              :class="['thumb', { active: activeImage === img }]"
              @click="activeImage = img"
            />
          </div>
        </div>

        <div class="info-section glass-card">
          <div class="tags-row">
            <span v-for="tag in product.tags || []" :key="tag" class="tag">{{ tag }}</span>
            <span class="cat">{{ product.category }}</span>
          </div>
          <h1 class="product-name">{{ product.name }}</h1>

          <div class="rating-row">
            <el-rate :model-value="product.rating" disabled />
            <span class="rating-val">{{ product.rating }}</span>
            <span class="sales">已售 {{ product.sales?.toLocaleString() }} 件</span>
            <span class="buyers">购买人数 {{ (product.buyerCount ?? product.sales ?? 0).toLocaleString() }}</span>
          </div>

          <div class="price-card">
            <span class="price">¥{{ product.price?.toLocaleString() }}</span>
            <span v-if="product.originalPrice" class="original">原价 ¥{{ product.originalPrice?.toLocaleString() }}</span>
            <span v-if="product.originalPrice" class="discount">{{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF</span>
          </div>

          <div class="merchant-card">
            <span class="merchant-label">商家</span>
            <span class="merchant-name">{{ product.merchantName || product.brand || '平台商家' }}</span>
          </div>

          <div class="quantity-row">
            <span class="label">数量</span>
            <el-input-number v-model="quantity" :min="1" :max="Math.max(1, product.stock || 1)" size="large" />
            <span class="stock">库存 {{ product.stock }} 件</span>
          </div>

          <div class="action-row">
            <button class="btn-cart" @click="handleAddCart">
              <IconFont name="icon-cart-full-fill" size="16px" />
              加入购物车
            </button>
            <button class="btn-buy" @click="handleBuyNow">立即购买</button>
          </div>

          <div class="desc-section">
            <button class="desc-toggle" type="button" @click="descExpanded = !descExpanded">
              <h3>商品描述</h3>
              <span class="desc-toggle-action">
                {{ descExpanded ? '收起' : '展开' }}
                <IconFont :name="descExpanded ? 'icon-arrow-up' : 'icon-arrow-down'" size="14px" />
              </span>
            </button>
            <p :class="{ collapsed: !descExpanded }">{{ product.description }}</p>
          </div>

          <div class="service-tags">
            <span><IconFont name="icon-security-fill" size="14px" /> 正品保障</span>
            <span><IconFont name="icon-kuaidiwuliu" size="14px" /> 快速发货</span>
            <span><IconFont name="icon-return" size="14px" /> 7天退换</span>
            <span><IconFont name="icon-paylater-fill" size="14px" /> 安全支付</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-wrap">
      <el-skeleton :rows="8" animated />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductDetailApi } from '../../api/product'
import { useCartStore } from '../../store/cart'
import IconFont from '../../components/IconFont.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const activeImage = ref('')
const quantity = ref(1)
const descExpanded = ref(false)

const gallery = computed(() => {
  if (!product.value) return []
  const list = product.value.images?.length ? product.value.images : [product.value.image].filter(Boolean)
  return list
})

onMounted(async () => {
  const res = await getProductDetailApi(route.params.id)
  product.value = res.data
  activeImage.value = res.data.images?.[0] || res.data.image
  descExpanded.value = false
})

const ensureLogin = () => {
  if (localStorage.getItem('token')) return true
  ElMessage.warning('请先登录')
  router.push('/login')
  return false
}

const handleAddCart = async () => {
  if (!ensureLogin()) return
  await cartStore.addToCart({ ...product.value, quantity: quantity.value })
}

const handleBuyNow = async () => {
  if (!ensureLogin()) return
  await cartStore.addToCart({ ...product.value, quantity: quantity.value })
  router.push('/cart')
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding: 24px 0 60px;
  background: #ffffff;
}

.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.detail-main {
  display: grid;
  grid-template-columns: 520px minmax(0, 1fr);
  gap: 28px;
}

.img-section,
.info-section {
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 28px;
  box-shadow: 0 16px 30px rgba(255, 79, 109, 0.05);
}

.img-section {
  padding: 22px;
}

.main-img-wrap {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 22px;
  background: #fff7f7;
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-list {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}

.thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
}

.thumb.active {
  border-color: #ff5a36;
}

.info-section {
  padding: 28px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag,
.cat {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid rgba(255, 79, 109, 0.12);
}

.tag {
  background: rgba(255, 79, 109, 0.08);
  color: #ff4f6d;
}

.cat {
  color: #7c4d3f;
}

.product-name {
  margin: 0 0 14px;
  color: #2f201a;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
}

.rating-row,
.quantity-row,
.action-row,
.service-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.rating-row {
  margin-bottom: 18px;
  color: #8f6d60;
  font-size: 13px;
}

.price-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  margin-bottom: 18px;
  background: #fff7f4;
  border-radius: 20px;
}

.merchant-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  margin-bottom: 18px;
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 18px;
}

.merchant-label {
  flex-shrink: 0;
  color: #a07b63;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.merchant-name {
  color: #3a241c;
  font-size: 14px;
  font-weight: 600;
}

.price {
  color: #ff5a36;
  font-size: 32px;
  font-weight: 800;
}

.original {
  color: #b79c90;
  font-size: 13px;
  text-decoration: line-through;
}

.discount {
  color: #ffffff;
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.quantity-row {
  margin-bottom: 20px;
  color: #7c4d3f;
  font-size: 13px;
}

.buyers {
  color: #a07b63;
}

.label,
.stock {
  font-weight: 600;
}

.action-row {
  margin-bottom: 24px;
}

.btn-cart,
.btn-buy {
  height: 48px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cart {
  border: 1px solid rgba(255, 79, 109, 0.16);
  background: #ffffff;
  color: #ff4f6d;
}

.btn-buy {
  border: none;
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  color: #ffffff;
}

.desc-section h3 {
  margin: 0;
  color: #3a241c;
  font-size: 16px;
}

.desc-toggle {
  width: 100%;
  padding: 0;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  background: transparent;
  cursor: pointer;
}

.desc-toggle-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ff5a36;
  font-size: 12px;
  font-weight: 700;
}

.desc-section p {
  margin: 0;
  color: #6f564b;
  font-size: 13px;
  line-height: 1.8;
  transition: all 0.2s ease;
}

.desc-section p.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.service-tags {
  margin-top: 20px;
  gap: 10px 16px;
}

.service-tags span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #7c4d3f;
  font-size: 12px;
}

.loading-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

@media (max-width: 960px) {
  .detail-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .container,
  .loading-wrap {
    padding: 0 14px;
  }

  .product-name {
    font-size: 24px;
  }

  .price {
    font-size: 26px;
  }
}
</style>
