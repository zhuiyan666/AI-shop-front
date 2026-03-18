<template>
  <div class="order-page">
    <div class="container">
      <div class="page-header">
        <h1>确认订单</h1>
        <el-steps :active="1" finish-status="success" align-center>
          <el-step title="确认订单" />
          <el-step title="支付" />
          <el-step title="完成" />
        </el-steps>
      </div>

      <div class="order-layout">
        <div class="order-left">
          <div class="section-card">
            <div class="section-title">
              <IconFont name="icon-map1" size="18px" />
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
                <el-input v-model="form.address" placeholder="省 / 市 / 区 / 街道 / 门牌号" />
              </el-form-item>
            </el-form>
          </div>

          <div class="section-card">
            <div class="section-title">
              <IconFont name="icon-bags" size="18px" />
              商品清单
            </div>
            <div class="order-items">
              <div v-for="item in orderItems" :key="item.id" class="order-item">
                <img :src="item.image" :alt="item.name" class="item-img" />
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-qty">x {{ item.quantity }}</div>
                </div>
                <div class="item-price">¥{{ (item.price * item.quantity).toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-right">
          <div class="summary-card">
            <div class="section-title plain">订单摘要</div>
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
            <el-button type="primary" size="large" class="submit-btn" :loading="submitting" @click="submitOrder">
              提交订单
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '../../store/cart'
import { createOrderApi } from '../../api/order'
import IconFont from '../../components/IconFont.vue'

const router = useRouter()
const cartStore = useCartStore()
const submitting = ref(false)

const form = ref({
  name: '',
  phone: '',
  address: ''
})

onMounted(async () => {
  if (!cartStore.items.length) {
    await cartStore.fetchCart()
  }
})

const orderItems = computed(() => (cartStore.checkedItems.length ? cartStore.checkedItems : cartStore.items))
const subtotal = computed(() => orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

const submitOrder = async () => {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    ElMessage.warning('请填写完整的收货信息')
    return
  }
  if (!orderItems.value.length) {
    ElMessage.warning('当前没有可提交的商品')
    return
  }

  submitting.value = true
  try {
    const payload = {
      name: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      items: orderItems.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    }
    const res = await createOrderApi(payload)
    const orderId = res.data?.id || res.data?.orderId || `ORDER${Date.now()}`
    router.push({ path: '/pay', query: { orderId, amount: subtotal.value } })
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || '提交订单失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  padding: 24px 0 60px;
  background: #ffffff;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 18px;
  color: #3a241c;
  font-size: 30px;
  font-weight: 800;
}

.order-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

.order-left {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-card,
.summary-card {
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 24px;
  box-shadow: 0 12px 28px rgba(255, 79, 109, 0.05);
}

.section-card {
  padding: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  color: #3a241c;
  font-size: 18px;
  font-weight: 800;
}

.section-title.plain {
  margin-bottom: 14px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px;
  background: #fff9f7;
  border-radius: 18px;
}

.item-img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 16px;
}

.item-name {
  color: #3a241c;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.item-qty {
  margin-top: 8px;
  color: #9a786a;
  font-size: 12px;
}

.item-price {
  color: #ff5a36;
  font-size: 18px;
  font-weight: 800;
}

.order-right {
  position: sticky;
  top: 84px;
}

.summary-card {
  padding: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #6d5246;
  font-size: 14px;
}

.summary-divider {
  height: 1px;
  margin: 12px 0;
  background: rgba(255, 79, 109, 0.12);
}

.free-ship {
  color: #22a06b;
  font-weight: 700;
}

.total-row {
  margin-bottom: 20px;
  color: #3a241c;
  font-weight: 700;
}

.total-price {
  color: #ff5a36;
  font-size: 28px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 16px;
  font-weight: 700;
}

@media (max-width: 960px) {
  .order-layout {
    grid-template-columns: 1fr;
  }

  .order-right {
    position: static;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 14px;
  }

  .order-item {
    grid-template-columns: 72px 1fr;
  }

  .item-price {
    grid-column: 2;
  }
}
</style>
