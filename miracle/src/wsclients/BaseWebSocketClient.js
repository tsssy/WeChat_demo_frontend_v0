// BaseWebSocketClient: 基础WebSocket客户端类
// 提供所有WebSocket客户端的通用功能
import { debugLog } from '../utils/debug.js'

class BaseWebSocketClient {
  constructor(url) {
    this.url = url
    this.socket = null
    this.connection_state = 'disconnected'
    this.user_id = null
  }

  /**
   * 启动与WebSocket服务器的连接
   */
  connect() {
    if (this.connection_state === 'connected' || this.connection_state === 'connecting') {
      debugLog.websocket('WebSocket已连接或正在连接中')
      return
    }

    try {
      this.connection_state = 'connecting'
      this.socket = new WebSocket(this.url)
      this._setupEventListeners()
      debugLog.websocket('WebSocket连接启动:', this.url)
    } catch (error) {
      debugLog.error('WebSocket连接失败:', error)
      this.connection_state = 'disconnected'
    }
  }

  /**
   * 主动关闭WebSocket连接
   */
  disconnect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close()
      debugLog.websocket('WebSocket连接已主动关闭')
    }
    this.connection_state = 'disconnected'
    this.socket = null
    this.user_id = null
  }

  /**
   * 向服务器发送注册消息
   * @param {object} userInfo - 用户信息对象，应包含user_id
   */
  register(userInfo) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      debugLog.warn('WebSocket未连接，无法注册')
      return false
    }

    try {
      // 只发送user_id字段，避免多余字段
      const user_id = userInfo.user_id !== undefined ? userInfo.user_id : userInfo.userId
      const registerMessage = JSON.stringify({ user_id })
      debugLog.websocket('发送注册消息:', { user_id })
      this.socket.send(registerMessage)
      this.user_id = user_id
      return true
    } catch (error) {
      debugLog.error('注册消息发送失败:', error)
      return false
    }
  }

  /**
   * 发送普通消息
   * @param {string} message - 要发送的消息（JSON字符串）
   * @returns {boolean} 发送是否成功
   */
  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      debugLog.warn('WebSocket未连接，消息发送失败')
      return false
    }

    if (this.connection_state !== 'registered') {
      debugLog.warn('用户未注册，消息发送失败')
      return false
    }

    try {
      this.socket.send(message)
      debugLog.websocket('消息已发送:', message)
      return true
    } catch (error) {
      debugLog.error('消息发送失败:', error)
      return false
    }
  }

  /**
   * 设置WebSocket事件监听器（私有方法）
   */
  _setupEventListeners() {
    if (!this.socket) return

    this.socket.onopen = (event) => {
      this.connection_state = 'connected'
      debugLog.websocket('WebSocket连接已建立')
      this.onOpen(event)
    }

    this.socket.onmessage = (event) => {
      let data
      try {
        data = JSON.parse(event.data)
      } catch (e) {
        data = event.data
      }
      
      // 处理注册响应
      if (data.status === 'authenticated') {
        this.connection_state = 'registered'
        this.user_id = data.user_id
        debugLog.websocket('用户注册成功:', data.user_id)
      }
      
      debugLog.websocket('收到消息:', data)
      this.onMessage(data)
    }

    this.socket.onclose = (event) => {
      this.connection_state = 'disconnected'
      this.user_id = null
      debugLog.websocket('WebSocket连接已关闭:', event.code, event.reason)
      this.onClose(event)
    }

    this.socket.onerror = (event) => {
      debugLog.error('WebSocket连接错误:', event)
      this.onError(event)
    }
  }

  /**
   * 连接打开时的钩子方法（应被子类重写）
   * @param {Event} event - 连接事件
   */
  onOpen(event) {
    // 子类应重写此方法并调用register()
    debugLog.websocket('BaseWebSocketClient.onOpen - 应被子类重写')
  }

  /**
   * 收到消息时的钩子方法（应被子类重写）
   * @param {any} data - 消息数据
   */
  onMessage(data) {
    // 子类应重写此方法处理不同类型的消息
    debugLog.websocket('BaseWebSocketClient.onMessage - 应被子类重写')
  }

  /**
   * 连接关闭时的钩子方法（应被子类重写）
   * @param {CloseEvent} event - 关闭事件
   */
  onClose(event) {
    // 子类应重写此方法处理连接关闭
    debugLog.websocket('BaseWebSocketClient.onClose - 应被子类重写')
  }

  /**
   * 连接错误时的钩子方法（应被子类重写）
   * @param {Event} event - 错误事件
   */
  onError(event) {
    // 默认行为：打印错误信息
    debugLog.error('WebSocket连接错误:', event)
  }

  /**
   * 获取当前连接状态
   */
  getConnectionState() {
    return this.connection_state
  }

  /**
   * 检查是否已连接并注册
   */
  isReady() {
    return this.connection_state === 'registered' && this.socket && this.socket.readyState === WebSocket.OPEN
  }
}

export default BaseWebSocketClient