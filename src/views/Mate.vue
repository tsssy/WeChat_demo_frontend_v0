<template>
  <div class="page-container mate-page">
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
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.mate-page h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  align-self: center;
}
.mate-list {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .mate-list {
    max-width: 380px;
  }
}
.mate-card {
  background: #f8f8f8;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.mate-card .match-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
}

.mate-card .match-time {
  font-size: 0.8rem;
  color: #999;
}

.mate-card button {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 4px;
  transition: background-color 0.3s;
}

.mate-card button:hover {
  background: #0056b3;
}
.match-rate {
  color: #ff6b81;
  font-weight: bold;
  font-size: 0.9rem;
}
.new-badge {
  background: #ff6b81;
  color: #fff;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: bold;
  position: absolute;
  top: 16px;
  right: 16px;
  text-transform: uppercase;
}
</style> 