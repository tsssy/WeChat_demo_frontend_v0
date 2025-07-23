<template>
  <div class="page-container no-bottom-nav chatroom-page">
    <!-- 聊天室页面骨架 -->
    <div class="chatroom-header">
      <button class="close-btn" @click="closeChat">×</button>
      <span class="chat-username">{{ chatUsername }}</span>
      <button class="like-btn" @click="toggleLike">{{ isLiked ? 'Unlike' : 'Like' }}</button>
      <!-- Like/Unlike 按钮，后续可切换 -->
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading chat history...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <h3>Error loading chat</h3>
      <p>{{ error }}</p>
      <button @click="loadChatHistory" class="retry-btn">Retry</button>
    </div>
    
    <!-- Chat messages -->
    <div v-else class="chat-messages">
      <!-- Show placeholder if no messages -->
      <div v-if="messages.length === 0" class="no-messages">
        <p>No messages yet. Start the conversation!</p>
      </div>
      <!-- Display loaded messages -->
      <div v-for="message in messages" :key="message.datetime" 
           :class="['message', message.sender_name === userStore.userName ? 'self' : 'other']">
        <div class="message-content">{{ message.message }}</div>
        <div class="message-time">{{ formatTime(message.datetime) }}</div>
      </div>
    </div>
    
    <div class="chat-input-bar">
      <input type="text" placeholder="Type to send" />
      <button class="send-btn">➤</button>
    </div>
    
    <!-- Toast component -->
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { APIServices } from '../services/APIServices.js'
import { debugLog } from '../utils/debug.js'
import eventBus from '../utils/eventBus.js'
import Toast from '../components/Toast.vue'

const router = useRouter()
const userStore = useUserStore()

// Component state
const isLiked = ref(false)
const messages = ref([])
const isLoading = ref(true)
const error = ref(null)
const toast = ref(null)
const chatUsername = ref('Someone Special')

// Load chat history on component mount
const loadChatHistory = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const currentUserId = userStore.userId
    const currentChatroomId = userStore.chatroomId
    
    // Try to get chatroom_id from session if not in store
    if (!currentChatroomId) {
      const sessionMatch = sessionStorage.getItem('current_match')
      if (sessionMatch) {
        const matchData = JSON.parse(sessionMatch)
        if (matchData.chatroom_id) {
          debugLog.log('Using chatroom_id from session:', matchData.chatroom_id)
        } else {
          throw new Error('No chatroom_id available. Please start from the Why Him page.')
        }
      } else {
        throw new Error('No chatroom information available. Please start from the Why Him page.')
      }
    }
    
    if (!currentUserId) {
      throw new Error('User not logged in. Please restart the application.')
    }
    
    debugLog.log('Loading chat history for:', {
      user_id: currentUserId,
      chatroom_id: currentChatroomId || JSON.parse(sessionStorage.getItem('current_match') || '{}').chatroom_id
    })
    
    // Call get_chat_history API
    const historyResponse = await APIServices.getChatHistory({
      user_id: currentUserId,
      chatroom_id: currentChatroomId || JSON.parse(sessionStorage.getItem('current_match') || '{}').chatroom_id
    })
    
    if (historyResponse.success) {
      messages.value = historyResponse.messages || []
      debugLog.log('Chat history loaded:', messages.value.length, 'messages')
    } else {
      throw new Error('Failed to load chat history')
    }
    
    // Set chat username from target user
    const targetUserName = userStore.targetUserName
    if (targetUserName) {
      chatUsername.value = targetUserName
    }
    
  } catch (err) {
    debugLog.error('Failed to load chat history:', err)
    error.value = err.message
    toast.value?.show(err.message, 'error')
  } finally {
    isLoading.value = false
  }
}

// Format timestamp for display
const formatTime = (datetime) => {
  if (!datetime) return ''
  try {
    const date = new Date(datetime)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    return ''
  }
}

// 监听聊天消息事件（可根据需要扩展）
function handleChatMessage(msg) {
  // 这里可以处理收到的聊天消息
  // console.log('收到聊天消息:', msg)
}

onMounted(() => {
  eventBus.on('chat:message', handleChatMessage)
  loadChatHistory()
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
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100vh;
}
.chatroom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.close-btn, .like-btn {
  background: #eee;
  border: none;
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-btn:hover, .like-btn:hover {
  background: #ddd;
}
.chat-username {
  font-weight: bold;
  font-size: 1.2rem;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex: 1;
  padding: 2rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top: 3px solid #ff6b81;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state h3 {
  color: #dc3545;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #666;
  margin-bottom: 1rem;
  text-align: center;
}

.retry-btn {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background: #0056b3;
}

.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  color: #666;
  text-align: center;
}
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.message {
  background: #ff6b81;
  color: #fff;
  border-radius: 16px;
  padding: 12px 16px;
  max-width: 280px;
  align-self: flex-end;
  word-wrap: break-word;
  line-height: 1.4;
  margin-bottom: 8px;
}

.message.other {
  background: #e9ecef;
  color: #333;
  align-self: flex-start;
}

.message-content {
  margin-bottom: 4px;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: right;
}

.message.other .message-time {
  text-align: left;
}

@media (min-width: 768px) {
  .message {
    max-width: 300px;
  }
}
.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background: #fff;
  position: sticky;
  bottom: 0;
}
.chat-input-bar input {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 10px 16px;
  margin-right: 8px;
  font-size: 1rem;
  outline: none;
}

.chat-input-bar input:focus {
  border-color: #007bff;
}
.send-btn {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.send-btn:hover {
  background: #0056b3;
}
</style> 