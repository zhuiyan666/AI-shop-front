<template>
  <div class="orders-page">
    <div class="container">
      <div class="header">
        <h1>我的订单</h1>
        <el-button @click="loadOrders" :loading="loading">刷新</el-button>
      </div>

      <div v-if="loading && !orders.length" class="loading">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="!orders.length" class="empty">
        <div class="empty-icon">🧾</div>
        <p>你还没有订单，先去逛逛商品吧</p>
        <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
      </div>

      <div v-else class="order-list">
        <div v-for="order in orders" :key="order.orderId" class="order-card">
          <div class="order-head">
            <div>
              <div class="order-no">订单号：{{ order.orderId }}</div>
              <div class="order-meta">共 {{ order.quantityCount || 0 }} 件商品</div>
            </div>
            <div class="order-actions">
              <el-tag :type="order.paymentStatus === 'paid' ? 'success' : 'warning'">
                {{ order.paymentStatus === 'paid' ? '已支付' : '待支付' }}
              </el-tag>
              <el-button
                v-if="order.paymentStatus !== 'paid'"
                type="primary"
                size="small"
                @click="goPay(order)"
              >
                去支付
              </el-button>
            </div>
          </div>

          <div class="items">
            <div v-for="item in order.items || []" :key="item.id" class="item-row">
              <img :src="item.productImage" class="item-img" />
              <div class="item-info">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-qty">x {{ item.quantity }}</div>
              </div>
              <div class="item-price">¥{{ formatPrice(item.totalAmount) }}</div>
            </div>
          </div>

          <div class="order-foot">
            <span>实付：</span>
            <strong>¥{{ formatPrice(order.payAmount || order.totalAmount) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listOrdersApi } from '../../api/order'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const orders = ref([])

function formatPrice (value) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function loadOrders () {
  loading.value = true
  try {
    const res = await listOrdersApi()
    orders.value = res.data || []
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || '加载订单失败')
  } finally {
    loading.value = false
  }
}

function goPay (order) {
  router.push({
    path: '/pay',
    query: { orderId: order.orderId, amount: order.payAmount || order.totalAmount || 0 }
  })
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-page { min-height: 100vh; padding: 24px 0 60px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.header h1 { color: #e2e8f0; font-size: 28px; margin: 0; }
.loading { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.empty { text-align: center; padding: 100px 0; color: #94a3b8; }
.empty-icon { font-size: 64px; margin-bottom: 10px; }
.order-list { display: flex; flex-direction: column; gap: 16px; }
.order-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
.order-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.order-no { color: #e2e8f0; font-weight: 600; }
.order-meta { color: #94a3b8; font-size: 12px; margin-top: 4px; }
.order-actions { display: flex; align-items: center; gap: 10px; }
.items { display: flex; flex-direction: column; gap: 10px; }
.item-row { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg-card2); border-radius: 8px; }
.item-img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; background: #111827; }
.item-info { flex: 1; min-width: 0; }
.item-name { color: #e2e8f0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-qty { color: #94a3b8; font-size: 12px; margin-top: 2px; }
.item-price { color: #f472b6; font-weight: 700; }
.order-foot { margin-top: 12px; display: flex; justify-content: flex-end; align-items: center; gap: 4px; color: #e2e8f0; }
</style>
