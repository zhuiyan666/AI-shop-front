<template>
  <div class="relative" style="width: 550px; height: 400px; display: inline-block;">
    <!-- Purple tall rectangle character - Back layer -->
    <div
      ref="purpleRef"
      class="character-layer"
      :style="{
        left: '70px',
        width: '180px',
        height: (isTyping || isHidingPassword) ? '440px' : '400px',
        backgroundColor: '#6C3FF5',
        borderRadius: '10px 10px 0 0',
        zIndex: 1,
        transform: purpleTransform,
        ...commonStyle
      }"
    >
      <!-- Eyes -->
      <div class="eyes-container" :style="purpleEyesPosition">
        <EyeBall
          :size="18"
          :pupil-size="7"
          :max-distance="5"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isPurpleBlinking"
          :force-look-x="purpleForceLookX"
          :force-look-y="purpleForceLookY"
          :mouse-x="mouseX"
          :mouse-y="mouseY"
        />
        <EyeBall
          :size="18"
          :pupil-size="7"
          :max-distance="5"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isPurpleBlinking"
          :force-look-x="purpleForceLookX"
          :force-look-y="purpleForceLookY"
          :mouse-x="mouseX"
          :mouse-y="mouseY"
        />
      </div>
    </div>

    <!-- Black tall rectangle character - Middle layer -->
    <div
      ref="blackRef"
      class="character-layer"
      :style="{
        left: '240px',
        width: '120px',
        height: '310px',
        backgroundColor: '#2D2D2D',
        borderRadius: '8px 8px 0 0',
        zIndex: 2,
        transform: blackTransform,
        ...commonStyle
      }"
    >
      <!-- Eyes -->
      <div class="eyes-container" style="gap: 1.5rem" :style="blackEyesPosition">
        <EyeBall
          :size="16"
          :pupil-size="6"
          :max-distance="4"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isBlackBlinking"
          :force-look-x="blackForceLookX"
          :force-look-y="blackForceLookY"
          :mouse-x="mouseX"
          :mouse-y="mouseY"
        />
        <EyeBall
          :size="16"
          :pupil-size="6"
          :max-distance="4"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isBlackBlinking"
          :force-look-x="blackForceLookX"
          :force-look-y="blackForceLookY"
          :mouse-x="mouseX"
          :mouse-y="mouseY"
        />
      </div>
    </div>

    <!-- Orange semi-circle character - Front left -->
    <div
      ref="orangeRef"
      class="character-layer"
      :style="{
        left: '0px',
        width: '240px',
        height: '200px',
        zIndex: 3,
        backgroundColor: '#FF9B6B',
        borderRadius: '120px 120px 0 0',
        transform: orangeTransform,
        ...commonStyle
      }"
    >
      <!-- Eyes - just pupils, no white -->
      <div class="eyes-container" style="transition: all 0.2s ease-out; gap: 2rem" :style="orangeEyesPosition">
        <Pupil
          :size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="frontForceLookX"
          :force-look-y="frontForceLookY"
          :mouse-x="mouseX"
          :mouse-y="mouseY"
        />
        <Pupil
          :size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="frontForceLookX"
          :force-look-y="frontForceLookY"
          :mouse-x="mouseX"
          :mouse-y="mouseY"
        />
      </div>
    </div>

    <!-- Yellow tall rectangle character - Front right -->
    <div
      ref="yellowRef"
      class="character-layer"
      :style="{
        left: '310px',
        width: '140px',
        height: '230px',
        backgroundColor: '#E8D754',
        borderRadius: '70px 70px 0 0',
        zIndex: 4,
        transform: yellowTransform,
        ...commonStyle
      }"
    >
      <!-- Eyes - just pupils, no white -->
      <div class="eyes-container" style="transition: all 0.2s ease-out; gap: 1.5rem" :style="yellowEyesPosition">
        <Pupil
          :size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="frontForceLookX"
          :force-look-y="frontForceLookY"
          :mouse-x="mouseX"
          :mouse-y="mouseY"
        />
        <Pupil
          :size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="frontForceLookX"
          :force-look-y="frontForceLookY"
          :mouse-x="mouseX"
          :mouse-y="mouseY"
        />
      </div>
      <!-- Horizontal line for mouth -->
      <div
        class="mouth-line"
        :style="yellowMouthPosition"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, defineProps } from 'vue';

const props = defineProps({
  isTyping: {
    type: Boolean,
    default: false
  },
  showPassword: {
    type: Boolean,
    default: false
  },
  passwordLength: {
    type: Number,
    default: 0
  }
});

const mouseX = ref(0);
const mouseY = ref(0);
const isPurpleBlinking = ref(false);
const isBlackBlinking = ref(false);
const isLookingAtEachOther = ref(false);
const isPurplePeeking = ref(false);

const purpleRef = ref(null);
const blackRef = ref(null);
const yellowRef = ref(null);
const orangeRef = ref(null);

const handleMouseMove = (e) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
};

// --- Sub-components definition inline in setup for Vue 3 SFC ---
import Pupil from './AnimatedCharacters_Pupil.vue';
import EyeBall from './AnimatedCharacters_EyeBall.vue';
// ----------------------------------------------------------------

let purpleBlinkTimeout = null;
let blackBlinkTimeout = null;
let lookTimer = null;
let peekTimer = null;

const schedulePurpleBlink = () => {
  purpleBlinkTimeout = setTimeout(() => {
    isPurpleBlinking.value = true;
    setTimeout(() => {
      isPurpleBlinking.value = false;
      schedulePurpleBlink();
    }, 150);
  }, Math.random() * 4000 + 3000);
};

const scheduleBlackBlink = () => {
  blackBlinkTimeout = setTimeout(() => {
    isBlackBlinking.value = true;
    setTimeout(() => {
      isBlackBlinking.value = false;
      scheduleBlackBlink();
    }, 150);
  }, Math.random() * 4000 + 3000);
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  schedulePurpleBlink();
  scheduleBlackBlink();
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  clearTimeout(purpleBlinkTimeout);
  clearTimeout(blackBlinkTimeout);
  clearTimeout(lookTimer);
  clearTimeout(peekTimer);
});

watch(() => props.isTyping, (typing) => {
  if (typing) {
    isLookingAtEachOther.value = true;
    clearTimeout(lookTimer);
    lookTimer = setTimeout(() => {
      isLookingAtEachOther.value = false;
    }, 800);
  } else {
    isLookingAtEachOther.value = false;
  }
});

watch(() => [props.passwordLength, props.showPassword], () => {
  if (props.passwordLength > 0 && props.showPassword) {
    clearTimeout(peekTimer);
    const schedulePeek = () => {
      peekTimer = setTimeout(() => {
        isPurplePeeking.value = true;
        setTimeout(() => {
          isPurplePeeking.value = false;
        }, 800);
      }, Math.random() * 3000 + 2000);
    };
    schedulePeek();
  } else {
    isPurplePeeking.value = false;
    clearTimeout(peekTimer);
  }
});

const calculatePosition = (refEl) => {
  if (!refEl) return { faceX: 0, faceY: 0, bodySkew: 0 };
  const rect = refEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 3;
  const deltaX = mouseX.value - centerX;
  const deltaY = mouseY.value - centerY;
  const faceX = Math.max(-15, Math.min(15, deltaX / 20));
  const faceY = Math.max(-10, Math.min(10, deltaY / 30));
  const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
  return { faceX, faceY, bodySkew };
};

const purplePos = computed(() => calculatePosition(purpleRef.value));
const blackPos = computed(() => calculatePosition(blackRef.value));
const yellowPos = computed(() => calculatePosition(yellowRef.value));
const orangePos = computed(() => calculatePosition(orangeRef.value));

const isHidingPassword = computed(() => props.passwordLength > 0 && !props.showPassword);

const commonStyle = {
  position: 'absolute',
  bottom: 0,
  transition: 'all 0.7s ease-in-out',
  transformOrigin: 'bottom center'
};

const purpleTransform = computed(() => {
  if (props.passwordLength > 0 && props.showPassword) return `skewX(0deg)`;
  if (props.isTyping || isHidingPassword.value)
    return `skewX(${(purplePos.value.bodySkew || 0) - 12}deg) translateX(40px)`;
  return `skewX(${purplePos.value.bodySkew || 0}deg)`;
});

const purpleEyesPosition = computed(() => {
  const left = (props.passwordLength > 0 && props.showPassword) ? 20
    : isLookingAtEachOther.value ? 55 : 45 + purplePos.value.faceX;
  const top = (props.passwordLength > 0 && props.showPassword) ? 35
    : isLookingAtEachOther.value ? 65 : 40 + purplePos.value.faceY;
  return { left: left + 'px', top: top + 'px' };
});
const purpleForceLookX = computed(() => {
  if (props.passwordLength > 0 && props.showPassword) return isPurplePeeking.value ? 4 : -4;
  if (isLookingAtEachOther.value) return 3;
  return undefined;
});
const purpleForceLookY = computed(() => {
  if (props.passwordLength > 0 && props.showPassword) return isPurplePeeking.value ? 5 : -4;
  if (isLookingAtEachOther.value) return 4;
  return undefined;
});

const blackTransform = computed(() => {
  if (props.passwordLength > 0 && props.showPassword) return `skewX(0deg)`;
  if (isLookingAtEachOther.value) return `skewX(${(blackPos.value.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`;
  if (props.isTyping || isHidingPassword.value) return `skewX(${(blackPos.value.bodySkew || 0) * 1.5}deg)`;
  return `skewX(${blackPos.value.bodySkew || 0}deg)`;
});

const blackEyesPosition = computed(() => {
  const left = (props.passwordLength > 0 && props.showPassword) ? 10
    : isLookingAtEachOther.value ? 32 : 26 + blackPos.value.faceX;
  const top = (props.passwordLength > 0 && props.showPassword) ? 28
    : isLookingAtEachOther.value ? 12 : 32 + blackPos.value.faceY;
  return { left: left + 'px', top: top + 'px' };
});
const blackForceLookX = computed(() => {
  if (props.passwordLength > 0 && props.showPassword) return -4;
  if (isLookingAtEachOther.value) return 0;
  return undefined;
});
const blackForceLookY = computed(() => {
  if (props.passwordLength > 0 && props.showPassword) return -4;
  if (isLookingAtEachOther.value) return -4;
  return undefined;
});

const orangeTransform = computed(() => {
  return (props.passwordLength > 0 && props.showPassword) ? `skewX(0deg)` : `skewX(${orangePos.value.bodySkew || 0}deg)`;
});
const orangeEyesPosition = computed(() => {
  const left = (props.passwordLength > 0 && props.showPassword) ? 50 : 82 + (orangePos.value.faceX || 0);
  const top = (props.passwordLength > 0 && props.showPassword) ? 85 : 90 + (orangePos.value.faceY || 0);
  return { left: left + 'px', top: top + 'px' };
});

const yellowTransform = computed(() => {
  return (props.passwordLength > 0 && props.showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.value.bodySkew || 0}deg)`;
});
const yellowEyesPosition = computed(() => {
  const left = (props.passwordLength > 0 && props.showPassword) ? 20 : 52 + (yellowPos.value.faceX || 0);
  const top = (props.passwordLength > 0 && props.showPassword) ? 35 : 40 + (yellowPos.value.faceY || 0);
  return { left: left + 'px', top: top + 'px' };
});
const yellowMouthPosition = computed(() => {
  const left = (props.passwordLength > 0 && props.showPassword) ? 10 : 40 + (yellowPos.value.faceX || 0);
  const top = (props.passwordLength > 0 && props.showPassword) ? 88 : 88 + (yellowPos.value.faceY || 0);
  return { left: left + 'px', top: top + 'px' };
});

const frontForceLookX = computed(() => (props.passwordLength > 0 && props.showPassword) ? -5 : undefined);
const frontForceLookY = computed(() => (props.passwordLength > 0 && props.showPassword) ? -4 : undefined);

</script>

<style scoped>
.relative {
  position: relative;
}
.character-layer {
  position: absolute;
  bottom: 0;
  transition: all 0.7s ease-in-out;
  transform-origin: bottom center;
}
.eyes-container {
  position: absolute;
  display: flex;
  gap: 2rem;
  transition: all 0.7s ease-in-out;
}
.mouth-line {
  position: absolute;
  width: 5rem;
  height: 4px;
  background-color: #2D2D2D;
  border-radius: 9999px;
  transition: all 0.2s ease-out;
}
</style>
