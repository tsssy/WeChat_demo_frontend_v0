import { defineStore } from 'pinia'

// 用户状态管理
export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    user: null,
    // 登录状态
    isLoggedIn: false,
    // 用户token
    token: null
  }),
  
  getters: {
    // 获取用户信息
    getUser: (state) => state.user,
    // 获取登录状态
    getLoginStatus: (state) => state.isLoggedIn,
    // 获取token
    getToken: (state) => state.token
  },
  
  actions: {
    // 设置用户信息
    setUser(user) {
      this.user = user
      this.isLoggedIn = true
    },
    
    // 设置token
    setToken(token) {
      this.token = token
    },
    
    // 登出
    logout() {
      this.user = null
      this.isLoggedIn = false
      this.token = null
    }
  }
}) 