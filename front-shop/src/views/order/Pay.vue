<template>
  <div class="pay-page">
    <div class="container">
      <div class="pay-card">
        <el-steps :active="activeStep" finish-status="success" align-center class="steps">
          <el-step title="确认订单" />
          <el-step title="支付" />
          <el-step title="完成" />
        </el-steps>

        <div class="order-info">
          <div class="order-label">订单号</div>
          <div class="order-id">{{ orderId }}</div>
        </div>

        <div class="amount-section">
          <div class="amount-label">需支付</div>
          <div class="amount">
            <span class="amount-unit">¥</span>
            <span class="amount-num">{{ parseFloat(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <div class="pay-methods">
          <div
            v-for="method in payMethods"
            :key="method.id"
            :class="['method-item', { active: selectedMethod === method.id }]"
            @click="selectedMethod = method.id"
          >
            <span class="method-icon"><IconFont :name="method.icon" size="22px" /></span>
            <span class="method-name">{{ method.name }}</span>
            <IconFont v-if="selectedMethod === method.id" name="icon-success-fill" size="16px" class="check-icon" />
          </div>
        </div>

        <el-button type="primary" size="large" class="pay-btn" :loading="paying" @click="handlePay">
          {{ paying ? '支付处理中...' : `立即支付 ¥${parseFloat(amount).toLocaleString()}` }}
        </el-button>

        <div class="pay-tips">
          <IconFont name="icon-security-fill" size="14px" />
          支付安全已由 256-bit SSL 加密保护
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { payOrderApi } from '../../api/order'
import IconFont from '../../components/IconFont.vue'

const route = useRoute()
const router = useRouter()
const paying = ref(false)
const activeStep = ref(1)
const selectedMethod = ref('alipay')

const orderId = ref(route.query.orderId || `ORDER${Date.now()}`)
const amount = ref(route.query.amount || '0')

const payMethods = [
  { id: 'alipay', icon: 'icon-paylater-fill', name: '支付宝' },
  { id: 'wechat', icon: 'icon-wallet1', name: '微信支付' }
]

async function handlePay () {
  paying.value = true
  try {
    await payOrderApi(orderId.value)
    ElMessage.success('支付成功')
    router.push({
      path: '/pay/result',
      query: { orderId: orderId.value, amount: amount.value, status: 'success' }
    })
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || '支付失败，请重试')
  } finally {
    paying.value = false
  }
}
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 60px 0;
  background: #fff8f6;
}

.container {
  width: 100%;
  padding: 0 24px;
}

.pay-card {
  max-width: 520px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 28px;
  box-shadow: 0 20px 40px rgba(255, 79, 109, 0.08);
}

.steps {
  margin-bottom: 40px;
}

.order-info {
  margin-bottom: 24px;
}

.order-label {
  margin-bottom: 6px;
  color: #9a786a;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.order-id {
  display: inline-block;
  padding: 6px 16px;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 20px;
  background: #fff8f6;
  color: #6a4f43;
  font-family: monospace;
  font-size: 14px;
}

.amount-section {
  margin: 32px 0;
}

.amount-label {
  margin-bottom: 10px;
  color: #9a786a;
  font-size: 13px;
}

.amount {
  display: inline-flex;
  align-items: baseline;
  color: #ff5a36;
}

.amount-unit {
  font-size: 22px;
  font-weight: 700;
}

.amount-num {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.pay-methods {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.method-item {
  display: grid;
  grid-template-columns: 28px 1fr 20px;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  text-align: left;
  border: 1px solid rgba(255, 79, 109, 0.12);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-item.active {
  border-color: rgba(255, 79, 109, 0.34);
  background: #fff8f6;
}

.method-icon,
.check-icon {
  color: #ff5a36;
}

.method-name {
  color: #3a241c;
  font-weight: 700;
}

.pay-btn {
  width: 100%;
  height: 50px;
  border-radius: 16px;
  font-weight: 700;
}

.pay-tips {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8d6c5f;
  font-size: 12px;
}
</style>
