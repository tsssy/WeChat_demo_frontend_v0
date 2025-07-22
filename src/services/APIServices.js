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
    // 中文注释：通过 NetworkManager 发送 POST 请求创建新用户
    const res = await NetworkManager.post('/api/v1/UserManagement/create_new_user', req)
    return new CreateNewUserResponse(res.success, res.user_id)
  },

  /**
   * 编辑用户年龄
   * @param {EditUserAgeRequest} req
   * @returns {Promise<EditUserAgeResponse>}
   */
  async editUserAge(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求编辑用户年龄
    const res = await NetworkManager.post('/api/v1/UserManagement/edit_user_age', req)
    return new EditUserAgeResponse(res.success)
  },

  /**
   * 编辑用户目标性别
   * @param {EditTargetGenderRequest} req
   * @returns {Promise<EditTargetGenderResponse>}
   */
  async editTargetGender(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求编辑用户目标性别
    const res = await NetworkManager.post('/api/v1/UserManagement/edit_target_gender', req)
    return new EditTargetGenderResponse(res.success)
  },

  /**
   * 编辑用户简介
   * @param {EditSummaryRequest} req
   * @returns {Promise<EditSummaryResponse>}
   */
  async editSummary(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求编辑用户简介
    const res = await NetworkManager.post('/api/v1/UserManagement/edit_summary', req)
    return new EditSummaryResponse(res.success)
  },

  /**
   * 保存用户信息到数据库
   * @param {SaveUserInfoToDatabaseRequest} req
   * @returns {Promise<SaveUserInfoToDatabaseResponse>}
   */
  async saveUserInfoToDatabase(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求保存用户信息到数据库
    const res = await NetworkManager.post('/api/v1/UserManagement/save_to_database', req)
    return new SaveUserInfoToDatabaseResponse(res.success)
  },

  /**
   * 根据用户id获取用户信息
   * @param {GetUserInfoWithUserIdRequest} req
   * @returns {Promise<GetUserInfoWithUserIdResponse>}
   */
  async getUserInfoWithUserId(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求获取用户信息
    const res = await NetworkManager.post('/api/v1/UserManagement/get_user_info_with_user_id', req)
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
    // 中文注释：通过 NetworkManager 发送 POST 请求创建匹配
    const res = await NetworkManager.post('/api/v1/MatchManager/create_match', req)
    return new CreateMatchResponse(res.match_id)
  },

  /**
   * 获取匹配信息
   * @param {GetMatchInfoRequest} req
   * @returns {Promise<GetMatchInfoResponse>}
   */
  async getMatchInfo(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求获取匹配信息
    const res = await NetworkManager.post('/api/v1/MatchManager/get_match_info', req)
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
    // 中文注释：通过 NetworkManager 发送 POST 请求切换点赞状态
    const res = await NetworkManager.post('/api/v1/MatchManager/toggle_like', req)
    return new ToggleLikeResponse(res.success)
  },

  /**
   * 保存匹配到数据库
   * @param {SaveMatchToDatabaseRequest} req
   * @returns {Promise<SaveMatchToDatabaseResponse>}
   */
  async saveMatchToDatabase(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求保存匹配到数据库
    const res = await NetworkManager.post('/api/v1/MatchManager/save_to_database', req)
    return new SaveMatchToDatabaseResponse(res.success)
  },

  // ---------------- 聊天室管理 ----------------

  /**
   * 获取或创建聊天室
   * @param {GetOrCreateChatroomRequest} req
   * @returns {Promise<GetOrCreateChatroomResponse>}
   */
  async getOrCreateChatroom(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求获取或创建聊天室
    const res = await NetworkManager.post('/api/v1/ChatroomManager/get_or_create_chatroom', req)
    return new GetOrCreateChatroomResponse(res.success, res.chatroom_id)
  },

  /**
   * 获取聊天历史记录
   * @param {GetChatHistoryRequest} req
   * @returns {Promise<GetChatHistoryResponse>}
   */
  async getChatHistory(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求获取聊天历史记录
    const res = await NetworkManager.post('/api/v1/ChatroomManager/get_chat_history', req)
    const messages = (res.messages || []).map(m => new ChatMessage(m.sender_name, m.message, m.datetime))
    return new GetChatHistoryResponse(res.success, messages)
  },

  /**
   * 保存聊天室历史记录
   * @param {SaveChatroomHistoryRequest} req
   * @returns {Promise<SaveChatroomHistoryResponse>}
   */
  async saveChatroomHistory(req) {
    // 中文注释：通过 NetworkManager 发送 POST 请求保存聊天室历史记录
    const res = await NetworkManager.post('/api/v1/ChatroomManager/save_chatroom_history', req)
    return new SaveChatroomHistoryResponse(res.success)
  }
} 