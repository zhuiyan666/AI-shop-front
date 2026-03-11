<template>
  <div class="pay-page">
    <div class="container">
      <div class="pay-card fade-in-up">
        <!-- 步骤条 -->
        <el-steps :active="activeStep" finish-status="success" align-center class="steps">
          <el-step title="确认订单" />
          <el-step title="支付" />
          <el-step title="完成" />
        </el-steps>

        <!-- 订单信息 -->
        <div class="order-info">
          <div class="order-label">订单号</div>
          <div class="order-id">{{ orderId }}</div>
        </div>

        <!-- 支付金额 -->
        <div class="amount-section">
          <div class="amount-label">需支付</div>
          <div class="amount">
            <span class="amount-unit">¥</span>
            <span class="amount-num">{{ parseFloat(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="pay-methods">
          <div
            v-for="method in payMethods"
            :key="method.id"
            :class="['method-item', { active: selectedMethod === method.id }]"
            @click="selectedMethod = method.id"
          >
            <span class="method-icon">{{ method.icon }}</span>
            <span class="method-name">{{ method.name }}</span>
            <el-icon v-if="selectedMethod === method.id" class="check-icon"><Check /></el-icon>
          </div>
        </div>

        <!-- 支付按钮 -->
        <el-button
          type="primary"
          size="large"
          class="pay-btn"
          :loading="paying"
          @click="handlePay"
        >
          {{ paying ? '支付处理中...' : `立即支付 ¥${parseFloat(amount).toLocaleString()}` }}
        </el-button>

        <div class="pay-tips">
          <el-icon><Lock /></el-icon>
          支付安全由 256-bit SSL 加密保护
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const paying = ref(false)
const activeStep = ref(1)
const selectedMethod = ref('alipay')

const orderId = ref(route.query.orderId || 'ORDER' + Date.now())
const amount = ref(route.query.amount || '0')

const payMethods = [
  { id: 'alipay', icon: '💰', name: '支付宝' },
  { id: 'wechat', icon: '💚', name: '微信支付' }
]

async function handlePay () {
  paying.value = true
  try {
    // 模拟支付处理（实际接入支付宝沙箱时，提交 form 表单到支付宝网关）
    await new Promise(r => setTimeout(r, 2000))
    ElMessage.success('支付成功！')
    router.push({
      path: '/pay/result',
      query: { orderId: orderId.value, amount: amount.value, status: 'success' }
    })
  } catch {
    ElMessage.error('支付失败，请重试')
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
}

.pay-card {
  max-width: 520px;
  margin: 0 auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px;
  text-align: center;
  animation: fade-in-up 0.5s ease;
}

.steps {
  margin-bottom: 40px;
}

.order-info {
  margin-bottom: 24px;
}
.order-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}
.order-id {
  font-size: 14px;
  color: var(--text-secondary);
  font-family: monospace;
  background: var(--bg-card2);
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  border: 1px solid var(--border);
}

.amount-section {
  margin: 32px 0;
}
.amount-label {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.amount {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}
.amount-unit {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
  margin-top: 8px;
}
.amount-num {
  font-size: 56px;
  font-weight: 800;
  background: linear-gradient(135deg, #ec4899, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.pay-methods {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  justify-content: center;
}
.method-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: var(--transition);
  flex: 1;
  justify-content: center;
}
.method-item:hover {
  border-color: var(--primary);
}
.method-item.active {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}
.method-icon { font-size: 22px; }
.method-name { font-weight: 600; color: var(--text-primary); }
.check-icon { color: var(--primary); }

.pay-btn {
  width: 100%;
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  border-radius: var(--radius-md) !important;
  margin-bottom: 16px;
}

.pay-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
