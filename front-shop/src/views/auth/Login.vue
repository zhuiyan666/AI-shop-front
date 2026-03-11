<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="bg-orb orb1"></div>
    <div class="bg-orb orb2"></div>

    <div class="auth-card glass-card">
      <!-- Logo -->
      <div class="auth-logo">
        <span style="font-size:40px">⚡</span>
        <h1>AI<span class="gradient-text">Shop</span></h1>
        <p class="sub">智能电商，从对话开始</p>
      </div>

      <!-- 登录表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名（测试：test）"
            size="large"
            prefix-icon="User"
            class="custom-input"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码（测试：123456）"
            size="large"
            prefix-icon="Lock"
            show-password
            class="custom-input"
            @keydown.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="submit-btn"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '🚀 立即登录' }}
        </el-button>
      </el-form>

      <div class="auth-footer">
        <span style="color:#64748b">还没有账号？</span>
        <router-link to="/register" class="link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login(form)
      ElMessage.success('登录成功 ✨')
      router.push('/')
    } catch (e) {
      ElMessage.error(e?.response?.data?.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: float 6s ease-in-out infinite;
}
.orb1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25), transparent);
  top: -100px; left: -100px;
}
.orb2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent);
  bottom: -80px; right: -80px;
  animation-delay: -3s;
}

.auth-card {
  width: 420px;
  padding: 48px 40px;
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s ease forwards;
}

.auth-logo {
  text-align: center;
  margin-bottom: 36px;
}
.auth-logo h1 { font-size: 32px; font-weight: 700; color: #e2e8f0; margin: 8px 0; }
.sub { color: #64748b; font-size: 14px; }

.auth-form { display: flex; flex-direction: column; gap: 4px; }

.custom-input :deep(.el-input__wrapper) {
  background: rgba(15, 15, 26, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px;
  box-shadow: none !important;
  transition: border-color 0.2s;
}
.custom-input :deep(.el-input__wrapper:hover),
.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #6366f1 !important;
}
.custom-input :deep(.el-input__inner) { color: #e2e8f0; font-size: 15px; }
.custom-input :deep(.el-input__prefix) { color: #6366f1; }

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
  border: none !important;
  border-radius: 10px !important;
  letter-spacing: 1px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
}
.link {
  color: #818cf8;
  text-decoration: none;
  margin-left: 6px;
  font-weight: 500;
}
.link:hover { color: #6366f1; text-decoration: underline; }
</style>
