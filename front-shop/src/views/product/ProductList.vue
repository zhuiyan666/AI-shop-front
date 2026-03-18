<template>
  <div class="product-list-page">
    <div class="container">
      <section class="category-header">
        <div class="header-copy">
          <h1>分类选购</h1>
        </div>

        <div ref="categoryPanelSlotRef" class="category-panel-slot" :style="panelSlotStyle">
          <div v-show="!showFloatingCategory" ref="categoryPanelRef" class="category-panel">
            <div class="panel-title">一级分类</div>
            <div class="l1-list">
              <button
                v-for="l1 in level1Options"
                :key="l1"
                :class="['l1-item', { active: selectedL1 === l1 }]"
                @click="selectL1(l1)"
              >
                {{ prettyCategory(l1) }}
              </button>
            </div>
            <div class="filter-bar">
              <div class="filter-row">
                <el-input
                  v-model="keyword"
                  placeholder="搜索商品名、品牌、分类..."
                  class="filter-search"
                  clearable
                  @change="doFilter"
                  @clear="doFilter"
                  prefix-icon="Search"
                />
                <el-select
                  v-model="sortBy"
                  placeholder="排序"
                  class="sort-select"
                  @change="doFilter"
                >
                  <el-option label="综合" value="" />
                  <el-option label="价格从低到高" value="price_asc" />
                  <el-option label="价格从高到低" value="price_desc" />
                  <el-option label="销量最高" value="sales" />
                  <el-option label="评分最高" value="rating" />
                </el-select>
              </div>

              <div class="subcats">
                <div class="subcat-line">
                  <span class="line-label">二级</span>
                  <div class="chips">
                    <button
                      v-for="l2 in level2Options"
                      :key="l2"
                      :class="['chip', { active: selectedL2 === l2 }]"
                      @click="selectL2(l2)"
                    >
                      {{ prettyCategory(l2) }}
                    </button>
                  </div>
                </div>

                <div class="subcat-line">
                  <span class="line-label">三级</span>
                  <div class="chips">
                    <button
                      v-for="l3 in level3Options"
                      :key="l3"
                      :class="['chip', { active: selectedL3 === l3 }]"
                      @click="selectL3(l3)"
                    >
                      {{ prettyCategory(l3) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div v-show="showFloatingCategory" class="sticky-category-bar">
        <div class="sticky-bar-inner">
          <span class="sticky-label">分类</span>
          <div class="sticky-bar-list">
            <button
              v-for="l1 in level1Options"
              :key="`sticky-${l1}`"
              :class="['sticky-item', { active: selectedL1 === l1 }]"
              @click="selectL1(l1)"
            >
              {{ prettyCategory(l1) }}
            </button>
          </div>
        </div>
      </div>

      <section class="content-panel">
        <div class="result-info">
          <span>共 <b>{{ total }}</b> 件商品</span>
          <span class="badge">{{ selectedPathText }}</span>
          <span v-if="keyword" class="badge">关键词：{{ keyword }}</span>
        </div>

        <div v-if="loading" class="products-grid">
          <div v-for="i in 8" :key="i" class="skeleton"></div>
        </div>
        <div v-else-if="products.length === 0" class="empty">
          <p>没有找到匹配商品</p>
          <el-button type="primary" @click="resetFilter">重置筛选</el-button>
        </div>
        <template v-else>
          <div class="products-grid">
            <ProductCard
              v-for="p in products"
              :key="p.id"
              :product="p"
              @add-cart="handleAddCart"
            />
          </div>
          <div class="pagination-wrap">
            <el-pagination
              background
              layout="prev, pager, next"
              :page-size="PAGE_SIZE"
              :current-page="currentPage"
              :total="total"
              @current-change="handlePageChange"
            />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductCategoriesApi, getProductListApi } from '../../api/product'
import ProductCard from '../../components/ProductCard.vue'
import { useCartStore } from '../../store/cart'

const PAGE_SIZE = 24
const ALL = '全部'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const categoryRows = ref([])
const products = ref([])
const total = ref(0)
const loading = ref(true)
const keyword = ref(route.query.keyword || '')
const sortBy = ref(route.query.sortBy || '')
const currentPage = ref(Number(route.query.page || 1))
const categoryPanelRef = ref(null)
const categoryPanelSlotRef = ref(null)
const showFloatingCategory = ref(false)
const floatingTriggerY = ref(Number.POSITIVE_INFINITY)
const categoryPanelSlotHeight = ref(0)

const selectedL1 = ref(ALL)
const selectedL2 = ref(ALL)
const selectedL3 = ref(ALL)

const categoryTree = computed(() => {
  const tree = new Map()
  for (const row of categoryRows.value) {
    const l1 = row.level1 || '综合'
    const l2 = row.level2 || '通用商品'
    const l3 = row.level3 || '通用商品'
    if (!tree.has(l1)) tree.set(l1, new Map())
    if (!tree.get(l1).has(l2)) tree.get(l1).set(l2, new Set())
    tree.get(l1).get(l2).add(l3)
  }
  return tree
})

const level1Options = computed(() => [ALL, ...Array.from(categoryTree.value.keys())])
const level2Options = computed(() => {
  if (selectedL1.value === ALL) return [ALL]
  const m = categoryTree.value.get(selectedL1.value)
  return [ALL, ...(m ? Array.from(m.keys()) : [])]
})
const level3Options = computed(() => {
  if (selectedL1.value === ALL || selectedL2.value === ALL) return [ALL]
  const m = categoryTree.value.get(selectedL1.value)
  const s = m?.get(selectedL2.value)
  return [ALL, ...(s ? Array.from(s) : [])]
})

const selectedPathText = computed(() => {
  const parts = [selectedL1.value, selectedL2.value, selectedL3.value].filter(v => v !== ALL).map(prettyCategory)
  return parts.length ? parts.join(' > ') : '全部分类'
})

const selectedCategoryQuery = computed(() => {
  const parts = [selectedL1.value, selectedL2.value, selectedL3.value].filter(v => v !== ALL)
  return parts.join(' > ')
})
const panelSlotStyle = computed(() => (
  categoryPanelSlotHeight.value > 0 ? { minHeight: `${categoryPanelSlotHeight.value}px` } : {}
))

const applyRouteCategory = (rawCategory) => {
  if (!rawCategory) {
    selectedL1.value = ALL
    selectedL2.value = ALL
    selectedL3.value = ALL
    return
  }
  const parts = String(rawCategory).split('>').map(s => s.trim()).filter(Boolean)
  selectedL1.value = parts[0] || ALL
  selectedL2.value = parts[1] || ALL
  selectedL3.value = parts[2] || ALL
}

const getScrollY = () => window.scrollY || window.pageYOffset || 0

const syncFloatingCategory = () => {
  showFloatingCategory.value = getScrollY() >= floatingTriggerY.value
}

const setupCategoryObserver = async () => {
  await nextTick()
  if (categoryPanelRef.value) {
    categoryPanelSlotHeight.value = categoryPanelRef.value.offsetHeight
  }
  if (!categoryPanelSlotRef.value) return
  const slotEl = categoryPanelSlotRef.value
  const slotTop = slotEl.getBoundingClientRect().top + getScrollY()
  const slotBottom = slotTop + slotEl.offsetHeight
  const panelBottom = Math.max(slotTop, slotBottom)
  floatingTriggerY.value = Math.max(0, panelBottom - 76)
  syncFloatingCategory()
}

const loadCategories = async () => {
  try {
    const res = await getProductCategoriesApi()
    categoryRows.value = res.data?.list || []
  } catch (_err) {
    categoryRows.value = []
    ElMessage.warning('分类加载失败，已先展示商品列表')
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProductListApi({
      page: currentPage.value,
      size: PAGE_SIZE,
      category: selectedCategoryQuery.value || undefined,
      keyword: keyword.value || undefined,
      sortBy: sortBy.value || undefined
    })
    products.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (_err) {
    products.value = []
    total.value = 0
    ElMessage.warning('商品列表加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const syncRoute = () => {
  const q = {}
  if (keyword.value) q.keyword = keyword.value
  if (sortBy.value) q.sortBy = sortBy.value
  if (currentPage.value > 1) q.page = String(currentPage.value)
  if (selectedCategoryQuery.value) q.category = selectedCategoryQuery.value
  router.replace({ path: '/products', query: q })
}

const prettyCategory = (name) => {
  if (!name) return name
  return name === '综合' ? '其他' : name
}

const selectL1 = async (l1) => {
  selectedL1.value = l1
  selectedL2.value = ALL
  selectedL3.value = ALL
  currentPage.value = 1
  syncRoute()
  await loadProducts()
}

const selectL2 = async (l2) => {
  selectedL2.value = l2
  selectedL3.value = ALL
  currentPage.value = 1
  syncRoute()
  await loadProducts()
}

const selectL3 = async (l3) => {
  selectedL3.value = l3
  currentPage.value = 1
  syncRoute()
  await loadProducts()
}

const handlePageChange = async (page) => {
  currentPage.value = page
  syncRoute()
  await loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const doFilter = async () => {
  currentPage.value = 1
  syncRoute()
  await loadProducts()
}

const resetFilter = async () => {
  keyword.value = ''
  sortBy.value = ''
  selectedL1.value = ALL
  selectedL2.value = ALL
  selectedL3.value = ALL
  currentPage.value = 1
  syncRoute()
  await loadProducts()
}

const handleAddCart = async (product) => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  await cartStore.addToCart(product)
}

onMounted(async () => {
  applyRouteCategory(route.query.category)
  currentPage.value = Number(route.query.page || 1)
  keyword.value = route.query.keyword || ''
  sortBy.value = route.query.sortBy || ''
  await Promise.allSettled([loadCategories(), loadProducts()])
  await setupCategoryObserver()
  window.addEventListener('scroll', syncFloatingCategory, { passive: true })
  window.addEventListener('resize', setupCategoryObserver)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', syncFloatingCategory)
  window.removeEventListener('resize', setupCategoryObserver)
})

watch(
  () => route.query,
  (q) => {
    keyword.value = q.keyword || ''
    sortBy.value = q.sortBy || ''
    currentPage.value = Number(q.page || 1)
    applyRouteCategory(q.category)
  }
)
</script>

<style scoped>
.product-list-page {
  padding: 24px 0 60px;
  min-height: 100vh;
  background: #ffffff;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.category-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 22px;
}

.category-panel-slot {
  width: 100%;
}

.header-copy h1 {
  margin: 0 0 6px;
  font-size: 28px;
  color: #3a241c;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.header-copy p {
  margin: 0;
  font-size: 13px;
  color: #a98478;
}

.category-panel,
.filter-bar,
.content-panel,
.empty {
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 24px;
  box-shadow: 0 12px 28px rgba(255, 79, 109, 0.05);
}

.category-panel {
  padding: 18px;
}

.panel-title {
  font-size: 15px;
  color: #3a241c;
  font-weight: 700;
  margin-bottom: 12px;
}

.l1-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sticky-category-bar {
  position: sticky;
  top: 64px;
  z-index: 40;
  margin-bottom: 16px;
  padding: 8px 0 0;
  background: #ffffff;
}

.sticky-bar-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 24px rgba(255, 79, 109, 0.06);
}

.sticky-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: #a98478;
}

.sticky-bar-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.sticky-bar-list::-webkit-scrollbar {
  display: none;
}

.sticky-item {
  flex-shrink: 0;
  height: 32px;
  border: 1px solid rgba(255,79,109,.12);
  background: #fff7f7;
  color: #7c4d3f;
  border-radius: 999px;
  padding: 0 14px;
  cursor: pointer;
  font-size: 12px;
  transition: all .2s;
}

.sticky-item.active {
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  border-color: transparent;
  color: #fff;
}

.l1-item {
  border: 1px solid rgba(255, 79, 109, 0.12);
  background: #fff7f7;
  color: #7c4d3f;
  border-radius: 999px;
  text-align: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: all .2s;
  font-size: 13px;
}

.l1-item:hover {
  border-color: rgba(255, 79, 109, 0.32);
  transform: translateY(-1px);
}

.l1-item.active {
  border-color: transparent;
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  color: #fff;
  box-shadow: 0 10px 22px rgba(255, 79, 109, 0.16);
}

.filter-bar {
  padding: 18px;
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.filter-search {
  flex: 1;
}

.filter-search :deep(.el-input__wrapper) {
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.14);
  border-radius: 999px;
  box-shadow: none !important;
}

.filter-search :deep(.el-input__inner) {
  color: #3a241c;
  font-size: 13px;
}

.sort-select {
  width: 180px;
}

.sort-select :deep(.el-input__wrapper) {
  background: #ffffff !important;
  border: 1px solid rgba(255, 79, 109, 0.14) !important;
  border-radius: 999px !important;
  box-shadow: none !important;
}

.subcats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subcat-line {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 10px;
  align-items: start;
}

.line-label {
  color: #a98478;
  font-size: 12px;
  line-height: 30px;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  height: 30px;
  border: 1px solid rgba(255,79,109,.12);
  background: #fff7f7;
  color: #7c4d3f;
  border-radius: 999px;
  padding: 0 12px;
  cursor: pointer;
  font-size: 12px;
  transition: all .2s;
}

.chip:hover {
  border-color: rgba(255,79,109,.3);
  color: #ff4f6d;
}

.chip.active {
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  border-color: transparent;
  color: #fff;
}

.content-panel {
  padding: 18px;
}

.result-info {
  margin-bottom: 18px;
  font-size: 13px;
  color: #7c4d3f;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.result-info b {
  color: #ff4f6d;
}

.badge {
  background: rgba(255,79,109,0.08);
  border: 1px solid rgba(255,79,109,0.14);
  color: #ff4f6d;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 12px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.skeleton {
  height: 340px;
  background: #fff7f7;
  border: 1px solid rgba(255,79,109,0.12);
  border-radius: 24px;
}

.empty {
  text-align: center;
  padding: 72px 0;
  color: #7c4d3f;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 28px 0 8px;
}

.pagination-wrap :deep(.el-pagination.is-background .btn-next),
.pagination-wrap :deep(.el-pagination.is-background .btn-prev),
.pagination-wrap :deep(.el-pagination.is-background .el-pager li) {
  min-width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #fff7f7;
  color: #7c4d3f;
  border: 1px solid rgba(255, 79, 109, 0.12);
}

.pagination-wrap :deep(.el-pagination.is-background .el-pager li.is-active) {
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  border-color: transparent;
  color: #fff;
}

@media (max-width: 1280px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 960px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 14px;
  }

  .filter-row {
    flex-direction: column;
  }

  .sort-select {
    width: 100%;
  }

  .subcat-line {
    grid-template-columns: 1fr;
  }

  .line-label {
    line-height: 1;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .sticky-bar-inner {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
