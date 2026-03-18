<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="logo-link" aria-label="回到首页">
        <SiteLogo />
      </router-link>

      <div class="search-wrap">
        <el-input
          v-model="keyword"
          placeholder="搜索商品、品牌、类目"
          class="search-input"
          @keydown.enter="doSearch"
          clearable
        >
          <template #prefix>
            <span class="input-prefix">
              <IconFont name="icon-search" size="16px" />
            </span>
          </template>
        </el-input>
        <button class="search-btn" @click="doSearch">
          <IconFont name="icon-search" size="14px" />
          搜索
        </button>
      </div>

      <div class="nav-actions">
        <router-link to="/chat" class="action-btn" title="AI 购物助手">
          <IconFont name="icon-comments-fill" size="18px" />
          <span class="action-label">AI助手</span>
        </router-link>

        <router-link to="/cart" class="action-btn" title="购物车">
          <el-badge :value="cartStore.totalCount || ''" :hidden="!cartStore.totalCount" type="danger">
            <IconFont name="icon-cart-full-fill" size="18px" />
          </el-badge>
          <span class="action-label">购物车</span>
        </router-link>

        <el-dropdown v-if="userStore.isLoggedIn" trigger="click">
          <div class="action-btn user-btn">
            <img :src="userStore.userInfo?.avatar || 'https://picsum.photos/seed/avatar/100/100'" class="avatar" />
            <span class="action-label">{{ userStore.userInfo?.nickname || '我的' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="user-menu">
              <el-dropdown-item @click="$router.push('/orders')">
                <IconFont name="icon-order-fill" size="14px" />
                我的订单
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <IconFont name="icon-return" size="14px" />
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <router-link v-else to="/login" class="action-btn login-btn">
          <IconFont name="icon-account-fill" size="18px" />
          <span class="action-label">登录</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'
import IconFont from './IconFont.vue'
import SiteLogo from './SiteLogo.vue'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const keyword = ref('')

onMounted(() => {
  if (!userStore.isLoggedIn) return
  cartStore.fetchCart().catch(() => {})
})

const doSearch = () => {
  const value = keyword.value.trim()
  if (!value) return
  router.push({ path: '/products', query: { keyword: value } })
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
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 79, 109, 0.1);
}

.nav-inner {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
  min-width: 150px;
  max-width: 240px;
}

.search-wrap {
  flex: 1;
  min-width: 220px;
  max-width: 620px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  flex: 1;
  min-width: 0;
}

.search-input :deep(.el-input__wrapper) {
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.14);
  border-radius: 999px;
  box-shadow: none !important;
  min-height: 40px;
}

.search-input :deep(.el-input__inner) {
  color: #3a241c;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: #a98478;
}

.input-prefix {
  display: inline-flex;
  align-items: center;
  color: #ff5a36;
}

.search-btn {
  height: 40px;
  flex-shrink: 0;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 79, 109, 0.16);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(255, 79, 109, 0.2);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: auto;
}

.action-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 64px;
  padding: 6px 10px;
  border-radius: 16px;
  color: #7c4d3f;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.action-btn:hover {
  color: #ff5a36;
  background: rgba(255, 79, 109, 0.08);
}

.action-label {
  font-size: 11px;
  line-height: 1;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 90, 54, 0.24);
}

.user-btn {
  user-select: none;
}

.user-menu :deep(.el-dropdown-menu__item) {
  gap: 8px;
  color: #3a241c;
}

.login-btn {
  color: #ff5a36;
}

@media (max-width: 900px) {
  .nav-inner {
    gap: 12px;
    padding: 0 14px;
  }

  .logo-link {
    min-width: 132px;
    max-width: 180px;
  }

  .search-wrap {
    max-width: none;
  }
}

@media (max-width: 720px) {
  .nav-inner {
    gap: 8px;
  }

  .logo-link {
    min-width: 116px;
    max-width: 132px;
  }

  .search-wrap {
    min-width: 0;
    gap: 6px;
  }

  .search-btn {
    min-width: 40px;
    padding: 0 12px;
  }

  .action-label {
    display: none;
  }

  .action-btn {
    min-width: 40px;
    padding: 8px;
  }
}
</style>
