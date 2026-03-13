<template>
  <div class="dashboard">
    <!-- 顶部 Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo-icon">🖥️</div>
        <div>
          <div class="logo-title gradient-text">服务器监控中心</div>
          <div class="logo-sub">实时心跳 · 状态追踪</div>
        </div>
      </div>
      <div class="header-right">
        <div class="ws-badge" :class="wsStatus">
          <span class="ws-dot"></span>
          {{ wsLabel }}
        </div>
        <div class="header-time">{{ currentTime }}</div>
      </div>
    </header>

    <div class="dashboard-body">
      <!-- 统计卡片 -->
      <div class="stat-cards fade-in-up">
        <div class="stat-card total">
          <div class="stat-icon">🖧</div>
          <div class="stat-info">
            <div class="stat-num">{{ store.totalCount }}</div>
            <div class="stat-label">注册服务器</div>
          </div>
        </div>
        <div class="stat-card online">
          <div class="stat-icon">🟢</div>
          <div class="stat-info">
            <div class="stat-num online-num">{{ store.onlineCount }}</div>
            <div class="stat-label">在线</div>
          </div>
        </div>
        <div class="stat-card offline">
          <div class="stat-icon">🔴</div>
          <div class="stat-info">
            <div class="stat-num offline-num">{{ store.offlineCount }}</div>
            <div class="stat-label">离线</div>
          </div>
        </div>
        <div class="stat-card rate">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-num rate-num">{{ onlineRate }}%</div>
            <div class="stat-label">在线率</div>
          </div>
        </div>
      </div>

      <!-- 主内容区：左边图表+服务器卡片，右边日志 -->
      <div class="main-grid">
        <!-- 左列 -->
        <div class="left-col">
          <!-- 在线趋势图 -->
          <div class="panel fade-in-up" style="animation-delay:0.1s">
            <div class="panel-title">
              <el-icon><TrendCharts /></el-icon>
              在线服务器趋势
            </div>
            <div class="chart-container">
              <HeartbeatChart :data="store.onlineHistory" mode="online" />
            </div>
          </div>

          <!-- 服务器卡片网格 -->
          <div class="panel fade-in-up" style="animation-delay:0.2s">
            <div class="panel-title">
              <el-icon><Monitor /></el-icon>
              服务器状态
            </div>
            <div class="server-grid">
              <ServerCard
                v-for="srv in store.servers"
                :key="srv.id"
                :server="srv"
                @click="goDetail"
              />
            </div>
          </div>

          <!-- 详细表格 -->
          <div class="panel fade-in-up" style="animation-delay:0.3s">
            <div class="panel-title">
              <el-icon><List /></el-icon>
              详细列表
            </div>
            <StatusTable :servers="store.servers" @select="goDetail" />
          </div>
        </div>

        <!-- 右列：事件日志 -->
        <div class="right-col">
          <div class="panel log-panel fade-in-up" style="animation-delay:0.15s">
            <div class="panel-title">
              <el-icon><Document /></el-icon>
              实时事件日志
              <el-badge :value="store.logs.length" type="primary" class="log-badge" />
            </div>
            <div class="log-list" ref="logListEl">
              <transition-group name="log">
                <div
                  v-for="log in store.logs.slice(0, 50)"
                  :key="log.id"
                  :class="['log-item', log.type]"
                >
                  <span class="log-icon">{{ log.icon }}</span>
                  <div class="log-content">
                    <div class="log-msg">
                      <span class="log-server">{{ log.serverName || log.serverId }}</span>
                      <span class="log-action">{{ logAction(log.type) }}</span>
                    </div>
                    <div class="log-time">{{ log.time }}</div>
                  </div>
                </div>
              </transition-group>
              <div v-if="!store.logs.length" class="log-empty">等待事件...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServerStore } from '../store/serverStore'
import ServerCard from '../components/ServerCard.vue'
import HeartbeatChart from '../components/HeartbeatChart.vue'
import StatusTable from '../components/StatusTable.vue'

const router = useRouter()
const store = useServerStore()

const currentTime = ref('')
let timeTimer = null

const wsStatus = computed(() => store.wsStatus)
const wsLabel = computed(() => store.wsLabel)

const onlineRate = computed(() =>
  store.totalCount ? Math.round((store.onlineCount / store.totalCount) * 100) : 0
)

function updateTime () {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function goDetail (server) {
  router.push(`/server/${server.id}`)
}

function logAction (type) {
  return { register: '上线注册', heartbeat: '发送心跳', offline: '已下线' }[type] || type
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timeTimer)
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}
.header-left { display: flex; align-items: center; gap: 14px; }
.logo-icon { font-size: 32px; }
.logo-title { font-size: 20px; font-weight: 800; }
.logo-sub { font-size: 11px; color: var(--text-muted); }
.header-right { display: flex; align-items: center; gap: 20px; }
.ws-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--border);
}
.ws-badge.mock { color: #f59e0b; border-color: rgba(245,158,11,0.3); }
.ws-badge.connected { color: var(--success); border-color: rgba(16,185,129,0.3); }
.ws-badge.disconnected { color: var(--danger); border-color: rgba(239,68,68,0.3); }
.ws-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.header-time {
  font-size: 13px;
  color: var(--text-muted);
  font-family: monospace;
}

/* Body */
.dashboard-body {
  flex: 1;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: var(--transition);
}
.stat-card:hover {
  border-color: var(--border-bright);
  transform: translateY(-2px);
}
.stat-icon { font-size: 32px; }
.stat-num {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}
.stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.online-num { color: var(--success); text-shadow: 0 0 20px rgba(16,185,129,0.5); }
.offline-num { color: var(--danger); }
.rate-num { color: var(--info); }

/* 主网格 */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
.left-col, .right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 面板 */
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
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

.chart-container { height: 200px; }

/* 服务器卡片网格 */
.server-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

/* 日志面板 */
.log-panel { height: fit-content; }
.log-badge { margin-left: auto; }
.log-list {
  max-height: calc(100vh - 260px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.log-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border-left: 3px solid transparent;
  transition: var(--transition);
}
.log-item.register { background: rgba(16,185,129,0.07); border-color: var(--success); }
.log-item.heartbeat { background: rgba(99,102,241,0.06); border-color: var(--primary); }
.log-item.offline   { background: rgba(239,68,68,0.07);  border-color: var(--danger); }
.log-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
.log-content { flex: 1; min-width: 0; }
.log-msg { font-size: 12px; color: var(--text-secondary); display: flex; gap: 4px; }
.log-server { color: var(--text-primary); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px; }
.log-action { flex-shrink: 0; }
.log-time { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
.log-empty { text-align: center; color: var(--text-muted); padding: 32px; font-size: 13px; }

/* 日志动画 */
.log-enter-active { transition: all 0.3s ease; }
.log-enter-from { opacity: 0; transform: translateX(-10px); }

@media (max-width: 1024px) {
  .main-grid { grid-template-columns: 1fr; }
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
