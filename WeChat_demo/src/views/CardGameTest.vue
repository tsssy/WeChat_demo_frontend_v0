<template>
  <div class="card-game-container">
    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-text">
        {{ progress?.current || 0 }} / {{ progress?.total || 16 }}
      </div>
    </div>
    
    <!-- 题目卡片 -->
    <div class="question-card" v-if="currentQuestion">
      <div class="question-number">
        第 {{ progress?.current || 1 }} 题
      </div>
      <div class="question-text">
        {{ currentQuestion.question_text }}
      </div>
    </div>
    
    <!-- 选项区域 -->
    <div class="options-section" v-if="currentQuestion">
      <div 
        v-for="option in currentQuestion.options" 
        :key="option.option"
        class="option-item"
        :class="{ 
          selected: selectedOption === option.option,
          disabled: isSubmitting 
        }"
        @click="selectOption(option.option)"
      >
        <div class="option-letter">{{ option.option }}</div>
        <div class="option-text">{{ option.text }}</div>
      </div>
    </div>
    
    <!-- 提交按钮 -->
    <div class="submit-section">
      <button 
        class="submit-btn"
        :disabled="!selectedOption || isSubmitting"
        @click="submitAnswer"
      >
        {{ isSubmitting ? '提交中...' : (isLastQuestion ? '查看结果' : '下一题') }}
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载题目...</div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-toast">
      {{ errorMessage }}
      <button @click="errorMessage = ''" class="close-error">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCardGameStore } from '@/stores/cardGame'
import { cardGameAPI } from '@/services/api'

// 路由和状态管理
const router = useRouter()
const cardGameStore = useCardGameStore()

// 响应式数据
const currentQuestion = ref(null)
const progress = ref(null)
const selectedOption = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// 计算属性
const progressPercentage = computed(() => {
  if (!progress.value) return 0
  return (progress.value.current / progress.value.total) * 100
})

const isLastQuestion = computed(() => {
  if (!progress.value) return false
  return progress.value.current === progress.value.total
})

// 显示错误消息
const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// 选择选项
const selectOption = (option) => {
  if (isSubmitting.value) return
  selectedOption.value = option
  console.log('📝 用户选择选项:', option)
}

// 提交答案
const submitAnswer = async () => {
  if (!selectedOption.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    console.log('🚀 提交答案:', {
      sessionId: cardGameStore.sessionId,
      questionId: currentQuestion.value.question_id,
      selectedOption: selectedOption.value
    })
    
    const response = await cardGameAPI.submitAnswer(
      cardGameStore.sessionId,
      currentQuestion.value.question_id,
      selectedOption.value
    )
    
    if (response.status === 'success') {
      // 记录答案
      cardGameStore.addAnswer(
        currentQuestion.value.question_id,
        selectedOption.value
      )
      
      if (response.data.is_completed) {
        // 测试完成，保存结果并跳转
        console.log('🎉 测试完成！')
        console.log('🎯 测试结果数据:', response.data)
        
        // 构造结果数据结构，匹配CardGameResult.vue期望的格式
        const resultData = {
          card: response.data.result_card,  // 注意：后端返回的是 result_card
          scores: response.data.scores
        }
        
        cardGameStore.setTestResult(resultData)
        router.push('/card-game-result')
      } else {
        // 继续下一题
        console.log('➡️ 继续下一题')
        currentQuestion.value = response.data.next_question
        progress.value = response.data.progress
        cardGameStore.updateCurrentQuestion(response.data.next_question)
        cardGameStore.updateProgress(response.data.progress)
        
        // 重置选择
        selectedOption.value = ''
      }
    } else {
      throw new Error(response.error || '提交答案失败')
    }
  } catch (error) {
    console.error('❌ 提交答案失败:', error)
    showError('提交答案失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 初始化页面
const initializePage = () => {
  console.log('🎮 开始初始化页面，当前store状态:', {
    sessionId: cardGameStore.sessionId,
    hasCurrentQuestion: !!cardGameStore.currentQuestion,
    hasProgress: !!cardGameStore.progress
  })
  
  if (!cardGameStore.sessionId || !cardGameStore.currentQuestion) {
    console.warn('⚠️ 没有游戏数据，返回首页')
    router.push('/')
    return
  }
  
  currentQuestion.value = cardGameStore.currentQuestion
  progress.value = cardGameStore.progress
  
  console.log('🎮 性格测试页面初始化完成:', {
    sessionId: cardGameStore.sessionId,
    currentQuestion: cardGameStore.currentQuestion.question_id,
    progress: cardGameStore.progress
  })
}

// 组件挂载
onMounted(() => {
  initializePage()
})
</script>

<style scoped>
.card-game-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.progress-section {
  margin-bottom: 30px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.question-card {
  background: white;
  border-radius: 20px;
  padding: 30px 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.question-number {
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.question-text {
  color: #333;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
}

.options-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.option-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.option-item:hover:not(.disabled) {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.option-item.selected {
  background: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
}

.option-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-letter {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  margin-right: 20px;
  flex-shrink: 0;
}

.option-item.selected .option-letter {
  background: #5a67d8;
}

.option-text {
  color: #333;
  font-size: 16px;
  line-height: 1.4;
  flex: 1;
}

.submit-section {
  text-align: center;
}

.submit-btn {
  width: 100%;
  max-width: 300px;
  padding: 15px 30px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  z-index: 2000;
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
  .card-game-container {
    padding: 15px;
  }
  
  .question-card {
    padding: 25px 20px;
    margin-bottom: 25px;
  }
  
  .question-text {
    font-size: 18px;
  }
  
  .option-item {
    padding: 15px;
  }
  
  .option-letter {
    width: 35px;
    height: 35px;
    font-size: 16px;
    margin-right: 15px;
  }
  
  .option-text {
    font-size: 15px;
  }
}
</style> 