<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">🛒 购物车</h1>

      <div v-if="cartStore.loading && cartStore.items.length === 0" class="loading">
        <el-skeleton :rows="4" animated />
      </div>

      <div v-else-if="cartStore.items.length === 0" class="empty">
        <div style="font-size:80px">🛒</div>
        <p>购物车空空如也</p>
        <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
      </div>

      <div v-else class="cart-layout">
        <!-- 商品列表 -->
        <div class="cart-list">
          <!-- 全选 -->
          <div class="list-header glass-card">
            <el-checkbox
              :model-value="allChecked"
              @change="cartStore.toggleAll($event)"
            >全选</el-checkbox>
            <span style="color:#64748b;font-size:14px">商品</span>
            <span class="center" style="color:#64748b;font-size:14px">单价</span>
            <span class="center" style="color:#64748b;font-size:14px">数量</span>
            <span class="center" style="color:#64748b;font-size:14px">小计</span>
            <span class="center" style="color:#64748b;font-size:14px">操作</span>
          </div>

          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-item glass-card"
            :class="{ unchecked: !item.checked }"
          >
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
              <el-button text type="danger" size="small" @click="cartStore.removeItem(item.id, item.productId)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 结算侧边栏 -->
        <div class="cart-sidebar">
          <div class="summary-card glass-card">
            <h3>订单摘要</h3>
            <div class="summary-line">
              <span>已选商品（{{ checkedCount }} 件）</span>
              <span>¥{{ cartStore.total.toLocaleString() }}</span>
            </div>
            <div class="summary-line">
              <span>运费</span>
              <span class="free">免费</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>合计</span>
              <span class="total-price">¥{{ cartStore.total.toLocaleString() }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="checkedCount === 0"
              class="checkout-btn"
              @click="handleCheckout"
            >
              结算（{{ checkedCount }} 件）
            </el-button>
            <button class="continue-btn" @click="$router.push('/products')">← 继续购物</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../store/cart'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

onMounted(() => cartStore.fetchCart())

const allChecked = computed(() => cartStore.items.length > 0 && cartStore.items.every(i => i.checked))
const checkedCount = computed(() => cartStore.checkedItems.reduce((s, i) => s + i.quantity, 0))

const handleCheckout = () => {
  if (cartStore.checkedItems.length === 0) { ElMessage.warning('请选择要结算的商品'); return }
  router.push('/order')
}
</script>

<style scoped>
.cart-page { min-height: 100vh; padding: 24px 0 60px; }
.container { max-width: 1300px; margin: 0 auto; padding: 0 24px; }
.page-title { font-size: 28px; font-weight: 700; color: #e2e8f0; margin-bottom: 28px; }
.empty { text-align: center; padding: 100px 0; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 20px; font-size: 18px; }
.cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
.cart-list { display: flex; flex-direction: column; gap: 12px; }
.list-header { padding: 14px 20px; display: grid; grid-template-columns: 40px 1fr 120px 140px 120px 60px; align-items: center; }
.center { text-align: center; }
.cart-item { padding: 16px 20px; display: grid; grid-template-columns: 40px 1fr 120px 140px 120px 60px; align-items: center; transition: all 0.2s; }
.cart-item.unchecked { opacity: 0.5; }
.item-info { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.item-img { width: 70px; height: 70px; border-radius: 8px; object-fit: cover; }
.item-name { font-size: 14px; color: #e2e8f0; line-height: 1.4; }
.item-price { color: #94a3b8; font-size: 15px; }
.subtotal { font-size: 16px; font-weight: 700; color: #f472b6; }
.summary-card { padding: 28px; display: flex; flex-direction: column; gap: 16px; position: sticky; top: 84px; }
.summary-card h3 { font-size: 18px; font-weight: 700; color: #e2e8f0; }
.summary-line { display: flex; justify-content: space-between; font-size: 14px; color: #94a3b8; }
.free { color: #22c55e; font-weight: 500; }
.summary-divider { height: 1px; background: rgba(99,102,241,0.15); }
.summary-total { display: flex; justify-content: space-between; align-items: center; }
.summary-total span:first-child { font-size: 15px; color: #e2e8f0; }
.total-price { font-size: 28px; font-weight: 800; color: #f472b6; }
.checkout-btn { width: 100%; height: 50px; font-size: 17px; font-weight: 600; background: linear-gradient(135deg, #6366f1, #ec4899) !important; border: none !important; border-radius: 10px !important; }
.continue-btn { width: 100%; height: 40px; background: transparent; border: none; color: #64748b; font-size: 13px; cursor: pointer; transition: color 0.2s; }
.continue-btn:hover { color: #818cf8; }
</style>
