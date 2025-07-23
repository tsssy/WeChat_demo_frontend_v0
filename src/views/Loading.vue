<template>
  <div class="loading-container">
    <div class="loading-page">
      <!-- 加载页面骨架 -->
      <h2>Finding your new match</h2>
      <div class="loading-spinner"></div>
      <ul class="thinking-process">
        <li 
          v-for="(message, index) in loadingMessages" 
          :key="index"
          :class="{ 'active': currentActiveIndex >= index, 'completed': currentActiveIndex > index }"
        >
          {{ message }}
          <span v-if="currentActiveIndex === index" class="typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </li>
        <!-- 重试消息 -->
        <li 
          v-if="isRetrying" 
          class="retry-message active"
        >
          {{ getRetryMessage() }}
          <span class="typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </li>
        <li 
          v-if="showFinalMessage" 
          class="final-message active"
        >
          We found you a match, redirecting now.
          <span class="typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </li>
      </ul>
      <p v-if="!showFinalMessage">Finding candidates ....</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import eventBus from '../utils/eventBus.js'
import { debugLog, devHelpers } from '../utils/debug.js'
import ManualMatchClient from '../wsclients/ManualMatchClient.js'
import WebSocketClient from '../wsclients/WebSocketClient.js'

const router = useRouter()
const userStore = useUserStore()

// WebSocket客户端实例
const matchClient = ref(null)
const messageClient = ref(null)

// Connection state tracking
const messageClientReady = ref(false)

// 动画状态
const currentActiveIndex = ref(-1)
const showFinalMessage = ref(false)
const matchReceived = ref(false)
const pageStartTime = ref(null)

// 重试逻辑状态
const retryCount = ref(0)
const maxRetries = ref(10) // 增加重试次数到10次
const retryDelay = ref(3000) // 3秒重试间隔
const isRetrying = ref(false)

// 加载状态信息
const loadingMessages = ref([
  'Analyzing your personality.',
  'Searching through user database.', 
  "Analyzing candidates' personality, modelling potential romantic relationships.",
  "Calculating match scores and matching.",
  "Comparing, pivotting your best match."
])

// 添加重试相关的消息
const getRetryMessage = () => {
  if (isRetrying.value) {
    return `Retrying match search... (${retryCount.value}/${maxRetries.value}) - Reconnecting to server`
  }
  return null
}

// WebSocket配置
const getWebSocketUrl = () => {
  // 始终使用生产环境URL
  return 'wss://lovetapoversea.xyz:4433/ws/match'
}

const getMessageWebSocketUrl = () => {
  // 始终使用生产环境URL for message WebSocket
  return 'wss://lovetapoversea.xyz:4433/ws/message'
}

// 开始思考过程动画
const startThinkingAnimation = () => {
  const animateNextStep = (index) => {
    if (index < loadingMessages.value.length) {
      currentActiveIndex.value = index
      debugLog.log(`开始思考步骤 ${index + 1}: ${loadingMessages.value[index]}`)
      
      // 每个步骤显示6-10秒随机时间
      const stepDuration = 6000 + Math.random() * 4000
      
      setTimeout(() => {
        animateNextStep(index + 1)
      }, stepDuration)
    } else {
      debugLog.log('思考过程完成，等待30秒计时器')
      // 所有思考步骤完成后，标记为已完成
      currentActiveIndex.value = loadingMessages.value.length
    }
  }
  
  // 延迟1秒开始第一步
  setTimeout(() => {
    animateNextStep(0)
  }, 1000)
}

// 重试匹配请求（先断开再重连）
const retryMatch = () => {
  if (retryCount.value >= maxRetries.value) {
    debugLog.error('已达到最大重试次数，停止重试')
    // 可以在这里显示错误信息给用户
    return
  }
  
  retryCount.value++
  isRetrying.value = true
  
  debugLog.log(`开始第 ${retryCount.value} 次重试匹配请求...`)
  
  // 先断开现有连接
  if (matchClient.value) {
    debugLog.websocket('断开现有匹配WebSocket连接以进行重试')
    matchClient.value.disconnect()
    matchClient.value = null
  }
  
  setTimeout(() => {
    // 重新初始化匹配WebSocket连接
    debugLog.websocket(`第 ${retryCount.value} 次重试：重新初始化匹配WebSocket连接`)
    initializeMatchWebSocket()
    
    // 等待连接建立后发送匹配请求
    setTimeout(() => {
      if (matchClient.value && matchClient.value.isReady()) {
        matchClient.value.start_match()
        debugLog.websocket(`第 ${retryCount.value} 次匹配请求已发送`)
        isRetrying.value = false
      } else {
        debugLog.error('重试后WebSocket连接未就绪，无法发送匹配请求')
        isRetrying.value = false
      }
    }, 1000) // 等待1秒让连接建立
  }, retryDelay.value)
}

// 检查是否可以导航（30秒已过且收到匹配且消息WebSocket已连接）
const checkAndNavigate = () => {
  const now = Date.now()
  const elapsed = now - pageStartTime.value
  const minimumWait = 30000 // 30秒
  
  debugLog.log(`检查导航条件: 已等待 ${elapsed}ms, 匹配已收到: ${matchReceived.value}, 消息客户端就绪: ${messageClientReady.value}`)
  
  if (elapsed >= minimumWait && matchReceived.value && messageClientReady.value) {
    debugLog.log('满足所有导航条件：30秒等待✅ 匹配完成✅ 消息WebSocket就绪✅')
    showFinalMessage.value = true
    
    // 显示最终消息3秒后跳转
    setTimeout(() => {
      debugLog.route('所有条件满足，跳转到WhyHim页面')
      router.push('/why-him')
    }, 3000)
  } else if (matchReceived.value && messageClientReady.value) {
    // 如果匹配已收到且消息客户端就绪但30秒未到，继续等待
    const remainingTime = minimumWait - elapsed
    debugLog.log(`匹配和消息客户端均已就绪，但需再等待 ${remainingTime}ms 满足最小等待时间`)
    setTimeout(checkAndNavigate, 1000)
  } else {
    // 如果条件不满足，检查缺少什么
    const missing = []
    if (!matchReceived.value) missing.push('匹配结果')
    if (!messageClientReady.value) missing.push('消息WebSocket连接')
    debugLog.log(`等待条件: ${missing.join(', ')}`)
    setTimeout(checkAndNavigate, 1000)
  }
}

// 初始化匹配WebSocket连接
const initializeMatchWebSocket = () => {
  if (!userStore.user_id) {
    debugLog.error('用户未初始化，无法建立匹配连接')
    return
  }

  try {
    devHelpers.time('匹配WebSocket初始化')
    
    const wsUrl = getWebSocketUrl()
    debugLog.websocket('初始化匹配WebSocket:', wsUrl)
    debugLog.websocket('用户ID:', userStore.user_id)
    
    matchClient.value = new ManualMatchClient(wsUrl, userStore.user_id)
    matchClient.value.connect()
    
    // 连接成功后自动开始匹配
    setTimeout(() => {
      if (matchClient.value && matchClient.value.isReady()) {
        matchClient.value.start_match()
        debugLog.websocket('匹配请求已发送')
      }
    }, 1000)
    
    devHelpers.timeEnd('匹配WebSocket初始化')
    
  } catch (error) {
    debugLog.error('匹配WebSocket初始化失败:', error)
  }
}

// 初始化消息WebSocket连接
const initializeMessageWebSocket = async () => {
  if (!userStore.user_id) {
    debugLog.error('用户未初始化，无法建立消息连接')
    return
  }

  try {
    devHelpers.time('消息WebSocket初始化')
    
    const wsUrl = getMessageWebSocketUrl()
    debugLog.websocket('初始化消息WebSocket:', wsUrl)
    debugLog.websocket('用户ID:', userStore.user_id)
    
    // Try to get existing singleton instance first
    messageClient.value = WebSocketClient.getInstance()
    
    if (!messageClient.value) {
      // If singleton doesn't exist, create new instance
      messageClient.value = WebSocketClient.getInstance(wsUrl, userStore.user_id)
    }
    
    if (messageClient.value) {
      messageClient.value.connect()
      debugLog.websocket('消息WebSocket连接已启动')
    } else {
      throw new Error('Failed to create message WebSocket client')
    }
    
    devHelpers.timeEnd('消息WebSocket初始化')
    
  } catch (error) {
    debugLog.error('消息WebSocket初始化失败:', error)
  }
}

// 处理匹配成功事件
function handleMatchSuccess(matchData) {
  debugLog.log('=== 匹配成功 ===')
  debugLog.log('完整匹配数据:', matchData)
  debugLog.log('匹配ID:', matchData.match_id)
  debugLog.log('目标用户ID:', matchData.matched_user_id)
  debugLog.log('匹配分数:', matchData.match_score)
  debugLog.log('给自己的理由:', matchData.reason_for_self)
  debugLog.log('给对方的理由:', matchData.reason_for_target)
  debugLog.log('==================')
  
  // 存储匹配信息到用户store
  userStore.setCurrentMatch(matchData)
  
  // 标记匹配已收到
  matchReceived.value = true
  debugLog.log('匹配结果已收到并存储')
  
  // 匹配成功后，先断开匹配WebSocket连接
  debugLog.log('匹配成功，断开匹配WebSocket连接...')
  if (matchClient.value) {
    matchClient.value.disconnect()
    matchClient.value = null
    debugLog.websocket('匹配WebSocket连接已断开')
  }
  
  // 然后初始化消息WebSocket连接
  debugLog.log('开始建立消息WebSocket连接...')
  setTimeout(() => {
    initializeMessageWebSocket()
  }, 500) // 等待500ms确保匹配连接完全断开
  
  // 检查是否可以导航
  checkAndNavigate()
}

// 处理匹配错误事件
function handleMatchError(errorData) {
  debugLog.error('=== 匹配失败 ===')
  debugLog.error('错误信息:', errorData)
  debugLog.error('==================')
  
  // 如果还没收到有效匹配且未达到最大重试次数，则重试
  if (!matchReceived.value && retryCount.value < maxRetries.value) {
    debugLog.log('检测到匹配错误，准备重试...')
    retryMatch()
  } else if (retryCount.value >= maxRetries.value) {
    debugLog.error('已达到最大重试次数，匹配失败')
    // 这里可以显示用户友好的错误信息
  }
}

// 处理所有匹配消息（用于完整日志记录）
function handleMatchMessage(data) {
  debugLog.log('=== 收到匹配消息 ===')
  debugLog.log('消息类型:', data.type)
  debugLog.log('完整数据:', data)
  
  // 根据消息类型进行不同的日志记录
  switch (data.type) {
    case 'match_info':
      debugLog.log('匹配信息详情:')
      debugLog.log('- 匹配ID:', data.match_id)
      debugLog.log('- 自己的ID:', data.self_user_id)
      debugLog.log('- 匹配用户ID:', data.matched_user_id)
      debugLog.log('- 匹配得分:', data.match_score)
      debugLog.log('- 匹配原因(给自己):', data.reason_of_match_given_to_self_user)
      debugLog.log('- 匹配原因(给对方):', data.reason_of_match_given_to_matched_user)
      break
      
    case 'match_error':
      debugLog.log('匹配错误详情:')
      debugLog.log('- 错误消息:', data.message)
      debugLog.log('- 重试次数:', retryCount.value)
      debugLog.log('- 最大重试次数:', maxRetries.value)
      break
      
    default:
      if (data.status === 'authenticated') {
        debugLog.log('认证成功详情:')
        debugLog.log('- 用户ID:', data.user_id)
      } else {
        debugLog.log('其他类型消息:', data)
      }
  }
  debugLog.log('==================')
}

// 处理连接状态变化
function handleMatchOpen(data) {
  debugLog.log('=== 匹配WebSocket连接已建立 ===')
  debugLog.log('连接数据:', data)
  debugLog.log('==================')
}

function handleMatchClose(data) {
  debugLog.log('=== 匹配WebSocket连接已关闭 ===')
  debugLog.log('关闭数据:', data)
  debugLog.log('==================')
}

function handleMatchAuthenticated(data) {
  debugLog.log('=== 匹配客户端认证成功 ===')
  debugLog.log('认证数据:', data)
  debugLog.log('==================')
}

// 处理消息WebSocket事件
function handleChatOpen(data) {
  debugLog.log('=== 消息WebSocket连接已建立 ===')
  debugLog.log('连接数据:', data)
  debugLog.log('==================')
}

function handleChatClose(data) {
  debugLog.log('=== 消息WebSocket连接已关闭 ===')
  debugLog.log('关闭数据:', data)
  messageClientReady.value = false
  debugLog.log('==================')
}

function handleChatAuthenticated(data) {
  debugLog.log('=== 消息客户端认证成功 ===')
  debugLog.log('认证数据:', data)
  messageClientReady.value = true
  debugLog.log('消息WebSocket客户端已就绪')
  debugLog.log('==================')
  
  // 检查是否可以导航
  checkAndNavigate()
}

function handleChatError(data) {
  debugLog.error('=== 消息WebSocket错误 ===')
  debugLog.error('错误数据:', data)
  messageClientReady.value = false
  debugLog.error('==================')
}

onMounted(() => {
  debugLog.log('Loading页面挂载开始')
  
  // 记录页面开始时间
  pageStartTime.value = Date.now()
  debugLog.log('页面开始时间已记录，开始30秒计时器')
  
  // 启动思考过程动画
  startThinkingAnimation()
  
  // 等待用户初始化完成后再建立WebSocket连接
  const checkUserAndConnect = async () => {
    if (userStore.hasUser && userStore.user_id) {
      debugLog.log('用户已就绪，开始建立匹配连接')
      initializeMatchWebSocket()
      // 不在此处初始化消息WebSocket，等收到匹配后再初始化
    } else {
      debugLog.log('等待用户初始化...')
      setTimeout(checkUserAndConnect, 500)
    }
  }
  
  checkUserAndConnect()
  
  // 设置事件监听器
  eventBus.on('match:success', handleMatchSuccess)
  eventBus.on('match:error', handleMatchError)
  eventBus.on('match:message', handleMatchMessage)
  eventBus.on('match:open', handleMatchOpen)
  eventBus.on('match:close', handleMatchClose)
  eventBus.on('match:authenticated', handleMatchAuthenticated)
  
  // 设置消息WebSocket事件监听器
  eventBus.on('chat:open', handleChatOpen)
  eventBus.on('chat:close', handleChatClose)
  eventBus.on('chat:authenticated', handleChatAuthenticated)
  eventBus.on('chat:error', handleChatError)
  
  // 显示当前用户信息 (开发调试)
  debugLog.user('Loading页面挂载 - 当前用户ID:', userStore.user_id)
  debugLog.user('Loading页面挂载 - 完整用户信息:', userStore.currentUser)
  debugLog.user('Loading页面挂载 - 用户状态:', {
    hasUser: userStore.hasUser,
    hasBasicProfile: userStore.hasBasicProfile,
    isLoading: userStore.isLoading,
    isInitialized: userStore.isInitialized
  })
})

onUnmounted(() => {
  debugLog.log('Loading页面卸载开始')
  
  // 清理事件监听器
  eventBus.off('match:success', handleMatchSuccess)
  eventBus.off('match:error', handleMatchError)
  eventBus.off('match:message', handleMatchMessage)
  eventBus.off('match:open', handleMatchOpen)
  eventBus.off('match:close', handleMatchClose)
  eventBus.off('match:authenticated', handleMatchAuthenticated)
  
  // 清理消息WebSocket事件监听器
  eventBus.off('chat:open', handleChatOpen)
  eventBus.off('chat:close', handleChatClose)
  eventBus.off('chat:authenticated', handleChatAuthenticated)
  eventBus.off('chat:error', handleChatError)
  
  // 关闭WebSocket连接
  if (matchClient.value) {
    matchClient.value.disconnect()
    matchClient.value = null
    debugLog.websocket('匹配WebSocket连接已清理')
  }
  
  // 注意：不要关闭消息WebSocket连接，因为用户导航到聊天页面后还需要使用
  // 消息WebSocket连接将在应用生命周期内保持活跃
  if (messageClient.value) {
    debugLog.websocket('消息WebSocket连接保持活跃，不在此页面关闭')
  }
  
  debugLog.log('Loading页面卸载完成')
})
</script>

<style scoped>
.loading-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background: #fff;
}

.loading-page {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #222;
  text-align: center;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
}

@media (min-width: 768px) {
  .loading-container {
    width: 430px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 12px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
  }
}

.loading-page h2 {
  font-size: 1.5rem;
  margin: 0 0 0.8rem 0;
  flex-shrink: 0;
}

.loading-page ul {
  width: 100%;
  text-align: left;
  padding: 0 1rem;
  margin: 0.8rem 0;
  flex: 1;
  overflow-y: auto;
  max-height: 40vh;
}

@media (min-width: 768px) {
  .loading-page ul {
    max-width: 320px;
    max-height: 30vh;
  }
  
  .loading-page h2 {
    font-size: 1.8rem;
  }
}

.loading-page li {
  margin-bottom: 0.4rem;
  line-height: 1.3;
  font-size: 0.9rem;
  opacity: 0.3;
  transition: opacity 0.5s ease-in;
}

.loading-page li.active {
  opacity: 1;
}

.loading-page li.completed {
  opacity: 0.7;
  color: #666;
}

.loading-page .retry-message {
  color: #ff9500;
  font-weight: 500;
  font-size: 0.95rem;
  margin-top: 0.3rem;
}

.loading-page .final-message {
  color: #ff6b81;
  font-weight: bold;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.thinking-process {
  width: 100%;
  text-align: left;
  padding: 0 1rem;
  margin: 0.8rem 0;
  flex: 1;
  overflow-y: auto;
  max-height: 40vh;
}

@media (min-width: 768px) {
  .thinking-process {
    max-width: 320px;
    max-height: 30vh;
  }
}

.typing-dots {
  display: inline-block;
  margin-left: 0.5rem;
}

.typing-dots .dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  margin: 0 1px;
  animation: typing 1.5s infinite;
}

.typing-dots .dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots .dot:nth-child(2) {
  animation-delay: 0.3s;
}

.typing-dots .dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.loading-page p {
  font-size: 0.9rem;
  margin: 0.8rem 0 0 0;
  flex-shrink: 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top: 3px solid #a0a0ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 1rem 0;
  flex-shrink: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 