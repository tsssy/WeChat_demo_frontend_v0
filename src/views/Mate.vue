<template>
  <div class="page-container mate-page">
    <!-- Mate 页面骨架 -->
    <h2>Liked matches are shown below</h2>
    <div class="mate-list">
      <!-- 动态渲染已like的match卡片 -->
      <MatchCard
        v-for="match in likedMatches"
        :key="match.match_id"
        :telegramId="match.target_user_id"
        @card-click="goToWhyHim(match)"
      />
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-if="!isLoading && likedMatches.length === 0" class="empty">暂无已喜欢的对象</div>
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
const likedMatches = ref([]) // 已like的match列表
const isLoading = ref(true)
let wsClient = null

// 跳转到WhyHim页面，传递match信息
function goToWhyHim(match) {
  userStore.setCurrentMatch(match)
  router.push('/why-him')
}
// 跳转到Chatroom页面
function goToChatroom(match) {
  userStore.setCurrentMatch(match)
  router.push('/chatroom')
}

// 加载已like的match列表逻辑
async function loadLikedMatches() {
  isLoading.value = true
  likedMatches.value = []
  try {
    // 1. 清理match/chatroom相关记录
    userStore.clearMatchInfo()
    // 2. 获取user_id
    let user_id = userStore.user_id
    if (!user_id) {
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
      wsClient.onMessage = (data) => {
        if (data.type === 'match_update') {
          loadLikedMatches()
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
        // 只保留已like的match
        if (matchInfo.is_liked) {
          matchDetailList.push({
            ...matchInfo,
            match_id
          })
        }
      } catch (e) {
        // 忽略单个match获取失败
      }
    }
    likedMatches.value = matchDetailList
  } catch (err) {
    likedMatches.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadLikedMatches()
})
</script>

<style scoped>
.mate-page {
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.mate-page h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  align-self: center;
}
.mate-list {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .mate-list {
    max-width: 380px;
  }
}
.mate-card {
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

.mate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.mate-card .match-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
}

.mate-card .match-time {
  font-size: 0.8rem;
  color: #999;
}

.mate-card button {
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

.mate-card button:hover {
  background: #0056b3;
}
.match-rate {
  color: #ff6b81;
  font-weight: bold;
  font-size: 0.9rem;
}
.new-badge {
  background: #ff6b81;
  color: #fff;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: bold;
  position: absolute;
  top: 16px;
  right: 16px;
  text-transform: uppercase;
}
</style> 