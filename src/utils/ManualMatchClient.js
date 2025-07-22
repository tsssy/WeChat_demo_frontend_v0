// ManualMatchClient：用于匹配流程的 WebSocket 客户端骨架
// 依赖 eventBus 进行事件分发
import eventBus from './eventBus.js'

class ManualMatchClient {
  constructor(url, user_id) {
    this.url = url
    this.user_id = user_id
    this.ws = null
    this.match_id = null
    this.target_user_id = null
  }

  // 建立 WebSocket 连接
  connect() {
    this.ws = new WebSocket(this.url)
    this.ws.onopen = (event) => this.onOpen(event)
    this.ws.onmessage = (event) => this.onMessage(event.data)
    this.ws.onclose = (event) => this.onClose(event)
    this.ws.onerror = (event) => this.onError(event)
  }

  // 发送首次配对请求
  start_match() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({ action: 'start_match', user_id: this.user_id })
      this.ws.send(msg)
    }
  }

  // 连接建立回调
  onOpen(event) {
    // 连接建立后可自动发起匹配请求
    eventBus.emit('match:open', event)
  }

  // 收到服务器推送的匹配状态/结果
  onMessage(data) {
    // 解析消息并分发事件
    let msg
    try {
      msg = JSON.parse(data)
    } catch (e) {
      msg = data
    }
    eventBus.emit('match:message', msg)
  }

  // 连接关闭回调
  onClose(event) {
    eventBus.emit('match:close', event)
  }

  // 连接错误回调
  onError(event) {
    eventBus.emit('match:error', event)
  }
}

export default ManualMatchClient 