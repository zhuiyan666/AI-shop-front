<template>
  <div class="auth-page">
    <div class="bg-orb orb1"></div>
    <div class="bg-orb orb2"></div>

    <div class="auth-card glass-card">
      <div class="auth-logo">
        <span style="font-size:40px">✨</span>
        <h1>创建账号</h1>
        <p class="sub">加入 AIShop，发现更多可能</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="auth-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" class="custom-input" />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称" size="large" prefix-icon="Avatar" class="custom-input" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" size="large" prefix-icon="Message" class="custom-input" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（6位以上）" size="large" prefix-icon="Lock" show-password class="custom-input" />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" size="large" prefix-icon="Lock" show-password class="custom-input" />
        </el-form-item>

        <el-button type="primary" size="large" :loading="loading" class="submit-btn" @click="handleRegister">
          {{ loading ? '注册中...' : '🎉 立即注册' }}
        </el-button>
      </el-form>

      <div class="auth-footer">
        <span style="color:#64748b">已有账号？</span>
        <router-link to="/login" class="link">立即登录</router-link>
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

const form = reactive({ username: '', nickname: '', email: '', password: '', confirmPassword: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 3, message: '至少3位字符', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: '请输入合法邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6位字符', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value, cb) => { value !== form.password ? cb(new Error('两次密码不一致')) : cb() }, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.register(form)
      ElMessage.success('注册成功，请登录 🎉')
      router.push('/login')
    } catch {
      ElMessage.error('注册失败，请重试')
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
.bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: float 6s ease-in-out infinite; }
.orb1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(99,102,241,0.25), transparent); top: -100px; left: -80px; }
.orb2 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(20,184,166,0.2), transparent); bottom: -80px; right: -80px; animation-delay: -3s; }
.auth-card { width: 440px; padding: 40px; position: relative; z-index: 1; animation: fadeInUp 0.6s ease forwards; }
.auth-logo { text-align: center; margin-bottom: 28px; }
.auth-logo h1 { font-size: 28px; font-weight: 700; color: #e2e8f0; margin: 8px 0; }
.sub { color: #64748b; font-size: 14px; }
.auth-form { display: flex; flex-direction: column; gap: 4px; }
.custom-input :deep(.el-input__wrapper) { background: rgba(15,15,26,0.6); border: 1px solid rgba(99,102,241,0.25); border-radius: 10px; box-shadow: none !important; transition: border-color 0.2s; }
.custom-input :deep(.el-input__wrapper:hover), .custom-input :deep(.el-input__wrapper.is-focus) { border-color: #6366f1 !important; }
.custom-input :deep(.el-input__inner) { color: #e2e8f0; }
.custom-input :deep(.el-input__prefix) { color: #14b8a6; }
.submit-btn { width: 100%; height: 48px; font-size: 16px; font-weight: 600; margin-top: 8px; background: linear-gradient(135deg, #14b8a6, #0f9081) !important; border: none !important; border-radius: 10px !important; }
.auth-footer { text-align: center; margin-top: 20px; font-size: 14px; }
.link { color: #818cf8; text-decoration: none; margin-left: 6px; font-weight: 500; }
.link:hover { text-decoration: underline; }
</style>
