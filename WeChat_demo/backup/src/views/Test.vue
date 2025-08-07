<template>
  <div class="test-container">
    <h1>测试页面</h1>
    <p>如果你能看到这个页面，说明前端应用正常工作。</p>
    
    <div class="test-section">
      <h2>基本信息</h2>
      <ul>
        <li>页面加载时间: {{ loadTime }}</li>
        <li>当前URL: {{ currentUrl }}</li>
        <li>Vue版本: {{ vueVersion }}</li>
      </ul>
    </div>

    <div class="test-section">
      <h2>功能测试</h2>
      <button @click="testClick">点击测试</button>
      <p v-if="clickCount > 0">点击次数: {{ clickCount }}</p>
    </div>

    <div class="test-section">
      <h2>网络测试</h2>
      <button @click="testNetwork">测试网络连接</button>
      <div v-if="networkResult" class="result">
        <pre>{{ networkResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data() {
    return {
      loadTime: new Date().toLocaleString(),
      currentUrl: window.location.href,
      vueVersion: this.$vue?.version || '未知',
      clickCount: 0,
      networkResult: null
    }
  },
  methods: {
    testClick() {
      this.clickCount++
      console.log('按钮被点击了', this.clickCount, '次')
    },
    async testNetwork() {
      try {
        this.networkResult = '正在测试网络连接...'
        const response = await fetch('/api/test')
        this.networkResult = `网络测试成功\n状态码: ${response.status}\n响应头: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`
      } catch (error) {
        this.networkResult = `网络测试失败: ${error.message}`
      }
    }
  }
}
</script>

<style scoped>
.test-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.test-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.test-section h2 {
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

.result {
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
}

.result pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
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