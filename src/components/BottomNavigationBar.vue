<template>
  <div class="bottom-nav">
    <!-- Match Tab -->
    <div class="nav-item" :class="{ active: activeTab === 'match' }" @click="navigateTo('match')">
      <div class="nav-icon">💬</div>
      <div class="nav-label">Match</div>
    </div>
    <!-- Mate Tab -->
    <div class="nav-item" :class="{ active: activeTab === 'mate' }" @click="navigateTo('mate')">
      <div class="nav-icon">❤️</div>
      <div class="nav-label">Mates</div>
    </div>
    <!-- Profile Tab -->
    <div class="nav-item" :class="{ active: activeTab === 'profile' }" @click="navigateTo('profile')">
      <div class="nav-icon">👤</div>
      <div class="nav-label">Profile</div>
    </div>
  </div>
</template>

<script setup>
// 引入路由
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 计算当前激活tab
const activeTab = (() => {
  if (route.path.startsWith('/mate')) return 'mate'
  if (route.path.startsWith('/profile')) return 'profile'
  return 'match'
})()

// 跳转到对应tab页面
function navigateTo(tab) {
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
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  color: #888;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s;
}
.nav-item.active {
  color: #ff6b81;
  font-weight: bold;
}
.nav-icon {
  font-size: 22px;
  margin-bottom: 2px;
}
</style>