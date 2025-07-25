<template>
  <div class="bottom-nav">
    <!-- Match Tab -->
    <div class="nav-item" :class="{ active: activeTab === 'match' }" @click="navigateTo('match')">
      <div class="nav-icon">
        <img src="/media/navigation_bar/Matches.svg" alt="Match" class="nav-svg" />
      </div>
      <div class="nav-label">Match</div>
    </div>
    <!-- Mate Tab -->
    <div class="nav-item" :class="{ active: activeTab === 'mate' }" @click="navigateTo('mate')">
      <div class="nav-icon-container">
        <div class="nav-icon">
          <img src="/media/navigation_bar/Mates.svg" alt="Mates" class="nav-svg" />
        </div>
        <!-- Mates按钮红点 -->
        <div v-if="hasMatesRedDot" class="mates-red-dot"></div>
      </div>
      <div class="nav-label">Mates</div>
    </div>
    <!-- Profile Tab -->
    <div class="nav-item" :class="{ active: activeTab === 'profile' }" @click="navigateTo('profile')">
      <div class="nav-icon">
        <img src="/media/navigation_bar/Profile.svg" alt="Profile" class="nav-svg" />
      </div>
      <div class="nav-label">Profile</div>
    </div>
  </div>
</template>

<script setup>
// 引入路由
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import eventBus from '@/utils/eventBus.js'

const router = useRouter()
const route = useRoute()
const hasMatesRedDot = ref(false)

// 计算当前激活tab - 使用computed让它变为reactive
const activeTab = computed(() => {
  if (route.path.startsWith('/mate')) return 'mate'
  if (route.path.startsWith('/profile')) return 'profile'
  if (route.path.startsWith('/match')) return 'match'
  return null
})

// 跳转到对应tab页面
function navigateTo(tab) {
  // 如果点击的是Mates按钮，清除红点
  if (tab === 'mate') {
    hasMatesRedDot.value = false
  }
  
  switch (tab) {
    case 'match':
      router.push('/match')
      break
    case 'mate':
      router.push('/mate')
      break
    case 'profile':
      router.push('/profile')
      break
  }
}

// 显示Mates按钮红点
function showMatesRedDot() {
  hasMatesRedDot.value = true
  console.log('Mates按钮显示红点')
}

// 隐藏Mates按钮红点
function hideMatesRedDot() {
  hasMatesRedDot.value = false
  console.log('Mates按钮隐藏红点')
}

onMounted(() => {
  // 监听Mates红点事件
  eventBus.on('show-mates-red-dot', showMatesRedDot)
  eventBus.on('hide-mates-red-dot', hideMatesRedDot)
})

onUnmounted(() => {
  // 清理事件监听
  eventBus.off('show-mates-red-dot', showMatesRedDot)
  eventBus.off('hide-mates-red-dot', hideMatesRedDot)
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-around;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  height: calc(80px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}

@media (min-width: 768px) {
  .bottom-nav {
    left: 50%;
    transform: translateX(-50%);
    width: 430px;
    border-radius: 0 0 12px 12px;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
  }
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  padding: 8px 4px;
  border-radius: 12px;
  margin: 0 4px;
  position: relative;
}

@media (min-width: 768px) {
  .nav-item {
    font-size: 14px;
    padding: 10px 6px;
  }
}

.nav-item.active {
  color: #ff6b81;
  font-weight: bold;
  background: rgba(255, 107, 129, 0.1);
  transform: translateY(-2px);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #ff6b81;
  border-radius: 0 0 3px 3px;
}

.nav-item:hover:not(.active) {
  color: #666;
  background: rgba(0, 0, 0, 0.05);
}
.nav-icon {
  font-size: 20px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .nav-icon {
    font-size: 22px;
  }
}

/* SVG图标样式 */
.nav-svg {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .nav-svg {
    width: 26px;
    height: 26px;
  }
}



/* Mates按钮红点样式 */
.nav-icon-container {
  position: relative;
  display: inline-block;
}

.mates-red-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ff4757;
  border-radius: 50%;
  border: 1px solid #fff;
  z-index: 10;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

</style>