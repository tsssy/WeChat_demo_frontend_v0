<template>
  <div class="chatroom-page">
    <!-- 聊天室页面骨架 -->
    <div class="chatroom-header">
      <button class="close-btn" @click="closeChat">×</button>
      <span class="chat-username">Ethan</span>
      <button class="like-btn" @click="toggleLike">{{ isLiked ? 'Unlike' : 'Like' }}</button>
      <!-- Like/Unlike 按钮，后续可切换 -->
    </div>
    <div class="chat-messages">
      <!-- 聊天消息区骨架 -->
      <div class="message self">This is a very long line that is so long that it changes line so frequently, so that you can see that it changes three lines.</div>
      <div class="message self">This is a very short line</div>
      <div class="message self">This is a long line that is maxima l</div>
    </div>
    <div class="chat-input-bar">
      <input type="text" placeholder="Type to send" />
      <button class="send-btn">➤</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import eventBus from '../utils/eventBus.js'

const router = useRouter()
const isLiked = ref(false) // 用于切换Like/Unlike按钮

// 监听聊天消息事件（可根据需要扩展）
function handleChatMessage(msg) {
  // 这里可以处理收到的聊天消息
  // console.log('收到聊天消息:', msg)
}

onMounted(() => {
  eventBus.on('chat:message', handleChatMessage)
})
onUnmounted(() => {
  eventBus.off('chat:message', handleChatMessage)
})

// Like/Unlike按钮点击逻辑
function toggleLike() {
  isLiked.value = !isLiked.value
}
// 关闭按钮点击逻辑，根据当前状态跳转到Mate或Match页面
function closeChat() {
  if (isLiked.value) {
    router.push('/mate')
  } else {
    router.push('/match')
  }
}
</script>

<style scoped>
.chatroom-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.chatroom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.close-btn, .like-btn {
  background: #eee;
  border: none;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 1rem;
  cursor: pointer;
}
.chat-username {
  font-weight: bold;
  font-size: 1.2rem;
}
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f8f8;
}
.message {
  background: #ff6b81;
  color: #fff;
  border-radius: 16px;
  padding: 10px 16px;
  margin-bottom: 10px;
  max-width: 70%;
  align-self: flex-end;
}
.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background: #fff;
}
.chat-input-bar input {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 16px;
  padding: 8px 12px;
  margin-right: 8px;
}
.send-btn {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  cursor: pointer;
}
</style> 