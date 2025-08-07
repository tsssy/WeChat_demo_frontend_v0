<template>
  <div class="debug-container">
    <h1>Debug 页面</h1>
    <p>这是一个用于调试的页面</p>
    
    <div class="debug-section">
      <h2>环境信息</h2>
      <ul>
        <li>当前时间: {{ currentTime }}</li>
        <li>用户代理: {{ userAgent }}</li>
        <li>窗口大小: {{ windowSize }}</li>
      </ul>
    </div>

    <div class="debug-section">
      <h2>API 测试</h2>
      <button @click="testApi">测试 API 连接</button>
      <div v-if="apiResult" class="api-result">
        <pre>{{ apiResult }}</pre>
      </div>
    </div>

    <div class="debug-section">
      <h2>控制台日志</h2>
      <button @click="addLog">添加测试日志</button>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Debug',
  data() {
    return {
      currentTime: new Date().toLocaleString(),
      userAgent: navigator.userAgent,
      windowSize: `${window.innerWidth} x ${window.innerHeight}`,
      apiResult: null,
      logs: []
    }
  },
  mounted() {
    // 页面加载时添加日志
    this.addLog('Debug 页面已加载')
    this.addLog(`当前路由: ${this.$route.path}`)
    this.addLog(`Vue 版本: ${this.$vue?.version || '未知'}`)
  },
  methods: {
    testApi() {
      this.addLog('开始测试 API 连接...')
      
      // 测试本地API
      fetch('/api/test')
        .then(response => {
          this.addLog(`API 响应状态: ${response.status}`)
          return response.json()
        })
        .then(data => {
          this.apiResult = JSON.stringify(data, null, 2)
          this.addLog('API 测试成功')
        })
        .catch(error => {
          this.addLog(`API 测试失败: ${error.message}`)
          this.apiResult = `错误: ${error.message}`
        })
    },
    addLog(message) {
      const timestamp = new Date().toLocaleTimeString()
      this.logs.unshift(`[${timestamp}] ${message}`)
      
      // 限制日志数量
      if (this.logs.length > 50) {
        this.logs = this.logs.slice(0, 50)
      }
    }
  }
}
</script>

<style scoped>
.debug-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.debug-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.debug-section h2 {
  margin-top: 0;
  color: #333;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
}

button:hover {
  background-color: #0056b3;
}

.api-result {
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
}

.api-result pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  padding: 10px;
}

.log-item {
  font-family: monospace;
  font-size: 12px;
  margin: 2px 0;
  padding: 2px 0;
  border-bottom: 1px solid #eee;
}

.log-item:last-child {
  border-bottom: none;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 5px 0;
  padding: 5px;
  background-color: white;
  border-radius: 3px;
}
</style> 