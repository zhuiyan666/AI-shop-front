<template>
  <div class="site-logo" :class="{ compact }">
    <span class="logo-mark">
      <IconFont name="icon-store-fill" :size="compact ? '16px' : '18px'" />
    </span>
    <span class="logo-text">
      <span class="logo-main">AI</span>
      <span class="logo-accent">Shop</span>
      <span v-if="showTagline" class="logo-tagline">CURATED COMMERCE</span>
    </span>
  </div>
</template>

<script setup>
import IconFont from './IconFont.vue'

defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  showTagline: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.site-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #3a241c;
  min-width: 0;
}

.site-logo.compact {
  gap: 8px;
}

.logo-mark {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff5a36 0%, #ff4f6d 100%);
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(255, 90, 54, 0.18);
  flex-shrink: 0;
}

.compact .logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 12px;
}

.logo-text {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 1px;
  font-weight: 800;
  letter-spacing: 0.02em;
  min-width: 0;
  white-space: nowrap;
}

.logo-main {
  font-size: 22px;
  color: #3a241c;
}

.logo-accent {
  font-size: 22px;
  color: #ff5a36;
}

.compact .logo-main,
.compact .logo-accent {
  font-size: 18px;
}

.logo-tagline {
  position: absolute;
  left: 100%;
  top: 2px;
  margin-left: 10px;
  color: #ff6a53;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  white-space: nowrap;
}

@media (max-width: 1180px) {
  .logo-tagline {
    display: none;
  }
}
</style>
