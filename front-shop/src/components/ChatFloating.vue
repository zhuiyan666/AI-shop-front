<template>
  <!-- 浮动 AI 助手按钮 -->
  <div v-if="!isChatPage" class="chat-float" @click="goChat" title="AI 购物助手">
    <div class="chat-icon">🤖</div>
    <div class="chat-pulse"></div>
    <div class="chat-tip">AI助手</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isChatPage = computed(() => route.path === '/chat')

const goChat = () => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  router.push('/chat')
}
</script>

<style scoped>
.chat-float {
  position: fixed;
  right: 28px;
  bottom: 40px;
  z-index: 999;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.chat-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}
.chat-float:hover .chat-icon {
  transform: scale(1.1) translateY(-4px);
  box-shadow: 0 16px 40px rgba(99, 102, 241, 0.65);
}

.chat-pulse {
  position: absolute;
  top: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.4);
  animation: chat-pulse 2s infinite;
}
@keyframes chat-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

.chat-tip {
  font-size: 11px;
  color: #94a3b8;
  background: rgba(15, 15, 26, 0.8);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}
</style>
