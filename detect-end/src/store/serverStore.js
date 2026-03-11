import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 服务器状态枚举
export const ServerStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown'
}

// 模拟初始服务器数据
function generateMockServers () {
  const names = ['web-server-01', 'api-server-02', 'db-server-03', 'cache-04', 'queue-05', 'cdn-06']
  const ips = ['192.168.1.101', '192.168.1.102', '192.168.1.103', '192.168.1.104', '192.168.1.105', '192.168.1.106']
  return names.map((name, i) => ({
    id: `srv-${i + 1}`,
    name,
    ip: ips[i],
    status: i < 4 ? ServerStatus.ONLINE : ServerStatus.OFFLINE,
    lastHeartbeat: Date.now() - Math.random() * 10000,
    registeredAt: Date.now() - 1000 * 60 * 60 * (i + 1),
    heartbeatInterval: 5000,
    heartbeatCount: Math.floor(Math.random() * 500) + 100,
    cpu: Math.floor(Math.random() * 80) + 10,
    memory: Math.floor(Math.random() * 70) + 20
  }))
}

export const useServerStore = defineStore('server', () => {
  const servers = ref(generateMockServers())
  const logs = ref([])
  const onlineHistory = ref([]) // [{time, count}]

  const onlineCount = computed(() => servers.value.filter(s => s.status === ServerStatus.ONLINE).length)
  const offlineCount = computed(() => servers.value.filter(s => s.status === ServerStatus.OFFLINE).length)
  const totalCount = computed(() => servers.value.length)

  // 初始化历史在线数量（最近20个点）
  function initHistory () {
    const now = Date.now()
    onlineHistory.value = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now - (19 - i) * 5000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      count: Math.floor(Math.random() * 3) + 2
    }))
  }

  // 处理 WebSocket 事件
  function handleServerEvent (event) {
    const { type, serverId, serverName, serverIp, timestamp } = event
    const ts = timestamp || Date.now()
    const time = new Date(ts).toLocaleTimeString('zh-CN')

    if (type === 'REGISTER') {
      const exists = servers.value.find(s => s.id === serverId)
      if (!exists) {
        servers.value.push({
          id: serverId,
          name: serverName || serverId,
          ip: serverIp || '—',
          status: ServerStatus.ONLINE,
          lastHeartbeat: ts,
          registeredAt: ts,
          heartbeatCount: 0,
          cpu: 0,
          memory: 0
        })
      } else {
        exists.status = ServerStatus.ONLINE
        exists.lastHeartbeat = ts
      }
      addLog({ type: 'register', serverId, serverName, time, icon: '🟢' })
    } else if (type === 'HEARTBEAT') {
      const srv = servers.value.find(s => s.id === serverId)
      if (srv) {
        srv.lastHeartbeat = ts
        srv.status = ServerStatus.ONLINE
        srv.heartbeatCount = (srv.heartbeatCount || 0) + 1
        if (event.cpu !== undefined) srv.cpu = event.cpu
        if (event.memory !== undefined) srv.memory = event.memory
      }
      addLog({ type: 'heartbeat', serverId, serverName, time, icon: '💓' })
    } else if (type === 'OFFLINE') {
      const srv = servers.value.find(s => s.id === serverId)
      if (srv) srv.status = ServerStatus.OFFLINE
      addLog({ type: 'offline', serverId, serverName, time, icon: '🔴' })
    }

    // 更新在线数量历史
    addToHistory()
  }

  function addLog (log) {
    logs.value.unshift({ ...log, id: Date.now() + Math.random() })
    if (logs.value.length > 100) logs.value.pop()
  }

  function addToHistory () {
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    onlineHistory.value.push({ time, count: onlineCount.value })
    if (onlineHistory.value.length > 30) onlineHistory.value.shift()
  }

  // 模拟随机心跳（用于 Demo 无后端时自动演示）
  let mockTimer = null
  function startMockHeartbeat () {
    if (mockTimer) return
    initHistory()
    mockTimer = setInterval(() => {
      const onlineServers = servers.value.filter(s => s.status === ServerStatus.ONLINE)
      if (onlineServers.length === 0) return
      // 随机选一个在线服务器发心跳
      const srv = onlineServers[Math.floor(Math.random() * onlineServers.length)]
      srv.cpu = Math.min(99, Math.max(5, srv.cpu + (Math.random() * 10 - 5)))
      srv.memory = Math.min(95, Math.max(10, srv.memory + (Math.random() * 6 - 3)))
      handleServerEvent({
        type: 'HEARTBEAT',
        serverId: srv.id,
        serverName: srv.name,
        timestamp: Date.now(),
        cpu: Math.round(srv.cpu),
        memory: Math.round(srv.memory)
      })

      // 偶尔触发上线/下线
      if (Math.random() < 0.05) {
        const offlineSrv = servers.value.find(s => s.status === ServerStatus.OFFLINE)
        if (offlineSrv) {
          handleServerEvent({ type: 'REGISTER', serverId: offlineSrv.id, serverName: offlineSrv.name, timestamp: Date.now() })
        }
      } else if (Math.random() < 0.03 && onlineServers.length > 2) {
        handleServerEvent({ type: 'OFFLINE', serverId: srv.id, serverName: srv.name, timestamp: Date.now() })
      }
    }, 2000)
  }

  function stopMockHeartbeat () {
    clearInterval(mockTimer)
    mockTimer = null
  }

  function getServer (id) {
    return servers.value.find(s => s.id === id)
  }

  return {
    servers, logs, onlineHistory, onlineCount, offlineCount, totalCount,
    handleServerEvent, startMockHeartbeat, stopMockHeartbeat, getServer, initHistory
  }
})
