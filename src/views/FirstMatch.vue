<template>
  <div class="first-match-container">
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
.first-match-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background: #fff;
}

.first-match-page {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #222;
  text-align: center;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
}

@media (min-width: 768px) {
  .first-match-container {
    width: 430px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 12px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
  }
}

.first-match-page h2 {
  font-size: 1.5rem;
  margin: 0 0 0.8rem 0;
  flex-shrink: 0;
}

.first-match-page ul {
  width: 100%;
  text-align: left;
  padding: 0 1rem;
  margin: 0.8rem 0;
  flex: 1;
  overflow-y: auto;
  max-height: 40vh;
}

@media (min-width: 768px) {
  .first-match-page ul {
    max-width: 320px;
    max-height: 30vh;
  }
  
  .first-match-page h2 {
    font-size: 1.8rem;
  }
}

.first-match-page li {
  margin-bottom: 0.4rem;
  line-height: 1.3;
  font-size: 0.9rem;
}

.first-match-page p {
  font-size: 0.9rem;
  margin: 0.8rem 0 0 0;
  flex-shrink: 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top: 3px solid #a0a0ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 1rem 0;
  flex-shrink: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 