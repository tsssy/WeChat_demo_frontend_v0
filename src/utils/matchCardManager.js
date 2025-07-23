// MatchCard全局管理器
// 用于实现"暴力"方法：直接轮询所有MatchCard实例来更新红点状态

class MatchCardManager {
  constructor() {
    // 存储所有注册的MatchCard实例
    // key: telegramId (string), value: MatchCard组件实例
    this.instances = new Map()
    
    // 持久化红点状态
    // key: telegramId (string), value: boolean (是否有未读消息)
    this.redDotStates = new Map()
  }

  /**
   * 注册MatchCard实例
   * @param {string} telegramId - 用户的telegram ID
   * @param {Object} instance - MatchCard组件实例
   */
  register(telegramId, instance) {
    console.log(`MatchCard注册: ${telegramId}`)
    this.instances.set(telegramId, instance)
    
    // 如果之前有未读消息状态，立即应用到新注册的实例
    if (this.redDotStates.get(telegramId) === true) {
      console.log(`恢复用户 ${telegramId} 的红点状态`)
      if (instance.showRedDot) {
        instance.showRedDot()
      }
    }
  }

  /**
   * 注销MatchCard实例
   * @param {string} telegramId - 用户的telegram ID
   */
  unregister(telegramId) {
    console.log(`MatchCard注销: ${telegramId}`)
    this.instances.delete(telegramId)
    // 注意：不删除redDotStates，保持状态持久化
  }

  /**
   * 获取所有已注册的MatchCard实例
   * @returns {Map} 所有实例的Map
   */
  getAllInstances() {
    return this.instances
  }

  /**
   * 根据telegramId获取特定的MatchCard实例
   * @param {string} telegramId - 用户的telegram ID
   * @returns {Object|null} MatchCard组件实例或null
   */
  getInstance(telegramId) {
    return this.instances.get(telegramId) || null
  }

  /**
   * 检查某个telegramId是否已注册
   * @param {string} telegramId - 用户的telegram ID
   * @returns {boolean} 是否已注册
   */
  hasInstance(telegramId) {
    return this.instances.has(telegramId)
  }

  /**
   * 为指定用户显示红点（收到新消息时调用）
   * @param {string} telegramId - 用户的telegram ID
   */
  showRedDotForUser(telegramId) {
    // 首先更新持久化状态
    this.redDotStates.set(telegramId, true)
    console.log(`设置用户 ${telegramId} 的红点状态为true`)
    
    const instance = this.getInstance(telegramId)
    if (instance && instance.showRedDot) {
      console.log(`为用户 ${telegramId} 显示红点`)
      instance.showRedDot()
      return true
    } else {
      console.log(`未找到用户 ${telegramId} 的MatchCard实例，但已保存红点状态`)
      return false
    }
  }

  /**
   * 为指定用户隐藏红点（用户查看消息后调用）
   * @param {string} telegramId - 用户的telegram ID
   */
  hideRedDotForUser(telegramId) {
    // 清除持久化状态
    this.redDotStates.set(telegramId, false)
    console.log(`设置用户 ${telegramId} 的红点状态为false`)
    
    const instance = this.getInstance(telegramId)
    if (instance && instance.hideRedDot) {
      console.log(`为用户 ${telegramId} 隐藏红点`)
      instance.hideRedDot()
      return true
    } else {
      console.log(`未找到用户 ${telegramId} 的MatchCard实例，但已清除红点状态`)
      return false
    }
  }

  /**
   * 处理WebSocket消息，执行"暴力轮询"逻辑
   * @param {Object} messageData - WebSocket消息数据
   */
  handleWebSocketMessage(messageData) {
    console.log('MatchCardManager处理WebSocket消息:', messageData)

    // 只处理private_message类型的消息
    if (messageData.type === 'private_message' || messageData.type === 'private') {
      const senderId = messageData.sender_id || messageData.from
      
      if (senderId) {
        // 直接轮询：为发送者显示红点
        const success = this.showRedDotForUser(senderId.toString())
        
        if (success) {
          console.log(`成功为发送者 ${senderId} 显示红点`)
        } else {
          console.log(`无法为发送者 ${senderId} 显示红点 - 可能该用户的MatchCard不在当前页面`)
        }
      } else {
        console.log('消息中没有找到sender_id或from字段')
      }
    }
  }

  /**
   * 清除所有红点
   */
  clearAllRedDots() {
    console.log('清除所有MatchCard红点')
    
    // 清除所有持久化状态
    this.redDotStates.clear()
    
    // 清除所有实例的红点显示
    this.instances.forEach((instance, telegramId) => {
      if (instance.hideRedDot) {
        instance.hideRedDot()
      }
    })
  }

  /**
   * 获取当前注册的实例数量
   * @returns {number} 实例数量
   */
  getInstanceCount() {
    return this.instances.size
  }

  /**
   * 获取所有已注册的telegramId列表
   * @returns {Array} telegramId数组
   */
  getAllTelegramIds() {
    return Array.from(this.instances.keys())
  }

  /**
   * 调试信息：打印所有已注册的实例
   */
  debugPrintAllInstances() {
    console.log('=== MatchCard管理器调试信息 ===')
    console.log(`总计注册实例数: ${this.getInstanceCount()}`)
    console.log('已注册的telegramId:', this.getAllTelegramIds())
    console.log('红点状态:', Object.fromEntries(this.redDotStates))
    console.log('=====================================')
  }

  /**
   * 获取指定用户的红点状态
   * @param {string} telegramId - 用户的telegram ID
   * @returns {boolean} 是否有未读消息
   */
  getRedDotState(telegramId) {
    return this.redDotStates.get(telegramId) === true
  }

  /**
   * 获取所有有红点的用户ID列表
   * @returns {Array} 有未读消息的telegramId数组
   */
  getAllUsersWithRedDots() {
    const usersWithRedDots = []
    this.redDotStates.forEach((hasRedDot, telegramId) => {
      if (hasRedDot) {
        usersWithRedDots.push(telegramId)
      }
    })
    return usersWithRedDots
  }

  /**
   * 获取有红点的用户数量
   * @returns {number} 有未读消息的用户数量
   */
  getRedDotCount() {
    return this.getAllUsersWithRedDots().length
  }
}

// 导出全局唯一实例
export const matchCardManager = new MatchCardManager()
export default matchCardManager