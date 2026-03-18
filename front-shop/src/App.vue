<template>
  <div id="app">
    <NavBar v-if="showNav" />
    <main :class="{ 'with-nav': showNav }">
      <router-view v-slot="{ Component }">
        <component :is="Component" :key="route.fullPath" />
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
</style>
