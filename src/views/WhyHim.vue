<template>
  <div class="page-container why-him-page">
    <!-- User name as top navigation -->
    <div class="top-nav">
      <h3 class="user-name">{{ targetUserDisplayName }}</h3>
    </div>
    
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
      <!-- Dynamic gender-based heading -->
      <h2>Why {{ targetGenderPronoun }}?</h2>
      
      <p>{{ matchDescription || defaultDescription }}</p>
      
      <button class="chat-now-btn" @click="goToChatroom">Chat Now</button>
      
      <!-- Other matches link below the button -->
      <a href="#" class="other-matches-link" @click.prevent="goToMatch">Check out other matches</a>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { APIServices } from '../services/APIServices.js'
import { debugLog } from '../utils/debug.js'

const router = useRouter()
const userStore = useUserStore()

// Reactive state
const isLoading = ref(true)
const error = ref(null)
const matchInfo = ref(null)
const targetUserInfo = ref(null)

// Computed properties
const targetUserDisplayName = computed(() => {
  const name = targetUserInfo.value?.telegram_user_name || userStore.targetUserName
  return name || 'Someone Special'
})

const targetGenderPronoun = computed(() => {
  const gender = targetUserInfo.value?.gender || 1
  return gender === 2 ? 'her' : 'him'
})

const matchDescription = computed(() => {
  return matchInfo.value?.description_for_target || userStore.matchDescription
})

const defaultDescription = computed(() => {
  const gender = targetUserInfo.value?.gender || 1
  const pronoun = gender === 2 ? 'She' : 'He'
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
        description_for_target: userStore.matchDescription
      }
      targetUserInfo.value = {
        telegram_user_name: userStore.targetUserName
      }
    }
    
    const currentMatchId = userStore.currentMatchId
    const currentUserId = userStore.userId
    const currentTargetUserId = userStore.targetUserId
    
    if (!currentMatchId || !currentUserId) {
      throw new Error('No match information available. Please start from the matching process.')
    }
    
    debugLog.log('Fetching match info:', { currentUserId, currentMatchId })
    
    try {
      // Fetch match information from API
      const matchResponse = await APIServices.getMatchInfo({ user_id: currentUserId, match_id: currentMatchId })
      matchInfo.value = matchResponse
      debugLog.log('Match info fetched:', matchResponse)
      
      // Get target user ID from match response or stored data
      const targetUserId = matchResponse.target_user_id || currentTargetUserId
      
      if (targetUserId) {
        debugLog.log('Fetching target user info:', targetUserId)
        
        // Fetch target user information
        const userResponse = await APIServices.getUserInfoWithUserId(targetUserId)
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
const goToChatroom = () => {
  router.push('/chatroom')
}

const goToMatch = () => {
  router.push('/match')
}

// Initialize on mount
onMounted(() => {
  debugLog.log('WhyHim page mounted')
  debugLog.log('User store state:', {
    currentMatchId: userStore.currentMatchId,
    targetUserId: userStore.targetUserId,
    userId: userStore.userId,
    targetUserName: userStore.targetUserName,
    matchDescription: userStore.matchDescription
  })
  
  loadMatchData()
})
</script>

<style scoped>
.why-him-page {
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: #222;
  text-align: center;
  padding: 0;
}

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 1rem;
  z-index: 100;
}

@media (min-width: 768px) {
  .top-nav {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: 430px;
  }
}

.user-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #222;
  margin: 0;
  text-align: center;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex: 1;
  margin-top: 4rem;
}

.match-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
  max-width: 100%;
  margin-top: 4rem;
  padding: 2rem 1rem;
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

.match-content h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
}

.match-content p {
  width: 100%;
  line-height: 1.5;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1rem;
}

@media (min-width: 768px) {
  .match-content p {
    max-width: 350px;
    font-size: 1.1rem;
  }
}

.chat-now-btn {
  background: #ff6b81;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 24px;
  padding: 16px 40px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(255, 107, 129, 0.3);
  margin-bottom: 1.5rem;
}

.chat-now-btn:hover {
  background: #ff5a73;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 107, 129, 0.4);
}

@media (min-width: 768px) {
  .chat-now-btn {
    font-size: 1.3rem;
    padding: 18px 48px;
  }
}

.other-matches-link {
  color: #007bff;
  text-decoration: underline;
  font-size: 0.9rem;
  transition: color 0.3s;
  margin-top: 0.5rem;
}

.other-matches-link:hover {
  color: #0056b3;
}
</style> 