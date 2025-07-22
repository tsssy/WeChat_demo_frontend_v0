// WebSocketClient：用于聊天功能的 WebSocket 客户端骨架
// 依赖 eventBus 进行事件分发
import eventBus from './eventBus.js'

class WebSocketClient {
  constructor(url, user_id) {
    this.url = url
    this.user_id = user_id
    this.ws = null
  }

  // 建立 WebSocket 连接
  connect() {
    this.ws = new WebSocket(this.url)
    this.ws.onopen = (event) => this.onOpen(event)
    this.ws.onmessage = (event) => this.onMessage(event.data)
    this.ws.onclose = (event) => this.onClose(event)
    this.ws.onerror = (event) => this.onError(event)
  }

  // 发送消息
  send(message, target_user_id) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({
        action: 'send_message',
        user_id: this.user_id,
        target_user_id,
        message
      })
      this.ws.send(msg)
      return true
    }
    return false
  }

  // 收到服务器推送的消息
  onMessage(data) {
    // 解析消息并分发事件
    let msg
    try {
      msg = JSON.parse(data)
    } catch (e) {
      msg = data
    }
    eventBus.emit('chat:message', msg)
  }

  // 连接建立回调
  onOpen(event) {
    eventBus.emit('chat:open', event)
  }

  // 连接关闭回调
  onClose(event) {
    eventBus.emit('chat:close', event)
  }

  // 连接错误回调
  onError(event) {
    eventBus.emit('chat:error', event)
  }
}

// 导出全局唯一实例（如需多聊天室可自行实例化）
export default WebSocketClient 