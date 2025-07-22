<template>
  <div class="card-poll-container">
    <!-- 初始化加载状态 -->
    <div v-if="isInitializing" class="initializing-container">
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
        </svg>
      </div>
      <p class="loading-text">Loading answers...</p>
    </div>
    
    <div v-else class="cards-wrapper" ref="cardsWrapper">
      <div
        v-for="(card, index) in cards"
        :key="card.id || card.type"
        class="card-item"
        :class="{ 
          'active': index === activeIndex,
          'left': index < activeIndex,
          'right': index > activeIndex
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
          <AnswerCards
            :answerId="card.answerId"
            :answerContent="card.answerContent"
            :questionString="card.questionString"
            :isLiked="card.isLiked"
            @dismiss="onDismiss"
            @like="onLike"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import AnswerCards from './AnswerCards.vue'
import { APIService } from '../../../services/APIServices.js'

export default {
  name: 'FemaleCardPoll',
  components: {
    AnswerCards
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
      apiService: new APIService(),
      cards: []
    }
  },
  async mounted() {
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
      this.isDragging = true
      this.startX = this.getEventX(event)
      this.currentX = 0
      event.preventDefault()
    },

    onDrag(event) {
      if (!this.isDragging) return
      
      const currentX = this.getEventX(event)
      this.currentX = currentX - this.startX
      event.preventDefault()
    },

    endDrag() {
      if (!this.isDragging) return
      
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
        const response = await this.apiService.getAnswer(this.telegramId, true) // isSwipingTowardLeft = true
        if (response && response.answers && response.answers.length > 0) {
          // 移除loading卡片
          this.cards.pop()
          
          // 将新答案列表转换为卡片格式并添加到数组末尾
          const newCards = response.answers.map((answer, index) => ({
            id: Date.now() + index,
            answerId: answer.answer_id,
            answerContent: answer.answer_content,
            questionString: answer.question_string,
            isLiked: answer.is_liked || false
          }))
          
          // 批量添加新卡片
          this.cards.push(...newCards)
          
          // 设置activeIndex指向第一个新卡片
          this.activeIndex = this.cards.length - newCards.length
          
          console.log('New answer cards added:', newCards)
        } else if (response && response.answer_id) {
          // 兼容单个答案的格式
          const newCard = {
            id: Date.now(),
            answerId: response.answer_id,
            answerContent: response.answer_content,
            questionString: response.question_string,
            isLiked: response.is_liked || false
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
        console.error('Failed to fetch new answers:', error)
        this.cards.pop()
        this.activeIndex = this.cards.length - 1
      } finally {
        this.isFetching = false
      }
    },

    async onDismiss(answerId) {
      console.log('Dismissing answer:', answerId)
      
      try {
        // 调用API来block答案
        await this.apiService.blockAnswer(this.telegramId, answerId)
        console.log('Answer blocked successfully:', answerId)
        
        // 从当前卡片数组中移除该卡片
        const cardIndex = this.cards.findIndex(card => card.answerId === answerId)
        if (cardIndex !== -1) {
          this.cards.splice(cardIndex, 1)
          
          // 调整activeIndex
          if (this.activeIndex >= cardIndex) {
            this.activeIndex = Math.max(0, this.activeIndex - 1)
          }
          
          // 如果卡片数量不足，尝试获取更多
          if (this.cards.length < 3) {
            this.insertLoadingAndFetch()
          }
        }
      } catch (error) {
        console.error('Failed to block answer:', error)
        // 即使API调用失败，也可以选择是否移除卡片
        // 这里我们选择不移除，让用户重试
      }
    },

    async onLike(likeData) {
      console.log('Liking/unliking answer:', likeData)
      try {
        // 调用API来like/unlike答案
        const response = await this.apiService.likeAnswer(this.telegramId, likeData.answerId)
        console.log('Answer like status updated successfully:', response)
        
        // 根据API响应更新本地卡片状态
        const cardIndex = this.cards.findIndex(card => card.answerId === likeData.answerId)
        if (cardIndex !== -1) {
          // 使用API响应中的is_liked状态，而不是本地状态
          this.cards[cardIndex].isLiked = response.is_liked
        }
      } catch (error) {
        console.error('Failed to like/unlike answer:', error)
        // 如果API调用失败，回滚本地状态
        const cardIndex = this.cards.findIndex(card => card.answerId === likeData.answerId)
        if (cardIndex !== -1) {
          this.cards[cardIndex].isLiked = !likeData.isLiked
        }
      }
    },

    async initializeCards() {
      console.log('Initializing answer cards...')
      this.isInitializing = true
      
      try {
        // 获取初始答案列表
        const response = await this.apiService.getAnswer(this.telegramId, false) // isSwipingTowardLeft = false
        
        if (response && response.answers && response.answers.length > 0) {
          // 新格式：批量答案列表
          this.cards = response.answers.map((answer, index) => ({
            id: Date.now() + index,
            answerId: answer.answer_id,
            answerContent: answer.answer_content,
            questionString: answer.question_string,
            isLiked: answer.is_liked || false
          }))
        } else if (response && response.answer_id) {
          // 兼容单个答案的格式
          this.cards = [{
            id: Date.now(),
            answerId: response.answer_id,
            answerContent: response.answer_content,
            questionString: response.question_string,
            isLiked: response.is_liked || false
          }]
        } else {
          // 如果API没有返回数据，使用默认卡片
          this.cards = [
            {
              id: 1,
              answerId: 'default_1',
              answerContent: "I love spending time outdoors hiking and exploring nature. It's so refreshing and helps me stay active!",
              questionString: "What's your favorite way to spend a weekend?",
              isLiked: false
            }
          ]
        }
        
        // 设置中间卡片为活跃状态
        this.activeIndex = Math.floor(this.cards.length / 2)
        
        console.log('Answer cards initialized:', this.cards)
      } catch (error) {
        console.error('Failed to initialize answer cards:', error)
        // 如果初始化失败，使用默认卡片
        this.cards = [
          {
            id: 1,
            answerId: 'default_1',
            answerContent: "I love spending time outdoors hiking and exploring nature. It's so refreshing and helps me stay active!",
            questionString: "What's your favorite way to spend a weekend?",
            isLiked: false
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

.card-item.active {
  z-index: 10;
}

.card-item.left {
  z-index: 5;
}

.card-item.right {
  z-index: 5;
}


.loading-spinner {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
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