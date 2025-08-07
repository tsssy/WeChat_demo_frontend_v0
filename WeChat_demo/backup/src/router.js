import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('./views/Chat.vue')
  },
  {
    path: '/card-game-test',
    name: 'CardGameTest',
    component: () => import('./views/CardGameTest.vue')
  },
  {
    path: '/card-game-result',
    name: 'CardGameResult',
    component: () => import('./views/CardGameResult.vue')
  },
  {
    path: '/debug',
    name: 'Debug',
    component: () => import('./views/Debug.vue')
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('./views/Test.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 