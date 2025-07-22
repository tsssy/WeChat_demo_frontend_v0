<template>
  <div class="match-page">
    <!-- Match 页面骨架 -->
    <h2>Matches for you</h2>
    <div class="match-list">
      <div class="match-card" @click="goToWhyHim">
        <span class="match-rate">Match Rate 98%</span>
        <span class="match-name">Daniel</span>
        <span class="match-date">Jul-16-2025</span>
        <span class="match-desc">He leads with quiet confidence and steady kindness...</span>
        <span class="match-dot"></span>
        <button @click.stop="goToChatroom">Chat</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
// 点击对象卡片跳转WhyHim页面
function goToWhyHim() {
  router.push('/why-him')
}
// 点击聊天入口跳转Chatroom页面
function goToChatroom() {
  router.push('/chatroom')
}
</script>

<style scoped>
.match-page {
  min-height: 100vh;
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
}
.match-list {
  width: 100%;
  max-width: 400px;
  margin-top: 24px;
}
.match-card {
  background: #f8f8f8;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
.match-rate {
  color: #ff6b81;
  font-weight: bold;
}
.match-dot {
  width: 10px;
  height: 10px;
  background: #ff6b81;
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 16px;
}
</style> 