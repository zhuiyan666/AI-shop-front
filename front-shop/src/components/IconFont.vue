<template>
  <svg
    class="iconfont-svg"
    aria-hidden="true"
    :style="{ width: size, height: size }"
  >
    <use :xlink:href="`#${name}`"></use>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: String, default: '1em' }
})
</script>

<style scoped>
.iconfont-svg {
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  flex-shrink: 0;
}
</style>
