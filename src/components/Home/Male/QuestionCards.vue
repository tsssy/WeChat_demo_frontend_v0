<template>
  <div class="card">
    <!-- 正常显示模式 -->
    <transition name="mode-transition" mode="out-in">
      <div v-if="!isAnswerMode" key="normal" class="normal-mode">
        <div class="top-content">
          <div class="question-text">
            {{ displayUserName }} asks
          </div>
        </div>
        <div class="center-content">
          <div class="main-question">
            {{ displayQuestionText }}
          </div>
          <!-- 显示当前回答 -->
          <div v-if="hasAnswer" class="current-answer-section">
            <div class="answer-title">
              {{ answerTitle }}
            </div>
            <div class="current-answer-text">
              {{ displayAnswerText }}
            </div>
          </div>
        </div>
        <div class="bottom-content">
          <div class="action">
            <SaveButton 
              @click="onSaveClick" 
              :isSaved="isSaved"
              :disabled="isProcessing"
            />
            <AnswerButton 
              @click="onAnswerClick" 
              :disabled="isProcessing"
            />
          </div>
        </div>
      </div>

      <!-- 回答输入模式 -->
      <div v-else key="answer" class="answer-mode">
        <BackButton @click="onBackClick" class="back-button" />
        <div class="top-content">
          <div class="question-text">
            {{ displayUserName }} asks
          </div>
        </div>
        <div class="question-display">
          <div class="main-question">
            {{ displayQuestionText }}
          </div>
        </div>
        <div class="answer-section">
          <div class="answer-label">Your draft answer</div>
          <textarea
            v-model="draftAnswer"
            class="answer-textarea"
            placeholder="Write your answer here..."
          ></textarea>
        </div>
        <div class="bottom-content">
          <div class="action">
            <SaveAsDraftButton 
              @click="onSaveAsDraftClick" 
              :disabled="isProcessing"
            />
            <SendButton 
              @click="onSaveAnswerClick" 
              :disabled="isProcessing"
            />
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Toast组件 -->
    <Toast ref="toast" />
  </div>
</template>

<script>
import SaveButton from './Buttons/SaveButton.vue'
import AnswerButton from './Buttons/AnswerButton.vue'
import SaveAsDraftButton from './Buttons/SaveAsDraftButton.vue'
import SendButton from './Buttons/SendButton.vue'
import BackButton from './Buttons/BackButton.vue'
import Toast from '../../Toast.vue'
import { APIService } from '../../../services/APIServices.js'

export default {
  name: 'QuestionCard',
  components: {
    SaveButton,
    AnswerButton,
    SaveAsDraftButton,
    SendButton,
    BackButton,
    Toast
  },
  props: {
    userName: {
      type: String,
      default: 'Jennifer'
    },
    // 完整的get_question响应数据
    questionData: {
      type: Object,
      default: () => ({
        question_id: '',
        question_content: '',
        is_saved: false,
        answer_id: null,
        answer_string: null,
        answer_is_draft: null
      })
    },
    telegramId: {
      type: Number,
      default: 123456789
    }
  },
  data() {
    return {
      apiService: new APIService(),
      isProcessing: false,
      isAnswerMode: false,
      draftAnswer: ''
    }
  },
  mounted() {
    // 获取Toast组件的引用
    this.$nextTick(() => {
      this.toastRef = this.$refs.toast
    })
  },
  watch: {
    isAnswerMode(newVal) {
      // 通知父组件回答模式状态变化
      this.$emit('answer-mode-change', newVal)
    }
  },
  computed: {
    // 从questionData中获取显示数据
    displayQuestionText() {
      return this.questionData.question_content || ''
    },
    displayUserName() {
      return this.userName
    },
    isSaved() {
      return this.questionData.is_saved || false
    },
    // 是否有回答
    hasAnswer() {
      return this.questionData.answer_string && this.questionData.answer_string.trim() !== ''
    },
    // 回答标题
    answerTitle() {
      if (this.questionData.answer_is_draft) {
        return 'Click Answer to continue edit'
      } else {
        return 'Your Answer'
      }
    },
    // 显示的回答文本
    displayAnswerText() {
      return this.questionData.answer_string || ''
    }
  },
  methods: {
    async onSaveClick() {
      if (this.isProcessing) return
      
      this.isProcessing = true
      console.log('Save button clicked!')
      
      try {
        if (this.questionData.question_id) {
          // 调用toggle_question_save API
          const response = await this.apiService.toggleQuestionSave(
            this.telegramId, 
            this.questionData.question_id
          )
          
          if (response && response.is_saved !== undefined) {
            // 更新本地状态
            this.questionData.is_saved = response.is_saved
            console.log('Question save status updated:', response.is_saved)
          }
        }
      } catch (error) {
        console.error('Failed to toggle question save:', error)
      } finally {
        this.isProcessing = false
      }
    },
    
    async onAnswerClick() {
      if (this.isProcessing) return
      
      console.log('Answer button clicked!')
      
      // 进入回答模式
      this.isAnswerMode = true
      
      // 如果有现有的答案，预填充到文本框
      if (this.questionData.answer_string) {
        this.draftAnswer = this.questionData.answer_string
      }
    },
    
    onBackClick() {
      // 退出回答模式，回到正常显示
      this.isAnswerMode = false
      this.draftAnswer = ''
    },
    
    async onSaveAsDraftClick() {
      if (this.isProcessing) return
      
      this.isProcessing = true
      console.log('Save as draft clicked!')
      
      try {
        if (this.questionData.question_id) {
          // 调用edit_answer API，保存为草稿
          const response = await this.apiService.editAnswer(
            this.telegramId,
            this.questionData.question_id,
            this.draftAnswer,
            false, // isSend = false，表示保存为草稿
            this.questionData.answer_id,
            true // answerIsDraft = true
          )
          
          if (response && !response.error) {
            // 根据API响应更新本地状态
            this.questionData.answer_id = response.answer_id
            this.questionData.answer_string = response.answer_string
            this.questionData.answer_is_draft = response.is_draft
            
            console.log('Answer saved as draft:', response)
            
            // 保存成功后退出回答模式
            this.isAnswerMode = false
            this.draftAnswer = ''
          } else if (response && response.error) {
            console.error('API returned error:', response.error)
            // 显示错误Toast
            if (this.toastRef) {
              const errorMessage = response.error.message || response.error.detail || response.error || 'Unknown error occurred'
              this.toastRef.show(errorMessage, 'error', 5000)
            }
          }
        }
      } catch (error) {
        console.error('Failed to save as draft:', error)
        // 显示错误Toast
        if (this.toastRef) {
          const errorMessage = error.message || error.response?.data?.message || 'Failed to save as draft. Please try again.'
          this.toastRef.show(errorMessage, 'error', 5000)
        }
      } finally {
        this.isProcessing = false
      }
    },
    
    async onSaveAnswerClick() {
      if (this.isProcessing) return
      
      this.isProcessing = true
      console.log('Save answer clicked!')
      
      try {
        if (this.questionData.question_id) {
          // 调用edit_answer API，发送答案
          const response = await this.apiService.editAnswer(
            this.telegramId,
            this.questionData.question_id,
            this.draftAnswer,
            true, // isSend = true，表示发送答案
            this.questionData.answer_id,
            false // answerIsDraft = false
          )
          
          if (response && !response.error) {
            // 根据API响应更新本地状态
            this.questionData.answer_id = response.answer_id
            this.questionData.answer_string = response.answer_string
            this.questionData.answer_is_draft = response.is_draft
            
            console.log('Answer sent:', response)
            
            // 发送成功后退出回答模式
            this.isAnswerMode = false
            this.draftAnswer = ''
          } else if (response && response.error) {
            console.error('API returned error:', response.error)
            // 显示错误Toast
            if (this.toastRef) {
              const errorMessage = response.error.message || response.error.detail || response.error || 'Unknown error occurred'
              this.toastRef.show(errorMessage, 'error', 5000)
            }
          }
        }
      } catch (error) {
        console.error('Failed to save answer:', error)
        // 显示错误Toast
        if (this.toastRef) {
          const errorMessage = error.message || error.response?.data?.message || 'Failed to send answer. Please try again.'
          this.toastRef.show(errorMessage, 'error', 5000)
        }
      } finally {
        this.isProcessing = false
      }
    }
  }
}
</script>

<style scoped>
.back-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  cursor: pointer;
  width: 24px;
  height: 24px;
}

.top-content {
  grid-area: top;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
}

.question-text {
  color: #fa86a4;
  font-size: 18px;
  font-weight: 600;
  text-align: left;
  flex: 1;
  margin-top: 0;
}

.center-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  text-align: center;
}

.main-question {
  color: #1e1e1e;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  padding: 0 20px;
  margin-bottom: 20px;
}

.current-answer-section {
  margin-top: 30px;
  padding: 20px;
  background-color: rgba(250, 134, 164, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(250, 134, 164, 0.3);
}

.answer-title {
  color: #fa86a4;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: left;
}

.current-answer-text {
  color: #1e1e1e;
  font-size: 16px;
  line-height: 1.5;
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.action {
  align-self: stretch;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  cursor: pointer;
}

.bottom-content {
  grid-area: bottom;
}

.card {
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03);
  border-radius: 30px;
  background-color: #ffeef2;
  height: 80vh;
  overflow: hidden;
  text-align: center;
  font-size: 16px;
  color: #fff;
  font-family: Nunito;
}

.normal-mode,
.answer-mode {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas: 
    "top"
    "question"
    "answer"
    "bottom";
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.question-display {
  grid-area: question;
  text-align: center;
}

.answer-section {
  grid-area: answer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.answer-label {
  color: #fa86a4;
  font-size: 18px;
  font-weight: 600;
  text-align: left;
  margin-bottom: 16px;
}

.answer-textarea {
  width: 100%;
  height: 40vh;
  padding: 16px;
  border: 2px solid #fa86a4;
  border-radius: 16px;
  background-color: #fff;
  color: #1e1e1e;
  font-size: 16px;
  font-family: Nunito;
  resize: none;
  outline: none;
  transition: border-color 0.3s ease;
  user-select: text;
  cursor: text;
  overflow-y: auto;
  box-sizing: border-box;
}

.answer-textarea:focus {
  border-color: #e91e63;
}

.answer-textarea::placeholder {
  color: #999;
}

/* 模式切换动画 */
.mode-transition-enter-active,
.mode-transition-leave-active {
  transition: all 0.4s ease-in-out;
}

.mode-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.mode-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.mode-transition-enter-to,
.mode-transition-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
