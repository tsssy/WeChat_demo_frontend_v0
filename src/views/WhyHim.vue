<template>
  <div class="page-container no-bottom-nav why-him-page">
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
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #222;
  text-align: center;
}

.why-him-page h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.why-him-page p {
  width: 100%;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  text-align: center;
}

@media (min-width: 768px) {
  .why-him-page p {
    max-width: 300px;
  }
}
.chat-now-btn {
  background: #ff6b81;
  color: #fff;
  font-size: 1.2rem;
  border: none;
  border-radius: 24px;
  padding: 14px 32px;
  margin: 1.5rem 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-now-btn:hover {
  background: #ff5a73;
}

@media (min-width: 768px) {
  .chat-now-btn {
    font-size: 1.3rem;
    padding: 16px 40px;
  }
}
.icebreaker {
  margin: 1rem 0;
  width: 100%;
}

@media (min-width: 768px) {
  .icebreaker {
    max-width: 300px;
  }
}

.icebreaker ul {
  text-align: left;
  padding-left: 1rem;
  margin-top: 0.5rem;
}

.icebreaker li {
  margin-bottom: 0.3rem;
  line-height: 1.3;
}
.other-matches-link {
  color: #007bff;
  text-decoration: underline;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style> 