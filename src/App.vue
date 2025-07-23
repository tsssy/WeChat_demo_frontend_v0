<script setup>
// 引入底部导航栏骨架组件
import BottomNavigationBar from './components/BottomNavigationBar.vue'
import DebugPanel from './components/DebugPanel.vue'
import Toast from './components/Toast.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUserStore } from './stores/user.js'
import { debugLog, devHelpers } from './utils/debug.js'
import eventBus from './utils/eventBus.js'

const route = useRoute()
const userStore = useUserStore()
const toastRef = ref(null)

// 计算是否显示底部导航栏
const showBottomNav = computed(() => {
  // Loading, WhyHim 和 Chatroom 页面不显示底部导航栏
  return route.name !== 'Loading' && route.name !== 'WhyHim' && route.name !== 'Chatroom'
})

// 处理liked match的Toast通知
function handleLikedMatchToast(data) {
  if (toastRef.value) {
    toastRef.value.show(data.message, 'info', 4000)
    console.log('显示liked match Toast:', data.message)
  }
}

// 在应用启动时初始化用户
onMounted(async () => {
  try {
    debugLog.log('应用启动 - 开始初始化...')
    devHelpers.time('应用启动')
    
    await userStore.initUser()
    
    // 全局暴露userStore和eventBus供管理器使用
    window.userStore = userStore
    window.eventBus = eventBus
    
    debugLog.log('应用启动 - 用户初始化完成:', userStore.user_id)
    devHelpers.timeEnd('应用启动')
    devHelpers.showMemory()
    
  } catch (error) {
    debugLog.error('应用启动 - 用户初始化失败:', error)
  }
  
  // 监听liked match Toast事件
  eventBus.on('show-liked-match-toast', handleLikedMatchToast)
})

onUnmounted(() => {
  // 清理事件监听
  eventBus.off('show-liked-match-toast', handleLikedMatchToast)
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
    <!-- 全局Toast组件 -->
    <Toast ref="toastRef" />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background: #fff;
  position: relative;
}
</style>
