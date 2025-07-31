<template>
  <div class="name-card">
    <div class="name-card-text">{{ userName }}</div>
    
    <!-- Arrow Shoot Overlay -->
    <div v-if="showOverlay && showGif && gifSrc" class="arrow-overlay">
      <img 
        ref="arrowGif"
        :src="gifSrc"
        alt="Arrow Shoot Animation"
        class="arrow-gif"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  userName: {
    type: String,
    default: 'Someone Special'
  },
  showOverlay: {
    type: Boolean,
    default: false
  }
})

const showGif = ref(false)
const arrowGif = ref(null)
const gifSrc = ref('')

// Watch for showOverlay changes to trigger gif animation
watch(() => props.showOverlay, async (newValue) => {
  if (newValue) {
    showGif.value = true
    await nextTick()
    
    // Force gif to reload and play from beginning
    const timestamp = new Date().getTime()
    gifSrc.value = `/media/WhyHim/ArrowShoot.gif?t=${timestamp}`
    
    // Hide gif after animation completes (adjust timing as needed)
    setTimeout(() => {
      showGif.value = false
      gifSrc.value = ''
    }, 5000) // Increased to 5 seconds - adjust as needed
  } else {
    showGif.value = false
    gifSrc.value = ''
  }
}, { immediate: true })
</script>

<style scoped>
.name-card {
  width: 80%;
  height: 200px;
  background-image: url('/media/WhyHim/MatchCardBackground.png');
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  position: relative;
}

.name-card-text {
  color: #FFF;
  text-align: center;
  font-family: "Anonymous Pro", monospace;
  font-size: 20px;
  font-style: normal;
  line-height: normal;
  margin: 0;
}

.arrow-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  border-radius: 12px;
  overflow: hidden;
}

.arrow-gif {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}
</style>