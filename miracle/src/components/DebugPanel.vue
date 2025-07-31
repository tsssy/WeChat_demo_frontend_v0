<template>
  <div v-if="showDebugInfo" class="debug-panel">
    <div class="debug-header" @click="toggleExpanded">
      <span class="debug-title">🛠️ Debug</span>
      <span class="debug-toggle">{{ isExpanded ? '▼' : '▶' }}</span>
    </div>
    
    <div v-if="isExpanded" class="debug-content">
      <div class="debug-section">
        <strong>Environment:</strong> {{ debugConfig.environment }}
      </div>
      
      <div v-if="userStore.hasUser" class="debug-section">
        <strong>User:</strong> {{ userStore.userId }} ({{ userStore.userName || 'Unknown' }})
        <div class="debug-subsection">
          Gender: {{ userStore.userGender || 'Not set' }} | 
          Age: {{ userStore.userAge || 'Not set' }} | 
          Target: {{ userStore.targetGender || 'Not set' }}
        </div>
      </div>
      
      <div class="debug-section">
        <strong>Route:</strong> {{ route.name || route.path }}
      </div>
      
      <div class="debug-section">
        <button @click="devHelpers.showMemory" class="debug-btn">Memory Info</button>
        <button @click="clearConsole" class="debug-btn">Clear Console</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { debugConfig, devHelpers, DEBUG } from '../utils/debug.js'

const route = useRoute()
const userStore = useUserStore()

const isExpanded = ref(false)
const showDebugInfo = computed(() => DEBUG)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const clearConsole = () => {
  console.clear()
  console.log('🛠️ Console cleared by debug panel')
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #333;
  z-index: 9999;
  min-width: 200px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #333;
  user-select: none;
}

.debug-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.debug-title {
  font-weight: bold;
}

.debug-toggle {
  font-size: 10px;
  color: #888;
}

.debug-content {
  padding: 8px 12px;
  max-height: 300px;
  overflow-y: auto;
}

.debug-section {
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #222;
}

.debug-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.debug-subsection {
  font-size: 10px;
  color: #888;
  margin-top: 2px;
}

.debug-btn {
  background: #333;
  color: #00ff00;
  border: 1px solid #555;
  border-radius: 2px;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  margin-right: 4px;
  margin-top: 4px;
}

.debug-btn:hover {
  background: #444;
}

/* Hide on mobile to avoid clutter */
@media (max-width: 768px) {
  .debug-panel {
    top: 5px;
    right: 5px;
    min-width: 150px;
    font-size: 10px;
  }
  
  .debug-header {
    padding: 4px 8px;
  }
  
  .debug-content {
    padding: 4px 8px;
    max-height: 200px;
  }
}
</style>