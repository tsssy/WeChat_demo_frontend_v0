<template>
  <div class="result-container">
    <!-- 完成标题 -->
    <div class="completion-header">
      <div class="completion-icon">🎉</div>
      <div class="completion-text">测试完成！</div>
    </div>
    
    <!-- 卡片展示区域 -->
    <div class="card-display" v-if="testResult">
      <div class="card-flip" :class="{ flipped: isCardFlipped }">
        <!-- 卡片背面 -->
        <div class="card-back">
          <div class="card-back-content">
            <div class="mystery-text">你的性格卡片是...</div>
            <div class="card-pattern"></div>
          </div>
        </div>
        
        <!-- 卡片正面 -->
        <div class="card-front">
          <div class="card-image-container">
            <img 
              :src="getCardImage(testResult.card.card_id)" 
              :alt="testResult.card.card_name"
              class="card-image"
              @error="handleImageError"
            />
          </div>
          <div class="card-name">{{ testResult.card.card_name }}</div>
          <div class="card-title">{{ testResult.card.title }}</div>
        </div>
      </div>
    </div>
    
    <!-- 详细描述 -->
    <div class="card-description" v-if="testResult && showDescription">
      <div class="description-content">
        {{ testResult.card.content }}
      </div>
    </div>
    
    <!-- 得分展示（可选） -->
    <div class="scores-section" v-if="testResult && showScores">
      <div class="scores-title">各类型得分</div>
      <div class="scores-grid">
        <div 
          v-for="(score, cardId) in testResult.scores" 
          :key="cardId"
          class="score-item"
          :class="{ highlight: cardId === testResult.card.card_id }"
        >
          <div class="score-label">{{ cardId }}</div>
          <div class="score-value">{{ score }}</div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button 
        class="action-btn primary"
        @click="restartTest"
        :disabled="isLoading"
      >
        重新测试
      </button>
      <button 
        class="action-btn secondary"
        @click="viewHistory"
        :disabled="isLoading"
      >
        查看历史
      </button>
      <button 
        class="action-btn secondary"
        @click="toggleScores"
      >
        {{ showScores ? '隐藏得分' : '查看得分' }}
      </button>
    </div>
    
    <!-- 历史记录弹窗 -->
    <div v-if="showHistoryModal" class="history-modal">
      <div class="history-content">
        <div class="history-header">
          <h3>测试历史</h3>
          <button @click="showHistoryModal = false" class="close-btn">×</button>
        </div>
        
        <div v-if="isLoadingHistory" class="loading-text">正在加载历史记录...</div>
        
        <div v-else-if="historyList.length > 0" class="history-list">
          <div 
            v-for="(item, index) in historyList" 
            :key="item.session_id"
            class="history-item"
          >
            <div class="history-emoji">{{ item.result_card.emoji }}</div>
            <div class="history-info">
              <div class="history-name">{{ item.result_card.card_name }}</div>
              <div class="history-date">{{ formatDate(item.completed_at) }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-history">暂无历史记录</div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">处理中...</div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-toast">
      {{ errorMessage }}
      <button @click="errorMessage = ''" class="close-error">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCardGameStore } from '@/stores/cardGame'
import { useUserStore } from '@/stores/user'
import { cardGameAPI } from '@/services/api'

// 导入所有卡片图片
import A1Image from '@/assets/personality_cards/A1.png'
import A2Image from '@/assets/personality_cards/A2.png'
import A3Image from '@/assets/personality_cards/A3.png'
import A4Image from '@/assets/personality_cards/A4.png'
import A5Image from '@/assets/personality_cards/A5.png'
import A6Image from '@/assets/personality_cards/A6.png'
import A7Image from '@/assets/personality_cards/A7.png'
import A8Image from '@/assets/personality_cards/A8.png'

// 路由和状态管理
const router = useRouter()
const cardGameStore = useCardGameStore()
const userStore = useUserStore()

// 卡片图片映射
const cardImages = {
  A1: A1Image,
  A2: A2Image,
  A3: A3Image,
  A4: A4Image,
  A5: A5Image,
  A6: A6Image,
  A7: A7Image,
  A8: A8Image
}

// 响应式数据
const testResult = ref(null)
const isCardFlipped = ref(false)
const showDescription = ref(false)
const showScores = ref(false)
const showHistoryModal = ref(false)
const historyList = ref([])
const isLoading = ref(false)
const isLoadingHistory = ref(false)
const errorMessage = ref('')

// 显示错误消息
const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// 获取卡片图片
const getCardImage = (cardId) => {
  console.log('🖼️ 获取卡片图片:', cardId)
  const image = cardImages[cardId]
  if (!image) {
    console.warn('⚠️ 未找到卡片图片:', cardId)
    return '' // 返回空字符串，触发错误处理
  }
  return image
}

// 处理图片加载错误
const handleImageError = (event) => {
  console.error('❌ 卡片图片加载失败')
  // 可以设置一个默认图片或显示emoji作为备选
  event.target.style.display = 'none'
  // 显示emoji作为备选方案
  const emojiDiv = event.target.parentNode
  emojiDiv.innerHTML = `<div class="card-emoji-fallback">${testResult.value?.card?.emoji || '🎴'}</div>`
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 翻转卡片动画
const flipCard = () => {
  setTimeout(() => {
    isCardFlipped.value = true
  }, 500)
  
  setTimeout(() => {
    showDescription.value = true
  }, 1500)
}

// 切换得分显示
const toggleScores = () => {
  showScores.value = !showScores.value
}

// 重新开始测试
const restartTest = async () => {
  if (isLoading.value) return
  
  const currentUser = userStore.getUser
  if (!currentUser) {
    router.push('/')
    return
  }
  
  isLoading.value = true
  
  try {
    console.log('🔄 重新开始测试')
    
    // 清理当前游戏数据
    cardGameStore.resetGame()
    
    // 启动新的测试
    const response = await cardGameAPI.startTest(currentUser.user_id)
    
    if (response.status === 'success') {
      cardGameStore.setGameData({
        sessionId: response.data.session_id,
        currentQuestion: response.data.current_question,
        progress: response.data.progress
      })
      
      router.push('/card-game-test')
    } else {
      throw new Error(response.error || '启动测试失败')
    }
  } catch (error) {
    console.error('❌ 重新开始测试失败:', error)
    showError('重新开始测试失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 查看历史记录
const viewHistory = async () => {
  const currentUser = userStore.getUser
  if (!currentUser) return
  
  showHistoryModal.value = true
  isLoadingHistory.value = true
  
  try {
    console.log('📚 加载历史记录')
    
    const response = await cardGameAPI.getHistory(currentUser.user_id)
    
    if (response.status === 'success') {
      historyList.value = response.data.history || []
      console.log('✅ 历史记录加载成功，记录数量:', historyList.value.length)
    } else {
      throw new Error(response.error || '加载历史记录失败')
    }
  } catch (error) {
    console.error('❌ 加载历史记录失败:', error)
    showError('加载历史记录失败')
  } finally {
    isLoadingHistory.value = false
  }
}

// 初始化页面
const initializePage = () => {
  console.log('🎯 开始初始化结果页面，当前store状态:', {
    hasTestResult: !!cardGameStore.testResult
  })
  
  if (!cardGameStore.testResult) {
    console.warn('⚠️ 没有测试结果，返回首页')
    router.push('/')
    return
  }
  
  testResult.value = cardGameStore.testResult
  
  console.log('🎯 结果页面初始化完成:', {
    cardName: cardGameStore.testResult.card.card_name,
    cardId: cardGameStore.testResult.card.card_id
  })
  
  // 启动卡片翻转动画
  flipCard()
}

// 组件挂载
onMounted(() => {
  initializePage()
})
</script>

<style scoped>
.result-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;
}

.completion-header {
  text-align: center;
  margin-bottom: 30px;
}

.completion-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.completion-text {
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.card-display {
  perspective: 1000px;
  margin-bottom: 30px;
}

.card-flip {
  position: relative;
  width: 280px;
  height: 400px;
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
}

.card-flip.flipped {
  transform: rotateY(180deg);
}

.card-back,
.card-front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  box-sizing: border-box;
}

.card-back {
  background: linear-gradient(45deg, #2c3e50, #34495e);
  color: white;
}

.card-back-content {
  text-align: center;
}

.mystery-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 30px;
}

.card-pattern {
  width: 100px;
  height: 100px;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1) 10px,
    transparent 10px,
    transparent 20px
  );
  border-radius: 50%;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.card-front {
  background: white;
  transform: rotateY(180deg);
  text-align: center;
}

.card-image-container {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  transition: transform 0.3s ease;
}

.card-image:hover {
  transform: scale(1.05);
}

.card-emoji-fallback {
  font-size: 100px;
  color: #667eea;
}

.card-name {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.card-description {
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  opacity: 0;
  animation: fadeInUp 0.8s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.description-content {
  color: #333;
  font-size: 16px;
  line-height: 1.6;
  text-align: center;
}

.scores-section {
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
}

.scores-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.scores-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.score-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.score-item.highlight {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.score-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.score-value {
  font-size: 20px;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.action-btn.primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.action-btn.secondary:hover:not(:disabled) {
  background: white;
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.history-modal {
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

.history-content {
  background: white;
  border-radius: 15px;
  padding: 25px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.history-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.history-emoji {
  font-size: 32px;
  margin-right: 15px;
}

.history-info {
  flex: 1;
}

.history-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.history-date {
  font-size: 14px;
  color: #666;
}

.no-history {
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 40px 0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
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
  z-index: 3000;
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

/* 移动端优化 */
@media (max-width: 768px) {
  .result-container {
    padding: 15px;
  }
  
  .card-flip {
    width: 250px;
    height: 350px;
  }
  
  .completion-text {
    font-size: 20px;
  }
  
  .card-emoji {
    font-size: 60px;
  }
  
  .card-name {
    font-size: 24px;
  }
  
  .scores-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 250px;
  }
}
</style> 