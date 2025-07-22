import { NetworkManager } from './NetworkManager.js'
import {
  // 用户管理
  CreateNewUserRequest,
  CreateNewUserResponse,
  EditUserAgeRequest,
  EditUserAgeResponse,
  EditTargetGenderRequest,
  EditTargetGenderResponse,
  EditSummaryRequest,
  EditSummaryResponse,
  SaveUserInfoToDatabaseRequest,
  SaveUserInfoToDatabaseResponse,
  GetUserInfoWithUserIdRequest,
  GetUserInfoWithUserIdResponse,
  // 匹配管理
  CreateMatchRequest,
  CreateMatchResponse,
  GetMatchInfoRequest,
  GetMatchInfoResponse,
  ToggleLikeRequest,
  ToggleLikeResponse,
  SaveMatchToDatabaseRequest,
  SaveMatchToDatabaseResponse,
  // 聊天室管理
  GetOrCreateChatroomRequest,
  GetOrCreateChatroomResponse,
  GetChatHistoryRequest,
  GetChatHistoryResponse,
  SaveChatroomHistoryRequest,
  SaveChatroomHistoryResponse,
  ChatMessage
} from './APISchemes.js'

// Miracle Demo API 服务类
export const APIServices = {
  /**
   * 创建新用户
   * @param {CreateNewUserRequest} req
   * @returns {Promise<CreateNewUserResponse>}
   */
  async createNewUser(req) {
    // 保证请求体为对象
    if (typeof req !== 'object' || req === null) throw new Error('createNewUser参数必须为对象')
    console.log('[API][createNewUser] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求创建新用户
    const res = await NetworkManager.post('/api/v1/UserManagement/create_new_user', req)
    console.log('[API][createNewUser] 响应体:', res)
    return new CreateNewUserResponse(res.success, res.user_id)
  },

  /**
   * 编辑用户年龄
   * @param {EditUserAgeRequest} req
   * @returns {Promise<EditUserAgeResponse>}
   */
  async editUserAge(req) {
    // 保证请求体为对象
    if (typeof req !== 'object' || req === null) req = { user_id: req.user_id ?? req, age: req.age ?? 0 }
    console.log('[API][editUserAge] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求编辑用户年龄
    const res = await NetworkManager.post('/api/v1/UserManagement/edit_user_age', req)
    console.log('[API][editUserAge] 响应体:', res)
    return new EditUserAgeResponse(res.success)
  },

  /**
   * 编辑用户目标性别
   * @param {EditTargetGenderRequest} req
   * @returns {Promise<EditTargetGenderResponse>}
   */
  async editTargetGender(req) {
    if (typeof req !== 'object' || req === null) req = { user_id: req.user_id ?? req, target_gender: req.target_gender ?? 0 }
    console.log('[API][editTargetGender] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求编辑用户目标性别
    const res = await NetworkManager.post('/api/v1/UserManagement/edit_target_gender', req)
    console.log('[API][editTargetGender] 响应体:', res)
    return new EditTargetGenderResponse(res.success)
  },

  /**
   * 编辑用户简介
   * @param {EditSummaryRequest} req
   * @returns {Promise<EditSummaryResponse>}
   */
  async editSummary(req) {
    if (typeof req !== 'object' || req === null) req = { user_id: req.user_id ?? req, summary: req.summary ?? '' }
    console.log('[API][editSummary] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求编辑用户简介
    const res = await NetworkManager.post('/api/v1/UserManagement/edit_summary', req)
    console.log('[API][editSummary] 响应体:', res)
    return new EditSummaryResponse(res.success)
  },

  /**
   * 保存用户信息到数据库
   * @param {SaveUserInfoToDatabaseRequest} req
   * @returns {Promise<SaveUserInfoToDatabaseResponse>}
   */
  async saveUserInfoToDatabase(req) {
    if (typeof req !== 'object' || req === null) req = { user_id: req.user_id ?? req }
    console.log('[API][saveUserInfoToDatabase] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求保存用户信息到数据库
    const res = await NetworkManager.post('/api/v1/UserManagement/save_to_database', req)
    console.log('[API][saveUserInfoToDatabase] 响应体:', res)
    return new SaveUserInfoToDatabaseResponse(res.success)
  },

  /**
   * 根据用户id获取用户信息
   * @param {GetUserInfoWithUserIdRequest} req
   * @returns {Promise<GetUserInfoWithUserIdResponse>}
   */
  async getUserInfoWithUserId(req) {
    if (typeof req !== 'object' || req === null) req = { user_id: req.user_id ?? req }
    console.log('[API][getUserInfoWithUserId] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求获取用户信息
    const res = await NetworkManager.post('/api/v1/UserManagement/get_user_info_with_user_id', req)
    console.log('[API][getUserInfoWithUserId] 响应体:', res)
    return new GetUserInfoWithUserIdResponse(
      res.user_id,
      res.telegram_user_name,
      res.telegram_id,
      res.gender,
      res.age,
      res.target_gender,
      res.user_personality_trait,
      res.match_ids
    )
  },

  // ---------------- 匹配管理 ----------------

  /**
   * 创建匹配
   * @param {CreateMatchRequest} req
   * @returns {Promise<CreateMatchResponse>}
   */
  async createMatch(req) {
    if (typeof req !== 'object' || req === null) throw new Error('createMatch参数必须为对象')
    console.log('[API][createMatch] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求创建匹配
    const res = await NetworkManager.post('/api/v1/MatchManager/create_match', req)
    console.log('[API][createMatch] 响应体:', res)
    return new CreateMatchResponse(res.match_id)
  },

  /**
   * 获取匹配信息
   * @param {GetMatchInfoRequest} req
   * @returns {Promise<GetMatchInfoResponse>}
   */
  async getMatchInfo(req) {
    if (typeof req !== 'object' || req === null) req = { user_id: req.user_id ?? req, match_id: req.match_id ?? 0 }
    console.log('[API][getMatchInfo] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求获取匹配信息
    const res = await NetworkManager.post('/api/v1/MatchManager/get_match_info', req)
    console.log('[API][getMatchInfo] 响应体:', res)
    return new GetMatchInfoResponse(
      res.target_user_id,
      res.description_for_target,
      res.is_liked,
      res.match_score,
      res.mutual_game_scores,
      res.chatroom_id
    )
  },

  /**
   * 切换点赞状态
   * @param {ToggleLikeRequest} req
   * @returns {Promise<ToggleLikeResponse>}
   */
  async toggleLike(req) {
    if (typeof req !== 'object' || req === null) req = { match_id: req.match_id ?? req }
    console.log('[API][toggleLike] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求切换点赞状态
    const res = await NetworkManager.post('/api/v1/MatchManager/toggle_like', req)
    console.log('[API][toggleLike] 响应体:', res)
    return new ToggleLikeResponse(res.success)
  },

  /**
   * 保存匹配到数据库
   * @param {SaveMatchToDatabaseRequest} req
   * @returns {Promise<SaveMatchToDatabaseResponse>}
   */
  async saveMatchToDatabase(req) {
    if (typeof req !== 'object' || req === null) req = { match_id: req.match_id ?? req }
    console.log('[API][saveMatchToDatabase] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求保存匹配到数据库
    const res = await NetworkManager.post('/api/v1/MatchManager/save_to_database', req)
    console.log('[API][saveMatchToDatabase] 响应体:', res)
    return new SaveMatchToDatabaseResponse(res.success)
  },

  // ---------------- 聊天室管理 ----------------

  /**
   * 获取或创建聊天室
   * @param {GetOrCreateChatroomRequest} req
   * @returns {Promise<GetOrCreateChatroomResponse>}
   */
  async getOrCreateChatroom(req) {
    if (typeof req !== 'object' || req === null) throw new Error('getOrCreateChatroom参数必须为对象')
    console.log('[API][getOrCreateChatroom] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求获取或创建聊天室
    const res = await NetworkManager.post('/api/v1/ChatroomManager/get_or_create_chatroom', req)
    console.log('[API][getOrCreateChatroom] 响应体:', res)
    return new GetOrCreateChatroomResponse(res.success, res.chatroom_id)
  },

  /**
   * 获取聊天历史记录
   * @param {GetChatHistoryRequest} req
   * @returns {Promise<GetChatHistoryResponse>}
   */
  async getChatHistory(req) {
    if (typeof req !== 'object' || req === null) req = { chatroom_id: req.chatroom_id ?? req, user_id: req.user_id ?? 0 }
    console.log('[API][getChatHistory] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求获取聊天历史记录
    const res = await NetworkManager.post('/api/v1/ChatroomManager/get_chat_history', req)
    console.log('[API][getChatHistory] 响应体:', res)
    const messages = (res.messages || []).map(m => new ChatMessage(m.sender_name, m.message, m.datetime))
    return new GetChatHistoryResponse(res.success, messages)
  },

  /**
   * 保存聊天室历史记录
   * @param {SaveChatroomHistoryRequest} req
   * @returns {Promise<SaveChatroomHistoryResponse>}
   */
  async saveChatroomHistory(req) {
    if (typeof req !== 'object' || req === null) req = { chatroom_id: req.chatroom_id ?? req }
    console.log('[API][saveChatroomHistory] 请求体:', req)
    // 中文注释：通过 NetworkManager 发送 POST 请求保存聊天室历史记录
    const res = await NetworkManager.post('/api/v1/ChatroomManager/save_chatroom_history', req)
    console.log('[API][saveChatroomHistory] 响应体:', res)
    return new SaveChatroomHistoryResponse(res.success)
  }
} 