// 统一URL配置管理
// 所有API和WebSocket URL的配置都在这里管理

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// ======= DEBUG配置 =======
// 手动控制Debug模式，不依赖于环境变量
export const DEBUG_CONFIG = {
  enabled: true, // 手动控制是否启用调试模式，修改这里可以开启/关闭debug
  showUserInfo: true,
  showApiCalls: true,
  showWebSocket: true,
  showRouteChanges: true,
  showEventBus: true
}

// ======= USER_ID覆盖配置 =======
// 用于调试时使用自定义user_id
export const USER_ID_OVERRIDE = {
  enabled: true, // 设为true时启用自定义user_id覆盖
  userId: 7226798439 // 当enabled为true时使用的自定义user_id
}

// 基础域名配置
const DOMAINS = {
  development: {
    api: 'https://lovetapoversea.xyz:4433',
    websocket: 'wss://lovetapoversea.xyz:4433'
  },
  production: {
    api: 'https://lovetapoversea.xyz:4433',
    websocket: 'wss://lovetapoversea.xyz:4433'
  }
}

// 获取当前环境的基础URL
const getCurrentDomain = () => {
  return isDevelopment ? DOMAINS.development : DOMAINS.production
}

// API配置
export const API_CONFIG = {
  BASE_URL: getCurrentDomain().api,
  ENDPOINTS: {
    USER_MANAGEMENT: '/api/v1/UserManagement',
    MATCH_MANAGER: '/api/v1/MatchManager',
    CHATROOM_MANAGER: '/api/v1/ChatroomManager'
  },
  getFullUrl: (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`
  }
}

// WebSocket配置
export const WEBSOCKET_CONFIG = {
  BASE_URL: getCurrentDomain().websocket,
  ENDPOINTS: {
    BASE: '/ws/base',
    MESSAGE: '/ws/message',
    MATCH: '/ws/match'
  },
  getFullUrl: (endpoint) => {
    return `${WEBSOCKET_CONFIG.BASE_URL}${endpoint}`
  }
}

// 便捷函数 - 获取API URL
export const getApiUrl = (endpoint = '') => {
  if (endpoint.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${endpoint}`
  }
  return `${API_CONFIG.BASE_URL}/${endpoint}`
}

// 便捷函数 - 获取WebSocket URL
export const getWebSocketUrl = (endpoint = '') => {
  if (endpoint.startsWith('/')) {
    return `${WEBSOCKET_CONFIG.BASE_URL}${endpoint}`
  }
  return `${WEBSOCKET_CONFIG.BASE_URL}/${endpoint}`
}

// 特定WebSocket连接的URL获取函数
export const getMatchWebSocketUrl = () => {
  return WEBSOCKET_CONFIG.getFullUrl(WEBSOCKET_CONFIG.ENDPOINTS.MATCH)
}

export const getMessageWebSocketUrl = () => {
  return WEBSOCKET_CONFIG.getFullUrl(WEBSOCKET_CONFIG.ENDPOINTS.MESSAGE)
}

export const getBaseWebSocketUrl = () => {
  return WEBSOCKET_CONFIG.getFullUrl(WEBSOCKET_CONFIG.ENDPOINTS.BASE)
}

// 环境信息
export const ENV_INFO = {
  isDevelopment,
  isProduction,
  currentDomain: getCurrentDomain()
}

// 调试函数 - 打印当前配置
export const printCurrentConfig = () => {
  console.log('=== URL Configuration ===')
  console.log('Environment:', isDevelopment ? 'Development' : 'Production')
  console.log('API Base URL:', API_CONFIG.BASE_URL)
  console.log('WebSocket Base URL:', WEBSOCKET_CONFIG.BASE_URL)
  console.log('Match WebSocket URL:', getMatchWebSocketUrl())
  console.log('Message WebSocket URL:', getMessageWebSocketUrl())
  console.log('Base WebSocket URL:', getBaseWebSocketUrl())
  console.log('========================')
}

export default {
  API_CONFIG,
  WEBSOCKET_CONFIG,
  DEBUG_CONFIG,
  USER_ID_OVERRIDE,
  getApiUrl,
  getWebSocketUrl,
  getMatchWebSocketUrl,
  getMessageWebSocketUrl,
  getBaseWebSocketUrl,
  ENV_INFO,
  printCurrentConfig
}