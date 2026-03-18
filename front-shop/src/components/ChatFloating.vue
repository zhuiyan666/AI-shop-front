<template>
  <div v-if="!isChatPage" class="chat-float" @click="goChat" title="AI 购物助手">
    <div class="chat-icon">
      <IconFont name="icon-comments-fill" size="28px" />
    </div>
    <div class="chat-pulse"></div>
    <div class="chat-tip">AI助手</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconFont from './IconFont.vue'

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
  left: 28px;
  bottom: 40px;
  z-index: 999;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.chat-icon {
  position: relative;
  z-index: 1;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  color: #ffffff;
  box-shadow: 0 14px 26px rgba(255, 90, 54, 0.18);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chat-float:hover .chat-icon {
  transform: scale(1.08) translateY(-4px);
  box-shadow: 0 18px 34px rgba(255, 90, 54, 0.24);
}

.chat-pulse {
  position: absolute;
  top: 0;
  width: 56px;
  height: 56px;
  border-radius: 20px;
  background: rgba(255, 90, 54, 0.16);
  animation: chat-pulse 2s infinite;
}

@keyframes chat-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.chat-tip {
  font-size: 11px;
  color: #e34724;
  background: rgba(255, 255, 255, 0.96);
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 90, 54, 0.14);
}
</style>
