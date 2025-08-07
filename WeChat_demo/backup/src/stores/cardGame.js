import { defineStore } from 'pinia'

// 抽卡游戏状态管理
export const useCardGameStore = defineStore('cardGame', {
  state: () => ({
    // 游戏会话ID
    sessionId: null,
    // 当前题目
    currentQuestion: null,
    // 进度信息
    progress: null,
    // 测试结果
    testResult: null,
    // 用户答案记录
    answers: []
  }),
  
  getters: {
    // 获取游戏数据
    getGameData: (state) => ({
      sessionId: state.sessionId,
      currentQuestion: state.currentQuestion,
      progress: state.progress
    }),
    
    // 获取测试结果
    getTestResult: (state) => state.testResult,
    
    // 获取答案记录
    getAnswers: (state) => state.answers,
    
    // 检查游戏是否已开始
    isGameStarted: (state) => !!state.sessionId,
    
    // 检查是否有测试结果
    hasResult: (state) => !!state.testResult
  },
  
  actions: {
    // 设置游戏数据
    setGameData(data) {
      this.sessionId = data.sessionId
      this.currentQuestion = data.currentQuestion
      this.progress = data.progress
      console.log('🎮 游戏数据已设置:', data)
    },
    
    // 更新当前题目
    updateCurrentQuestion(question) {
      this.currentQuestion = question
    },
    
    // 更新进度
    updateProgress(progress) {
      this.progress = progress
    },
    
    // 添加答案记录
    addAnswer(questionId, selectedOption) {
      this.answers.push({
        questionId,
        selectedOption,
        timestamp: new Date().toISOString()
      })
      console.log('📝 答案已记录:', { questionId, selectedOption })
    },
    
    // 设置测试结果
    setTestResult(result) {
      this.testResult = result
      console.log('🎯 测试结果已保存:', result)
    },
    
    // 清理游戏数据
    clearGameData() {
      this.sessionId = null
      this.currentQuestion = null
      this.progress = null
      this.testResult = null
      this.answers = []
      console.log('🧹 游戏数据已清理')
    },
    
    // 重置游戏（保留结果）
    resetGame() {
      this.sessionId = null
      this.currentQuestion = null
      this.progress = null
      this.answers = []
      console.log('🔄 游戏已重置')
    }
  }
}) 