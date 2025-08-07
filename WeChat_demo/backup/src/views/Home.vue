<template>
  <div class="home-container">
    <!-- 标题 -->
    <h1 class="title">基础信息</h1>
    
    <!-- 性别选择区域 -->
    <div class="gender-section">
      <div class="select-label">select gender</div>
      <div class="gender-buttons">
        <button 
          class="gender-btn"
          :class="{ active: selectedGender === 2 }"
          @click="selectGender(2)"
        >
          Boy
        </button>
        <button 
          class="gender-btn"
          :class="{ active: selectedGender === 1 }"
          @click="selectGender(1)"
        >
          Girl
        </button>
      </div>
    </div>
    
    <!-- 年龄输入区域 -->
    <div class="age-section">
      <div class="age-input-container">
        <div class="age-label">enter age</div>
        <input 
          type="number" 
          class="age-input"
          v-model="userAge"
          placeholder="19"
          min="1"
          max="100"
        />
      </div>
    </div>
    
    <!-- 提示文本 -->
    <div class="hint-text">
      Let's click the button below to use AI
    </div>
    
    <!-- Use AI 按钮 -->
    <button 
      class="use-ai-btn"
      @click="handleUseAI"
      :disabled="!canProceed || isLoading"
    >
      {{ isLoading ? 'Loading...' : 'Use AI' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCardGameStore } from '@/stores/cardGame'
import { userAPI, cardGameAPI } from '@/services/api'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const cardGameStore = useCardGameStore()

// 响应式数据
const selectedGender = ref(null) // 1: 女性, 2: 男性
const userAge = ref('')
const isLoading = ref(false)

// 计算属性：是否可以继续
const canProceed = computed(() => {
  return selectedGender.value && userAge.value && parseInt(userAge.value) > 0
})

// 选择性别
const selectGender = (gender) => {
  selectedGender.value = gender
  console.log('选择性别:', gender === 1 ? '女性' : '男性', 'selectedGender.value:', selectedGender.value)
}

// 生成随机用户ID
const generateUserId = () => {
  return Math.floor(Math.random() * 1000000000)
}

// 启动抽卡游戏
const startCardGame = async (userId) => {
  try {
    console.log('🎮 启动抽卡游戏，用户ID:', userId)
    
    const response = await cardGameAPI.startTest(userId)
    console.log('🎮 抽卡游戏API完整响应:', response)
    
    if (response.status === 'success') {
      console.log('🎮 响应数据:', response.data)
      
      // 将游戏数据保存到store
      cardGameStore.setGameData({
        sessionId: response.data.session_id,
        currentQuestion: response.data.first_question, // 修复：后端返回的是 first_question
        progress: response.data.progress
      })
      
      console.log('✅ 抽卡游戏启动成功，跳转到测试页面')
      router.push('/card-game-test')
    } else {
      console.error('❌ API返回失败状态:', response)
      throw new Error(response.error || '启动游戏失败')
    }
  } catch (error) {
    console.error('❌ 启动抽卡游戏失败:', error)
    alert('游戏启动失败，请重试: ' + error.message)
  }
}

// 处理Use AI按钮点击
const handleUseAI = async () => {
  if (!canProceed.value) {
    alert('请选择性别并输入年龄')
    return
  }
  
  isLoading.value = true
  
  try {
    // 生成用户信息
    const userId = generateUserId()
    const userName = `user_${userId}`
    const age = parseInt(userAge.value)
    
    console.log('准备创建用户:', {
      userId,
      userName,
      gender: selectedGender.value,
      age
    })
    
    // 第一步：调用create_new_user接口
    const createUserResponse = await userAPI.createNewUser({
      telegram_user_name: userName,
      telegram_user_id: userId,
      gender: selectedGender.value
    })
    
    console.log('创建用户响应:', createUserResponse)
    
    if (!createUserResponse.success) {
      throw new Error('创建用户失败')
    }
    
    // 第二步：调用edit_user_age接口
    const editAgeResponse = await userAPI.editUserAge({
      user_id: createUserResponse.user_id,
      age: age
    })
    
    console.log('编辑年龄响应:', editAgeResponse)
    
    if (!editAgeResponse.success) {
      throw new Error('设置年龄失败')
    }
    
    // 保存用户信息到store
    userStore.setUser({
      user_id: createUserResponse.user_id,
      telegram_user_name: userName,
      telegram_user_id: userId,
      gender: selectedGender.value,
      age: age
    })
    
    // 根据性别跳转不同页面
    if (selectedGender.value === 1) {
      // 女性：跳转AI聊天页面
      console.log('👩 女性用户，跳转AI聊天页面')
      router.push('/chat')
    } else if (selectedGender.value === 2) {
      // 男性：启动抽卡游戏并跳转到测试页面
      console.log('👨 男性用户，启动抽卡游戏')
      await startCardGame(createUserResponse.user_id)
    }
    
  } catch (error) {
    console.error('处理失败:', error)
    alert('操作失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #8BC34A 0%, #7CB342 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  box-sizing: border-box;
}

.title {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 40px;
  text-align: left;
  width: 100%;
  max-width: 350px;
}

.gender-section {
  width: 100%;
  max-width: 350px;
  margin-bottom: 40px;
}

.select-label {
  background: white;
  color: black;
  padding: 15px 20px;
  border-radius: 25px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
}

.gender-buttons {
  display: flex;
  gap: 20px;
  justify-content: space-between;
}

.gender-btn {
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.gender-btn.active {
  background: rgba(255, 255, 255, 0.8);
  color: black;
}

.gender-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.age-section {
  width: 100%;
  max-width: 350px;
  margin-bottom: 40px;
}

.age-input-container {
  display: flex;
  gap: 20px;
  align-items: center;
}

.age-label {
  background: white;
  color: black;
  padding: 15px 20px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
}

.age-input {
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.age-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.age-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.5);
  color: black;
}

.hint-text {
  background: white;
  color: black;
  padding: 15px 20px;
  border-radius: 25px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 30px;
  width: 100%;
  max-width: 350px;
  box-sizing: border-box;
}

.use-ai-btn {
  width: 100%;
  max-width: 350px;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.use-ai-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.5);
}

.use-ai-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 