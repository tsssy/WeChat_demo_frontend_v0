<template>
  <div class="page-container match-page">
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
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.match-page h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  align-self: center;
}
.match-list {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .match-list {
    max-width: 380px;
  }
}
.match-card {
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

.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.match-card .match-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
}

.match-card .match-desc {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #666;
}

.match-card .match-date {
  font-size: 0.8rem;
  color: #999;
}

.match-card button {
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

.match-card button:hover {
  background: #0056b3;
}
.match-rate {
  color: #ff6b81;
  font-weight: bold;
  font-size: 0.9rem;
}
.match-dot {
  width: 8px;
  height: 8px;
  background: #ff6b81;
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 16px;
}
</style> 