<template>
  <div class="bottom-nav">
    <div class="nav-item" :class="{ active: activeTab === 'home' }" @click="navigateTo('home')">
      <div class="nav-icon">🏠</div>
      <div class="nav-label">Home</div>
    </div>
    
    <div class="nav-item" :class="{ active: activeTab === 'matches' }" @click="navigateTo('matches')">
      <div class="nav-icon">💕</div>
      <div class="nav-label">Matches</div>
    </div>
    
    <div class="nav-item" :class="{ active: activeTab === 'answers' }" @click="navigateTo('answers')">
      <div class="nav-icon">📝</div>
      <div class="nav-label">{{ isFemaleUser ? 'Your Questions' : 'Your Answers' }}</div>
    </div>
    
    <div class="nav-item" :class="{ active: activeTab === 'profile' }" @click="navigateTo('profile')">
      <div class="nav-icon">👤</div>
      <div class="nav-label">Profile</div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'BottomNavigationBar',
  props: {
    activeTab: {
      type: String,
      default: 'home'
    },
    isFemaleUser: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const router = useRouter()
    
    const navigateTo = (tab) => {
      let route = ''
      switch (tab) {
        case 'home':
          route = '/home'
          break
        case 'matches':
          route = '/matches'
          break
        case 'answers':
          route = '/your-content'
          break
        case 'profile':
          route = '/profile'
          break
      }
      
      if (route) {
        router.push(route)
      }
    }
    
    return {
      navigateTo
    }
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-around;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 12px;
  min-width: 70px;
}

.nav-item:hover {
  background: rgba(250, 134, 164, 0.1);
  transform: translateY(-2px);
}

.nav-item.active {
  background: rgba(250, 134, 164, 0.2);
  transform: translateY(-2px);
}

.nav-item.active .nav-icon {
  transform: scale(1.2);
}

.nav-item.active .nav-label {
  color: #fa86a4;
  font-weight: 600;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
  transition: transform 0.3s ease;
}

.nav-label {
  font-size: 10px;
  color: #ccc;
  text-align: center;
  font-weight: 400;
  transition: all 0.3s ease;
  line-height: 1.2;
}

/* Global style removed - handled by individual pages */

/* Responsive adjustments for very small screens */
@media (max-width: 360px) {
  .nav-label {
    font-size: 9px;
  }
  
  .nav-icon {
    font-size: 18px;
  }
  
  .nav-item {
    min-width: 60px;
    padding: 6px 8px;
  }
}
</style>