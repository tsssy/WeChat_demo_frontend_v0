<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="your-matches-parent">
      <b class="your-matches">Your Profile</b>
      <div class="group-child" />
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your profile...</p>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadProfile" class="retry-button">Try Again</button>
    </div>
    
    <!-- Profile content -->
    <div v-else class="profile-container">
      <!-- Profile Header Card -->
      <div class="profile-header-card">
        <div class="profile-avatar">
          <div class="avatar-large">
            {{ getInitials() }}
          </div>
          <div class="avatar-badge">
            {{ genderEmoji }}
          </div>
        </div>
        
        <div class="profile-basic-info">
          <h2 class="profile-name">{{ userInfo?.first_name || 'User' }}</h2>
          <p class="profile-id">ID: {{ telegramId }}</p>
          <div class="profile-mode">
            <span class="mode-badge">{{ getModeText() }}</span>
          </div>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-number">{{ stats.questions }}</div>
          <div class="stat-label">{{ isFemale ? 'Questions' : 'Answers' }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💕</div>
          <div class="stat-number">{{ stats.matches }}</div>
          <div class="stat-label">Matches</div>
        </div>
        
        <!-- 只对男性用户显示Saved统计 -->
        <div v-if="!isFemale" class="stat-card">
          <div class="stat-icon">💾</div>
          <div class="stat-number">{{ stats.saved }}</div>
          <div class="stat-label">Saved</div>
        </div>
      </div>
      
      <!-- Profile Details -->
      <div class="profile-details">
        <div class="detail-section">
          <h3 class="section-title">Account Information</h3>
          
          <div class="detail-item">
            <div class="detail-label">Gender</div>
            <div class="detail-value">
              {{ getGenderText() }}
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">Looking for</div>
            <div class="detail-value">{{ getModeText() }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">Profile Photo</div>
            <div class="detail-value">{{ userInfo?.profile_photo || 'None' }}</div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3 class="section-title">Activity Summary</h3>
          
          <div class="detail-item">
            <div class="detail-label">{{ isFemale ? 'Questions Created' : 'Answers Given' }}</div>
            <div class="detail-value">{{ stats.questions }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">Paired Users</div>
            <div class="detail-value">{{ userInfo?.paired_user?.length || 0 }}</div>
          </div>
          
          <!-- 只对男性用户显示Saved统计 -->
          <div v-if="!isFemale" class="detail-item">
            <div class="detail-label">Saved Questions</div>
            <div class="detail-value">{{ stats.saved }}</div>
          </div>
        </div>
        
        <!-- Actions Section -->
        <div class="detail-section">
          <h3 class="section-title">Actions</h3>
          
          <div class="action-buttons">
            <button @click="editProfile" class="action-button primary">
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Navigation Bar -->
    <BottomNavigationBar 
      activeTab="profile" 
      :isFemaleUser="isFemale" 
    />
  </div>
</template>

<script>
import BottomNavigationBar from '@/components/BottomNavigationBar.vue'
import { useNavigationStore } from '../stores/navigation.js'
import { APIService } from '../services/APIServices.js'
import { debugLog } from '../utils/debug.js'

export default {
  name: 'Profile',
  components: {
    BottomNavigationBar
  },
  data() {
    return {
      userInfo: null,
      stats: {
        questions: 0,
        matches: 0,
        saved: 0
      },
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
    },
    genderEmoji() {
      if (this.isFemale) return '👩'
      return '👨'
    }
  },
  async mounted() {
    await this.loadProfile()
  },
  methods: {
    async loadProfile() {
      if (!this.telegramId) {
        this.error = 'No telegram ID available'
        this.isLoading = false
        return
      }

      try {
        this.isLoading = true
        this.error = null
        
        debugLog.log('🔄 Loading profile for telegram ID:', this.telegramId)
        
        const apiService = new APIService()
        
        // Get user info
        const userInfoResponse = await apiService.getUserInfo(this.telegramId)
        this.userInfo = userInfoResponse
        debugLog.log('✅ User info received:', userInfoResponse)
        
        // Calculate stats from user info
        this.stats = {
          questions: this.userInfo.question_list?.length || this.userInfo.answer_list?.length || 0,
          matches: this.userInfo.paired_user?.length || 0,
          saved: this.userInfo.saved_list_question?.length || this.userInfo.saved_list_answer?.length || 0
        }
        
        // Get additional data from entry store for display name
        const navigationStore = useNavigationStore()
        const entryData = navigationStore.getPageData('entry')
        if (entryData.userInfo) {
          this.userInfo.first_name = entryData.userInfo.first_name || this.userInfo.first_name
          this.userInfo.last_name = entryData.userInfo.last_name || this.userInfo.last_name
        }
        
      } catch (error) {
        debugLog.error('❌ Failed to load profile:', error)
        this.error = 'Failed to load profile. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    
    getInitials() {
      if (this.userInfo?.first_name) {
        const firstName = this.userInfo.first_name.charAt(0).toUpperCase()
        const lastName = this.userInfo?.last_name?.charAt(0).toUpperCase() || ''
        return firstName + lastName
      }
      // Fallback to telegram ID
      const idStr = this.telegramId?.toString() || '00'
      return idStr.slice(-2).toUpperCase()
    },
    
    getGenderText() {
      if (!this.userInfo) return 'Unknown'
      
      switch (this.userInfo.gender) {
        case 1: return 'Female'
        case 2: return 'Male'
        case 3: return 'Male'
        default: return 'Unknown'
      }
    },
    
    getModeText() {
      if (!this.userInfo?.mode) return 'Not set'
      
      switch (this.userInfo.mode) {
        case 1: return 'Friends'
        case 2: return 'Short-term relationship'
        case 3: return 'Long-term relationship'
        default: return 'Not set'
      }
    },
    
    editProfile() {
      // For now, show alert. In real app, this would open edit modal
      debugLog.log('📝 Edit profile clicked')
      alert('Edit Profile feature coming soon!')
    },
    
    viewSettings() {
      debugLog.log('⚙️ Settings clicked')
      alert('Settings feature coming soon!')
    },
    
    showHelp() {
      debugLog.log('❓ Help clicked')
      alert('Help & Support:\n\n• Swipe right to like answers\n• Swipe left to dismiss\n• Create questions to engage others\n• Check matches to start conversations')
    },
    
    logout() {
      debugLog.log('🚪 Logout clicked')
      if (confirm('Are you sure you want to logout?')) {
        // Clear navigation store and redirect to entry
        const navigationStore = useNavigationStore()
        navigationStore.clearAll()
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  background: #000;
  min-height: 100vh;
  color: white;
  padding-bottom: 80px; /* Space for bottom navigation */
}

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

.profile-container {
  padding: 20px;
}

.profile-header-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid #333;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.profile-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fa86a4, #e75a7c);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 24px;
  color: white;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.profile-basic-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.profile-id {
  font-size: 14px;
  color: #999;
  margin: 0 0 8px 0;
}

.mode-badge {
  background: rgba(250, 134, 164, 0.2);
  color: #fa86a4;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 16px 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #2a2a2a;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 20px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #fa86a4;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #ccc;
  font-weight: 500;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 20px;
}

.section-title {
  color: #fa86a4;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #ccc;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: white;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.primary {
  background: #fa86a4;
  color: white;
}

.action-button.primary:hover {
  background: #e75a7c;
  transform: translateY(-2px);
}

.action-button.secondary {
  background: transparent;
  color: #ccc;
  border: 1px solid #333;
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.action-button.danger {
  background: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.action-button.danger:hover {
  background: rgba(255, 107, 107, 0.1);
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .your-matches-parent {
    padding: 16px;
  }
  
  .profile-container {
    padding: 16px;
  }
  
  .profile-header-card {
    padding: 20px;
    gap: 16px;
  }
  
  .avatar-large {
    width: 70px;
    height: 70px;
    font-size: 20px;
  }
  
  .avatar-badge {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
  
  .profile-name {
    font-size: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .stat-card {
    padding: 12px 6px;
  }
  
  .stat-icon {
    font-size: 18px;
  }
  
  .stat-number {
    font-size: 16px;
  }
  
  .detail-section {
    padding: 16px;
  }
}
</style>