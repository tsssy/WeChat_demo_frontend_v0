<template>
  <div class="chat-container">
    <!-- 聊天历史区域 -->
    <div class="chat-history" ref="chatHistoryRef">
      <!-- 加载状态 -->
      <div v-if="isLoadingHistory" class="loading-message">
        正在加载聊天记录...
      </div>
      
      <!-- 聊天消息列表 -->
      <div v-for="(message, index) in chatHistory" :key="index" class="message-wrapper">
        <!-- AI消息 -->
        <div v-if="!message.isUser" class="message ai-message">
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
        
        <!-- 用户消息 -->
        <div v-else class="message user-message">
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
      
      <!-- AI正在回复状态 -->
      <div v-if="isAiTyping" class="message ai-message typing">
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          AI正在思考中...
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <input
          v-model="currentMessage"
          type="text"
          placeholder="Message"
          class="message-input"
          @keyup.enter="sendMessage"
          :disabled="isAiTyping"
        />
        <button
          @click="sendMessage"
          class="send-button"
          :disabled="!currentMessage.trim() || isAiTyping"
        >
          发送
        </button>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-toast">
      {{ errorMessage }}
      <button @click="errorMessage = ''" class="close-error">×</button>
    </div>
    
    <!-- 总结弹窗 -->
    <div v-if="showSummary" class="summary-modal">
      <div class="summary-content">
        <h3>对话总结</h3>
        <div class="summary-text">{{ summaryText }}</div>
        <button @click="closeSummary" class="close-summary-btn">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { aiAPI, userAPI } from '@/services/api'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const chatHistory = ref([]) // 聊天历史记录
const currentMessage = ref('') // 当前输入的消息
const isLoadingHistory = ref(false) // 是否正在加载历史记录
const isAiTyping = ref(false) // AI是否正在回复
const errorMessage = ref('') // 错误消息
const showSummary = ref(false) // 是否显示总结弹窗
const summaryText = ref('') // 总结内容
const chatHistoryRef = ref(null) // 聊天历史容器引用

// 获取用户信息
const currentUser = userStore.getUser
if (!currentUser) {
  // 如果没有用户信息，跳转回首页
  router.push('/')
}

// 格式化时间显示
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

// 显示错误消息
const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// 将后端返回的元组数组转换为对象数组
const formatHistoryData = (historyData) => {
  return historyData.map(([content, timestamp, senderId, displayName]) => ({
    content,
    timestamp,
    senderId,
    displayName,
    isUser: displayName === 'I'
  }))
}

// 加载聊天历史记录
const loadChatHistory = async () => {
  if (!currentUser?.user_id) return
  
  try {
    isLoadingHistory.value = true
    console.log('🔄 加载聊天历史，用户ID:', currentUser.user_id)
    
    const response = await aiAPI.getChatHistory(currentUser.user_id)
    
    if (response.status === 'success') {
      // 格式化历史数据
      chatHistory.value = formatHistoryData(response.data || [])
      console.log('✅ 聊天历史加载成功，消息数量:', chatHistory.value.length)
      
      // 修正逻辑：无论新用户还是老用户，只要历史记录为空就自动调用AI交互接口
      if (chatHistory.value.length === 0) {
        console.log('📝 没有历史记录（新用户或老用户历史为空），发送初始消息')
        await sendInitialMessage()
      } else {
        console.log('📚 加载了历史记录，消息数量:', chatHistory.value.length)
        scrollToBottom()
      }
    } else {
      console.error('❌ 加载聊天历史失败:', response.error)
      showError('加载聊天记录失败: ' + response.error)
    }
  } catch (error) {
    console.error('❌ 加载聊天历史异常:', error)
    showError('加载聊天记录失败，请检查网络连接')
  } finally {
    isLoadingHistory.value = false
  }
}

// 发送初始消息（没有历史记录时）
const sendInitialMessage = async () => {
  const initialMessage = "你好，我想开始我们的对话"
  await sendAIMessage(initialMessage, false) // false表示不添加到界面（因为AI会自动处理）
}

// 保存完整总结到后端
const saveSummaryToBackend = async (fullSummaryContent) => {
  if (!currentUser?.user_id || !fullSummaryContent) return
  
  try {
    console.log('💾 开始保存完整总结到edit_summary，用户ID:', currentUser.user_id)
    console.log('💾 保存内容:', fullSummaryContent)
    
    const response = await userAPI.editSummary({
      user_id: currentUser.user_id,
      summary: fullSummaryContent
    })
    
    if (response.success) {
      console.log('✅ 完整总结保存到edit_summary成功')
    } else {
      console.error('❌ 完整总结保存失败:', response)
      showError('总结保存失败，但对话已完成')
    }
  } catch (error) {
    console.error('❌ 保存完整总结异常:', error)
    showError('总结保存失败，但对话已完成')
  }
}

// 发送AI消息
const sendAIMessage = async (message, addToHistory = true) => {
  if (!currentUser?.user_id) return
  
  try {
    isAiTyping.value = true
    
    // 如果需要添加到历史记录，先添加用户消息
    if (addToHistory) {
      const userMessage = {
        content: message,
        timestamp: new Date().toISOString(),
        senderId: currentUser.user_id,
        displayName: 'I',
        isUser: true
      }
      chatHistory.value.push(userMessage)
      scrollToBottom()
    }
    
    console.log('🤖 发送AI消息:', message)
    
    const response = await aiAPI.sendMessage(currentUser.user_id, message)
    
    console.log('🤖 AI API完整响应:', response)
    
    if (response.status === 'success') {
      // 添加AI回复消息
      const aiMessage = {
        content: response.response,
        timestamp: new Date().toISOString(),
        senderId: 999, // AI用户ID
        displayName: 'AI Assistant',
        isUser: false
      }
      chatHistory.value.push(aiMessage)
      
      console.log('✅ AI回复成功:', response.response)
      
      // 检查是否有总结
      if (response.summary && response.summary.trim()) {
        console.log('📋 收到对话总结:', response.summary)
        
        // 添加总结消息作为第二条AI消息
        const summaryMessage = {
          content: response.summary,
          timestamp: new Date().toISOString(),
          senderId: 999, // AI用户ID
          displayName: 'AI Assistant',
          isUser: false
        }
        chatHistory.value.push(summaryMessage)
        
        // 调用edit_summary接口，保存完整的总结内容（response + summary）
        const fullSummaryContent = response.response + '\n\n' + response.summary
        await saveSummaryToBackend(fullSummaryContent)
        
        // 显示总结弹窗（显示完整内容：关键问题摘要 + 提问问题包）
        const fullSummaryForModal = response.response + '\n\n' + response.summary
        summaryText.value = fullSummaryForModal
        showSummary.value = true
      }
      
      scrollToBottom()
    } else {
      console.error('❌ AI回复失败:', response.error)
      
      // 特殊处理Pydantic验证错误
      if (response.error && response.error.includes('validation error for ChatResponse')) {
        console.log('🔧 检测到后端Pydantic验证错误，尝试恢复对话')
        showError('AI服务正在调整中，请稍后重试')
        
        // 如果是初始消息失败，可以尝试重新发送
        if (!addToHistory && chatHistory.value.length === 0) {
          console.log('🔄 初始消息失败，3秒后重试')
          setTimeout(() => {
            sendInitialMessage()
          }, 3000)
        }
      } else {
        showError('AI服务暂时不可用: ' + response.error)
      }
    }
  } catch (error) {
    console.error('❌ 发送AI消息异常:', error)
    showError('发送消息失败，请检查网络连接')
    
    // 如果是初始消息失败，尝试重新发送
    if (!addToHistory && chatHistory.value.length === 0) {
      console.log('🔄 网络异常导致初始消息失败，5秒后重试')
      setTimeout(() => {
        sendInitialMessage()
      }, 5000)
    }
  } finally {
    isAiTyping.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  const message = currentMessage.value.trim()
  if (!message) return
  
  // 清空输入框
  currentMessage.value = ''
  
  // 发送消息
  await sendAIMessage(message, true)
}

// 关闭总结弹窗
const closeSummary = () => {
  showSummary.value = false
  summaryText.value = ''
}

// 监听聊天历史变化，自动滚动到底部
watch(chatHistory, () => {
  scrollToBottom()
}, { deep: true })

// 组件挂载时加载聊天历史
onMounted(() => {
  loadChatHistory()
})
</script>

<style scoped>
.chat-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #8BC34A 0%, #7CB342 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 100px;
  box-sizing: border-box;
}

.loading-message {
  text-align: center;
  color: white;
  font-size: 16px;
  margin: 20px 0;
}

.message-wrapper {
  margin-bottom: 15px;
}

.message {
  max-width: 80%;
  margin-bottom: 5px;
  width: fit-content;
  min-width: 60px;
}

/* 针对不同长度消息的优化 */
.message-content {
  min-width: 40px;
  width: auto;
}

/* 短消息优化 */
.message-content:has-text-length-short {
  min-width: 60px;
}

/* 长消息优化 */
@media (max-width: 768px) {
  .message {
    max-width: 85%;
  }
}

.ai-message {
  margin-right: auto;
}

.ai-message .message-content {
  background: white;
  color: black;
  padding: 12px 16px;
  border-radius: 18px 18px 18px 5px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
  display: inline-block;
  max-width: 100%;
}

.user-message {
  margin-left: auto;
  text-align: right;
}

.user-message .message-content {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 16px;
  border-radius: 18px 18px 5px 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
  display: inline-block;
  max-width: 100%;
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  text-align: left;
}

.user-message .message-time {
  text-align: right;
}

.typing {
  opacity: 0.8;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #666;
  border-radius: 50%;
  margin: 0 2px;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.input-container {
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 100%;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  background: white;
}

.message-input:focus {
  border-color: #8BC34A;
}

.message-input:disabled {
  background: #f5f5f5;
  color: #999;
}

.send-button {
  padding: 12px 20px;
  background: #8BC34A;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-button:hover:not(:disabled) {
  background: #7CB342;
  transform: translateY(-1px);
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.error-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #f44336;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.close-error {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.summary-content {
  background: white;
  border-radius: 15px;
  padding: 25px;
  max-width: 90%;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.summary-content h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
  text-align: center;
}

.summary-text {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-wrap;
  font-size: 14px;
}

.close-summary-btn {
  width: 100%;
  padding: 12px;
  background: #8BC34A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.close-summary-btn:hover {
  background: #7CB342;
}

/* 滚动条样式 */
.chat-history::-webkit-scrollbar {
  width: 4px;
}

.chat-history::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.chat-history::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style> 