<template>
  <div id="app">
    <NavBar v-if="showNav" />
    <main :class="{ 'with-nav': showNav }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <ChatFloating />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import ChatFloating from './components/ChatFloating.vue'

const route = useRoute()
const noNavRoutes = ['/login', '/register']
const showNav = computed(() => !noNavRoutes.includes(route.path))
</script>

<style>
.with-nav {
  padding-top: 64px;
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
