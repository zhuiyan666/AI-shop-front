import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 服务器状态枚举
export const ServerStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown'
}

// 移除原有的 generateMockServers 假数据逻辑


export const useServerStore = defineStore('server', () => {
  const servers = ref([]) // 初始为空，仅有真实连接时才有数据
  const logs = ref([])
  const onlineHistory = ref([]) // [{time, count}]
  const serverHistoryMap = ref({}) // { serverId: [{timestamp, cpu, memory}] }
  
  const wsStatus = ref('connecting')
  const wsLabel = ref('连接中...')

  const onlineCount = computed(() => servers.value.filter(s => s.status === ServerStatus.ONLINE).length)
  const offlineCount = computed(() => servers.value.filter(s => s.status === ServerStatus.OFFLINE).length)
  const totalCount = computed(() => servers.value.length)

  // 初始化历史在线数量
  let historyTimer = null

  function initHistory () {
    onlineHistory.value = []
    if (historyTimer) clearInterval(historyTimer)
    historyTimer = setInterval(() => {
      addToHistory()
    }, 5000) // Record online history every 5 seconds
  }

  function stopHistory() {
    if (historyTimer) {
      clearInterval(historyTimer)
      historyTimer = null
    }
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
          memory: 0,
          disk: 0,
          latency: 0
        })
      } else {
        exists.status = ServerStatus.ONLINE
        exists.lastHeartbeat = ts
        if (serverIp) exists.ip = serverIp
      }
      addLog({ type: 'register', serverId, serverName, time, icon: '🟢' })
    } else if (type === 'HEARTBEAT') {
      let srv = servers.value.find(s => s.id === serverId)
      if (!srv) {
        // 如果是刷新后收到的首次心跳缓存，这里负责把它重建出来
        srv = {
          id: serverId,
          name: serverName || serverId,
          ip: event.ip || '—',
          status: ServerStatus.ONLINE,
          lastHeartbeat: ts,
          registeredAt: ts,
          heartbeatCount: 0,
          cpu: 0,
          memory: 0,
          disk: 0,
          latency: 0
        }
        servers.value.push(srv)
      }
      srv.lastHeartbeat = ts
      srv.status = ServerStatus.ONLINE
      
      // 只在纯粹的心跳包时增加计数和日志，忽略携带数据的DATA包
      if (event.cpu === undefined && event.memory === undefined) {
        srv.heartbeatCount = (srv.heartbeatCount || 0) + 1
        addLog({ type: 'heartbeat', serverId, serverName, time, icon: '💓' })
      }
      
      // 记录真实历史数据给图表使用
      if (event.cpu !== undefined || event.memory !== undefined) {
        if (event.cpu !== undefined) srv.cpu = event.cpu
        if (event.memory !== undefined) srv.memory = event.memory
        if (event.disk !== undefined) srv.disk = event.disk
        if (event.latency !== undefined) srv.latency = event.latency
        if (event.ip !== undefined) srv.ip = event.ip
        
        if (!serverHistoryMap.value[serverId]) {
          serverHistoryMap.value[serverId] = []
        }
        serverHistoryMap.value[serverId].push({
          timestamp: time,
          cpu: srv.cpu,
          memory: srv.memory
        })
        if (serverHistoryMap.value[serverId].length > 40) {
          serverHistoryMap.value[serverId].shift()
        }
      }
    } else if (type === 'OFFLINE') {
      const srv = servers.value.find(s => s.id === serverId)
      if (srv) srv.status = ServerStatus.OFFLINE
      addLog({ type: 'offline', serverId, serverName, time, icon: '🔴' })
    }
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
    servers, logs, onlineHistory, serverHistoryMap, onlineCount, offlineCount, totalCount,
    wsStatus, wsLabel,
    handleServerEvent, startMockHeartbeat, stopMockHeartbeat, getServer, initHistory, stopHistory
  }
})
