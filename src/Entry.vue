<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNavigationStore } from './stores/navigation.js'
import { APIService } from './services/APIServices.js'
import { DEBUG, debugLog } from './utils/debug.js'
import Toast from './components/Toast.vue'

const router = useRouter()
const navigationStore = useNavigationStore()
const apiService = new APIService()

// Reactive data
const title = ref('Telegram Mini App User Info')
const userInfo = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)
// Use global DEBUG variable instead of local debug toggle
const debug = ref(DEBUG) // Debug toggle - controlled by global DEBUG

// Toast ref
const toastRef = ref(null)

// Computed properties for window object access
const windowAvailable = computed(() => typeof window !== 'undefined')
const telegramAvailable = computed(() => windowAvailable.value && !!window.Telegram)
const webAppAvailable = computed(() => telegramAvailable.value && !!window.Telegram.WebApp)

// Methods
const getTelegramUserInfo = () => {
  try {
    debugLog.log('Checking Telegram WebApp availability...')
    debugLog.log('Window object:', typeof window !== 'undefined')
    
    if (typeof window !== 'undefined') {
      debugLog.log('Telegram object:', !!window.Telegram)
      debugLog.log('WebApp object:', !!(window.Telegram && window.Telegram.WebApp))
    }
    
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp
      debugLog.log('WebApp object found:', webApp)
      
      // Initialize the WebApp
      webApp.ready()
      debugLog.log('WebApp ready() called')
      
      // Get user information
      const user = webApp.initDataUnsafe?.user
      debugLog.log('User data:', user)
      
      if (user) {
        userInfo.value = user
        debugLog.log('Telegram User Info:', user)
        
        // Store user info in navigation store for later use
        navigationStore.navigateTo('entry', { userInfo: user })
        
        // Start the API flow
        handleUserFlow(user.id)
      } else {
        debugLog.log('No user data found in initDataUnsafe, using placeholder')
        
        // Create placeholder user info with non_telegram_tester
        const placeholderUser = {
          id: 9168168168,
          first_name: 'Test',
          last_name: 'User',
          username: 'test_user',
          language_code: 'en',
          is_premium: false
        }
        
        userInfo.value = placeholderUser
        debugLog.log('Using placeholder user info:', placeholderUser)
        
        // Store placeholder user info in navigation store
        navigationStore.navigateTo('entry', { userInfo: placeholderUser })
        
        // Start the API flow with placeholder user
        handleUserFlow(placeholderUser.id)
      }
      
      // Get additional WebApp info
      const webAppInfo = {
        platform: webApp.platform,
        version: webApp.version,
        colorScheme: webApp.colorScheme,
        themeParams: webApp.themeParams,
        initData: webApp.initData,
        initDataUnsafe: webApp.initDataUnsafe
      }
      debugLog.log('WebApp Info:', webAppInfo)
      
    } else {
      errorMessage.value = 'Telegram WebApp API not available. This app should be run within Telegram.'
      debugLog.log('Telegram WebApp not found')
    }
  } catch (error) {
    debugLog.error('Error getting Telegram user info:', error)
    errorMessage.value = 'Error accessing Telegram user information: ' + error.message
  }
}

// Handle the user flow based on gender
const handleUserFlow = async (telegramId) => {
  try {
    isLoading.value = true
    debugLog.log('🔄 Starting user flow for telegram ID:', telegramId)
    
    // Step 1: Check if user already exists (PRIORITY CHECK)
    const userExistResponse = await apiService.getUserExist(telegramId)
    debugLog.log('🔍 User exist response:', userExistResponse)
    
    if (userExistResponse.success) {
      // User already exists - go directly to home
      debugLog.log('✅ User already exists, proceeding to home')
      navigationStore.navigateTo('home')
      router.push('/home')
      return
    }
    
    // Step 2: Get user gender from telegram session (only if user doesn't exist)
    const genderResponse = await apiService.getUserFromTelegramSession(telegramId)
    debugLog.log('📊 Gender response:', genderResponse)
    
    const userGender = genderResponse.gender
    debugLog.log('👤 User gender:', userGender)
    
    // Store user info and gender in navigation store for ModeSelection
    const userData = {
      userInfo: userInfo.value,
      gender: userGender,
      telegramId: telegramId
    }
    
    // Navigate to mode selection with all user data
    debugLog.log('📋 Storing user data for mode selection:', userData)
    navigationStore.navigateTo('mode-selection', userData)
    router.push('/mode-selection')
    
  } catch (error) {
    debugLog.error('❌ Error in user flow:', error)
    toastRef.value?.show('An error occurred. Please try again.', 'error')
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Delay execution to ensure Telegram script is loaded
  setTimeout(() => {
    getTelegramUserInfo()
  }, 100)
})
</script>

<template>
  <div class="black-bg">
    <img class="logo" src="/media/logos/pink_logo.png" alt="Logo" />
    
    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading...</p>
    </div>
    
    <div class="debug-container" v-if="debug">
      <h1 class="title">{{ title }}</h1>
      
      <!-- User Information Display -->
      <div class="user-info" v-if="userInfo">
        <h2 class="section-title">User Information:</h2>
        <div class="info-item">
          <span class="label">User ID:</span>
          <span class="value">{{ userInfo.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">First Name:</span>
          <span class="value">{{ userInfo.first_name }}</span>
        </div>
        <div class="info-item" v-if="userInfo.last_name">
          <span class="label">Last Name:</span>
          <span class="value">{{ userInfo.last_name }}</span>
        </div>
        <div class="info-item" v-if="userInfo.username">
          <span class="label">Username:</span>
          <span class="value">@{{ userInfo.username }}</span>
        </div>
        <div class="info-item" v-if="userInfo.language_code">
          <span class="label">Language:</span>
          <span class="value">{{ userInfo.language_code }}</span>
        </div>
        <div class="info-item" v-if="userInfo.is_premium">
          <span class="label">Premium User:</span>
          <span class="value">Yes</span>
        </div>
      </div>
      
      <div class="error-message" v-if="errorMessage">
        <span>{{ errorMessage }}</span>
      </div>
      
      <!-- Debug Information -->
      <div class="debug-info">
        <h2 class="section-title">Debug Information:</h2>
        <div class="info-item">
          <span class="label">Window Object:</span>
          <span class="value">{{ windowAvailable ? 'Available' : 'Not Available' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Telegram Object:</span>
          <span class="value">{{ telegramAvailable ? 'Available' : 'Not Available' }}</span>
        </div>
        <div class="info-item">
          <span class="label">WebApp Object:</span>
          <span class="value">{{ webAppAvailable ? 'Available' : 'Not Available' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Loading State:</span>
          <span class="value">{{ isLoading ? 'Loading...' : 'Idle' }}</span>
        </div>
      </div>
    </div>
    
    <!-- Toast component -->
    <Toast ref="toastRef" />
  </div>
</template>

<style>
.black-bg {
  background: #000;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: Arial, sans-serif;
}

.logo {
  max-width: 200px;
  width: 100%;
  height: auto;
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  color: #fff;
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.debug-container {
  text-align: center;
  max-width: 600px;
  padding: 20px;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #fff;
}

.section-title {
  font-size: 18px;
  margin: 20px 0 10px 0;
  color: #fff;
}

.user-info, .debug-info {
  margin: 20px 0;
  text-align: left;
}

.info-item {
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.label {
  font-weight: bold;
  color: #ccc;
  margin-right: 10px;
}

.value {
  color: #fff;
}

.error-message {
  color: #ff6b6b;
  margin: 20px 0;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 5px;
}
</style>