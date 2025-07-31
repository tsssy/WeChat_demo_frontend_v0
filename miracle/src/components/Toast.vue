<template>
  <Transition name="toast">
    <div v-if="isVisible" :class="['toast', `toast-${type}`]">
      <div class="toast-content">
        <span class="toast-message">{{ message }}</span>
        <button class="toast-close" @click="hide">×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
const message = ref('')
const type = ref('info')
let timeoutId = null

const show = (msg, toastType = 'info', duration = 3000) => {
  message.value = msg
  type.value = toastType
  isVisible.value = true
  
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  timeoutId = setTimeout(() => {
    hide()
  }, duration)
}

const hide = () => {
  isVisible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

// Expose methods for external use
defineExpose({
  show,
  hide
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 280px;
  max-width: 90vw;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: Arial, sans-serif;
  font-size: 14px;
}


.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toast-message {
  flex: 1;
  margin-right: 8px;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.toast-close:hover {
  opacity: 1;
}

.toast-success {
  background-color: #4caf50;
  color: white;
}

.toast-error {
  background-color: #f44336;
  color: white;
}

.toast-info {
  background-color: #2196f3;
  color: white;
}

.toast-warning {
  background-color: #ff9800;
  color: white;
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style> 