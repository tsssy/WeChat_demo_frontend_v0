<template>
  <div 
    class="match-card"
    @click="handleCardClick"
  >
    <!-- 红点通知 -->
    <div v-if="hasUnreadMessage" class="red-dot"></div>
    
    <div class="match-avatar">
      <div class="avatar-placeholder">
        {{ getInitials(telegramId) }}
      </div>
    </div>
    
    <div class="match-info">
      <div class="match-name">
        User {{ telegramId }}
      </div>
      <div class="match-preview">
        <span class="match-status">💬 Start chatting</span>
      </div>
    </div>
    
    <div class="match-actions">
      <div class="chat-icon">💬</div>
    </div>
  </div>
</template>

<script>
import { matchCardManager } from '@/utils/matchCardManager.js'

export default {
  name: 'MatchCard',
  props: {
    telegramId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      hasUnreadMessage: false
    }
  },
  mounted() {
    // 向全局管理器注册当前实例
    matchCardManager.register(this.telegramId.toString(), this)
  },
  unmounted() {
    // 从全局管理器注销当前实例
    matchCardManager.unregister(this.telegramId.toString())
  },
  methods: {
    // 从telegram ID生成用户头像的缩写
    getInitials(telegramId) {
      const idStr = telegramId.toString()
      return idStr.slice(-2).toUpperCase()
    },
    
    // 处理卡片点击事件
    handleCardClick() {
      // 通过管理器清除红点状态（确保持久化状态也被清除）
      matchCardManager.hideRedDotForUser(this.telegramId.toString())
      this.$emit('card-click', this.telegramId)
    },
    
    // 显示红点（由管理器调用）
    showRedDot() {
      this.hasUnreadMessage = true
    },
    
    // 隐藏红点（由管理器调用）
    hideRedDot() {
      this.hasUnreadMessage = false
    }
  }
}
</script>

<style scoped>
.match-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.match-card:hover {
  background: #2a2a2a;
  border-color: #fa86a4;
  transform: translateY(-2px);
}

.match-card:active {
  transform: translateY(0);
}

.match-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fa86a4, #e75a7c);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
}

.match-info {
  flex: 1;
  min-width: 0;
}

.match-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.match-preview {
  font-size: 14px;
  color: #999;
}

.match-status {
  color: #fa86a4;
  font-weight: 500;
}

.match-actions {
  flex-shrink: 0;
}

.chat-icon {
  font-size: 20px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.match-card:hover .chat-icon {
  opacity: 1;
}

/* 红点样式 */
.red-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  background: #ff4757;
  border-radius: 50%;
  border: 2px solid #1a1a1a;
  z-index: 10;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 移动端优化 */
@media (max-width: 480px) {
  .match-card {
    padding: 12px;
    gap: 12px;
  }
  
  .match-avatar {
    width: 44px;
    height: 44px;
  }
  
  .avatar-placeholder {
    font-size: 14px;
  }
  
  .match-name {
    font-size: 15px;
  }
  
  .red-dot {
    top: 6px;
    right: 6px;
    width: 10px;
    height: 10px;
  }
}
</style> 