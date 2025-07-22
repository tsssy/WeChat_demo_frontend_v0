<template>
  <div class="home">
    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading...</p>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    
    <!-- Main content area with padding for bottom nav -->
    <div class="main-content">
      <!-- Conditional rendering based on user gender -->
      <MaleCardPoll v-if="isMale" :telegramId="telegramId" />
      <FemaleCardPoll v-else-if="isFemale" :telegramId="telegramId" />
    </div>
    
    <!-- Bottom Navigation Bar -->
    <BottomNavigationBar 
      v-if="!isLoading && !error && userInfo"
      activeTab="home" 
      :isFemaleUser="isFemale" 
    />
  </div>
</template>

<script>
import MaleCardPoll from '@/components/Home/Male/MaleCardPoll.vue'
import FemaleCardPoll from '@/components/Home/Female/FemaleCardPoll.vue'
import BottomNavigationBar from '@/components/BottomNavigationBar.vue'
import { useNavigationStore } from './stores/navigation.js'
import { APIService } from './services/APIServices.js'
import { debugLog } from './utils/debug.js'

export default {
  name: 'Home',
  components: {
    MaleCardPoll,
    FemaleCardPoll,
    BottomNavigationBar
  },
  data() {
    return {
      userInfo: null,
      isLoading: true,
      error: null
    }
  },
  computed: {
    telegramId() {
      const navigationStore = useNavigationStore()
      const entryData = navigationStore.getPageData('entry')
      return entryData.userInfo?.id || null
    },
    isMale() {
      // Gender 2 or 3 represents male users
      return this.userInfo && (this.userInfo.gender === 2 || this.userInfo.gender === 3)
    },
    isFemale() {
      // Gender 1 represents female users
      return this.userInfo && this.userInfo.gender === 1
    }
  },
  async mounted() {
    await this.getUserInfo()
  },
  methods: {
    async getUserInfo() {
      if (!this.telegramId) {
        this.error = 'No telegram ID available'
        this.isLoading = false
        return
      }

      try {
        debugLog.log('🔄 Getting user info for telegram ID:', this.telegramId)
        
        const apiService = new APIService()
        const response = await apiService.getUserInfo(this.telegramId)
        
        debugLog.log('✅ User info received:', response)
        this.userInfo = response
        
      } catch (error) {
        debugLog.error('❌ Failed to get user info:', error)
        this.error = 'Failed to load user information. Please try again.'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
/* Main container - Full screen flex layout */
.home {
  background: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Card container - Takes remaining space, no conflicting height */
.main-content {
  flex: 1;
  position: relative;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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

/* Error state */
.error-message {
  text-align: center;
  color: #ff6b6b;
  font-size: 16px;
  padding: 20px;
}

.error-message p {
  margin: 0;
}
</style>
