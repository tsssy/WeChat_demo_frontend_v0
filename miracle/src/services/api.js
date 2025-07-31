// src/services/api.js
// 统一封装后端接口请求，基础地址通过环境变量获取
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// 获取匹配对象详情
export function getMatchInfo(matchId) {
  return axios.post(`${BASE_URL}/api/v1/MatchManager/get_match_info`, { match_id: matchId })
}

// Like/Unlike 操作
export function toggleLike(matchId) {
  return axios.post(`${BASE_URL}/api/v1/MatchManager/toggle_like`, { match_id: matchId })
}

// 获取/创建聊天室
export function getOrCreateChatroom(userId1, userId2, matchId) {
  return axios.post(`${BASE_URL}/api/v1/ChatroomManager/get_or_create_chatroom`, {
    user_id_1: userId1,
    user_id_2: userId2,
    match_id: matchId
  })
}

// 获取聊天历史
export function getChatHistory(chatroomId, userId) {
  return axios.post(`${BASE_URL}/api/v1/ChatroomManager/get_chat_history`, {
    chatroom_id: chatroomId,
    user_id: userId
  })
}

// 获取用户信息
export function getUserInfo(userId) {
  return axios.post(`${BASE_URL}/api/v1/UserManagement/get_user_info_with_user_id`, { user_id: userId })
}

// 其它接口可按需补充... 