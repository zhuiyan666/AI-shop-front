<template>
  <div class="auth-page">
    <div class="auth-shell">
      <section class="art-panel" :class="[`is-${mascotState}`]">
        <div class="art-copy">
          <span class="art-chip">AI 购物助手</span>
          <h1>让登录生动起来</h1>
          <p>开启您的智能购物之旅。输入您的账号信息体验全程带有交互的登录！</p>
        </div>

        <div class="mascot-stage flex justify-center mt-2 relative z-10" style="height: 400px; transform: scale(0.65) translateY(10%); transform-origin: top center;">
          <AnimatedCharacters 
            :isTyping="isTyping" 
            :showPassword="showPassword" 
            :passwordLength="form.password.length" 
          />
        </div>

        <div class="art-footer">
          <span>聚焦用户名</span>
          <span>聚焦密码</span>
          <span>点击登录</span>
        </div>
      </section>

      <section class="form-panel">
        <div class="auth-logo">
          <SiteLogo :show-tagline="false" />
          <p class="sub">欢迎回来。请登录以继续使用AI购物助手。</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @submit.prevent="handleLogin">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名 (测试账号: test)"
              size="large"
              prefix-icon="User"
              class="custom-input"
              @focus="focusedField = 'username'"
              @blur="focusedField = ''"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="密码 (测试密码: 123456)"
              size="large"
              prefix-icon="Lock"
              class="custom-input"
              @focus="focusedField = 'password'"
              @blur="focusedField = ''"
              @keydown.enter="handleLogin"
            >
              <template #suffix>
                <el-icon @click="showPassword = !showPassword" class="cursor-pointer hover:text-gray-600 transition-colors" style="cursor: pointer;">
                  <component :is="showPassword ? EyeOff : Eye" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="helper-row">
            <span class="helper-text">您可以使用默认的测试账号进行预览。</span>
            <router-link to="/register" class="helper-link">创建账号</router-link>
          </div>

          <el-button type="primary" size="large" :loading="loading" class="submit-btn" @click="handleLogin">
            <IconFont name="icon-account-fill" size="16px" />
            {{ loading ? '登录中...' : '立即登录' }}
          </el-button>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import IconFont from '../../components/IconFont.vue'
import SiteLogo from '../../components/SiteLogo.vue'
import AnimatedCharacters from '../../components/AnimatedCharacters.vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const focusedField = ref('')
const showPassword = ref(false)

const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const isTyping = computed(() => focusedField.value !== '')

const handleLogin = async () => {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    focusedField.value = ''
    try {
      await userStore.login(form)
      ElMessage.success('登录成功')
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
  background:
    radial-gradient(circle at top left, rgba(255, 210, 197, 0.45), transparent 28%),
    radial-gradient(circle at bottom right, rgba(255, 79, 109, 0.08), transparent 26%),
    #fff7f4;
  padding: 32px 24px;
}

.auth-shell {
  width: min(1120px, 100%);
  min-height: 680px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  border-radius: 32px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(255, 79, 109, 0.12);
  border: 1px solid rgba(255, 90, 54, 0.1);
}

.art-panel {
  position: relative;
  padding: 44px 40px 34px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.28), transparent 24%),
    linear-gradient(160deg, #5d6672 0%, #7f8794 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.art-panel::after {
  content: '';
  position: absolute;
  inset: 24px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

.art-copy,
.art-footer,
.mascot-stage {
  position: relative;
  z-index: 1;
}

.art-chip {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.art-copy h1 {
  margin: 18px 0 14px;
  color: #ffffff;
  font-size: 42px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.art-copy p {
  max-width: 420px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
}

.mascot-stage {
  position: relative;
  height: 340px;
  margin: 12px 0;
  overflow: visible;
}


.art-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 12px;
}

.form-panel {
  padding: 54px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
}

.auth-logo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.sub {
  margin: 0;
  color: #a98478;
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-input :deep(.el-input__wrapper) {
  background: #ffffff;
  border: 1px solid rgba(255, 79, 109, 0.16);
  border-radius: 16px;
  box-shadow: none !important;
  min-height: 50px;
}

.custom-input :deep(.el-input__wrapper:hover),
.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(255, 79, 109, 0.34) !important;
}

.custom-input :deep(.el-input__inner) {
  color: #3a241c;
  font-size: 14px;
}

.helper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  margin-bottom: 8px;
}

.helper-text {
  color: #a98478;
  font-size: 12px;
}

.helper-link {
  color: #ff5a36;
  font-size: 13px;
  font-weight: 700;
}

.submit-btn {
  width: 100%;
  height: 52px;
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none !important;
  border-radius: 16px !important;
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%) !important;
  font-size: 15px;
  font-weight: 700;
}

@keyframes mascot-float {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}

@keyframes eye-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@media (max-width: 980px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .art-panel {
    min-height: 420px;
  }

  .form-panel {
    padding: 36px 24px 42px;
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: 16px;
  }

  .auth-shell {
    border-radius: 24px;
  }

  .art-panel {
    padding: 28px 22px 20px;
    min-height: 360px;
  }

  .art-copy h1 {
    font-size: 30px;
  }

  .mascot-stage {
    height: 260px;
  }

  .shape-back {
    width: 156px;
    height: 190px;
  }

  .shape-middle {
    left: 150px;
    width: 92px;
    height: 144px;
  }

  .shape-front {
    width: 128px;
    height: 104px;
  }

  .shape-front::after {
    right: -102px;
    width: 96px;
    height: 132px;
  }

  .eyes {
    margin-top: 44px;
    gap: 12px;
  }

  .eye {
    width: 18px;
    height: 18px;
  }

  .eye::after {
    top: 6px;
    left: 6px;
    width: 6px;
    height: 6px;
  }

  .mouth {
    left: 50px;
    bottom: 22px;
  }

  .art-footer {
    flex-wrap: wrap;
  }
}
</style>
