<template>
  <div class="page-container why-him-page">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading match information...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <h3>Error loading match</h3>
      <p>{{ error }}</p>
      <button @click="retryLoad" class="retry-btn">Retry</button>
    </div>
    
    <!-- Content when loaded -->
    <div v-else class="match-content">
      <!-- 新的标题 -->
      <h1 class="cupid-title">🎉 Cupid find your match！</h1>
      
      <!-- 卡片placeholder -->
      <div class="match-card-placeholder">
        <p>Match Card Placeholder</p>
      </div>
      
      <!-- Dynamic gender-based heading -->
      <h2 class="why-title">Why {{ targetGenderPronoun }}?</h2>
      
      <!-- 理由文字 -->
      <p class="match-reason">{{ matchDescription || defaultDescription }}</p>
      
      <!-- Chat Now按钮 -->
      <button class="chat-now-btn" @click="goToChatroom">Chat Now</button>
      
      <!-- Other Matches按钮 -->
      <button class="other-matches-btn" @click="goToMatch">Check out other matches</button>
    </div>
    
    <!-- Toast component -->
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { APIServices } from '../services/APIServices.js'
import { debugLog } from '../utils/debug.js'
import Toast from '../components/Toast.vue'

const router = useRouter()
const userStore = useUserStore()

// Toast component reference
const toast = ref(null)

// Reactive state
const isLoading = ref(true)
const error = ref(null)
const matchInfo = ref(null)
const targetUserInfo = ref(null)

// Computed properties
const targetUserDisplayName = computed(() => {
  const name = targetUserInfo.value?.telegram_user_name || userStore.target_user_name
  return name || 'Someone Special'
})

const targetGenderPronoun = computed(() => {
  // 1为女性，2为男性
  const gender = targetUserInfo.value?.gender || 1
  return gender === 1 ? 'her' : 'him' // 1为女用her，2为男用him
})

const matchDescription = computed(() => {
  return matchInfo.value?.description_for_target || userStore.match_description
})

const defaultDescription = computed(() => {
  // 1为女性，2为男性
  const gender = targetUserInfo.value?.gender || 1
  const pronoun = gender === 1 ? 'She' : 'He' // 1为女用She，2为男用He
  return `${pronoun} deeply values emotional honesty and is serious about building a meaningful relationship. Just like you, ${pronoun.toLowerCase()} has been hurt by loved ones in the past. You two share a desire for stability and mutual growth.`
})

// Load match and user data
const loadMatchData = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    debugLog.log('Loading match data for WhyHim page')
    
    // First try to restore from session storage
    const hasSessionData = userStore.restoreMatchFromSession()
    
    if (hasSessionData) {
      debugLog.log('Match data restored from session storage')
      // Use stored data as fallback
      matchInfo.value = {
        description_for_target: userStore.match_description
      }
      targetUserInfo.value = {
        telegram_user_name: userStore.target_user_name
      }
    }
    
    const current_match_id = userStore.current_match_id
    const current_user_id = userStore.user_id
    const current_target_user_id = userStore.target_user_id
    
    if (!current_match_id || !current_user_id) {
      throw new Error('No match information available. Please start from the matching process.')
    }
    
    debugLog.log('Fetching match info:', { current_user_id, current_match_id })
    
    try {
      // Fetch match information from API
      const matchResponse = await APIServices.getMatchInfo({ user_id: current_user_id, match_id: current_match_id })
      
      // 直接使用API返回的description_for_target，无需反向修正
      matchInfo.value = {
        ...matchResponse,
        description_for_target: matchResponse.description_for_target // 直接使用API原始顺序
      }
      debugLog.log('Match info fetched:', matchInfo.value)
      
      // Get target user ID from match response or stored data
      const target_user_id = matchResponse.target_user_id || current_target_user_id
      
      if (target_user_id) {
        debugLog.log('Fetching target user info:', target_user_id)
        
        // Fetch target user information
        const userResponse = await APIServices.getUserInfoWithUserId(target_user_id)
        targetUserInfo.value = userResponse
        debugLog.log('Target user info fetched:', userResponse)
        
        // Store target user info in user store
        userStore.setTargetUser(userResponse)
      }
    } catch (apiError) {
      debugLog.warn('API call failed, using stored data as fallback:', apiError.message)
      
      // If API calls fail but we have session data, continue with that
      if (!hasSessionData) {
        throw apiError
      }
    }
    
  } catch (err) {
    debugLog.error('Failed to load match data:', err)
    error.value = err.message || 'Failed to load match information'
  } finally {
    isLoading.value = false
  }
}

// Retry loading
const retryLoad = () => {
  loadMatchData()
}

// Navigation functions
const goToChatroom = async () => {
  try {
    const current_user_id = userStore.user_id
    const current_match_id = userStore.current_match_id
    const current_target_user_id = userStore.target_user_id
    
    if (!current_user_id || !current_match_id || !current_target_user_id) {
      toast.value?.show('Missing required information for creating chatroom', 'error')
      return
    }
    
    debugLog.log('Creating/getting chatroom with:', {
      user_id_1: current_user_id,
      user_id_2: current_target_user_id,
      match_id: current_match_id
    })
    
    // Call get_or_create_chatroom API with correct parameter names
    const chatroomResponse = await APIServices.getOrCreateChatroom({
      user_id_1: current_user_id,
      user_id_2: current_target_user_id,
      match_id: current_match_id
    })
    
    if (chatroomResponse.success && chatroomResponse.chatroom_id) {
      debugLog.log('Chatroom created/retrieved successfully:', chatroomResponse.chatroom_id)
      
      // Store chatroom_id in user store or session
      const updatedMatch = { ...userStore.currentMatch, chatroom_id: chatroomResponse.chatroom_id }
      userStore.setCurrentMatch(updatedMatch)
      
      // Navigate to chatroom
      router.push('/chatroom')
    } else {
      toast.value?.show('Failed to create chatroom', 'error')
    }
  } catch (error) {
    debugLog.error('Error creating chatroom:', error)
    toast.value?.show('Error connecting to chat. Please try again.', 'error')
  }
}

const goToMatch = () => {
  router.push('/match')
}

// Initialize on mount
onMounted(() => {
  debugLog.log('WhyHim page mounted')
  debugLog.log('User store state:', {
    current_match_id: userStore.current_match_id,
    target_user_id: userStore.target_user_id,
    user_id: userStore.user_id,
    target_user_name: userStore.target_user_name,
    match_description: userStore.match_description
  })
  
  loadMatchData()
})
</script>

<style scoped>
.why-him-page {
  background: transparent;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: #222;
  text-align: center;
  padding: 0;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex: 1;
}

.match-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
  max-width: 100%;
  padding: 2rem 1rem;
  gap: 1.5rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top: 3px solid #ff6b81;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state h3 {
  color: #dc3545;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #666;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background: #0056b3;
}

/* 新的标题样式 */
.cupid-title {
  color: #FE6A80;
  text-align: center;
  font-family: "Anonymous Pro", monospace;
  font-style: normal;
  line-height: normal;
  font-size: 1.5rem;
  margin: 0;
}

@media (min-width: 768px) {
  .cupid-title {
    font-size: 2rem;
  }
}

/* 卡片placeholder样式 */
.match-card-placeholder {
  width: 100%;
  max-width: 300px;
  height: 200px;
  background: #f5f5f5;
  border: 2px dashed #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

.match-card-placeholder p {
  color: #999;
  font-size: 1rem;
  margin: 0;
}

/* Why him/her标题样式 */
.why-title {
  color: #616161;
  text-align: center;
  font-family: "Crimson Text", serif;
  font-style: normal;
  line-height: normal;
  font-size: 1.6rem;
  margin: 0;
}

@media (min-width: 768px) {
  .why-title {
    font-size: 2rem;
  }
}

/* 理由文字样式 */
.match-reason {
  color: #000;
  text-align: center;
  font-family: "Source Serif Pro", serif;
  font-style: normal;
  line-height: 1.5;
  font-size: 1rem;
  max-width: 100%;
  margin: 0;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .match-reason {
    max-width: 400px;
    font-size: 1.1rem;
  }
}

/* Chat Now按钮样式 */
.chat-now-btn {
  width: 70%;
  height: 60px;
  border-radius: 30px;
  background: #FE6A80;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  
  color: #FFF;
  text-align: center;
  font-family: "Anonymous Pro", monospace;
  font-style: normal;
  line-height: normal;
  font-size: 1rem;
  font-weight: bold;
}

.chat-now-btn:hover {
  background: #fe5a73;
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .chat-now-btn {
    height: 80px;
    border-radius: 40px;
    font-size: 1.2rem;
  }
}

/* Other Matches按钮样式 */
.other-matches-btn {
  width: 70%;
  height: 60px;
  border-radius: 30px;
  background: #C0DFCF;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  
  color: #FFF;
  text-align: center;
  font-family: "Anonymous Pro", monospace;
  font-style: normal;
  line-height: normal;
  font-size: 1rem;
  font-weight: bold;
}

.other-matches-btn:hover {
  background: #b0cfbf;
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .other-matches-btn {
    height: 80px;
    border-radius: 40px;
    font-size: 1.2rem;
  }
}
</style> 