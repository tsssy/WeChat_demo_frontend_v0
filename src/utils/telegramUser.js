// Telegram用户相关工具函数
// 当前为骨架实现，使用默认用户ID 1000001

/**
 * 默认用户配置
 */
const DEFAULT_USER = {
  user_id: 1000001,
  telegram_user_name: 'default_user',
  telegram_user_id: 1000001,
  gender: 2, // 默认为女性
  age: null,
  target_gender: 1, // 默认寻找男性
  summary: null,
  match_ids: []
}

/**
 * 获取Telegram用户信息的骨架函数
 * 当前返回默认用户，未来将从Telegram WebApp API获取
 * @returns {Promise<Object>} 用户信息对象
 */
export async function getTelegramUser() {
  try {
    // 检查是否在Telegram WebApp环境中
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      const webApp = window.Telegram.WebApp
      const user = webApp.initDataUnsafe.user
      
      if (user && user.id) {
        // 从Telegram获取真实用户信息
        return {
          user_id: user.id,
          telegram_user_name: user.username || `user_${user.id}`,
          telegram_user_id: user.id,
          gender: null, // 需要用户后续设置
          age: null,
          target_gender: null,
          summary: null,
          match_ids: []
        }
      }
    }
    
    // 开发环境或非Telegram环境使用默认用户
    console.log('使用默认用户 (开发环境)', DEFAULT_USER.user_id)
    return DEFAULT_USER
  } catch (error) {
    console.warn('获取Telegram用户信息失败，使用默认用户:', error)
    return DEFAULT_USER
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