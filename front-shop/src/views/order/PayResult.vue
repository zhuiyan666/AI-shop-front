<template>
  <div class="result-page">
    <div class="result-card fade-in-up">
      <template v-if="status === 'success'">
        <div class="result-icon success-icon">
          <div class="check-circle">
            <svg viewBox="0 0 52 52" class="check-svg">
              <circle class="check-circle-bg" cx="26" cy="26" r="25" fill="none" />
              <path class="check-mark" fill="none" d="M14 27 L22 35 L38 17" />
            </svg>
          </div>
        </div>
        <h2 class="result-title success-text">支付成功</h2>
        <p class="result-desc">订单已支付完成，库存已扣减，购物车已同步更新。</p>
      </template>

      <template v-else>
        <div class="result-icon fail-icon">✖</div>
        <h2 class="result-title fail-text">支付失败</h2>
        <p class="result-desc">支付未完成，请稍后重试。</p>
      </template>

      <div class="result-info">
        <div class="info-row">
          <span class="info-label">订单号</span>
          <span class="info-value mono">{{ orderId }}</span>
        </div>
        <div v-if="amount" class="info-row">
          <span class="info-label">支付金额</span>
          <span class="info-value accent">¥{{ parseFloat(amount).toLocaleString() }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">支付时间</span>
          <span class="info-value">{{ payTime }}</span>
        </div>
      </div>

      <div class="result-btns">
        <el-button type="primary" size="large" @click="$router.push('/')">
          继续购物
        </el-button>
        <el-button size="large" @click="$router.push('/cart')">
          查看购物车
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '../../store/cart'

const route = useRoute()
const cartStore = useCartStore()
const status = computed(() => route.query.status || 'success')
const orderId = computed(() => route.query.orderId || '-')
const amount = computed(() => route.query.amount || '')

const payTime = new Date().toLocaleString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit'
})

onMounted(async () => {
  if (status.value !== 'success') return
  try {
    await cartStore.fetchCart({ silent: true })
  } catch (_) {
    // ignore sync errors on result page
  }
})
</script>

<style scoped>
.result-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
.result-card { width: 100%; max-width: 480px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 48px 40px; text-align: center; }
.result-icon { margin-bottom: 24px; }
.success-icon .check-circle { width: 80px; height: 80px; margin: 0 auto; }
.check-svg { width: 80px; height: 80px; }
.check-circle-bg { stroke: var(--success); stroke-width: 2; stroke-dasharray: 160; stroke-dashoffset: 160; animation: circle-draw 0.6s ease forwards; }
.check-mark { stroke: var(--success); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 50; stroke-dashoffset: 50; animation: check-draw 0.4s 0.5s ease forwards; }
@keyframes circle-draw { to { stroke-dashoffset: 0; } }
@keyframes check-draw { to { stroke-dashoffset: 0; } }
.fail-icon { font-size: 64px; line-height: 1; }
.result-title { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
.success-text { color: var(--success); }
.fail-text { color: var(--danger); }
.result-desc { color: var(--text-secondary); font-size: 15px; margin-bottom: 32px; }
.result-info { background: var(--bg-card2); border-radius: var(--radius-md); padding: 20px 24px; margin-bottom: 32px; border: 1px solid var(--border); text-align: left; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.info-row + .info-row { border-top: 1px solid var(--border); }
.info-label { font-size: 13px; color: var(--text-muted); }
.info-value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
.info-value.mono { font-family: monospace; font-size: 12px; }
.info-value.accent { color: var(--accent); font-weight: 700; font-size: 16px; }
.result-btns { display: flex; gap: 12px; }
.result-btns .el-button { flex: 1; height: 48px; border-radius: var(--radius-md) !important; }
</style>
