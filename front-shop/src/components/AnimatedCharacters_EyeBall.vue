<template>
  <div
    style="border-radius: 9999px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; overflow: hidden;"
    :style="{
      width: size + 'px',
      height: (isBlinking ? '2px' : size + 'px'),
      backgroundColor: eyeColor
    }"
  >
    <Pupil
      v-if="!isBlinking"
      :size="pupilSize"
      :max-distance="maxDistance"
      :pupil-color="pupilColor"
      :force-look-x="forceLookX"
      :force-look-y="forceLookY"
      :mouse-x="mouseX"
      :mouse-y="mouseY"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import Pupil from './AnimatedCharacters_Pupil.vue';

defineProps(['size', 'pupilSize', 'maxDistance', 'eyeColor', 'pupilColor', 'isBlinking', 'forceLookX', 'forceLookY', 'mouseX', 'mouseY']);
</script>
