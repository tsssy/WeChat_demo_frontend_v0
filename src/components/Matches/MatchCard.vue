<template>
  <div 
    class="match-card"
    @click="handleCardClick"
  >
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
export default {
  name: 'MatchCard',
  props: {
    telegramId: {
      type: [String, Number],
      required: true
    }
  },
  methods: {
    // 从telegram ID生成用户头像的缩写
    getInitials(telegramId) {
      const idStr = telegramId.toString()
      return idStr.slice(-2).toUpperCase()
    },
    
    // 处理卡片点击事件
    handleCardClick() {
      this.$emit('card-click', this.telegramId)
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
}
</style> 