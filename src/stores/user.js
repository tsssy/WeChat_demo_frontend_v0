import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTelegramUser, initTelegramWebApp } from '../utils/telegramUser.js'
import { debugLog, devHelpers } from '../utils/debug.js'

export const useUserStore = defineStore('user', () => {
  // 用户状态
  const currentUser = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // 计算属性
  const userId = computed(() => currentUser.value?.user_id || null)
  const userName = computed(() => currentUser.value?.telegram_user_name || null)
  const userGender = computed(() => currentUser.value?.gender || null)
  const userAge = computed(() => currentUser.value?.age || null)
  const targetGender = computed(() => currentUser.value?.target_gender || null)
  const userSummary = computed(() => currentUser.value?.summary || null)
  const matchIds = computed(() => currentUser.value?.match_ids || [])

  // 是否有用户信息
  const hasUser = computed(() => !!currentUser.value)
  
  // 是否完成基础设置 (性别、年龄、目标性别)
  const hasBasicProfile = computed(() => {
    return !!(currentUser.value?.gender && 
              currentUser.value?.age && 
              currentUser.value?.target_gender)
  })

  /**
   * 初始化用户信息
   */
  const initUser = async () => {
    if (isInitialized.value) {
      debugLog.user('用户已初始化，返回现有用户:', currentUser.value?.user_id)
      return currentUser.value
    }

    try {
      isLoading.value = true
      devHelpers.time('用户初始化')
      
      debugLog.user('开始初始化用户...')
      
      // 初始化Telegram WebApp
      const webApp = initTelegramWebApp()
      debugLog.user('Telegram WebApp:', webApp ? '已初始化' : '不可用')
      
      // 获取用户信息
      const user = await getTelegramUser()
      currentUser.value = user
      
      // 将用户ID存储到sessionStorage
      if (user?.user_id) {
        sessionStorage.setItem('user_id', user.user_id.toString())
        debugLog.user('用户ID已存储到sessionStorage:', user.user_id)
      }
      
      debugLog.user('用户初始化完成:', {
        user_id: user.user_id,
        username: user.telegram_user_name,
        gender: user.gender,
        age: user.age,
        target_gender: user.target_gender
      })
      
      isInitialized.value = true
      devHelpers.timeEnd('用户初始化')
      
      return user
    } catch (error) {
      debugLog.error('用户初始化失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  const updateUser = (updates) => {
    if (!currentUser.value) {
      debugLog.warn('尝试更新用户信息，但用户未初始化')
      return
    }
    
    const oldUser = { ...currentUser.value }
    currentUser.value = {
      ...currentUser.value,
      ...updates
    }
    
    debugLog.user('用户信息已更新:', {
      updates,
      old: oldUser,
      new: currentUser.value
    })
  }

  /**
   * 设置用户性别
   */
  const setUserGender = (gender) => {
    updateUser({ gender })
  }

  /**
   * 设置用户年龄
   */
  const setUserAge = (age) => {
    updateUser({ age })
  }

  /**
   * 设置目标性别
   */
  const setTargetGender = (targetGender) => {
    updateUser({ target_gender: targetGender })
  }

  /**
   * 设置用户简介
   */
  const setUserSummary = (summary) => {
    updateUser({ summary })
  }

  /**
   * 添加匹配ID
   */
  const addMatchId = (matchId) => {
    if (!currentUser.value) return
    
    const currentMatchIds = currentUser.value.match_ids || []
    if (!currentMatchIds.includes(matchId)) {
      updateUser({ 
        match_ids: [...currentMatchIds, matchId] 
      })
    }
  }

  /**
   * 清除用户信息 (登出时使用)
   */
  const clearUser = () => {
    const oldUserId = currentUser.value?.user_id
    currentUser.value = null
    isInitialized.value = false
    sessionStorage.removeItem('user_id')
    debugLog.user('用户信息已清除:', oldUserId)
  }

  /**
   * 从sessionStorage恢复用户ID
   */
  const getUserIdFromSession = () => {
    const storedUserId = sessionStorage.getItem('user_id')
    return storedUserId ? parseInt(storedUserId) : null
  }

  return {
    // 状态
    currentUser,
    isLoading,
    isInitialized,
    
    // 计算属性
    userId,
    userName,
    userGender,
    userAge,
    targetGender,
    userSummary,
    matchIds,
    hasUser,
    hasBasicProfile,
    
    // 方法
    initUser,
    updateUser,
    setUserGender,
    setUserAge,
    setTargetGender,
    setUserSummary,
    addMatchId,
    clearUser,
    getUserIdFromSession
  }
})