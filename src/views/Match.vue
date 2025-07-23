<template>
  <div class="page-container match-page">
    <!-- Match 页面骨架 -->
    <h2>Matches for you</h2>
    <div class="match-list">
      <!-- 动态渲染未like的match卡片 -->
      <MatchCard
        v-for="match in matches"
        :key="match.match_id"
        :telegramId="match.target_user_id"
        @card-click="goToWhyHim(match)"
      />
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-if="!isLoading && matches.length === 0" class="empty">暂无可配对对象</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { APIServices } from '../services/APIServices.js'
import WebSocketClientSingleton from '../wsclients/WebSocketClient.js'
import MatchCard from '../components/Matches/MatchCard.vue'

const router = useRouter()
const userStore = useUserStore()
const matches = ref([]) // 未like的match列表
const isLoading = ref(true)
let wsClient = null

// 跳转到WhyHim页面，传递match信息
function goToWhyHim(match) {
  // 可根据需要将match信息存入store/session
  userStore.setCurrentMatch(match)
  router.push('/why-him')
}
// 跳转到Chatroom页面
function goToChatroom(match) {
  userStore.setCurrentMatch(match)
  router.push('/chatroom')
}

// 加载match列表逻辑
async function loadMatches() {
  isLoading.value = true
  matches.value = []
  try {
    // 1. 清理match/chatroom相关记录
    userStore.clearMatchInfo()
    // 2. 获取user_id
    let user_id = userStore.user_id
    if (!user_id) {
      // 尝试从session恢复
      user_id = userStore.getUserIdFromSession()
    }
    if (!user_id) {
      await userStore.initUser()
      user_id = userStore.user_id
    }
    if (!user_id) throw new Error('无法获取用户ID')

    // 3. 连接WebSocket
    if (!wsClient) {
      wsClient = WebSocketClientSingleton.getInstance('/ws/message', user_id)
      // 监听websocket消息，实时刷新match
      wsClient.onMessage = (data) => {
        // 这里可根据data类型判断是否需要刷新match
        if (data.type === 'match_update') {
          loadMatches()
        }
      }
      wsClient.connect()
    }

    // 4. 获取用户信息，拿到match_ids
    const userInfo = await APIServices.getUserInfoWithUserId({ user_id })
    const match_ids = userInfo.match_ids || []
    // 5. 遍历match_ids，获取每个match详细信息
    const matchDetailList = []
    for (const match_id of match_ids) {
      try {
        const matchInfo = await APIServices.getMatchInfo({ user_id, match_id })
        // 只保留未like的match
        if (!matchInfo.is_liked) {
          matchDetailList.push({
            ...matchInfo,
            match_id
          })
        }
      } catch (e) {
        // 忽略单个match获取失败
      }
    }
    matches.value = matchDetailList
  } catch (err) {
    // 错误处理
    matches.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadMatches()
})
</script>

<style scoped>
.match-page {
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.match-page h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  align-self: center;
}
.match-list {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .match-list {
    max-width: 380px;
  }
}
.match-card {
  background: #f8f8f8;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.match-card .match-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
}

.match-card .match-desc {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #666;
}

.match-card .match-date {
  font-size: 0.8rem;
  color: #999;
}

.match-card button {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 4px;
  transition: background-color 0.3s;
}

.match-card button:hover {
  background: #0056b3;
}
.match-rate {
  color: #ff6b81;
  font-weight: bold;
  font-size: 0.9rem;
}
.match-dot {
  width: 8px;
  height: 8px;
  background: #ff6b81;
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 16px;
}
</style> 