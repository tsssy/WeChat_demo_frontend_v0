<script setup>
// 引入底部导航栏骨架组件
import BottomNavigationBar from './components/BottomNavigationBar.vue'
import DebugPanel from './components/DebugPanel.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useUserStore } from './stores/user.js'
import { debugLog, devHelpers } from './utils/debug.js'

const route = useRoute()
const userStore = useUserStore()

// 计算是否显示底部导航栏
const showBottomNav = computed(() => {
  // Loading, WhyHim 和 Chatroom 页面不显示底部导航栏
  return route.name !== 'Loading' && route.name !== 'WhyHim' && route.name !== 'Chatroom'
})

// 在应用启动时初始化用户
onMounted(async () => {
  try {
    debugLog.log('应用启动 - 开始初始化...')
    devHelpers.time('应用启动')
    
    await userStore.initUser()
    
    debugLog.log('应用启动 - 用户初始化完成:', userStore.userId)
    devHelpers.timeEnd('应用启动')
    devHelpers.showMemory()
    
  } catch (error) {
    debugLog.error('应用启动 - 用户初始化失败:', error)
  }
})
</script>

<template>
  <div class="app-container">
    <!-- 路由页面内容 -->
    <router-view />
    <!-- 全局底部导航栏骨架 - 仅在非Loading页面显示 -->
    <BottomNavigationBar v-if="showBottomNav" />
    <!-- 开发调试面板 -->
    <DebugPanel />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background: #fff;
  position: relative;
}
</style>
