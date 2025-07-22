import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTelegramUser, initTelegramWebApp } from '../utils/telegramUser.js'
import { debugLog, devHelpers } from '../utils/debug.js'

export const useUserStore = defineStore('user', () => {
  // 用户状态
  const currentUser = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  
  // 当前匹配信息
  const currentMatch = ref(null)
  const matchTargetUser = ref(null)

  // 计算属性
  const userId = computed(() => currentUser.value?.user_id || null)
  const userName = computed(() => currentUser.value?.telegram_user_name || null)
  const userGender = computed(() => currentUser.value?.gender || null)
  const userAge = computed(() => currentUser.value?.age || null)
  const targetGender = computed(() => currentUser.value?.target_gender || null)
  const userSummary = computed(() => currentUser.value?.summary || null)
  const matchIds = computed(() => currentUser.value?.match_ids || [])

  // 匹配相关计算属性
  const currentMatchId = computed(() => currentMatch.value?.match_id || null)
  const targetUserId = computed(() => currentMatch.value?.target_user_id || null)
  const matchScore = computed(() => currentMatch.value?.match_score || null)
  const matchDescription = computed(() => currentMatch.value?.description_for_target || null)
  const isLiked = computed(() => currentMatch.value?.is_liked || false)
  const chatroomId = computed(() => currentMatch.value?.chatroom_id || null)
  const targetUserName = computed(() => matchTargetUser.value?.telegram_user_name || null)

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
   * 存储当前匹配信息
   */
  const setCurrentMatch = (matchData) => {
    currentMatch.value = {
      match_id: matchData.match_id,
      target_user_id: matchData.matched_user_id || matchData.target_user_id,
      match_score: matchData.match_score,
      description_for_target: matchData.reason_for_self || matchData.description_for_target,
      is_liked: matchData.is_liked || false,
      chatroom_id: matchData.chatroom_id || null,
      mutual_game_scores: matchData.mutual_game_scores || {}
    }
    
    // 将匹配信息存储到sessionStorage
    sessionStorage.setItem('current_match', JSON.stringify(currentMatch.value))
    debugLog.user('当前匹配信息已存储:', currentMatch.value)
  }

  /**
   * 存储目标用户信息
   */
  const setTargetUser = (userData) => {
    matchTargetUser.value = userData
    sessionStorage.setItem('target_user', JSON.stringify(userData))
    debugLog.user('目标用户信息已存储:', userData)
  }

  /**
   * 从sessionStorage恢复匹配信息
   */
  const restoreMatchFromSession = () => {
    const matchData = sessionStorage.getItem('current_match')
    const targetData = sessionStorage.getItem('target_user')
    
    if (matchData) {
      currentMatch.value = JSON.parse(matchData)
      debugLog.user('从session恢复匹配信息:', currentMatch.value)
    }
    
    if (targetData) {
      matchTargetUser.value = JSON.parse(targetData)
      debugLog.user('从session恢复目标用户信息:', matchTargetUser.value)
    }
    
    return !!(currentMatch.value && matchTargetUser.value)
  }

  /**
   * 清除匹配信息
   */
  const clearMatchInfo = () => {
    currentMatch.value = null
    matchTargetUser.value = null
    sessionStorage.removeItem('current_match')
    sessionStorage.removeItem('target_user')
    debugLog.user('匹配信息已清除')
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
    currentMatch,
    matchTargetUser,
    
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
    
    // 匹配相关计算属性
    currentMatchId,
    targetUserId,
    matchScore,
    matchDescription,
    isLiked,
    chatroomId,
    targetUserName,
    
    // 方法
    initUser,
    updateUser,
    setUserGender,
    setUserAge,
    setTargetGender,
    setUserSummary,
    addMatchId,
    clearUser,
    getUserIdFromSession,
    
    // 匹配相关方法
    setCurrentMatch,
    setTargetUser,
    restoreMatchFromSession,
    clearMatchInfo
  }
})