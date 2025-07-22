<template>
  <div class="matches-page">
    <!-- Header -->
    <div class="your-matches-parent">
      <b class="your-matches">Your Matches</b>
      <div class="group-child" />
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Finding your matches...</p>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadMatches" class="retry-button">Try Again</button>
    </div>
    
    <!-- No matches state -->
    <div v-else-if="matches.length === 0" class="no-matches">
      <div class="empty-icon">💔</div>
      <h3>No matches yet</h3>
      <p>Keep answering questions and liking others' answers to find your matches!</p>
    </div>
    
    <!-- Matches list -->
    <MatchesList 
      v-else 
      :matches="matches"
      @card-click="openChat"
    />
    
    <!-- Bottom Navigation Bar -->
    <BottomNavigationBar 
      activeTab="matches" 
      :isFemaleUser="isFemale" 
    />
  </div>
</template>

<script>
import BottomNavigationBar from '@/components/BottomNavigationBar.vue'
import MatchesList from '@/components/Matches/MatchesList.vue'
import { useNavigationStore } from '../stores/navigation.js'
import { APIService } from '../services/APIServices.js'
import { debugLog } from '../utils/debug.js'

export default {
  name: 'Matches',
  components: {
    BottomNavigationBar,
    MatchesList
  },
  data() {
    return {
      matches: [],
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
    isFemale() {
      return this.userInfo && this.userInfo.gender === 1
    }
  },
  async mounted() {
    await this.loadMatches()
  },
  methods: {
    async loadMatches() {
      if (!this.telegramId) {
        this.error = 'No telegram ID available'
        this.isLoading = false
        return
      }

      try {
        this.isLoading = true
        this.error = null
        
        debugLog.log('🔄 Loading matches for telegram ID:', this.telegramId)
        
        const apiService = new APIService()
        
        // Get user info first
        const userInfoResponse = await apiService.getUserInfo(this.telegramId)
        this.userInfo = userInfoResponse
        debugLog.log('✅ User info received:', userInfoResponse)
        
        // Get matched users
        const matchesResponse = await apiService.getMatchedUsers(this.telegramId)
        debugLog.log('✅ Matches received:', matchesResponse)
        
        // Transform telegram_id_list to match objects
        this.matches = matchesResponse.telegram_id_list.map(telegramId => ({
          telegram_id: telegramId,
          last_message: null,
          timestamp: new Date()
        }))
        
      } catch (error) {
        debugLog.error('❌ Failed to load matches:', error)
        this.error = 'Failed to load matches. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    
    openChat(telegramId) {
      // 暂时显示一个提示。在实际应用中，这会打开聊天界面
      debugLog.log('💬 Opening chat with user:', telegramId)
      alert(`Chat with User ${telegramId} - Feature coming soon!`)
    }
  }
}
</script>

<style scoped>
.your-matches-parent {
  padding: 20px;
  text-align: left;
  font-size: 20px;
  color: #fff;
  font-family: Nunito;
  position: relative;
}
.your-matches {
  display: block;
  line-height: 140%;
  margin-bottom: 8px;
}
.group-child {
  border-top: 1px solid #36394a;
  width: 100%;
}
.matches-page {
  background: #000;
  min-height: 100vh;
  color: white;
  padding-bottom: 80px; /* Space for bottom navigation */
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(250, 134, 164, 0.3);
  border-top: 4px solid #fa86a4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: #ccc;
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 40px 20px;
}

.error-message p {
  color: #ff6b6b;
  font-size: 16px;
  margin: 0 0 20px 0;
}

.retry-button {
  background: #fa86a4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #e75a7c;
  transform: translateY(-2px);
}

.no-matches {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-matches h3 {
  color: #fa86a4;
  font-size: 20px;
  margin: 0 0 12px 0;
}

.no-matches p {
  color: #ccc;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}



/* Mobile optimizations */
@media (max-width: 480px) {
  .your-matches-parent {
    padding: 16px;
  }
}
</style>