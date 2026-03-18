<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useServerStore } from './store/serverStore'
import { getWsClient } from './utils/websocket'

const store = useServerStore()
let wsClient = null

onMounted(() => {
  // Clear any existing mock data on start
  store.servers.length = 0;
  store.initHistory();

  // Connect to actual Spring Boot backend websocket
  const wsBase = process.env.VUE_APP_MONITOR_WS_URL || 'ws://localhost:8080/ws/monitor'
  const token = localStorage.getItem('token') || ''
  const monitorKey = process.env.VUE_APP_MONITOR_WS_KEY || ''
  const qs = []
  if (token) qs.push(`token=${encodeURIComponent(token)}`)
  if (monitorKey) qs.push(`monitorKey=${encodeURIComponent(monitorKey)}`)
  const wsUrl = qs.length ? `${wsBase}?${qs.join('&')}` : wsBase
  wsClient = getWsClient(wsUrl)
  
  wsClient.on('open', () => {
    store.wsStatus = 'connected'
    store.wsLabel = '已连接实况'
  })

  wsClient.on('close', () => {
    store.wsStatus = 'disconnected'
    store.wsLabel = '连接中断'
  })

  wsClient.on('message', (data) => {
     if (typeof data === 'object' && data.type) {
         store.handleServerEvent(data)
     }
  })

  wsClient.connect()
})

onUnmounted(() => {
  if (wsClient) {
    wsClient.disconnect()
  }
  store.stopHistory()
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
}
</style>
