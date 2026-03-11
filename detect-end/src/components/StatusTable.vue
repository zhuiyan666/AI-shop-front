<template>
  <el-table
    :data="servers"
    class="status-table"
    empty-text="暂无服务器数据"
    @row-click="(row) => $emit('select', row)"
  >
    <el-table-column width="56" align="center">
      <template #default="{ row }">
        <span class="status-dot" :class="row.status"></span>
      </template>
    </el-table-column>

    <el-table-column label="服务器名称" min-width="140">
      <template #default="{ row }">
        <div class="srv-name">{{ row.name }}</div>
      </template>
    </el-table-column>

    <el-table-column label="IP 地址" min-width="130">
      <template #default="{ row }">
        <span class="mono">{{ row.ip }}</span>
      </template>
    </el-table-column>

    <el-table-column label="状态" width="90" align="center">
      <template #default="{ row }">
        <el-tag
          :type="row.status === 'online' ? 'success' : 'danger'"
          effect="dark"
          size="small"
          round
        >
          {{ row.status === 'online' ? '在线' : '离线' }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="CPU" width="100">
      <template #default="{ row }">
        <div v-if="row.status === 'online'" class="mini-progress">
          <div class="mini-bar" :style="{ width: row.cpu + '%' }" :class="cpuClass(row.cpu)"></div>
        </div>
        <span v-else class="text-muted">—</span>
      </template>
    </el-table-column>

    <el-table-column label="内存" width="100">
      <template #default="{ row }">
        <div v-if="row.status === 'online'" class="mini-progress">
          <div class="mini-bar mem" :style="{ width: row.memory + '%' }"></div>
        </div>
        <span v-else class="text-muted">—</span>
      </template>
    </el-table-column>

    <el-table-column label="心跳次数" width="90" align="center">
      <template #default="{ row }">
        <span class="count">{{ row.heartbeatCount || 0 }}</span>
      </template>
    </el-table-column>

    <el-table-column label="最后心跳" min-width="120">
      <template #default="{ row }">
        <span class="time-text">{{ formatTime(row.lastHeartbeat) }}</span>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="80" align="center">
      <template #default="{ row }">
        <el-button link type="primary" size="small" @click.stop="$emit('select', row)">详情</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({ servers: { type: Array, default: () => [] } })
defineEmits(['select'])

function formatTime (ts) {
  if (!ts) return '—'
  const diff = Date.now() - ts
  if (diff < 5000) return '刚刚'
  if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`
  return new Date(ts).toLocaleTimeString('zh-CN')
}

function cpuClass (cpu) {
  if (cpu >= 80) return 'danger'
  if (cpu >= 60) return 'warning'
  return 'normal'
}
</script>

<style scoped>
.srv-name {
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
}
.srv-name:hover { color: var(--primary-light); }
.mono { font-family: monospace; font-size: 12px; color: var(--text-secondary); }
.text-muted { color: var(--text-muted); font-size: 12px; }
.count { color: var(--info); font-weight: 600; }
.time-text { font-size: 12px; color: var(--text-secondary); }

.mini-progress {
  height: 5px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}
.mini-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.mini-bar.normal  { background: linear-gradient(90deg, #6366f1, #818cf8); }
.mini-bar.warning { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.mini-bar.danger  { background: linear-gradient(90deg, #ef4444, #f87171); }
.mini-bar.mem     { background: linear-gradient(90deg, #10b981, #34d399); }
</style>
