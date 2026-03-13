<template>
  <nav class="navbar">
    <div class="nav-inner">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">AI<span class="gradient-text">Shop</span></span>
      </router-link>

      <!-- 搜索框 -->
      <div class="search-wrap">
        <el-input
          v-model="keyword"
          placeholder="搜索商品、品牌..."
          class="search-input"
          @keydown.enter="doSearch"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>

      <!-- 右侧操作区 -->
      <div class="nav-actions">
        <!-- AI 聊天 -->
        <router-link to="/chat" class="action-btn" title="AI 购物助手">
          <el-icon><ChatRound /></el-icon>
          <span class="action-label">AI助手</span>
        </router-link>

        <!-- 购物车 -->
        <router-link to="/cart" class="action-btn" title="购物车">
          <el-badge :value="cartStore.totalCount || ''" :hidden="!cartStore.totalCount" type="danger">
            <el-icon><ShoppingCart /></el-icon>
          </el-badge>
          <span class="action-label">购物车</span>
        </router-link>

        <!-- 用户 -->
        <el-dropdown v-if="userStore.isLoggedIn" trigger="click">
          <div class="action-btn user-btn">
            <img :src="userStore.userInfo?.avatar || 'https://picsum.photos/seed/avatar/100/100'" class="avatar" />
            <span class="action-label">{{ userStore.userInfo?.nickname || '我的' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="user-menu">
              <el-dropdown-item @click="$router.push('/orders')">
                <el-icon><List /></el-icon> 我的订单
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <router-link v-else to="/login" class="action-btn login-btn">
          <el-icon><User /></el-icon>
          <span class="action-label">登录</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const keyword = ref('')

onMounted(() => {
  if (!userStore.isLoggedIn) return
  cartStore.fetchCart().catch(() => {})
})

const doSearch = () => {
  if (!keyword.value.trim()) return
  router.push({ path: '/products', query: { keyword: keyword.value } })
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  background: rgba(15, 15, 26, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
}

.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon { font-size: 24px; }
.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.5px;
}

.search-wrap {
  flex: 1;
  max-width: 560px;
  display: flex;
  gap: 8px;
}
.search-input :deep(.el-input__wrapper) {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  box-shadow: none !important;
}
.search-input :deep(.el-input__inner) {
  color: #e2e8f0;
}
.search-input :deep(.el-input__inner::placeholder) {
  color: #64748b;
}
.search-btn {
  padding: 0 20px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}
.search-btn:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  border: none;
  background: none;
}
.action-btn:hover {
  color: #818cf8;
  background: rgba(99, 102, 241, 0.1);
}
.action-btn :deep(.el-icon) { font-size: 20px; }
.action-label { font-size: 11px; line-height: 1; }

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(99, 102, 241, 0.5);
}

.user-btn { cursor: pointer; }

.user-menu :deep(.el-dropdown-menu__item) {
  color: #e2e8f0;
}

.login-btn { color: #818cf8; }
</style>
