import { createRouter, createWebHistory } from 'vue-router'
import Entry from './Entry.vue'
import GenderSelection from './GenderSelection.vue'
import ModeSelection from './ModeSelection.vue'
import Home from './Home.vue'
import APITestPage from './components/APITestPage.vue'
import Matches from './views/Matches.vue'
import YourContent from './views/YourContent.vue'
import Profile from './views/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'Entry',
    component: Entry
  },
  {
    path: '/gender-selection',
    name: 'GenderSelection',
    component: GenderSelection
  },
  {
    path: '/mode-selection',
    name: 'ModeSelection',
    component: ModeSelection
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/api-test',
    name: 'APITest',
    component: APITestPage
  },
  {
    path: '/matches',
    name: 'Matches',
    component: Matches
  },
  {
    path: '/your-content',
    name: 'YourContent',
    component: YourContent
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