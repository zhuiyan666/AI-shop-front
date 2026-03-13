<template>
  <div :class="['server-card', server.status]" @click="$emit('click', server)">
    <!-- 状态指示灯 -->
    <div class="card-status-bar">
      <div class="status-indicator">
        <span :class="['status-dot', server.status]"></span>
        <span v-if="server.status === 'online'" class="status-ring"></span>
      </div>
      <span :class="['status-label', server.status]">
        {{ server.status === 'online' ? '在线' : '离线' }}
      </span>
    </div>

    <!-- 服务器名称 -->
    <div class="card-name">{{ server.name }}</div>
    <div class="card-ip">{{ server.ip }}</div>

    <!-- 资源使用 -->
    <div v-if="server.status === 'online'" class="card-metrics">
      <div class="metric">
        <span class="metric-label">CPU</span>
        <div class="metric-bar">
          <div class="metric-fill cpu" :style="{ width: server.cpu + '%' }"></div>
        </div>
        <span class="metric-val">{{ server.cpu }}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">内存</span>
        <div class="metric-bar">
          <div class="metric-fill mem" :style="{ width: server.memory + '%' }"></div>
        </div>
        <span class="metric-val">{{ server.memory }}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">网路</span>
        <div class="metric-bar">
           <!-- inverted latency bar -->
          <div class="metric-fill ping" :style="{ width: Math.min(100, server.latency) + '%' }"></div>
        </div>
        <span class="metric-val">{{ server.latency }}<small>ms</small></span>
      </div>
    </div>

    <!-- 心跳时间 -->
    <div class="card-heartbeat">
      <el-icon><Timer /></el-icon>
      {{ formatTime(server.lastHeartbeat) }}
    </div>
  </div>
</template>

<script setup>
defineProps({ server: { type: Object, required: true } })
defineEmits(['click'])

function formatTime (ts) {
  if (!ts) return '—'
  const diff = Date.now() - ts
  if (diff < 5000) return '刚刚'
  if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`
  return new Date(ts).toLocaleTimeString('zh-CN')
}
</script>

<style scoped>
.server-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}
.server-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99,102,241,0.05), transparent);
  opacity: 0;
  transition: var(--transition);
}
.server-card:hover { border-color: rgba(99,102,241,0.35); transform: translateY(-3px); }
.server-card:hover::before { opacity: 1; }

.server-card.online { border-left: 3px solid var(--success); }
.server-card.offline { border-left: 3px solid var(--danger); opacity: 0.65; }

.card-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.status-indicator {
  position: relative;
  width: 10px;
  height: 10px;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: block;
}
.status-dot.online  { background: var(--success); box-shadow: 0 0 8px var(--success); }
.status-dot.offline { background: var(--danger); }
.status-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--success);
  opacity: 0.4;
  animation: pulse-ring 1.5s infinite;
}
.status-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-label.online  { color: var(--success); }
.status-label.offline { color: var(--danger); }

.card-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-ip {
  font-size: 12px;
  color: var(--text-muted);
  font-family: monospace;
  margin-bottom: 12px;
}

.card-metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.metric {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.metric-label {
  color: var(--text-muted);
  width: 28px;
  flex-shrink: 0;
}
.metric-bar {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.07);
  border-radius: 2px;
  overflow: hidden;
}
.metric-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.metric-fill.cpu  { background: linear-gradient(90deg, #6366f1, #818cf8); }
.metric-fill.mem  { background: linear-gradient(90deg, #10b981, #34d399); }
.metric-fill.ping { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

.metric-val {
  color: var(--text-secondary);
  width: 38px;
  text-align: right;
  font-family: monospace;
}
.metric-val small { font-size: 8px; color: var(--text-muted); opacity: 0.8; margin-left:1px; }

.card-heartbeat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
