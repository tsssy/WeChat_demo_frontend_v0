// ManualMatchClient: 继承自BaseWebSocketClient，专门用于匹配功能
// 依赖eventBus进行事件分发，按照FRONTEND_INTEGRATION_GUIDE.md规范实现
import BaseWebSocketClient from './BaseWebSocketClient.js'
import eventBus from '../utils/eventBus.js'
import { debugLog } from '../utils/debug.js'

class ManualMatchClient extends BaseWebSocketClient {
  constructor(url, user_id) {
    super(url)
    this.user_id = user_id
    this.match_id = null
    this.target_user_id = null
  }

  /**
   * 发送首次配对请求
   * 根据后端文档，认证成功后会自动开始匹配过程
   */
  start_match() {
    if (!this.isReady()) {
      debugLog.warn('ManualMatchClient未就绪，无法开始匹配')
      return false
    }

    debugLog.websocket('开始匹配过程，用户ID:', this.user_id)
    // 根据后端文档，认证后会自动触发匹配，无需额外发送请求
    return true
  }

  /**
   * 连接建立后的处理
   * @param {Event} event - 连接事件
   */
  onOpen(event) {
    debugLog.websocket('Match WebSocket连接已建立')
    
    // 发送认证信息
    const authInfo = {
      user_id: this.user_id
    }
    
    this.register(authInfo)
    
    // 通知页面连接已建立
    eventBus.emit('match:open', {
      event,
      user_id: this.user_id
    })
  }

  /**
   * 处理来自服务器的匹配消息
   * @param {any} data - 服务器消息
   */
  onMessage(data) {
    debugLog.websocket('收到匹配消息:', data)

    // 处理不同类型的匹配消息
    switch (data.type) {
      case 'match_info':
        this.handleMatchInfo(data)
        break
      
      case 'match_error':
        this.handleMatchError(data)
        break
        
      default:
        // 处理认证响应和其他消息
        if (data.status === 'authenticated') {
          debugLog.websocket('匹配客户端认证成功，自动匹配过程已开始')
          eventBus.emit('match:authenticated', {
            user_id: data.user_id
          })
        } else {
          debugLog.websocket('未知匹配消息类型:', data)
        }
        break
    }

    // 通用事件分发
    eventBus.emit('match:message', data)
  }

  /**
   * 处理匹配信息
   * @param {object} matchData - 匹配数据
   */
  handleMatchInfo(matchData) {
    this.match_id = matchData.match_id
    this.target_user_id = matchData.matched_user_id
    
    debugLog.user('匹配成功:', {
      match_id: this.match_id,
      target_user_id: this.target_user_id,
      match_score: matchData.match_score,
      self_reason: matchData.reason_of_match_given_to_self_user,
      target_reason: matchData.reason_of_match_given_to_matched_user
    })

    // 分发匹配成功事件
    eventBus.emit('match:success', {
      match_id: this.match_id,
      self_user_id: matchData.self_user_id,
      matched_user_id: matchData.matched_user_id,
      match_score: matchData.match_score,
      reason_for_self: matchData.reason_of_match_given_to_self_user,
      reason_for_target: matchData.reason_of_match_given_to_matched_user
    })
  }

  /**
   * 处理匹配错误
   * @param {object} errorData - 错误数据
   */
  handleMatchError(errorData) {
    debugLog.error('匹配失败:', errorData.message)
    
    eventBus.emit('match:error', {
      message: errorData.message,
      type: 'match_error'
    })
  }

  /**
   * 连接关闭处理
   * @param {CloseEvent} event - 关闭事件
   */
  onClose(event) {
    debugLog.websocket('Match WebSocket连接已关闭:', event.code, event.reason)
    
    // 清理匹配状态
    this.match_id = null
    this.target_user_id = null
    
    eventBus.emit('match:close', {
      event,
      code: event.code,
      reason: event.reason
    })
  }

  /**
   * 连接错误处理
   * @param {Event} event - 错误事件
   */
  onError(event) {
    debugLog.error('Match WebSocket连接错误:', event)
    
    eventBus.emit('match:error', {
      event,
      type: 'connection_error'
    })
  }

  /**
   * 获取当前匹配信息
   */
  getMatchInfo() {
    return {
      match_id: this.match_id,
      target_user_id: this.target_user_id,
      user_id: this.user_id,
      connection_state: this.connection_state
    }
  }

  /**
   * 重置匹配状态
   */
  resetMatch() {
    this.match_id = null
    this.target_user_id = null
    debugLog.websocket('匹配状态已重置')
  }
}

export default ManualMatchClient