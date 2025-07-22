<script setup>
// 引入底部导航栏骨架组件
import BottomNavigationBar from './components/BottomNavigationBar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 计算是否显示底部导航栏
const showBottomNav = computed(() => {
  // Loading 页面不显示底部导航栏
  return route.name !== 'Loading'
})
</script>

<template>
  <div class="app-container">
    <!-- 路由页面内容 -->
    <router-view />
    <!-- 全局底部导航栏骨架 - 仅在非Loading页面显示 -->
    <BottomNavigationBar v-if="showBottomNav" />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background: #fff;
  position: relative;
}
</style>
