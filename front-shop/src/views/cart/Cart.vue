<template>
  <div class="cart-page">
    <div class="container">
      <div class="page-head">
        <h1 class="page-title">购物车</h1>
        <p class="page-subtitle">统一红白主题，结算区和商品区使用同一套卡片语言。</p>
      </div>

      <div v-if="cartStore.loading && cartStore.items.length === 0" class="loading-card">
        <el-skeleton :rows="4" animated />
      </div>

      <div v-else-if="cartStore.items.length === 0" class="empty-card">
        <div class="empty-icon"><IconFont name="icon-cart-Empty-fill" size="42px" /></div>
        <p>购物车还是空的</p>
        <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-list">
          <div class="list-header">
            <el-checkbox :model-value="allChecked" @change="cartStore.toggleAll($event)">全选</el-checkbox>
            <span>商品</span>
            <span class="center">单价</span>
            <span class="center">数量</span>
            <span class="center">小计</span>
            <span class="center">操作</span>
          </div>

          <div v-for="item in cartStore.items" :key="item.id" class="cart-item" :class="{ unchecked: !item.checked }">
            <el-checkbox :model-value="item.checked" @change="cartStore.toggleCheck(item.id)" />
            <div class="item-info" @click="$router.push(`/product/${item.productId}`)">
              <img :src="item.image" class="item-img" />
              <div class="item-meta">
                <p class="item-name">{{ item.name }}</p>
              </div>
            </div>
            <span class="center item-price">¥{{ item.price?.toLocaleString() }}</span>
            <div class="center">
              <el-input-number
                :model-value="item.quantity"
                :min="1"
                :max="99"
                size="small"
                @change="cartStore.updateQuantity(item.id, item.productId, $event)"
              />
            </div>
            <span class="center subtotal">¥{{ (item.price * item.quantity).toLocaleString() }}</span>
            <div class="center">
              <el-button text class="remove-btn" size="small" @click="cartStore.removeItem(item.id, item.productId)">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <div class="cart-sidebar">
          <div class="summary-card">
            <h3>订单摘要</h3>
            <div class="summary-line">
              <span>已选商品（{{ checkedCount }} 件）</span>
              <span>¥{{ cartStore.total.toLocaleString() }}</span>
            </div>
            <div class="summary-line">
              <span>运费</span>
              <span class="free">免运费</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>合计</span>
              <span class="total-price">¥{{ cartStore.total.toLocaleString() }}</span>
            </div>
            <el-button type="primary" size="large" :disabled="checkedCount === 0" class="checkout-btn" @click="handleCheckout">
              去结算（{{ checkedCount }}）
            </el-button>
            <button class="continue-btn" @click="$router.push('/products')">继续购物</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '../../store/cart'
import IconFont from '../../components/IconFont.vue'

const router = useRouter()
const cartStore = useCartStore()

onMounted(() => cartStore.fetchCart())

const allChecked = computed(() => cartStore.items.length > 0 && cartStore.items.every(i => i.checked))
const checkedCount = computed(() => cartStore.checkedItems.reduce((sum, item) => sum + item.quantity, 0))

const handleCheckout = () => {
  if (cartStore.checkedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  router.push('/order')
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  padding: 24px 0 60px;
  background: #ffffff;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-head {
  margin-bottom: 22px;
}

.page-title {
  margin: 0 0 6px;
  font-size: 30px;
  font-weight: 800;
  color: #3a241c;
  letter-spacing: -0.03em;
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #a98478;
}

.loading-card,
.empty-card,
.list-header,
.cart-item,
.summary-card {
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 24px;
  box-shadow: 0 12px 28px rgba(255, 79, 109, 0.05);
}

.loading-card,
.empty-card {
  padding: 32px;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
  color: #7c4d3f;
}

.empty-icon {
  width: 92px;
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  background: rgba(255, 79, 109, 0.08);
  color: #ff4f6d;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-header,
.cart-item {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 120px 140px 120px 72px;
  align-items: center;
  padding: 16px 20px;
}

.list-header {
  color: #7c4d3f;
  font-size: 13px;
  font-weight: 700;
}

.center {
  text-align: center;
}

.list-header :deep(.el-checkbox),
.cart-item :deep(.el-checkbox) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0;
}

.list-header :deep(.el-checkbox__label) {
  padding-left: 8px;
}

.cart-item :deep(.el-checkbox__label) {
  display: none;
}

.cart-item.unchecked {
  opacity: 0.55;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.item-img {
  width: 76px;
  height: 76px;
  border-radius: 18px;
  object-fit: cover;
  background: #fff7f7;
}

.item-name {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #3a241c;
}

.item-price {
  color: #7c4d3f;
  font-size: 14px;
}

.subtotal {
  color: #ff5a36;
  font-size: 16px;
  font-weight: 800;
}

.remove-btn {
  color: #ff4f6d;
  font-weight: 700;
}

.cart-sidebar {
  position: sticky;
  top: 84px;
}

.summary-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card h3 {
  margin: 0;
  color: #3a241c;
  font-size: 18px;
  font-weight: 800;
}

.summary-line,
.summary-total {
  display: flex;
  justify-content: space-between;
}

.summary-line {
  color: #7c4d3f;
  font-size: 13px;
}

.free {
  color: #22a06b;
  font-weight: 700;
}

.summary-divider {
  height: 1px;
  background: rgba(255, 79, 109, 0.12);
}

.total-price {
  color: #ff5a36;
  font-size: 28px;
  font-weight: 800;
}

.checkout-btn,
.continue-btn {
  height: 48px;
  border-radius: 16px;
  font-weight: 700;
}

.continue-btn {
  border: 1px solid rgba(255, 79, 109, 0.12);
  background: #ffffff;
  color: #7c4d3f;
  cursor: pointer;
}

@media (max-width: 960px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-sidebar {
    position: static;
  }
}

@media (max-width: 720px) {
  .container {
    padding: 0 14px;
  }

  .list-header {
    display: none;
  }

  .cart-item {
    grid-template-columns: 44px 1fr;
    gap: 12px;
  }

  .cart-item > :nth-child(3),
  .cart-item > :nth-child(4),
  .cart-item > :nth-child(5),
  .cart-item > :nth-child(6) {
    grid-column: 2;
    text-align: left;
  }
}
</style>
