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
      <!-- Display messages using MessageBox component -->
      <MessageBox 
        v-for="message in messages" 
        :key="message.id"
        :message="message.content"
        :message-type="message.type"
      />
    </div>
    
    <div class="chat-input-bar">
      <input 
        type="text" 
        v-model="messageInput"
        placeholder="Type to send" 
        @keypress="handleKeyPress"
        :disabled="isSending"
      />
      <button 
        class="send-btn" 
        @click="sendMessage"
        :disabled="isSending || !messageInput.trim()"
      >
        {{ isSending ? '...' : '➤' }}
      </button>
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
import MessageBox from '../components/MessageBox.vue'
import WebSocketClient from '../wsclients/WebSocketClient.js'

const router = useRouter()
const userStore = useUserStore()

// Component state
const isLiked = ref(false)
const messages = ref([]) // Will store both historical and new messages
const isLoading = ref(true)
const error = ref(null)
const toast = ref(null)
const chatUsername = ref('Someone Special')
const messageInput = ref('')
const isSending = ref(false)

// WebSocket client
const messageClient = ref(null)

// Load chat history using get_chat_history API call
const loadChatHistory = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const currentUserId = userStore.userId
    let currentChatroomId = userStore.chatroomId
    
    // Try to get chatroom_id from session if not in store
    if (!currentChatroomId) {
      const sessionMatch = sessionStorage.getItem('current_match')
      if (sessionMatch) {
        const matchData = JSON.parse(sessionMatch)
        currentChatroomId = matchData.chatroom_id
        if (currentChatroomId) {
          debugLog.log('Using chatroom_id from session:', currentChatroomId)
        } else {
          throw new Error('No chatroom_id available. Please start from the Why Him page.')
        }
      } else {
        throw new Error('No chatroom information available. Please start from the Why Him page.')
      }
    }
    
    if (!currentUserId || !currentChatroomId) {
      throw new Error('Missing user_id or chatroom_id. Please restart from Why Him page.')
    }
    
    debugLog.log('Loading chat history with:', {
      user_id: currentUserId,
      chatroom_id: currentChatroomId
    })
    
    // Call get_chat_history API through APIServices
    const historyResponse = await APIServices.getChatHistory({
      user_id: currentUserId,
      chatroom_id: currentChatroomId  
    })
    
    debugLog.log('APIServices response:', historyResponse)
    
    if (historyResponse.success) {
      // Convert APIServices response to display format
      // historyResponse.messages contains ChatMessage objects with structure:
      // { sender_name, message, datetime }
      messages.value = (historyResponse.messages || []).map((msg, index) => ({
        id: `${msg.datetime}-${msg.sender_name}-${index}`, // Unique ID
        content: msg.message, // Message content
        sender_name: msg.sender_name, // Sender name  
        datetime: msg.datetime, // Timestamp
        type: msg.sender_name === 'I' ? 'self' : 'other' // Determine alignment based on sender_name
      }))
      
      debugLog.log('Chat history processed:', messages.value.length, 'messages')
      if (messages.value.length > 0) {
        debugLog.log('Sample message:', messages.value[0])
      }
    } else {
      throw new Error('API returned success: false')
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

// Send message function
const sendMessage = async () => {
  debugLog.log('Send message clicked, input value:', messageInput.value)
  
  // Prevent sending empty messages
  if (!messageInput.value.trim()) {
    debugLog.warn('Message is empty, showing warning')
    toast.value?.show('Please enter a message', 'warning')
    return
  }
  
  if (isSending.value) {
    debugLog.warn('Already sending a message, preventing duplicate')
    return // Prevent double sending
  }
  
  try {
    isSending.value = true
    debugLog.log('Starting message send process...')
    
    // Get required data from session storage
    const currentUserId = userStore.userId
    const currentTargetUserId = userStore.targetUserId
    let currentChatroomId = userStore.chatroomId
    
    debugLog.log('Initial data from store:', {
      currentUserId,
      currentTargetUserId,
      currentChatroomId
    })
    
    // Try to get chatroom_id from session if not in store
    if (!currentChatroomId) {
      const sessionMatch = sessionStorage.getItem('current_match')
      debugLog.log('Trying to get chatroom_id from session:', sessionMatch)
      if (sessionMatch) {
        const matchData = JSON.parse(sessionMatch)
        currentChatroomId = matchData.chatroom_id
        debugLog.log('Found chatroom_id in session:', currentChatroomId)
      }
    }
    
    // Validate required data
    if (!currentUserId || !currentTargetUserId || !currentChatroomId) {
      const missing = []
      if (!currentUserId) missing.push('currentUserId')
      if (!currentTargetUserId) missing.push('currentTargetUserId')
      if (!currentChatroomId) missing.push('currentChatroomId')
      debugLog.error('Missing required data:', missing)
      throw new Error(`Missing required information: ${missing.join(', ')}`)
    }
    
    // Get WebSocket client instance
    if (!messageClient.value) {
      debugLog.log('Getting WebSocket client instance...')
      messageClient.value = WebSocketClient.getInstance()
    }
    
    debugLog.log('WebSocket client:', messageClient.value)
    debugLog.log('WebSocket client ready:', messageClient.value?.isReady())
    
    if (!messageClient.value) {
      debugLog.error('WebSocket client is null')
      throw new Error('WebSocket connection not available. Please refresh the page.')
    }
    
    if (!messageClient.value.isReady()) {
      debugLog.error('WebSocket client not ready')
      throw new Error('WebSocket connection not ready. Please wait a moment and try again.')
    }
    
    // Prepare message data (keep target_user_id as number, WebSocketClient will convert)
    const messageData = {
      target_user_id: currentTargetUserId, // Keep as number, WebSocketClient handles conversion
      chatroom_id: currentChatroomId, // Keep as number
      content: messageInput.value.trim() // Keep as string
    }
    
    debugLog.log('Sending message via WebSocket:', messageData)
    
    // Send message via WebSocket
    const success = messageClient.value.send(
      messageData.content,
      messageData.target_user_id,
      messageData.chatroom_id
    )
    
    debugLog.log('WebSocket send result:', success)
    
    if (success) {
      // Add the sent message to UI immediately
      addNewMessage(messageData.content, userStore.userName || 'You', true)
      
      // Clear input on successful send
      messageInput.value = ''
      debugLog.log('Message sent successfully, input cleared')
    } else {
      throw new Error('Failed to send message via WebSocket')
    }
    
  } catch (error) {
    debugLog.error('Error sending message:', error)
    toast.value?.show(`Failed to send message: ${error.message}`, 'error')
  } finally {
    isSending.value = false
    debugLog.log('Message sending process completed')
  }
}

// Handle Enter key in input
const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Add new message to the messages array
const addNewMessage = (content, senderName, isFromSelf = false) => {
  const newMessage = {
    id: `${Date.now()}-${senderName}`, // Unique ID using timestamp
    content: content,
    sender_name: senderName,
    datetime: new Date().toISOString(),
    type: isFromSelf ? 'self' : 'other'
  }
  
  messages.value.push(newMessage)
  debugLog.log('New message added to chat:', newMessage)
}

// 监听聊天消息事件（处理接收到的消息）
function handleChatMessage(data) {
  debugLog.log('Received chat message via eventBus:', data)
  
  // Handle private messages
  if (data.type === 'private' || data.content) {
    const senderName = data.sender_name || 'Unknown'
    const content = data.content || data.message || ''
    
    // Determine if this message is from the current user
    const isFromSelf = data.sender_id === userStore.userId || senderName === userStore.userName
    
    debugLog.log('Adding received message:', {
      content,
      senderName,
      isFromSelf,
      currentUserName: userStore.userName,
      currentUserId: userStore.userId,
      senderUserId: data.sender_id
    })
    
    addNewMessage(content, senderName, isFromSelf)
  }
}

onMounted(() => {
  eventBus.on('chat:message', handleChatMessage)
  eventBus.on('chat:private_message', handleChatMessage) // Listen for private messages specifically
  loadChatHistory()
  
  // Initialize WebSocket client
  debugLog.log('Initializing WebSocket client in Chatroom...')
  messageClient.value = WebSocketClient.getInstance()
  
  if (!messageClient.value) {
    debugLog.error('WebSocket client not available. Please ensure it was initialized in Loading page.')
    toast.value?.show('Chat connection not available. Please refresh the page.', 'error')
  } else {
    debugLog.log('WebSocket client found:', {
      isReady: messageClient.value.isReady(),
      connectionState: messageClient.value.getConnectionState()
    })
  }
})
onUnmounted(() => {
  eventBus.off('chat:message', handleChatMessage)
  eventBus.off('chat:private_message', handleChatMessage)
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

.chat-input-bar input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
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

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 