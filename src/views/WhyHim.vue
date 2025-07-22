<template>
  <div class="why-him-page">
    <!-- Why him 页面骨架 -->
    <h2>Why him?</h2>
    <p>He deeply values emotional honesty and is serious about building a meaningful relationship. Just like you, he has been hurt by his loved one in teenage years. You two share a desire for stability and mutual growth.</p>
    <button class="chat-now-btn" @click="goToChatroom">Chat Now</button>
    <div class="icebreaker">
      <b>Icebreaker tips:</b>
      <ul>
        <li>Do you like playing violin?</li>
        <li>What's your thought about James Bond?</li>
      </ul>
    </div>
    <a href="#" class="other-matches-link" @click.prevent="goToMatch">Check out other matches</a>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 点击Chat Now按钮跳转到聊天室页面
function goToChatroom() {
  router.push('/chatroom')
}
// 点击返回链接跳转到Match页面
function goToMatch() {
  router.push('/match')
}
</script>

<style scoped>
.why-him-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #222;
}
.chat-now-btn {
  background: #ff6b81;
  color: #fff;
  font-size: 1.5rem;
  border: none;
  border-radius: 24px;
  padding: 16px 40px;
  margin: 24px 0;
  cursor: pointer;
}
.icebreaker {
  margin-bottom: 16px;
}
.other-matches-link {
  color: #007bff;
  text-decoration: underline;
  margin-top: 16px;
}
</style> 