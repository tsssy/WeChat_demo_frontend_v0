<template>
  <div class="card">
    <div class="content">
      <div class="center-content">
        <div class="question-section">
          <div class="question-text">
            You asked
          </div>
          <div class="main-question">
            {{ questionString }}
          </div>
        </div>
        <!-- 显示回答 -->
        <div class="answer-section">
          <div class="answer-title">
            Someone answered:
          </div>
          <div class="answer-text">
            {{ answerContent }}
          </div>
        </div>
      </div>
      <div class="bottom-content">
        <div class="action">
          <DismissButton @click="onDismissClick" />
          <LikeButton :isLiked="localIsLiked" @click="onLikeClick" />
        </div>
      </div>
    </div>
    
    <!-- Toast组件 -->
    <Toast ref="toast" />
  </div>
</template>

<script>
import DismissButton from './Buttons/DismissButton.vue'
import LikeButton from './Buttons/LikeButton.vue'
import Toast from '../../Toast.vue'

export default {
  name: 'AnswerCard',
  components: {
    DismissButton,
    LikeButton,
    Toast
  },
  props: {
    answerId: {
      type: String,
      required: true
    },
    answerContent: {
      type: String,
      required: true
    },
    questionString: {
      type: String,
      required: true
    },
    isLiked: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localIsLiked: this.isLiked
    }
  },
  mounted() {
    // 获取Toast组件的引用
    this.$nextTick(() => {
      this.toastRef = this.$refs.toast
    })
  },
  watch: {
    isLiked: {
      immediate: true,
      handler(newVal) {
        this.localIsLiked = newVal
      }
    }
  },
  methods: {
    onDismissClick() {
      console.log('Dismiss button clicked!')
      // 触发dismiss事件，让父组件处理
      this.$emit('dismiss', this.answerId)
    },
    
    onLikeClick() {
      console.log('Like button clicked!')
      // 触发like事件，让父组件处理
      // 不在这里切换状态，等待API响应
      this.$emit('like', {
        answerId: this.answerId,
        isLiked: !this.localIsLiked // 发送期望的新状态
      })
    }
  }
}
</script>

<style scoped>


.center-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  text-align: center;
}

.question-section {
  margin-bottom: 30px;
}

.question-text {
  color: #fa86a4;
  font-size: 18px;
  font-weight: 600;
  text-align: left;
  margin-bottom: 12px;
}

.main-question {
  color: #1e1e1e;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  padding: 0 20px;
  margin-bottom: 20px;
}

.answer-section {
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

.answer-text {
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
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
}

.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
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
</style>
