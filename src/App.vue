<script setup>
// 引入底部导航栏骨架组件
import BottomNavigationBar from './components/BottomNavigationBar.vue'
</script>

<template>
  <div class="app-container">
    <!-- 路由页面内容 -->
    <router-view />
    <!-- 全局底部导航栏骨架 -->
    <BottomNavigationBar />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background: #fff;
  position: relative;
  padding-bottom: 64px; /* 给底部导航栏预留空间 */
}
</style>
