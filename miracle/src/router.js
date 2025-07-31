import { createRouter, createWebHistory } from 'vue-router'
// 新页面骨架组件导入
import Loading from './views/Loading.vue'
import WhyHim from './views/WhyHim.vue'
import Chatroom from './views/Chatroom.vue'
import Match from './views/Match.vue'
import Mate from './views/Mate.vue'
import Profile from './views/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'Loading',
    component: Loading
  },
  {
    path: '/why-him',
    name: 'WhyHim',
    component: WhyHim
  },
  {
    path: '/chatroom',
    name: 'Chatroom',
    component: Chatroom
  },
  {
    path: '/match',
    name: 'Match',
    component: Match
  },
  {
    path: '/mate',
    name: 'Mate',
    component: Mate
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 