<template>
  <div class="server-detail">
    <!-- 顶部导航 -->
    <div class="detail-header">
      <el-button link @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回 Dashboard
      </el-button>
    </div>

    <div v-if="server" class="detail-body">
      <!-- 基本信息卡片 -->
      <div class="info-card fade-in-up">
        <div class="server-hero">
          <div class="server-avatar" :class="server.status">
            🖥️
            <span v-if="server.status === 'online'" class="avatar-pulse"></span>
          </div>
          <div class="server-meta">
            <h1 class="server-name">{{ server.name }}</h1>
            <div class="server-ip">{{ server.ip }}</div>
            <el-tag :type="server.status === 'online' ? 'success' : 'danger'" effect="dark" size="large" round>
              <span class="status-dot" :class="server.status"></span>
              {{ server.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">服务器 ID</div>
            <div class="meta-value mono">{{ server.id }}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">注册时间</div>
            <div class="meta-value">{{ formatDate(server.registeredAt) }}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">最后心跳</div>
            <div class="meta-value">{{ formatTime(server.lastHeartbeat) }}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">累计心跳</div>
            <div class="meta-value info">{{ server.heartbeatCount }} 次</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">网络延迟</div>
            <div class="meta-value" :class="pingClass(server.latency)">{{ server.latency }} <small>ms</small></div>
          </div>
        </div>

        <!-- 当前资源使用 -->
        <div v-if="server.status === 'online'" class="resource-bars">
          <div class="resource-item">
            <div class="resource-header">
              <span>CPU 使用率</span>
              <span :class="cpuClass(server.cpu)">{{ server.cpu }}%</span>
            </div>
            <div class="resource-track">
              <div class="resource-fill cpu" :style="{ width: server.cpu + '%' }"></div>
            </div>
          </div>
          <div class="resource-item">
            <div class="resource-header">
              <span>内存使用率</span>
              <span class="mem-val">{{ server.memory }}%</span>
            </div>
            <div class="resource-track">
              <div class="resource-fill mem" :style="{ width: server.memory + '%' }"></div>
            </div>
          </div>
          <div class="resource-item">
            <div class="resource-header">
              <span>磁盘空间使用率</span>
              <span class="disk-val">{{ server.disk?.toFixed(1) || 0 }}%</span>
            </div>
            <div class="resource-track">
              <div class="resource-fill disk" :style="{ width: (server.disk || 0) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 心跳历史图表 -->
      <div class="panel fade-in-up" style="animation-delay:0.1s">
        <div class="panel-title">
          <el-icon><TrendCharts /></el-icon>
          历史资源监控
        </div>
        <div class="chart-wrap">
          <HeartbeatChart :data="heartbeatHistory" mode="resource" />
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <div class="not-found-icon">🔍</div>
      <div class="not-found-text">未找到服务器信息</div>
      <el-button @click="$router.back()">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useServerStore } from '../store/serverStore'
import HeartbeatChart from '../components/HeartbeatChart.vue'

const route = useRoute()
const store = useServerStore()

const server = computed(() => store.getServer(route.params.id))
const heartbeatHistory = computed(() => store.serverHistoryMap[route.params.id] || [])

// No mock endpoints or timers needed here anymore. The websocket in App.vue automatically pushes 
// real data into serverStore's `serverHistoryMap` on each HEARTBEAT (DATA type) packet.

function formatDate (ts) {
  return ts ? new Date(ts).toLocaleString('zh-CN') : '—'
}
function formatTime (ts) {
  if (!ts) return '—'
  const diff = Date.now() - ts
  if (diff < 5000) return '刚刚'
  if (diff < 60000) return `${Math.floor(diff / 1000)} 秒前`
  return new Date(ts).toLocaleTimeString('zh-CN')
}
function cpuClass (cpu) {
  if (cpu >= 80) return 'danger-val'
  if (cpu >= 60) return 'warning-val'
  return 'normal-val'
}
function pingClass (latency) {
  if (latency >= 100) return 'ping-danger'
  if (latency >= 50) return 'ping-warning'
  return 'ping-good'
}
</script>

<style scoped>
.server-detail {
  min-height: 100vh;
  padding: 20px 32px 60px;
}
.detail-header { margin-bottom: 24px; }

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
}

.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
}

.server-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}
.server-avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  background: var(--bg-card2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  position: relative;
}
.server-avatar.online { border-color: rgba(16,185,129,0.4); }
.avatar-pulse {
  position: absolute;
  inset: -4px;
  border-radius: calc(var(--radius-md) + 4px);
  border: 2px solid var(--success);
  animation: pulse-ring 2s infinite;
  opacity: 0.5;
}
.server-meta { flex: 1; }
.server-name {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.server-ip {
  font-family: monospace;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}
.meta-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.meta-value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
.meta-value.mono { font-family: monospace; font-size: 12px; }
.meta-value.info { color: var(--info); }
.ping-good { color: var(--success); font-family: monospace; font-weight: 600;}
.ping-warning { color: var(--warning); font-family: monospace; font-weight: 600;}
.ping-danger { color: var(--danger); font-family: monospace; font-weight: 600;}
.meta-value small { font-size: 10px; opacity: 0.7; margin-left: 2px; }

.resource-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.resource-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.normal-val  { color: var(--primary-light); font-weight: 600; }
.warning-val { color: var(--warning); font-weight: 600; }
.danger-val  { color: var(--danger); font-weight: 600; }
.mem-val     { color: var(--success); font-weight: 600; }
.disk-val    { color: var(--info); font-weight: 600; }
.resource-track {
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}
.resource-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}
.resource-fill.cpu { background: linear-gradient(90deg, #6366f1, #818cf8); }
.resource-fill.mem { background: linear-gradient(90deg, #10b981, #34d399); }
.resource-fill.disk { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.chart-wrap { height: 280px; }

.not-found {
  text-align: center;
  padding: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.not-found-icon { font-size: 64px; }
.not-found-text { font-size: 18px; color: var(--text-secondary); }
</style>
