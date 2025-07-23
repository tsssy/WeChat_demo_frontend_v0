<template>
  <div class="page-container no-bottom-nav chatroom-page">
    <!-- 聊天室页面骨架 -->
    <div class="chatroom-header">
      <button class="close-btn" @click="closeChat">×</button>
      <span class="chat-username">{{ chatUsername }}</span>
      <button class="like-btn" @click="toggleLike">{{ isLiked ? 'Unlike' : 'Like' }}</button>
      <!-- Like/Unlike 按钮，后续可切换 -->
    </div>
    <!-- WebSocket 连接中状态 -->
    <div v-if="wsConnecting" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在连接聊天服务器...</p>
    </div>
    <!-- Loading state -->
    <div v-else-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading chat history...</p>
    </div>
    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <h3>Error loading chat</h3>
      <p>{{ error }}</p>
      <button @click="ensureWebSocketAndLoadHistory" class="retry-btn">Retry</button>
    </div>
    <!-- Chat messages -->
    <div v-else class="chat-messages" ref="chatMessagesContainer">
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
        :sender-name="message.sender_name"
      />
      <!-- 滚动锚点，保证每次新消息后都能滚动到底部 -->
      <div ref="bottomAnchor"></div>
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
const wsConnecting = ref(false) // WebSocket 连接中状态

// WebSocket client
const messageClient = ref(null)

// 聊天消息容器ref
const chatMessagesContainer = ref(null)
// 滚动锚点ref
const bottomAnchor = ref(null)

// 监听messages变化，自动滚动到底部锚点
watch(messages, async () => {
  await nextTick() // 等待DOM更新
  // 中文注释：每次消息变化后滚动到底部锚点
  if (bottomAnchor.value) {
    bottomAnchor.value.scrollIntoView({ behavior: 'auto' })
  }
})

// Load chat history using get_chat_history API call
const loadChatHistory = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const currentUserId = userStore.user_id
    let currentChatroomId = userStore.chatroom_id
    
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
    const targetUserName = userStore.target_user_name
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
    const currentUserId = userStore.user_id
    const currentTargetUserId = userStore.target_user_id
    let currentChatroomId = userStore.chatroom_id
    
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
      addNewMessage(messageData.content, userStore.user_name || 'You', true)
      // 新增：发送后自动滚动到底部锚点
      nextTick(() => {
        if (bottomAnchor.value) {
          console.log('sendMessage: 滚动到底部锚点', bottomAnchor.value)
          bottomAnchor.value.scrollIntoView({ behavior: 'auto' })
        } else {
          console.log('sendMessage: bottomAnchor is null')
        }
      })
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
  // 中文调试日志：收到消息
  console.log('handleChatMessage 收到消息:', data)
  debugLog.log('handleChatMessage 收到消息:', data)
  // 只显示private/private_message类型，其它类型只console显示
  if (!data || (data.type !== 'private' && data.type !== 'private_message')) {
    debugLog.log('内部消息类型，仅console显示:', data)
    return
  }
  // 只显示当前聊天chatroom_id的消息
  const currentChatroomId = userStore.chatroom_id || (sessionStorage.getItem('current_match') ? JSON.parse(sessionStorage.getItem('current_match')).chatroom_id : null)
  if (!currentChatroomId || data.chatroom_id != currentChatroomId) {
    debugLog.log('忽略非当前chatroom_id的消息:', data)
    return
  }
  const senderName = data.sender_name || 'Unknown'
  const content = data.content || data.message || ''
  const isFromSelf = false
  // 中文调试日志：准备添加新消息
  console.log('handleChatMessage: 准备添加新消息', { content, senderName, isFromSelf })
  addNewMessage(content, senderName, isFromSelf)
  // 中文调试日志：messages 当前内容
  console.log('handleChatMessage: messages 当前内容', messages.value)
  // 新增：每次添加新消息后，自动滚动到底部锚点
  nextTick(() => {
    if (bottomAnchor.value) {
      console.log('handleChatMessage: 滚动到底部锚点', bottomAnchor.value)
      bottomAnchor.value.scrollIntoView({ behavior: 'auto' })
    } else {
      console.log('handleChatMessage: bottomAnchor is null')
    }
  })
}

// 获取当前用户ID，优先从store，其次从session，只用user_id字段
function getCurrentUserId() {
  let user_id = userStore.user_id
  if (!user_id) {
    const sessionMatch = sessionStorage.getItem('current_match')
    if (sessionMatch) {
      try {
        const matchData = JSON.parse(sessionMatch)
        // 只用user_id/self_user_id/id字段
        user_id = matchData.user_id || matchData.self_user_id || matchData.id
      } catch (e) {
        console.error('解析sessionStorage.current_match失败', e)
      }
    }
  }
  // 打印user_id类型和值
  console.log('[WS DEBUG] getCurrentUserId:', user_id, typeof user_id)
  // 转为字符串并去除空格
  if (user_id !== undefined && user_id !== null) {
    user_id = String(user_id).trim()
  }
  // 检查user_id有效性
  if (!user_id || user_id === 'None' || user_id === 'null' || user_id === 'undefined') return null
  return user_id
}

import { getMessageWebSocketUrl } from '@/utils/config.js'

// 带重试的WebSocket连接函数，始终传递user_id
async function connectWebSocketWithRetry(maxRetries = 10, delayMs = 500) {
  let attempt = 0
  const wsUrl = getMessageWebSocketUrl()
  const user_id = getCurrentUserId()
  if (!user_id) {
    debugLog.error('无法获取有效user_id，WebSocket连接中止')
    error.value = '用户未登录或信息丢失，请重新登录'
    return false
  }
  console.log('[WS DEBUG] connectWebSocketWithRetry 使用user_id:', user_id)
  while (attempt < maxRetries) {
    // 每次都用user_id和url创建实例
    messageClient.value = WebSocketClient.getInstance(wsUrl, user_id)
    if (!messageClient.value) {
      debugLog.error('WebSocket client 不可用')
      await new Promise(res => setTimeout(res, delayMs))
      attempt++
      continue
    }
    // 尝试连接
    messageClient.value.connect && messageClient.value.connect()
    // 等待0.5秒让连接建立
    await new Promise(res => setTimeout(res, delayMs))
    if (messageClient.value.isReady()) {
      debugLog.log('WebSocket 连接成功，重试次数:', attempt)
      return true
    }
    debugLog.log('WebSocket 未就绪，重试中...', attempt + 1)
    attempt++
  }
  debugLog.error('WebSocket 连接重试超出最大次数')
  return false
}

// 检查 WebSocket 连接并在 ready 后加载聊天历史（带重试）
const ensureWebSocketAndLoadHistory = async () => {
  wsConnecting.value = true
  error.value = null
  // 自动重试连接WebSocket
  const connected = await connectWebSocketWithRetry(10, 500)
  if (!connected) {
    error.value = '聊天服务器连接失败（已重试10次），请检查网络或稍后重试。'
    wsConnecting.value = false
    return
  }
  debugLog.log('WebSocket 已就绪，开始加载聊天历史')
  wsConnecting.value = false
  loadChatHistory()
}

// 统一注销所有 eventBus 监听器
function unregisterEventBusListeners() {
  console.log('Chatroom.vue: 注销 eventBus 监听器')
  eventBus.off('chat:message', handleChatMessage)
  eventBus.off('chat:private_message', handleChatMessage)
}

// 统一注册所有 eventBus 监听器
function registerEventBusListeners() {
  console.log('Chatroom.vue: 注册 eventBus 监听器')
  eventBus.on('chat:message', handleChatMessage)
  eventBus.on('chat:private_message', handleChatMessage)
}

onMounted(async () => {
  // 1. 先注销所有监听器，防止重复注册
  unregisterEventBusListeners()
  // 2. 重置 WebSocketClient 实例，确保是新连接
  if (WebSocketClient.resetInstance) {
    WebSocketClient.resetInstance()
    console.log('Chatroom.vue: 已重置 WebSocketClient 实例')
  }
  // 3. 注册监听器
  registerEventBusListeners()
  // 4. 确保 chatroom_id 已同步
  let currentChatroomId = userStore.chatroom_id
  if (!currentChatroomId) {
    const sessionMatch = sessionStorage.getItem('current_match')
    if (sessionMatch) {
      const matchData = JSON.parse(sessionMatch)
      currentChatroomId = matchData.chatroom_id
      if (currentChatroomId) {
        userStore.chatroom_id = currentChatroomId
        console.log('Chatroom.vue: chatroom_id 已从 sessionStorage 同步到 userStore', currentChatroomId)
      }
    }
  }
  // 5. 连接 WebSocket 并加载历史
  await ensureWebSocketAndLoadHistory()
})

onUnmounted(() => {
  // 注销监听器，重置 WebSocket
  unregisterEventBusListeners()
  if (WebSocketClient.resetInstance) {
    WebSocketClient.resetInstance()
    console.log('Chatroom.vue: 已重置 WebSocketClient 实例 (unmounted)')
  }
})

// Like/Unlike按钮点击逻辑，调用toggle_like接口
async function toggleLike() {
  try {
    // 获取当前match_id
    const match_id = userStore.current_match_id || (sessionStorage.getItem('current_match') ? JSON.parse(sessionStorage.getItem('current_match')).match_id : null)
    if (!match_id) {
      toast.value?.show('无法获取匹配ID，无法点赞', 'error')
      return
    }
    // 调用toggleLike接口
    const res = await APIServices.toggleLike({ match_id })
    if (res && res.success) {
      isLiked.value = !isLiked.value
      toast.value?.show(isLiked.value ? '已点赞' : '已取消点赞', 'success')
    } else {
      toast.value?.show('操作失败，请稍后重试', 'error')
    }
  } catch (e) {
    toast.value?.show('网络错误，操作失败', 'error')
    debugLog.error('toggleLike error:', e)
  }
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