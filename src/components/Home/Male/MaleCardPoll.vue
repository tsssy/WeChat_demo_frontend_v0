<template>
  <div class="card-poll-container">
    <!-- 初始化加载状态 -->
    <div v-if="isInitializing" class="initializing-container">
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
        </svg>
      </div>
      <p class="loading-text">Loading questions...</p>
    </div>
    
    <div v-else class="cards-wrapper" ref="cardsWrapper">
      <div
        v-for="(card, index) in cards"
        :key="card.id || card.type"
        class="card-item"
        :class="{ 
          'active': index === activeIndex,
          'left': index < activeIndex,
          'right': index > activeIndex,
          'answer-mode': isAnswerMode
        }"
        :style="getCardStyle(index)"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @mousemove="onDrag"
        @touchmove="onDrag"
        @mouseup="endDrag"
        @touchend="endDrag"
        @mouseleave="endDrag"
      >
        <template v-if="card.type === 'loading'">
          <div class="loading-spinner">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
            </svg>
          </div>
        </template>
        <template v-else>
          <QuestionCard
            :userName="card.userName"
            :questionData="card.questionData"
            :telegramId="telegramId"
            @open-answer="onOpenAnswer"
            @answer-mode-change="onAnswerModeChange"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import QuestionCard from './QuestionCards.vue'
import { apiService } from '../../../services/APIServices.js'

export default {
  name: 'MaleCardPoll',
  components: {
    QuestionCard
  },
  props: {
    telegramId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      activeIndex: 1, // 中间卡片的索引
      isDragging: false,
      startX: 0,
      currentX: 0,
      dragThreshold: 100, // 拖拽阈值
      isFetching: false, // 防止重复请求
      isInitializing: true, // 初始化状态
      isAnswerMode: false, // 是否处于回答模式
      cards: []
    }
  },
  async mounted() {
    console.log('MaleCardPoll mounted with telegramId:', this.telegramId)
    await this.initializeCards()
  },
  methods: {
    getCardStyle(index) {
      const distance = Math.abs(index - this.activeIndex)
      const baseStyle = {
        position: 'absolute',
        transition: this.isDragging ? 'none' : 'all 0.3s ease',
        zIndex: this.cards.length - distance
      }

      if (index === this.activeIndex) {
        return {
          ...baseStyle,
          transform: `translate(-50%, -50%) translateX(${this.currentX}px)`,
          opacity: 1
        }
      } else if (index < this.activeIndex) {
        // 左边的卡片 - 像扑克牌一样斜着叠起来
        const offset = (index - this.activeIndex) * 30 - 120
        const opacity = Math.max(0.05, 1 - distance * 0.5) // 降低透明度
        const scale = Math.max(0.6, 1 - distance * 0.1)
        const rotation = (index - this.activeIndex) * 12 // 每张卡片旋转12度
        return {
          ...baseStyle,
          transform: `translate(-50%, -50%) translateX(${offset}px) translateY(${Math.abs(index - this.activeIndex) * 5}px) scale(${scale}) rotate(${rotation}deg)`,
          opacity: opacity,
          filter: 'brightness(0.7) contrast(1.2)' // 添加黑色滤镜
        }
      } else {
        // 右边的卡片 - 像扑克牌一样斜着叠起来
        const offset = (index - this.activeIndex) * 30 + 120
        const opacity = Math.max(0.05, 1 - distance * 0.5) // 降低透明度
        const scale = Math.max(0.6, 1 - distance * 0.1)
        const rotation = (index - this.activeIndex) * 12 // 每张卡片旋转12度
        return {
          ...baseStyle,
          transform: `translate(-50%, -50%) translateX(${offset}px) translateY(${Math.abs(index - this.activeIndex) * 5}px) scale(${scale}) rotate(${rotation}deg)`,
          opacity: opacity,
          filter: 'brightness(0.7) contrast(1.2)' // 添加黑色滤镜
        }
      }
    },

    startDrag(event) {
      // 如果处于回答模式，禁止拖动
      if (this.isAnswerMode) return
      
      this.isDragging = true
      this.startX = this.getEventX(event)
      this.currentX = 0
      event.preventDefault()
    },

    onDrag(event) {
      if (!this.isDragging || this.isAnswerMode) return
      
      const currentX = this.getEventX(event)
      this.currentX = currentX - this.startX
      event.preventDefault()
    },

    endDrag() {
      if (!this.isDragging || this.isAnswerMode) return
      
      this.isDragging = false
      
      // 判断拖拽方向
      if (this.currentX > this.dragThreshold && this.activeIndex > 0) {
        // 向右拖拽，显示左边的卡片
        this.activeIndex--
      } else if (this.currentX < -this.dragThreshold && this.activeIndex < this.cards.length - 1) {
        // 向左拖拽，显示右边的卡片
        this.activeIndex++
      } else if (this.currentX < -this.dragThreshold && this.activeIndex === this.cards.length - 1) {
        // 向左拖拽，但已经是最后一张卡片，插入loading卡片并fetch新卡片
        this.insertLoadingAndFetch()
      }
      
      // 重置位置
      this.currentX = 0
    },

    getEventX(event) {
      return event.type.includes('touch') ? event.touches[0].clientX : event.clientX
    },

    async insertLoadingAndFetch() {
      if (this.isFetching) return
      this.isFetching = true
      // 插入loading卡片
      const loadingCard = { type: 'loading', id: 'loading_' + Date.now() }
      this.cards.push(loadingCard)
      this.activeIndex = this.cards.length - 1
              // fetch新卡片
        try {
          const response = await apiService.getQuestion(this.telegramId, false)
        if (response && response.questions && response.questions.length > 0) {
          // 移除loading卡片
          this.cards.pop()
          
          // 将新问题列表转换为卡片格式并添加到数组末尾
          const newCards = response.questions.map((question, index) => ({
            id: Date.now() + index,
            userName: `User ${this.cards.length + index + 1}`,
            questionData: question // 保存完整的question数据
          }))
          
          // 批量添加新卡片
          this.cards.push(...newCards)
          
          // 设置activeIndex指向第一个新卡片
          this.activeIndex = this.cards.length - newCards.length
          
          console.log('New cards added:', newCards)
        } else if (response && response.question_content) {
          // 兼容单个问题的旧格式
          const newCard = {
            id: Date.now(),
            userName: 'New User',
            questionData: response // 保存完整的response数据
          }
          // 用splice替换loading卡片为新卡片
          this.cards.splice(this.cards.length - 1, 1, newCard)
          this.activeIndex = this.cards.length - 1
        } else {
          // 没有新卡片，移除loading卡片
          this.cards.pop()
          this.activeIndex = this.cards.length - 1
        }
      } catch (error) {
        console.error('Failed to fetch new questions:', error)
        this.cards.pop()
        this.activeIndex = this.cards.length - 1
      } finally {
        this.isFetching = false
      }
    },

    onOpenAnswer(answerData) {
      console.log('Opening answer dialog with data:', answerData)
      // 这里可以处理导航到回答页面或打开回答对话框
      // 例如：this.$router.push(`/answer/${answerData.questionId}`)
    },

    onAnswerModeChange(isAnswerMode) {
      this.isAnswerMode = isAnswerMode
      console.log('Answer mode changed:', isAnswerMode)
    },

    async initializeCards() {
      console.log('Initializing cards with telegramId:', this.telegramId)
      this.isInitializing = true
      
      try {
        // 获取初始问题列表
        console.log('Calling getQuestion API...')
        const response = await apiService.getQuestion(this.telegramId, false)
        console.log('API response:', response)
        
        if (response && response.questions && response.questions.length > 0) {
          // 新格式：批量问题列表
          this.cards = response.questions.map((question, index) => ({
            id: Date.now() + index,
            userName: `User ${index + 1}`,
            questionData: question // 保存完整的question数据
          }))
        } else if (response && response.question_content) {
          // 兼容旧格式：单个问题
          this.cards = [{
            id: Date.now(),
            userName: 'User 1',
            questionData: response // 保存完整的response数据
          }]
        } else {
          // 如果API没有返回数据，使用默认卡片
          this.cards = [
            {
              id: 1,
              userName: 'Default User',
              questionData: {
                question_id: 'default_1',
                question_content: "What's your favorite way to spend a weekend?",
                is_saved: false,
                answer_id: null,
                answer_string: null,
                answer_is_draft: null
              }
            }
          ]
        }
        
        // 设置中间卡片为活跃状态
        this.activeIndex = Math.floor(this.cards.length / 2)
        
        console.log('Cards initialized:', this.cards)
      } catch (error) {
        console.error('Failed to initialize cards:', error)
        // 如果初始化失败，使用默认卡片
        this.cards = [
          {
            id: 1,
            userName: 'Default User',
            questionData: {
              question_id: 'default_1',
              question_content: "What's your favorite way to spend a weekend?",
              is_saved: false,
              answer_id: null,
              answer_string: null,
              answer_is_draft: null
            }
          }
        ]
        this.activeIndex = 0
      } finally {
        this.isInitializing = false
      }
    }
  }
}
</script>

<style scoped>
.card-poll-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: visible;
  padding-top: 20px; /* Top spacing for cards */
  box-sizing: border-box;
}

.initializing-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.loading-text {
  color: #fa86a4;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.cards-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.card-item {
  position: absolute;
  width: 90%;
  max-width: 350px;
  height: 100%;
  max-height: 600px;
  cursor: grab;
  user-select: none;
  left: 50%;
  top: 50%;
  transform-origin: center center;
}

.card-item:active {
  cursor: grabbing;
}

.card-item.answer-mode {
  cursor: default;
  user-select: text;
}

.card-item.answer-mode:active {
  cursor: default;
}

.card-item.active {
  z-index: 10;
}

.card-item.left {
  z-index: 5;
}

.card-item.right {
  z-index: 5;
}


.spinner {
  animation: spin 1s linear infinite;
  width: 60px;
  height: 60px;
}
.spinner .path {
  stroke: #fa86a4;
  stroke-linecap: round;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style> 