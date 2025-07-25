<template>
  <div class="page-container profile-page">
    <!-- Profile 页面 -->
    <PageTitle title="My Profile" />
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      Loading your profile...
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadUserInfo" class="retry-btn">Retry</button>
    </div>
    
    <!-- 用户信息 -->
    <div v-else-if="userInfo" class="profile-content">
      <div class="profile-info">
        <div>Name: {{ userInfo.telegram_user_name || 'N/A' }}</div>
        <div>Age: {{ userInfo.age || 'N/A' }}</div>
        <div>Gender: {{ getGenderText(userInfo.gender) }}</div>
        <div>Target Gender: {{ getGenderText(userInfo.target_gender) }}</div>
      </div>
      
      <div class="trait-section" v-if="userInfo.user_personality_trait">
        <h3>Your Personality Trait</h3>
        <div class="trait-content">
          <p v-html="formatPersonalityTrait(userInfo.user_personality_trait)"></p>
        </div>
      </div>
      
      <div class="stats-section">
        <h3>Profile Stats</h3>
        <div class="stat-item">
          <span>User ID:</span> {{ userInfo.user_id }}
        </div>
        <div class="stat-item">
          <span>Telegram ID:</span> {{ userInfo.telegram_id }}
        </div>
        <div class="stat-item">
          <span>Matches:</span> {{ userInfo.match_ids?.length || 0 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Profile 页面 - 获取并显示用户信息
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { APIServices } from '@/services/APIServices.js'
import PageTitle from '../components/PageTitle.vue'
import eventBus from '../utils/eventBus.js'

// Store
const userStore = useUserStore()

// 响应式数据
const userInfo = ref(null)
const isLoading = ref(false)
const error = ref(null)

// 获取性别文本
const getGenderText = (gender) => {
  // 1为女性，2为男性，3为其他
  if (!gender) return 'N/A'
  switch (gender) {
    case 1: return 'Female' // 女
    case 2: return 'Male'   // 男
    case 3: return 'Other'  // 其他
    default: return 'Unknown' // 未知
  }
}

// 格式化性格特质文本 - 根据规则添加换行
const formatPersonalityTrait = (text) => {
  if (!text) return ''
  
  let formattedText = text
  // 1. 冒号":"之后换行
  formattedText = formattedText.replace(/：/g, '：<br/>')
  formattedText = formattedText.replace(/:/g, ':<br/>')
  
  // 2. "-"之前换行  
  formattedText = formattedText.replace(/-/g, '<br/>-')
  
  // 3. "***"之前换行
  formattedText = formattedText.replace(/\*\*\*/g, '<br/>***')
  
  // 清理开头可能多余的<br/>
  formattedText = formattedText.replace(/^<br\/>/, '')
  
  return formattedText
}

// 加载用户信息
const loadUserInfo = async () => {
  if (!userStore.user_id) {
    error.value = 'User not logged in'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    console.log('Loading user info for user_id:', userStore.user_id)
    const response = await APIServices.getUserInfoWithUserId(userStore.user_id)
    console.log('User info loaded:', response)
    userInfo.value = response
  } catch (err) {
    console.error('Failed to load user info:', err)
    error.value = 'Failed to load user information. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// 监听'match_update'事件，刷新用户信息
function onMatchUpdate() {
  console.log('收到match_update事件，Profile页面刷新数据')
  loadUserInfo()
}

// 生命周期
onMounted(() => {
  eventBus.on('match_update', onMatchUpdate)
  loadUserInfo()
})

onUnmounted(() => {
  eventBus.off('match_update', onMatchUpdate)
})
</script>

<style scoped>
.profile-page {
  background: transparent;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 1rem;
  padding-bottom: 100px; /* 为底部导航栏预留空间 */
}



/* 加载状态 */
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
  font-family: 'Anonymous Pro', monospace;
}

/* 错误状态 */
.error {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  font-family: 'Anonymous Pro', monospace;
}

.retry-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 1rem;
  font-family: 'Anonymous Pro', monospace;
}

.retry-btn:hover {
  background: #2980b9;
}

/* 用户信息 */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-info {
  text-align: center;
  align-self: center;
  background: #F8F8F8;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.profile-info div {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  font-family: 'Anonymous Pro', monospace;
}

/* 性格特质区域 */
.trait-section {
  width: 100%;
  max-width: 100%;
  background: #F8F8F8;
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.trait-section h3 {
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
  font-size: 1.3rem;
  font-family: 'Anonymous Pro', monospace;
}

.trait-content p {
  line-height: 1.6;
  color: #555;
  text-align: left;
  margin: 0;
  padding: 1rem;
  background: #DDEBE3;
  border-radius: 8px;
  font-family: 'Anonymous Pro', monospace;
  text-decoration: underline;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

/* 统计信息区域 */
.stats-section {
  background: #F8F8F8;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.stats-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  text-align: center;
  font-size: 1.2rem;
  font-family: 'Anonymous Pro', monospace;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(52, 152, 219, 0.2);
  font-family: 'Anonymous Pro', monospace;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item span {
  font-weight: 600;
  color: #34495e;
}

@media (min-width: 768px) {
  .trait-section, .stats-section {
    max-width: 500px;
    align-self: center;
  }
  
  .profile-info {
    max-width: 400px;
  }
}
</style>