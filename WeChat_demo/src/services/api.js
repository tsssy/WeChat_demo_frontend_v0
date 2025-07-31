// API服务配置
const API_BASE_URL = '/api'

// 通用请求方法
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }
  
  try {
    console.log('🌐 [API] 请求信息:', { 
      method: config.method || 'GET', 
      url, 
      headers: config.headers, 
      body: config.body 
    })
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🌐 [API] 响应数据:', data)
    
    return data
  } catch (error) {
    console.error('❌ [API] 请求错误:', error)
    throw error
  }
}

// 用户管理API方法
export const userAPI = {
  // 创建新用户
  async createNewUser(userData) {
    return await apiRequest('/v1/UserManagement/create_new_user', {
      method: 'POST',
      body: JSON.stringify({
        telegram_user_name: userData.telegram_user_name,
        telegram_user_id: userData.telegram_user_id,
        gender: userData.gender
      })
    })
  },
  
  // 编辑用户年龄
  async editUserAge(userData) {
    return await apiRequest('/v1/UserManagement/edit_user_age', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userData.user_id,
        age: userData.age
      })
    })
  }
}

// AI聊天API方法
export const aiAPI = {
  // 获取AI聊天历史记录
  async getChatHistory(userId) {
    return await apiRequest('/v1/ai/history', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId
      })
    })
  },
  
  // 发送AI聊天消息
  async sendMessage(userId, message) {
    return await apiRequest('/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        message: message
      })
    })
  }
}

// 导出API方法
export default {
  userAPI,
  aiAPI
} 