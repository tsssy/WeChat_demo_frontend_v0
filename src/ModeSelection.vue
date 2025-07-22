<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HorizontalLogo from './components/HorizontalLogo.vue'
import CommonNextButton from './components/CommonNextButton.vue'
import ModeCard from './components/ModeSelection/ModeCard.vue'
import { useNavigationStore } from './stores/navigation.js'
import { APIService } from './services/APIServices.js'
import { DEBUG, debugLog } from './utils/debug.js'

// Debug the DEBUG value
console.log('DEBUG value in ModeSelection:', DEBUG)
console.log('DEBUG type:', typeof DEBUG)

const router = useRouter()
const navigationStore = useNavigationStore()
const selectedMode = ref('')
const isLoading = ref(false)
const error = ref(null)
const result = ref(null)
const statusMessage = ref('')

const selectMode = (mode) => {
  selectedMode.value = mode
  debugLog.log('Selected mode:', mode)
}

// Test function to verify status message display
const testStatusMessage = () => {
  statusMessage.value = 'Test message - Status display is working!'
  debugLog.log('Test status message set:', statusMessage.value)
}

// Test function to verify API connection
const testApiConnection = async () => {
  try {
    statusMessage.value = 'Testing API connection...'
    debugLog.log('Testing API connection to:', 'https://lovetapoversea.xyz:4433')
    
    const response = await fetch('https://lovetapoversea.xyz:4433/api/v1/users/male_users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        telegram_id: 'test_connection',
        mode: 'friends'
      })
    })
    
    debugLog.log('API test response status:', response.status)
    const data = await response.json()
    debugLog.log('API test response data:', data)
    
    statusMessage.value = JSON.stringify(data)
  } catch (err) {
    debugLog.error('API test failed:', err)
    statusMessage.value = err.message
  }
}

// Navigate to API test page
const goToApiTest = () => {
  debugLog.log('Navigating to API test page')
  router.push('/api-test')
}

const handleNext = async () => {
  if (!selectedMode.value) {
    debugLog.log('Please select a mode first')
    return
  }

  // Debug: Show all store data
  debugLog.log('All navigation store data:', navigationStore.pageData)

  // Get user data from navigation store (from mode-selection page data)
  const modeSelectionData = navigationStore.getPageData('mode-selection')
  debugLog.log('Mode selection data from store:', modeSelectionData)
  
  const userInfo = modeSelectionData.userInfo
  const userGender = modeSelectionData.gender
  const telegramId = modeSelectionData.telegramId
  
  debugLog.log('User info from store:', userInfo)
  debugLog.log('User gender from store:', userGender)
  debugLog.log('Telegram ID from store:', telegramId)

  if (!userInfo || !userInfo.id) {
    debugLog.error('No user info available from previous steps')
    debugLog.log('Available store data:', navigationStore.pageData)
    statusMessage.value = 'No user information available. Please restart the app.'
    return
  }

  isLoading.value = true
  error.value = null
  result.value = null
  statusMessage.value = 'Creating user...'
  debugLog.log('Status message set:', statusMessage.value)

  try {
    // Initialize APIService
    const apiService = new APIService()
    
    let response
    
    if (userGender === 1) {
      // Female user - create female user
      debugLog.log('👩 Creating female user with telegramId:', telegramId, 'username:', userInfo.username, 'mode:', selectedMode.value)
      response = await apiService.createFemaleUser(telegramId, userInfo.username, selectedMode.value)
    } else if (userGender === 2 || userGender === 3) {
      // Male user - create male user
      debugLog.log('👨 Creating male user with telegramId:', telegramId, 'username:', userInfo.username, 'mode:', selectedMode.value)
      response = await apiService.createMaleUser(telegramId, userInfo.username, selectedMode.value)
    } else {
      throw new Error('Invalid gender value: ' + userGender)
    }

    debugLog.log('✅ User created successfully!')
    debugLog.log('Response object:', response)
    debugLog.log('Response type:', typeof response)
    debugLog.log('Response keys:', Object.keys(response))
    
    // Store the result to display
    result.value = response
    
    // Show success message
    statusMessage.value = 'User created successfully! Redirecting...'
    debugLog.log('Status message updated with success:', statusMessage.value)
    
    // Step 2: After user creation success, route to Home.vue
    setTimeout(() => {
      router.push('/home')
    }, 1000) // Small delay to show success message
    
  } catch (err) {
    debugLog.error('❌ Failed to create user:', err)
    debugLog.log('Error details:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack
    })
    debugLog.log('Error type:', typeof err)
    debugLog.log('Error constructor:', err.constructor.name)
    
    // Show error message
    statusMessage.value = `Error: ${err.message}`
    debugLog.log('Status message updated with error:', statusMessage.value)
  } finally {
    isLoading.value = false
    debugLog.log('Request completed, loading set to false')
  }
}
</script>

<template>
  <div class="mode-selection">
    <!-- Status message display -->
    <div v-if="statusMessage" class="status-message">
      {{ statusMessage }}
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <div>Creating your account...</div>
    </div>

    <div class="logo-container">
      <HorizontalLogo />
    </div>
    
    <div class="welcome-text-container">
      <h1 class="welcomeToLovelush">I'm looking for?</h1>
    </div>
    
    <div class="title-container">
      <h2 class="title">Enhance your experience by tell us your goals</h2>
    </div>
    
    <!-- User Info Display (Debug Mode) -->
    <div v-if="DEBUG" class="user-info-debug">
      <div class="debug-section">
        <h3>User Info:</h3>
        <p>ID: {{ navigationStore.getPageData('mode-selection')?.userInfo?.id }}</p>
        <p>Name: {{ navigationStore.getPageData('mode-selection')?.userInfo?.first_name }} {{ navigationStore.getPageData('mode-selection')?.userInfo?.last_name }}</p>
        <p>Username: @{{ navigationStore.getPageData('mode-selection')?.userInfo?.username }}</p>
        <p>Gender: {{ navigationStore.getPageData('mode-selection')?.gender === 1 ? 'Female' : 'Male' }}</p>
        <p>Selected Mode: {{ selectedMode || 'None' }}</p>
      </div>
    </div>
    
    <div class="mode-options-container">
      <div class="mode-options">
        <div 
          class="mode-card-wrapper"
          @click="selectMode(1)"
        >
          <ModeCard 
            text="Friends"
            emoji="💕"
            :selected="selectedMode === 1"
          />
        </div>
        
        <div 
          class="mode-card-wrapper"
          @click="selectMode(2)"
        >
          <ModeCard 
            text="Short-term relationship"
            emoji="👫"
            :selected="selectedMode === 2"
          />
        </div>
        
        <div 
          class="mode-card-wrapper"
          @click="selectMode(3)"
        >
          <ModeCard 
            text="Long-term Relationship"
            emoji="🤩"
            :selected="selectedMode === 3"
          />
        </div>
      </div>
    </div>
    


    <!-- Test buttons for debugging - only show in debug mode -->
    <div v-if="DEBUG" style="position: absolute; top: 50%; right: 1rem; z-index: 10000; display: flex; flex-direction: column; gap: 0.5rem;">
      <div style="background: #333; color: #00ff00; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; text-align: center; margin-bottom: 0.5rem;">
        DEBUG MODE ({{ DEBUG }})
      </div>
      <button @click="testStatusMessage" style="background: red; color: white; padding: 0.5rem; border: none; border-radius: 4px;">
        Test Status
      </button>
      <button @click="testApiConnection" style="background: blue; color: white; padding: 0.5rem; border: none; border-radius: 4px;">
        Test API
      </button>
      <button @click="goToApiTest" style="background: #28a745; color: white; padding: 0.5rem; border: none; border-radius: 4px;">
        🔧 API Test
      </button>
    </div>
    
    <!-- Debug info display -->
    <div v-if="DEBUG" style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,0,0,0.8); color: white; padding: 0.5rem; border-radius: 4px; font-size: 0.75rem;">
      DEBUG: {{ DEBUG }}
    </div>

    <div class="next-button-container">
      <div 
        class="next-button-wrapper"
        :class="{ disabled: !selectedMode || isLoading }"
        @click="handleNext"
      >
        <CommonNextButton />
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.mode-selection {
  background: #000;
  height: 100vh;
  width: 100%;
  color: white;
  font-family: Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

/* Logo - The pivot point */
.logo-container {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.logo-container img {
  width: 200px;
  height: auto;
  object-fit: contain;
}

/* Welcome text - positioned relative to logo */
.welcome-text-container {
  position: absolute;
  top: 8rem;
  left: 50%;
  transform: translateX(-50%);
}

.welcomeToLovelush {
  font-size: 2rem;
  line-height: 140%;
  font-family: Nunito, sans-serif;
  color: #fa86a4;
  text-align: center;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

/* Title - positioned relative to welcome text */
.title-container {
  position: absolute;
  top: 11rem;
  left: 50%;
  transform: translateX(-50%);
}

.title {
  font-size: 1rem;
  line-height: 160%;
  font-family: Nunito, sans-serif;
  color: #fff;
  text-align: center;
  font-weight: 400;
  margin: 0;
  white-space: nowrap;
}

/* Mode options - positioned relative to title */
.mode-options-container {
  position: absolute;
  top: 15rem;
  left: 50%;
  transform: translateX(-50%);
  /* 移除高度限制和滚动，让内容自然显示 */
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.mode-card-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
}

/* Next button - 调整位置避免与模式选择按钮重叠 */
.next-button-container {
  position: absolute;
  bottom: 2rem; /* 改为固定距离底部2rem，而不是百分比 */
  left: 50%;
  transform: translateX(-50%);
}

.next-button-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 100px;
  padding: 0.5rem;
}

.next-button-wrapper:hover {
  transform: scale(1.05);
}

/* Status Message Styles */
.status-message {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  z-index: 9999;
  max-width: 90%;
  word-wrap: break-word;
  animation: fadeIn 0.3s ease-out;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Error and Loading Styles */
.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ff4444;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  max-width: 80%;
  z-index: 1000;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-align: center;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fa86a4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.next-button-wrapper.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-button-wrapper.disabled:hover {
  transform: none;
}

/* User Info Debug Styles */
.user-info-debug {
  position: absolute;
  top: 14rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  max-width: 200px;
  z-index: 1000;
}

.debug-section h3 {
  margin: 0 0 0.5rem 0;
  color: #fa86a4;
  font-size: 0.8rem;
}

.debug-section p {
  margin: 0.25rem 0;
  font-size: 0.7rem;
  color: #ccc;
}

/* 响应式设计 - 针对手机端优化 */
@media (max-width: 768px) {
  /* 调整欢迎文本大小 */
  .welcomeToLovelush {
    font-size: 1.5rem;
  }
  
  /* 调整标题大小 */
  .title {
    font-size: 0.9rem;
  }
  
  /* 调整模式选择区域位置 */
  .mode-options-container {
    top: 13rem;
    /* 移除高度限制，避免出现滚动条 */
  }
  
  /* 调整Next按钮位置，确保不重叠 */
  .next-button-container {
    bottom: 3rem;
  }
  
  /* 调整logo大小 */
  .logo-container img {
    width: 150px;
  }
}

/* 针对更小屏幕的额外优化 */
@media (max-height: 700px) {
  .welcome-text-container {
    top: 6rem;
  }
  
  .title-container {
    top: 9rem;
  }
  
  .mode-options-container {
    top: 12rem;
    /* 移除高度限制，避免出现滚动条 */
  }
  
  .next-button-container {
    bottom: 1rem;
  }
}
</style>