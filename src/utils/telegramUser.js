// Telegram用户相关工具函数
// 获取真实Telegram用户信息，支持debug模式下的user_id覆盖

import { USER_ID_OVERRIDE } from './config.js'

/**
 * 默认用户配置 (已移除，现在会抛出错误而不是使用默认用户)
 */

/**
 * 获取Telegram用户信息
 * 优先级：1. 用户ID覆盖（调试模式）2. Telegram WebApp API 3. URL参数 4. 抛出错误
 * @returns {Promise<Object>} 用户信息对象
 */
export async function getTelegramUser() {
  try {
    // 打印入口信息
    console.log('🚀 [ENTRY] getTelegramUser() 开始获取用户信息...')
    console.log('🔧 [CONFIG] USER_ID_OVERRIDE.enabled:', USER_ID_OVERRIDE.enabled)
    console.log('🔧 [CONFIG] USER_ID_OVERRIDE.userId:', USER_ID_OVERRIDE.userId)
    
    // 1. 检查是否启用了用户ID覆盖（调试模式）
    if (USER_ID_OVERRIDE.enabled) {
      console.log('🐛 [OVERRIDE] ✅ 使用覆盖的user_id:', USER_ID_OVERRIDE.userId)
      console.log('🐛 [OVERRIDE] 这是调试模式，不是真实用户ID')
      const result = {
        user_id: USER_ID_OVERRIDE.userId,
        telegram_user_name: `debug_user_${USER_ID_OVERRIDE.userId}`,
        telegram_user_id: USER_ID_OVERRIDE.userId,
        gender: null, // 需要用户后续设置
        age: null,
        target_gender: null,
        summary: null,
        match_ids: []
      }
      console.log('🎯 [FINAL] 最终使用的user_id:', result.user_id, '(来源: OVERRIDE)')
      return result
    }

    console.log('🔍 [CHECK] Override未启用，检查Telegram WebApp API...')
    
    // 2. 尝试从Telegram WebApp API获取真实用户信息
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      const webApp = window.Telegram.WebApp
      const user = webApp.initDataUnsafe.user
      
      if (user && user.id) {
        console.log('📱 [TELEGRAM] ✅ 获取到真实Telegram用户信息')
        console.log('📱 [TELEGRAM] user.id:', user.id)
        console.log('📱 [TELEGRAM] user.username:', user.username)
        const result = {
          user_id: user.id,
          telegram_user_name: user.username || `user_${user.id}`,
          telegram_user_id: user.id,
          gender: null, // 需要用户后续设置
          age: null,
          target_gender: null, 
          summary: null,
          match_ids: []
        }
        console.log('🎯 [FINAL] 最终使用的user_id:', result.user_id, '(来源: TELEGRAM_API)')
        return result
      }
    }
    
    console.log('🔍 [CHECK] Telegram API无效，检查URL参数...')
    
    // 3. 尝试从URL参数获取用户ID (备用方案)
    const urlUserId = getUserIdFromUrl()
    if (urlUserId) {
      console.log('🔗 [URL] ✅ 从URL参数获取user_id:', urlUserId)
      const result = {
        user_id: urlUserId,
        telegram_user_name: `url_user_${urlUserId}`,
        telegram_user_id: urlUserId,
        gender: null,
        age: null,
        target_gender: null,
        summary: null,
        match_ids: []
      }
      console.log('🎯 [FINAL] 最终使用的user_id:', result.user_id, '(来源: URL_PARAMS)')
      return result
    }
    
    // 4. 无法获取用户信息，抛出错误
    console.error('❌ [ERROR] 无法获取Telegram用户信息，所有方法都失败了')
    throw new Error('Failed to get telegram user info')
  } catch (error) {
    console.error('❌ [ERROR] 获取Telegram用户信息失败:', error)
    throw error
  }
}

/**
 * 从URL参数获取用户ID (备用方案)
 * @returns {number|null} 用户ID或null
 */
export function getUserIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get('user_id')
  return userId ? parseInt(userId) : null
}

/**
 * 检查是否在Telegram WebApp环境中
 * @returns {boolean} 是否在Telegram环境
 */
export function isTelegramWebApp() {
  return !!(window.Telegram && window.Telegram.WebApp)
}

/**
 * 初始化Telegram WebApp (如果可用)
 */
export function initTelegramWebApp() {
  if (isTelegramWebApp()) {
    const webApp = window.Telegram.WebApp
    webApp.ready()
    webApp.expand() // 展开到全屏
    
    // 设置主题颜色
    webApp.setHeaderColor('#ffffff')
    webApp.setBackgroundColor('#ffffff')
    
    console.log('Telegram WebApp 已初始化')
    return webApp
  }
  return null
}