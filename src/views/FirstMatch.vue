<template>
  <div class="first-match-page">
    <!-- 首次匹配页面骨架 -->
    <h2>Finding your first match</h2>
    <div class="loading-spinner"></div>
    <ul>
      <li>Analyzing your personality</li>
      <li>Confirmed that you are an adventurous person</li>
      <li>Considering about your past history of being hurt by boys in teenage years. Finding someone who values relationship and has been in your shoes before.</li>
    </ul>
    <p>Finding candidates ....</p>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import eventBus from '../utils/eventBus.js'

const router = useRouter()

// 监听匹配成功事件，自动跳转到WhyHim页面
function handleMatchSuccess(msg) {
  // 这里可以根据msg内容判断是否匹配成功
  // 假设msg.type === 'match_success'表示成功
  if (msg && msg.type === 'match_success') {
    router.push('/why-him')
  }
}

onMounted(() => {
  eventBus.on('match:message', handleMatchSuccess)
})
onUnmounted(() => {
  eventBus.off('match:message', handleMatchSuccess)
})
</script>

<style scoped>
.first-match-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #222;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top: 4px solid #a0a0ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 24px 0;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 