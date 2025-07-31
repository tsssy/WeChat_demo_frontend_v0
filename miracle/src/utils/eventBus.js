// 全局事件总线 EventBus，用于页面、组件、WebSocket 之间的事件通信
// 使用方法：
// import eventBus from '@/utils/eventBus.js'
// eventBus.on('eventName', callback)
// eventBus.emit('eventName', data)
// eventBus.off('eventName', callback)

class EventBus {
  constructor() {
    // 存储事件名和回调函数数组的映射
    this.listeners = {}
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }
    this.listeners[eventName].push(callback)
  }

  // 取消订阅事件
  off(eventName, callback) {
    if (!this.listeners[eventName]) return
    this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback)
  }

  // 触发事件
  emit(eventName, data) {
    if (!this.listeners[eventName]) return
    this.listeners[eventName].forEach(callback => {
      callback(data)
    })
  }
}

// 导出全局唯一实例
const eventBus = new EventBus()
export default eventBus 