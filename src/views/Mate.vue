<template>
  <div class="page-container mate-page">
    <!-- Mate 页面骨架 -->
    <h2>Liked matches are shown below</h2>
    <div class="mate-list">
      <!-- 动态渲染已like的match卡片 -->
      <MatchCard
        v-for="match in likedMatches"
        :key="match.match_id"
        :matchData="match"
        @card-click="goToWhyHim(match)"
      />
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-if="!isLoading && likedMatches.length === 0" class="empty">暂无已喜欢的对象</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { APIServices } from '../services/APIServices.js'
import WebSocketClientSingleton from '../wsclients/WebSocketClient.js'
import MatchCard from '../components/Matches/MatchCard.vue'
import eventBus from '../utils/eventBus.js' // 引入全局事件总线
import { getMessageWebSocketUrl } from '@/utils/config.js' // 引入全局WebSocket地址配置
import { matchCardManager } from '@/utils/matchCardManager.js' // 引入MatchCard管理器

const router = useRouter()
const userStore = useUserStore()
const likedMatches = ref([]) // 已like的match列表
const isLoading = ref(true)
let wsClient = null

// 跳转到WhyHim页面，传递match信息
function goToWhyHim(match) {
  // 清除对应用户的红点
  matchCardManager.hideRedDotForUser(match.target_user_id.toString())
  
  userStore.setCurrentMatch(match)
  router.push('/why-him')
}
// 跳转到Chatroom页面
function goToChatroom(match) {
  // 清除对应用户的红点
  matchCardManager.hideRedDotForUser(match.target_user_id.toString())
  
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
      // 使用全局统一的WebSocket地址
      wsClient = WebSocketClientSingleton.getInstance(getMessageWebSocketUrl(), user_id)
      wsClient.onMessage = (data) => {
        console.log('WebSocket 收到消息:', data) // 调试：打印所有收到的消息
        
        // 【暴力方法】直接轮询所有MatchCard实例
        matchCardManager.handleWebSocketMessage(data)
        
        if (data.type === 'match_update') {
          loadLikedMatches()
        }
        // 监听private类型消息
        if (data.type === 'private') {
          console.log('WebSocket 收到 private 消息:', data) // 调试日志
          // 可根据需要刷新数据
        }
        // 监听private_message类型消息
        if (data.type === 'private_message') {
          console.log('WebSocket 收到 private_message 消息:', data) // 调试日志
          // 可根据需要刷新数据
        }
      }
      wsClient.connect()
      console.log('已连接到 WebSocket /ws/message channel') // 标注已连接
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
          // 直接使用API返回的description_for_target，无需反向修正
          matchDetailList.push({
            ...matchInfo,
            match_id,
            description_for_target: matchInfo.description_for_target // 直接使用API原始顺序
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
  // 监听'private'事件
  eventBus.on('private', onPrivate)
  // 监听'private_message'事件
  eventBus.on('private_message', onPrivateMessage)
  console.log('已注册 eventBus 的 private 和 private_message 事件监听') // 标注已注册
  
  // 调试：打印MatchCard管理器状态
  setTimeout(() => {
    matchCardManager.debugPrintAllInstances()
  }, 1000)
})

onUnmounted(() => {
  // 页面卸载时移除eventBus监听，防止内存泄漏
  eventBus.off('private', onPrivate)
  eventBus.off('private_message', onPrivateMessage)
})

// 处理private事件
function onPrivate(payload) {
  console.log('收到 private 事件', payload)
  // 可根据需要刷新数据
}
// 处理private_message事件
function onPrivateMessage(payload) {
  console.log('收到 private_message 事件', payload)
  // 可根据需要刷新数据
}
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