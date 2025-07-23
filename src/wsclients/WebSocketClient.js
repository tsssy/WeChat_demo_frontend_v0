// WebSocketClient: 单例模式的消息WebSocket客户端
// 继承自BaseWebSocketClient，专门用于聊天和消息功能
// 按照FRONTEND_INTEGRATION_GUIDE.md规范实现
import BaseWebSocketClient from './BaseWebSocketClient.js'
import eventBus from '../utils/eventBus.js'
import { debugLog } from '../utils/debug.js'

class WebSocketClient extends BaseWebSocketClient {
  constructor(url, user_id) {
    super(url)
    this.user_id = user_id
    this.chatroom_id = null
    this.current_target_user_id = null
  }

  /**
   * 向指定用户发送私聊消息
   * @param {string} message - 消息内容
   * @param {number} target_user_id - 目标用户ID
   * @param {number} chatroom_id - 聊天室ID（可选）
   * @returns {boolean} 发送是否成功
   */
  send(message, target_user_id, chatroom_id = null) {
    if (!this.isReady()) {
      debugLog.warn('WebSocketClient未就绪，消息发送失败')
      return false
    }

    const messageData = {
      type: "private",
      target_user_id: target_user_id.toString(),
      content: message,
      timestamp: new Date().toISOString()
    }

    // 如果有聊天室ID，添加到消息中
    if (chatroom_id || this.chatroom_id) {
      messageData.chatroom_id = chatroom_id || this.chatroom_id
    }

    const messageStr = JSON.stringify(messageData)
    const success = super.send(messageStr)
    
    if (success) {
      debugLog.websocket('私聊消息已发送:', messageData)
    }
    
    return success
  }

  /**
   * 发送广播消息
   * @param {string} content - 消息内容
   * @returns {boolean} 发送是否成功
   */
  sendBroadcast(content) {
    if (!this.isReady()) {
      debugLog.warn('WebSocketClient未就绪，广播消息发送失败')
      return false
    }

    const broadcastData = {
      type: "broadcast",
      content: content,
      timestamp: new Date().toISOString()
    }

    const success = super.send(JSON.stringify(broadcastData))
    
    if (success) {
      debugLog.websocket('广播消息已发送:', broadcastData)
    }
    
    return success
  }

  /**
   * 初始化私聊
   * @param {number} target_user_id - 目标用户ID
   * @param {number} match_id - 匹配ID
   * @returns {boolean} 初始化是否成功
   */
  initPrivateChat(target_user_id, match_id) {
    if (!this.isReady()) {
      debugLog.warn('WebSocketClient未就绪，无法初始化私聊')
      return false
    }

    const initData = {
      type: "private_chat_init",
      target_user_id: target_user_id.toString(),
      match_id: match_id
    }

    this.current_target_user_id = target_user_id
    const success = super.send(JSON.stringify(initData))
    
    if (success) {
      debugLog.websocket('私聊初始化请求已发送:', initData)
    }
    
    return success
  }

  /**
   * 连接建立后的处理
   * @param {Event} event - 连接事件
   */
  onOpen(event) {
    debugLog.websocket('Message WebSocket连接已建立')
    
    // 发送认证信息
    const authInfo = {
      user_id: this.user_id
    }
    
    this.register(authInfo)
    
    // 通知页面连接已建立
    eventBus.emit('chat:open', {
      event,
      user_id: this.user_id
    })
  }

  /**
   * 处理来自服务器的消息
   * @param {any} data - 服务器消息
   */
  onMessage(data) {
    debugLog.websocket('收到聊天消息:', data)

    // 处理不同类型的消息
    switch (data.type) {
      case 'private_chat_progress':
        this.handlePrivateChatProgress(data)
        break
      case 'private':
        this.handlePrivateMessage(data)
        break
      case 'private_message': // 兼容后端发来的 private_message 类型，和 private 一样处理
        this.handlePrivateMessage(data)
        break
      case 'broadcast':
        this.handleBroadcastMessage(data)
        break
        
      case 'private_chat_error':
        this.handleChatError(data)
        break
        
      default:
        // 处理认证响应和其他消息
        if (data.status === 'authenticated') {
          debugLog.websocket('消息客户端认证成功')
          eventBus.emit('chat:authenticated', {
            user_id: data.user_id
          })
        } else {
          debugLog.websocket('未知聊天消息类型:', data)
        }
        break
    }

    // 通用事件分发
    eventBus.emit('chat:message', data)
  }

  /**
   * 处理私聊进度消息
   * @param {object} progressData - 进度数据
   */
  handlePrivateChatProgress(progressData) {
    debugLog.websocket('私聊进度:', progressData)
    
    // 如果聊天室准备完成，保存聊天室ID
    if (progressData.status === 'completed' && progressData.chatroom_id) {
      this.chatroom_id = progressData.chatroom_id
      debugLog.websocket('聊天室已准备就绪:', this.chatroom_id)
      
      eventBus.emit('chat:room_ready', {
        chatroom_id: this.chatroom_id,
        target_user_id: this.current_target_user_id,
        message: progressData.message
      })
    }
    
    eventBus.emit('chat:progress', progressData)
  }

  /**
   * 处理私聊消息
   * @param {object} messageData - 消息数据
   */
  handlePrivateMessage(messageData) {
    debugLog.websocket('收到私聊消息:', messageData)
    
    eventBus.emit('chat:private_message', {
      content: messageData.content,
      sender_id: messageData.sender_id,
      timestamp: messageData.timestamp,
      chatroom_id: messageData.chatroom_id
    })
  }

  /**
   * 处理广播消息
   * @param {object} broadcastData - 广播数据
   */
  handleBroadcastMessage(broadcastData) {
    debugLog.websocket('收到广播消息:', broadcastData)
    
    eventBus.emit('chat:broadcast_message', {
      content: broadcastData.content,
      sender_id: broadcastData.sender_id,
      timestamp: broadcastData.timestamp
    })
  }

  /**
   * 处理聊天错误
   * @param {object} errorData - 错误数据
   */
  handleChatError(errorData) {
    debugLog.error('聊天错误:', errorData.error)
    
    eventBus.emit('chat:error', {
      error: errorData.error,
      type: 'chat_error'
    })
  }

  /**
   * 连接关闭处理
   * @param {CloseEvent} event - 关闭事件
   */
  onClose(event) {
    debugLog.websocket('Message WebSocket连接已关闭:', event.code, event.reason)
    
    // 清理聊天状态
    this.chatroom_id = null
    this.current_target_user_id = null
    
    eventBus.emit('chat:close', {
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
    debugLog.error('Message WebSocket连接错误:', event)
    
    eventBus.emit('chat:error', {
      event,
      type: 'connection_error'
    })
  }

  /**
   * 获取当前聊天信息
   */
  getChatInfo() {
    return {
      chatroom_id: this.chatroom_id,
      target_user_id: this.current_target_user_id,
      user_id: this.user_id,
      connection_state: this.connection_state
    }
  }

  /**
   * 重置聊天状态
   */
  resetChat() {
    this.chatroom_id = null
    this.current_target_user_id = null
    debugLog.websocket('聊天状态已重置')
  }
}

// 单例模式实现
let instance = null

export default class WebSocketClientSingleton {
  static getInstance(url = null, user_id = null) {
    if (!instance && url && user_id) {
      instance = new WebSocketClient(url, user_id)
    }
    return instance
  }

  static resetInstance() {
    if (instance) {
      instance.disconnect()
      instance = null
    }
  }

  static hasInstance() {
    return !!instance
  }
}