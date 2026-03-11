<template>
  <div class="order-page">
    <div class="container">
      <!-- 头部 -->
      <div class="page-header fade-in-up">
        <h1>确认订单</h1>
        <el-steps :active="1" finish-status="success" align-center>
          <el-step title="确认订单" />
          <el-step title="支付" />
          <el-step title="完成" />
        </el-steps>
      </div>

      <div class="order-layout">
        <!-- 左侧：商品列表 + 地址 -->
        <div class="order-left">
          <!-- 收货地址 -->
          <div class="section-card fade-in-up">
            <div class="section-title">
              <el-icon><Location /></el-icon>
              收货地址
            </div>
            <el-form :model="form" label-width="80px" class="addr-form">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="收货人">
                    <el-input v-model="form.name" placeholder="请输入姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号">
                    <el-input v-model="form.phone" placeholder="请输入手机号" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="详细地址">
                <el-input v-model="form.address" placeholder="省/市/区/街道/门牌号" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 商品列表 -->
          <div class="section-card fade-in-up" style="animation-delay:0.1s">
            <div class="section-title">
              <el-icon><ShoppingBag /></el-icon>
              商品清单
            </div>
            <div class="order-items">
              <div v-for="item in orderItems" :key="item.id" class="order-item">
                <img :src="item.image" :alt="item.name" class="item-img" />
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-qty">× {{ item.quantity }}</div>
                </div>
                <div class="item-price">¥{{ (item.price * item.quantity).toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：订单小计 -->
        <div class="order-right">
          <div class="summary-card fade-in-up" style="animation-delay:0.2s">
            <div class="section-title">订单摘要</div>
            <div class="summary-rows">
              <div class="summary-row">
                <span>商品小计</span>
                <span>¥{{ subtotal.toLocaleString() }}</span>
              </div>
              <div class="summary-row">
                <span>运费</span>
                <span class="free-ship">免运费</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total-row">
                <span>合计</span>
                <span class="total-price">¥{{ subtotal.toLocaleString() }}</span>
              </div>
            </div>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="submitting"
              @click="submitOrder"
            >
              提交订单
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../store/cart'
import { createOrderMock } from '../../api/order'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()
const submitting = ref(false)

const form = ref({
  name: '',
  phone: '',
  address: ''
})

// 从购物车获取勾选商品
const orderItems = computed(() => cartStore.checkedItems.length
  ? cartStore.checkedItems
  : cartStore.items
)

const subtotal = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

onMounted(() => {
  if (!cartStore.items.length) {
    cartStore.fetchCart()
  }
})

async function submitOrder () {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    ElMessage.warning('请填写完整收货信息')
    return
  }
  submitting.value = true
  try {
    const res = await createOrderMock(orderItems.value)
    const { orderId, totalAmount } = res.data
    ElMessage.success('订单创建成功！')
    router.push({ path: '/pay', query: { orderId, amount: totalAmount } })
  } catch (e) {
    ElMessage.error('创建订单失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  padding: 32px 0 80px;
}

.page-header {
  margin-bottom: 40px;
}
.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f1f5f9, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.order-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.section-card, .summary-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  margin-bottom: 20px;
  animation: fade-in-up 0.5s ease both;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.addr-form :deep(.el-form-item__label) {
  color: var(--text-secondary);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-card2);
  border-radius: var(--radius-sm);
}
.item-img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
}
.item-info {
  flex: 1;
}
.item-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.item-qty {
  color: var(--text-muted);
  font-size: 13px;
}
.item-price {
  font-weight: 600;
  color: var(--accent);
  font-size: 16px;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
}
.free-ship {
  color: var(--success);
  font-weight: 500;
}
.summary-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}
.total-row {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.total-price {
  font-size: 22px;
  background: linear-gradient(135deg, #ec4899, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.submit-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  border-radius: var(--radius-md) !important;
}

@media (max-width: 768px) {
  .order-layout {
    grid-template-columns: 1fr;
  }
}
</style>
