<template>
  <div 
    class="match-card"
    @click="handleCardClick"
  >
    <!-- 红点通知 -->
    <div v-if="hasUnreadMessage" class="red-dot"></div>
    
    <!-- 左侧：用户头像圆圈 -->
    <div class="score-section">
      <div class="score-circle">
        <div class="score-text">
          {{ getUserInitial() }}
        </div>
      </div>
    </div>
    
    <!-- 右侧：用户信息 -->
    <div class="user-info">
      <!-- 用户名 -->
      <div class="user-name">
        {{ userData.telegram_user_name || `User ${matchData.target_user_id}` }}
      </div>
      
      <!-- Match页面（未喜欢）显示描述 -->
      <div v-if="!matchData.is_liked" class="user-description">
        {{ matchData.description_for_target || '暂无描述' }}
      </div>
    </div>
    
    <!-- 已喜欢状态的爱心印章 -->
    <div v-if="matchData.is_liked" class="love-stamp">
      <img src="/media/Home/MatchCard/LoveStamp.svg" alt="Love Stamp" />
    </div>
    
    <!-- 箭头 - 只在未喜欢状态下显示 -->
    <div v-if="!matchData.is_liked" class="match-arrow">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<script>
import { matchCardManager } from '@/utils/matchCardManager.js'
import { APIServices } from '@/services/APIServices.js'

export default {
  name: 'MatchCard',
  props: {
    // 保持向后兼容性，优先使用matchData
    telegramId: {
      type: [String, Number],
      required: false
    },
    // 新的match数据对象
    matchData: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      hasUnreadMessage: false,
      userData: {}, // 存储用户信息
      isLoading: true
    }
  },
  computed: {
    // 获取用户ID
    userId() {
      return this.matchData.target_user_id || this.telegramId
    }
  },
  async mounted() {
    // 向全局管理器注册当前实例
    matchCardManager.register(this.userId.toString(), this)
    
    // 获取用户信息
    await this.fetchUserInfo()
  },
  unmounted() {
    // 从全局管理器注销当前实例
    matchCardManager.unregister(this.userId.toString())
  },
  methods: {
    // 获取用户信息
    async fetchUserInfo() {
      try {
        this.isLoading = true
        const userInfo = await APIServices.getUserInfoWithUserId({ 
          user_id: this.userId 
        })
        this.userData = userInfo
        console.log(`获取用户 ${this.userId} 信息成功:`, userInfo)
      } catch (error) {
        console.error(`获取用户 ${this.userId} 信息失败:`, error)
        this.userData = {
          telegram_user_name: `User ${this.userId}`
        }
      } finally {
        this.isLoading = false
      }
    },
    
    // 处理卡片点击事件
    handleCardClick() {
      // 通过管理器清除红点状态（确保持久化状态也被清除）
      matchCardManager.hideRedDotForUser(this.userId.toString())
      this.$emit('card-click', this.userId)
    },
    
    // 显示红点（由管理器调用）
    showRedDot() {
      this.hasUnreadMessage = true
    },
    
    // 隐藏红点（由管理器调用）
    hideRedDot() {
      this.hasUnreadMessage = false
    },

    // 获取用户首字母
    getUserInitial() {
      if (this.userData.telegram_user_name) {
        const userName = this.userData.telegram_user_name;
        // 如果第一个字符是@，使用第二个字符；否则使用第一个字符
        const firstChar = userName.charAt(0) === '@' ? userName.charAt(1) : userName.charAt(0);
        return firstChar.toUpperCase();
      }
      return `U${this.userId.toString().charAt(0).toUpperCase()}`;
    }
  }
}
</script>

<style scoped>
/* 卡片主体样式 - 简化版 */
.match-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 16px;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 24px; /* 从16px增加到24px，增加各部分之间的间距 */
  cursor: pointer;
  margin-bottom: 12px;
  position: relative;
}

.match-card:hover {
  border-color: #fa86a4;
  transform: translateY(-2px);
}

/* 左侧：用户头像区域 */
.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  margin-right: 8px; /* 增加圆圈右边到description的距离 */
}

/* 左侧：用户头像圆圈 */
.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fa86a4, #e75a7c);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-text {
  font-size: 24px; /* 增大字体以显示首字母 */
  font-weight: 700;
  color: white;
}

/* 中间：用户信息区域 */
.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  color: #000; /* 改为黑色 */
  font-family: "Crimson Text"; /* 设置字体系列 */
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-description {
  font-size: 14px;
  color: #858585; /* 改为指定的灰色 */
  font-family: "Source Serif Pro"; /* 设置字体系列 */
  font-style: normal; /* 设置字体样式 */
  word-wrap: break-word;
  text-align: justify; /* 添加两端对齐 */
}

/* 右侧：箭头 */
.match-arrow {
  color: #adb5bd;
  flex-shrink: 0;
  position: relative; /* 确保箭头能够覆盖其他元素 */
  z-index: 20; /* 设置高z-index确保在love-stamp之上 */
}

.match-card:hover .match-arrow {
  color: #fa86a4;
}

/* 爱心印章 - 已喜欢状态显示 */
.love-stamp {
  position: absolute;
  bottom: 0; /* 完全贴合底部，无边距 */
  right: 0; /* 完全贴合右侧，无边距 */
  z-index: 10; /* 设置较低的z-index，确保在箭头下方 */
  pointer-events: none; /* 不阻挡点击事件 */
  height: 80%; /* 占据卡片80%的高度 */
  display: flex;
  align-items: flex-end; /* 图片底部对齐 */
  justify-content: flex-end; /* 图片右侧对齐 */
}

.love-stamp img {
  height: 100%; /* 填满容器高度 */
  width: auto; /* 保持宽高比 */
  opacity: 0.8; /* 稍微透明，让它更融入设计 */
  border-radius: 0 0 15px 0; /* 考虑1px边框，调整为15px与内容区域圆角一致 */
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
  border: 2px solid #ffffff;
  z-index: 10;
}

/* 移动端简化 */
@media (max-width: 480px) {
  .match-card {
    padding: 12px;
    gap: 18px; /* 从12px增加到18px，与桌面端保持比例 */
  }
  
  .score-section {
    margin-right: 6px; /* 移动端对应的右边距 */
  }
  
  .score-circle {
    width: 50px;
    height: 50px;
  }
  
  .score-text {
    font-size: 20px; /* 移动端首字母字体大小 */
  }
  
  .user-name {
    font-size: 16px;
    color: #000; /* 确保移动端也使用黑色 */
    font-family: "Crimson Text"; /* 确保移动端也使用相同字体 */
  }
  
  .user-description {
    font-size: 13px;
    color: #858585; /* 确保移动端也使用指定灰色 */
    font-family: "Source Serif Pro"; /* 确保移动端也使用相同字体 */
    font-style: normal; /* 确保移动端也使用相同字体样式 */
    text-align: justify; /* 移动端也使用两端对齐 */
  }
  
  /* 移动端爱心印章样式调整 */
  .love-stamp {
    bottom: 0; /* 移动端也完全贴合底部 */
    right: 0; /* 移动端也完全贴合右侧 */
    height: 80%; /* 移动端也占据80%高度 */
  }
  
  .love-stamp img {
    height: 100%; /* 移动端图片也填满容器高度 */
    width: auto; /* 移动端也保持宽高比 */
    border-radius: 0 0 15px 0; /* 移动端也调整为15px与内容区域圆角一致 */
  }
}
</style> 