<template>
  <div class="detail-page">
    <div class="container" v-if="product">
      <!-- 面包屑 -->
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/products' }">商品</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-main">
        <!-- 左：图片 -->
        <div class="img-section">
          <div class="main-img-wrap">
            <img :src="activeImage" :alt="product.name" class="main-img" />
          </div>
          <div class="thumb-list">
            <img
              v-for="(img, i) in product.images"
              :key="i"
              :src="img"
              :class="['thumb', { active: activeImage === img }]"
              @click="activeImage = img"
            />
          </div>
        </div>

        <!-- 右：信息 -->
        <div class="info-section glass-card">
          <div class="tags-row">
            <span v-for="tag in product.tags" :key="tag" class="tag" :class="tag">{{ tag }}</span>
            <span class="cat">{{ product.category }}</span>
          </div>
          <h1 class="product-name">{{ product.name }}</h1>

          <div class="rating-row">
            <el-rate :model-value="product.rating" disabled />
            <span class="rating-val">{{ product.rating }}</span>
            <span class="sales">已售 {{ product.sales?.toLocaleString() }} 件</span>
          </div>

          <div class="price-card">
            <span class="price">¥{{ product.price?.toLocaleString() }}</span>
            <span v-if="product.originalPrice" class="original">
              原价 ¥{{ product.originalPrice?.toLocaleString() }}
            </span>
            <span class="discount" v-if="product.originalPrice">
              {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF
            </span>
          </div>

          <div class="quantity-row">
            <span class="label">数量</span>
            <el-input-number v-model="quantity" :min="1" :max="product.stock" size="large" />
            <span class="stock">库存 {{ product.stock }} 件</span>
          </div>

          <div class="action-row">
            <button class="btn-cart" @click="handleAddCart">
              <el-icon><ShoppingCart /></el-icon> 加入购物车
            </button>
            <button class="btn-buy" @click="handleBuyNow">立即购买</button>
          </div>

          <div class="desc-section">
            <h3>商品描述</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="service-tags">
            <span>✅ 正品保障</span>
            <span>🚚 快速发货</span>
            <span>🔄 7天退换</span>
            <span>🔒 安全支付</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else class="loading-wrap">
      <el-skeleton :rows="8" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetailApi } from '../../api/product'
import { useCartStore } from '../../store/cart'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const product = ref(null)
const activeImage = ref('')
const quantity = ref(1)

onMounted(async () => {
  const res = await getProductDetailApi(route.params.id)
  product.value = res.data
  activeImage.value = res.data.images?.[0] || res.data.image
})

const handleAddCart = async () => {
  if (!localStorage.getItem('token')) { ElMessage.warning('请先登录'); router.push('/login'); return }
  await cartStore.addToCart({ ...product.value, quantity: quantity.value })
}

const handleBuyNow = async () => {
  if (!localStorage.getItem('token')) { ElMessage.warning('请先登录'); router.push('/login'); return }
  await cartStore.addToCart({ ...product.value, quantity: quantity.value })
  router.push('/cart')
}
</script>

<style scoped>
.detail-page { min-height: 100vh; padding: 24px 0 60px; }
.container { max-width: 1300px; margin: 0 auto; padding: 0 24px; }
.breadcrumb { margin-bottom: 24px; }
.breadcrumb :deep(.el-breadcrumb__item) { color: #64748b; }
.breadcrumb :deep(.el-breadcrumb__inner) { color: #64748b; }
.breadcrumb :deep(.el-breadcrumb__inner.is-link:hover) { color: #818cf8; }
.detail-main { display: grid; grid-template-columns: 500px 1fr; gap: 32px; align-items: start; }
.main-img-wrap { width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: rgba(15,15,26,0.5); }
.main-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.main-img:hover { transform: scale(1.05); }
.thumb-list { display: flex; gap: 10px; margin-top: 12px; }
.thumb { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
.thumb.active { border-color: #6366f1; }
.thumb:hover { border-color: rgba(99,102,241,0.5); }
.info-section { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
.tags-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.tag { font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: 600; }
.tag.热卖 { background: rgba(239,68,68,0.2); color: #f87171; }
.tag.新品 { background: rgba(99,102,241,0.2); color: #818cf8; }
.cat { font-size: 12px; color: #6366f1; background: rgba(99,102,241,0.1); padding: 3px 10px; border-radius: 10px; }
.product-name { font-size: 24px; font-weight: 700; color: #e2e8f0; line-height: 1.3; }
.rating-row { display: flex; align-items: center; gap: 10px; }
.rating-val { font-size: 16px; font-weight: 700; color: #fbbf24; }
.sales { font-size: 13px; color: #64748b; }
.price-card { background: rgba(244,114,182,0.08); border: 1px solid rgba(244,114,182,0.2); border-radius: 10px; padding: 16px 20px; display: flex; align-items: baseline; gap: 12px; }
.price { font-size: 36px; font-weight: 800; color: #f472b6; }
.original { color: #475569; text-decoration: line-through; font-size: 16px; }
.discount { background: rgba(239,68,68,0.15); color: #f87171; border-radius: 6px; padding: 3px 8px; font-size: 13px; font-weight: 600; }
.quantity-row { display: flex; align-items: center; gap: 16px; }
.label { font-size: 14px; color: #64748b; }
.stock { font-size: 13px; color: #64748b; }
.action-row { display: flex; gap: 12px; }
.btn-cart, .btn-buy {
  flex: 1; height: 52px; border-radius: 10px; font-size: 16px; font-weight: 600;
  cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-cart { background: transparent; border: 2px solid #6366f1; color: #818cf8; }
.btn-cart:hover { background: rgba(99,102,241,0.15); transform: translateY(-2px); }
.btn-buy { background: linear-gradient(135deg, #6366f1, #ec4899); border: none; color: white; box-shadow: 0 8px 24px rgba(99,102,241,0.4); }
.btn-buy:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(99,102,241,0.5); }
.desc-section h3 { font-size: 16px; font-weight: 600; color: #e2e8f0; margin-bottom: 10px; }
.desc-section p { font-size: 14px; color: #94a3b8; line-height: 1.7; }
.service-tags { display: flex; gap: 16px; flex-wrap: wrap; }
.service-tags span { font-size: 13px; color: #64748b; }
.loading-wrap { max-width: 1300px; margin: 60px auto; padding: 0 24px; }
</style>
