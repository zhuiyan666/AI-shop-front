<template>
  <div class="product-list-page">
    <div class="container">
      <!-- 筛选栏 -->
      <div class="filter-bar glass-card">
        <div class="filter-left">
          <span class="filter-label">分类：</span>
          <div class="cat-tabs">
            <button
              v-for="cat in ['全部', ...categories]"
              :key="cat"
              :class="['cat-tab', { active: activeCategory === cat }]"
              @click="selectCategory(cat)"
            >{{ cat }}</button>
          </div>
        </div>
        <div class="filter-right">
          <el-input v-model="keyword" placeholder="搜索商品..." class="filter-search" clearable @input="doFilter" prefix-icon="Search" />
          <el-select v-model="sortBy" placeholder="排序" class="sort-select" @change="doFilter">
            <el-option label="综合" value="" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
            <el-option label="销量最高" value="sales" />
            <el-option label="评分最高" value="rating" />
          </el-select>
        </div>
      </div>

      <!-- 结果信息 -->
      <div class="result-info">
        <span>共 <b style="color:#818cf8">{{ filteredProducts.length }}</b> 件商品</span>
        <span v-if="activeCategory !== '全部'" class="badge">{{ activeCategory }}</span>
        <span v-if="keyword" class="badge">关键词：{{ keyword }}</span>
      </div>

      <!-- 商品列表 -->
      <div v-if="loading" class="products-grid">
        <div v-for="i in 8" :key="i" class="skeleton glass-card"></div>
      </div>
      <div v-else-if="filteredProducts.length === 0" class="empty">
        <div style="font-size:60px">🔍</div>
        <p>没有找到匹配的商品</p>
        <el-button type="primary" @click="resetFilter">重置筛选</el-button>
      </div>
      <div v-else class="products-grid">
        <ProductCard
          v-for="p in filteredProducts"
          :key="p.id"
          :product="p"
          @add-cart="handleAddCart"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductListApi } from '../../api/product'
import { useCartStore } from '../../store/cart'
import ProductCard from '../../components/ProductCard.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const allProducts = ref([])
const loading = ref(true)
const keyword = ref(route.query.keyword || '')
const activeCategory = ref(route.query.category || '全部')
const sortBy = ref('')

const categories = ['手机数码', '电脑平板', '音频设备', '家用电器', '运动服饰', '影音娱乐']

const filteredProducts = computed(() => {
  let list = [...allProducts.value]
  if (activeCategory.value !== '全部') list = list.filter(p => p.category === activeCategory.value)
  if (keyword.value) list = list.filter(p => p.name.includes(keyword.value) || p.category.includes(keyword.value))
  if (sortBy.value === 'price_asc') list.sort((a, b) => a.price - b.price)
  else if (sortBy.value === 'price_desc') list.sort((a, b) => b.price - a.price)
  else if (sortBy.value === 'sales') list.sort((a, b) => b.sales - a.sales)
  else if (sortBy.value === 'rating') list.sort((a, b) => b.rating - a.rating)
  return list
})

onMounted(async () => {
  const res = await getProductListApi({})
  allProducts.value = res.data?.list || []
  loading.value = false
})

watch(() => route.query, (q) => {
  keyword.value = q.keyword || ''
  activeCategory.value = q.category || '全部'
})

const selectCategory = (cat) => { activeCategory.value = cat }
const doFilter = () => {}
const resetFilter = () => { keyword.value = ''; activeCategory.value = '全部'; sortBy.value = '' }

const handleAddCart = async (product) => {
  if (!localStorage.getItem('token')) { ElMessage.warning('请先登录'); router.push('/login'); return }
  await cartStore.addToCart(product)
}
</script>

<style scoped>
.product-list-page { padding: 24px 0 60px; min-height: 100vh; }
.container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
.filter-bar { padding: 20px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.filter-label { font-size: 14px; color: #64748b; white-space: nowrap; }
.filter-left { display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap; }
.cat-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.cat-tab { padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(99,102,241,0.2); background: transparent; color: #94a3b8; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.cat-tab:hover { border-color: rgba(99,102,241,0.5); color: #818cf8; }
.cat-tab.active { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #818cf8; }
.filter-right { display: flex; gap: 12px; align-items: center; }
.filter-search { width: 220px; }
.filter-search :deep(.el-input__wrapper) { background: rgba(15,15,26,0.5); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; box-shadow: none !important; }
.filter-search :deep(.el-input__inner) { color: #e2e8f0; }
.sort-select { width: 160px; }
.sort-select :deep(.el-input__wrapper) { background: rgba(15,15,26,0.5) !important; border: 1px solid rgba(99,102,241,0.2) !important; box-shadow: none !important; }
.sort-select :deep(.el-input__inner) { color: #e2e8f0 !important; }
.result-info { margin-bottom: 20px; font-size: 14px; color: #64748b; display: flex; align-items: center; gap: 10px; }
.badge { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; border-radius: 12px; padding: 2px 10px; font-size: 12px; }
.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.skeleton { height: 340px; background: linear-gradient(90deg, rgba(26,26,46,0.8) 25%, rgba(99,102,241,0.07) 50%, rgba(26,26,46,0.8) 75%); background-size: 200% auto; animation: shimmer 1.5s linear infinite; border-radius: 12px; }
.empty { text-align: center; padding: 80px 0; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 16px; font-size: 16px; }
</style>
