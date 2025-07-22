<template>
  <div class="mate-page">
    <!-- Mate 页面骨架 -->
    <h2>Liked matches are shown below</h2>
    <div class="mate-list">
      <div class="mate-card" @click="goToWhyHim">
        <span class="match-rate">Match Rate 98%</span>
        <span class="match-name">Ethan</span>
        <span class="match-time">5 min ago</span>
        <span class="new-badge">new</span>
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
.mate-page {
  min-height: 100vh;
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
}
.mate-list {
  width: 100%;
  max-width: 400px;
  margin-top: 24px;
}
.mate-card {
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
.new-badge {
  background: #ff6b81;
  color: #fff;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.8rem;
  position: absolute;
  top: 16px;
  right: 16px;
}
</style> 