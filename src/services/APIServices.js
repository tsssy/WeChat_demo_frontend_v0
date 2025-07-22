import { useApiRequester } from '../composables/useApiRequester.js'
import { debugLog } from '../utils/debug.js'

// Import all request and response schemas
import {
  // User Service Schemas
  CreateFemaleUserRequest,
  CreateFemaleUserResponse,
  CreateMaleUserRequest,
  CreateMaleUserResponse,
  GetTelegramSessionGenderRequest,
  GetTelegramSessionGenderResponse,
  GetUserExistRequest,
  GetUserExistResponse,
  GetUserInfoRequest,
  GetUserInfoResponse,
  
  // Card Poll Service Schemas
  EditAnswerRequest,
  EditAnswerResponse,
  ToggleQuestionSaveRequest,
  ToggleQuestionSaveResponse,
  GetQuestionRequest,
  GetQuestionResponse,
  BlockAnswerRequest,
  BlockAnswerResponse,
  LikeAnswerRequest,
  LikeAnswerResponse,
  GetCardPollAnswerRequest,
  GetCardPollAnswerResponse,
  
  // Message Service Schemas
  GetMatchedUsersRequest,
  GetMatchedUsersResponse,
  
  // Question Answer Management Schemas
  NewQuestionRequest,
  NewQuestionResponse,
  ToggleQuestionActiveRequest,
  ToggleQuestionActiveResponse,
  GetAnswerListRequest,
  GetAnswerListResponse,
  GetQuestionListRequest,
  GetQuestionListResponse,
  GetQAMAnswerRequest,
  GetQAMAnswerResponse,
  GetQuestionInfoRequest,
  GetQuestionInfoResponse,
  GetAnswerInfoRequest,
  GetAnswerInfoResponse,
  
  // Utility functions
  validateRequest,
  createResponse
} from './APISchemes.js'

/**
 * Unified API Service Class
 * Handles all API communications with proper schema validation and response parsing
 */
export class APIService {
  constructor() {
    // Initialize API requester
    const { 
      post,
      get,
      put,
      patch,
      del,
      isLoading, 
      error, 
      clearError,
      setAuthToken,
      getAuthToken
    } = useApiRequester()
    
    // Bind API methods to this instance
    this.post = post
    this.get = get
    this.put = put
    this.patch = patch
    this.del = del
    this.isLoading = isLoading
    this.error = error
    this.clearError = clearError
    this.setAuthToken = setAuthToken
    this.getAuthToken = getAuthToken
    
    // API Configuration
    this.BASE_URL = 'https://lovetapoversea.xyz:4433'
    
    // Fake Mode Configuration
    this.FAKE_MODE = true // Toggle this to enable/disable fake responses
    this.FAKE_DELAY = 500 // Simulate network delay in milliseconds
    
    // API Endpoints
    this.ENDPOINTS = {
      // User Service
      CREATE_FEMALE_USER: '/api/v1/users/create_new_female_user',
      CREATE_MALE_USER: '/api/v1/users/create_new_male_user',
      GET_USER_FROM_TELEGRAM_SESSION: '/api/v1/users/get_user_from_telegram_session',
      GET_USER_EXIST: '/api/v1/users/get_user_exist',
      GET_USER_INFO: '/api/v1/users/get_user_info',
      
      // Card Poll Service
      EDIT_ANSWER: '/api/v1/cardpoll/edit_answer',
      TOGGLE_QUESTION_SAVE: '/api/v1/cardpoll/toggle_question_save',
      GET_QUESTION: '/api/v1/cardpoll/get_question',
      BLOCK_ANSWER: '/api/v1/cardpoll/block_answer',
      LIKE_ANSWER: '/api/v1/cardpoll/like_answer',
      GET_ANSWER: '/api/v1/cardpoll/get_answer',
      
      // Message Service
      GET_MATCHED_USERS: '/api/v1/message/get_matched_users',
      
      // Question Answer Management Service
      NEW_QUESTION: '/api/v1/question_answer_management/new_question',
      TOGGLE_QUESTION_ACTIVE: '/api/v1/question_answer_management/toggle_question_active',
      GET_ANSWER_LIST_FOR_A_QUESTION: '/api/v1/question_answer_management/get_answer_list_for_a_question',
      GET_QUESTION_LIST: '/api/v1/question_answer_management/get_question_list',
      GET_ANSWER_QAM: '/api/v1/question_answer_management/get_qa_answer',
      GET_QUESTION_INFO: '/api/v1/question_answer_management/get_question_info',
      GET_ANSWER_INFO: '/api/v1/question_answer_management/get_answer_info'
    }
    
    debugLog.log('🚀 APIService initialized with endpoints:', this.ENDPOINTS)
  }

    /**
   * Helper function to convert telegram ID to integer if it's a numerical string
   * @param {string|number} telegramId - The telegram ID to convert
   * @returns {number} - The telegram ID as an integer
   */
  _normalizeTelegramId(telegramId) {
    // If it's already a number, return it
    if (typeof telegramId === 'number') {
      return telegramId
    }
    
    // If it's a string, check if it contains only numbers
    if (typeof telegramId === 'string') {
      // Check if the string contains only digits
      if (/^\d+$/.test(telegramId)) {
        const converted = parseInt(telegramId, 10)
        debugLog.log(`🔄 Converting telegram ID from string "${telegramId}" to integer ${converted}`)
        return converted
      }
    }
    
    // If it's not a valid format, return as-is (will be caught by validation)
    debugLog.log(`⚠️ Telegram ID "${telegramId}" (type: ${typeof telegramId}) is not a valid numerical format`)
    return telegramId
  }

  // ============================================================================
  // USER SERVICE METHODS
  // ============================================================================

  /**
   * Create a new female user
   * @param {number|string} telegramId - Telegram user ID (will be converted to integer if string)
   * @param {string} telegramUserName - Telegram username
   * @param {number} mode - User mode (1 or 3, optional)
   * @returns {Promise<CreateFemaleUserResponse>}
   */
  async createFemaleUser(telegramId, telegramUserName, mode = null) {
    try {
      // Normalize telegram ID to integer if it's a numerical string
      const normalizedTelegramId = this._normalizeTelegramId(telegramId)
      
      debugLog.log('👤 Creating female user with telegram_id:', normalizedTelegramId, 'username:', telegramUserName, 'mode:', mode)
      
      const request = new CreateFemaleUserRequest(normalizedTelegramId, telegramUserName, mode)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for createFemaleUser')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeUserResponses().createFemaleUser()
        return CreateFemaleUserResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.CREATE_FEMALE_USER, request)
      return CreateFemaleUserResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ createFemaleUser failed:', error)
      throw error
    }
  }

  /**
   * Create a new male user
   * @param {number|string} telegramId - Telegram user ID (will be converted to integer if string)
   * @param {string} telegramUserName - Telegram username
   * @param {number} mode - User mode (1 or 3, optional)
   * @returns {Promise<CreateMaleUserResponse>}
   */
  async createMaleUser(telegramId, telegramUserName, mode = null) {
    try {
      // Normalize telegram ID to integer if it's a numerical string
      const normalizedTelegramId = this._normalizeTelegramId(telegramId)
      
      debugLog.log('👤 Creating male user with telegram_id:', normalizedTelegramId, 'username:', telegramUserName, 'mode:', mode)
      
      const request = new CreateMaleUserRequest(normalizedTelegramId, telegramUserName, mode)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) { //this.FAKE_MODE
        debugLog.log('🎭 Using fake response for createMaleUser')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeUserResponses().createMaleUser()
        return CreateMaleUserResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.CREATE_MALE_USER, request)
      return CreateMaleUserResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ createMaleUser failed:', error)
      throw error
    }
  }

  /**
   * Get user gender from telegram session
   * @param {number|string} telegramId - Telegram user ID (will be converted to integer if string)
   * @returns {Promise<GetTelegramSessionGenderResponse>}
   */
  async getUserFromTelegramSession(telegramId) {
    try {
      // Normalize telegram ID to integer if it's a numerical string
      const normalizedTelegramId = this._normalizeTelegramId(telegramId)
      
      debugLog.log('👤 Getting user from telegram session:', normalizedTelegramId)
      
      const request = new GetTelegramSessionGenderRequest(normalizedTelegramId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getUserFromTelegramSession')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeUserResponses().getUserFromTelegramSession()
        return GetTelegramSessionGenderResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_USER_FROM_TELEGRAM_SESSION, request)
      return GetTelegramSessionGenderResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getUserFromTelegramSession failed:', error)
      throw error
    }
  }

  /**
   * Check if user exists
   * @param {number|string} telegramId - Telegram user ID (will be converted to integer if string)
   * @returns {Promise<GetUserExistResponse>}
   */
  async getUserExist(telegramId) {
    try {
      // Normalize telegram ID to integer if it's a numerical string
      const normalizedTelegramId = this._normalizeTelegramId(telegramId)
      
      debugLog.log('👤 Checking if user exists:', normalizedTelegramId)
      
      const request = new GetUserExistRequest(normalizedTelegramId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getUserExist')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeUserResponses().getUserExist()
        return GetUserExistResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_USER_EXIST, request)
      return GetUserExistResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getUserExist failed:', error)
      throw error
    }
  }

  /**
   * Get user information
   * @param {number|string} telegramId - Telegram user ID (will be converted to integer if string)
   * @returns {Promise<GetUserInfoResponse>}
   */
  async getUserInfo(telegramId) {
    try {
      // Normalize telegram ID to integer if it's a numerical string
      const normalizedTelegramId = this._normalizeTelegramId(telegramId)
      
      debugLog.log('👤 Getting user info:', normalizedTelegramId)
      
      const request = new GetUserInfoRequest(normalizedTelegramId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getUserInfo')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeUserResponses().getUserInfo()
        return GetUserInfoResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_USER_INFO, request)
      return GetUserInfoResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getUserInfo failed:', error)
      throw error
    }
  }

  // ============================================================================
  // CARD POLL SERVICE METHODS
  // ============================================================================

  /**
   * Edit an answer
   * @param {number|string} telegramId - Telegram user ID (will be converted to integer if string)
   * @param {string} questionId - Question ID
   * @param {string} newAnswer - New answer content
   * @param {boolean} isSend - Whether to send the answer
   * @param {string} answerId - Answer ID (optional)
   * @param {boolean} answerIsDraft - Whether answer is draft (optional)
   * @returns {Promise<EditAnswerResponse>}
   */
  async editAnswer(telegramId, questionId, newAnswer, isSend, answerId = null, answerIsDraft = null) {
    try {
      // Normalize telegram ID to integer if it's a numerical string
      const normalizedTelegramId = this._normalizeTelegramId(telegramId)
      
      debugLog.log('📝 Editing answer:', { telegramId: normalizedTelegramId, questionId, newAnswer, isSend, answerId, answerIsDraft })
      
      const request = new EditAnswerRequest(normalizedTelegramId, questionId, newAnswer, isSend, answerId, answerIsDraft)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for editAnswer')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeCardPollResponses().editAnswer()
        return EditAnswerResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.EDIT_ANSWER, request)
      return EditAnswerResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ editAnswer failed:', error)
      throw error
    }
  }

  /**
   * Toggle question save status
   * @param {number} telegramId - Telegram user ID
   * @param {string} questionId - Question ID
   * @returns {Promise<ToggleQuestionSaveResponse>}
   */
  async toggleQuestionSave(telegramId, questionId) {
    try {
      debugLog.log('💾 Toggling question save:', { telegramId, questionId })
      
      const request = new ToggleQuestionSaveRequest(telegramId, questionId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for toggleQuestionSave')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeCardPollResponses().toggleQuestionSave()
        return ToggleQuestionSaveResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.TOGGLE_QUESTION_SAVE, request)
      return ToggleQuestionSaveResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ toggleQuestionSave failed:', error)
      throw error
    }
  }

  /**
   * Get a question
   * @param {number} telegramId - Telegram user ID
   * @param {boolean} isSwipingTowardLeft - Swipe direction
   * @returns {Promise<GetQuestionResponse>}
   */
  async getQuestion(telegramId, isSwipingTowardLeft) {
    try {
      debugLog.log('❓ Getting question:', { telegramId, isSwipingTowardLeft })
      
      const request = new GetQuestionRequest(telegramId, isSwipingTowardLeft)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getQuestion')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeCardPollResponses().getQuestion()
        return GetQuestionResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_QUESTION, request)
      return GetQuestionResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getQuestion failed:', error)
      throw error
    }
  }

  /**
   * Block an answer
   * @param {number} telegramId - Telegram user ID
   * @param {string} answerId - Answer ID to block
   * @returns {Promise<BlockAnswerResponse>}
   */
  async blockAnswer(telegramId, answerId) {
    try {
      debugLog.log('🚫 Blocking answer:', { telegramId, answerId })
      
      const request = new BlockAnswerRequest(telegramId, answerId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for blockAnswer')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeCardPollResponses().blockAnswer()
        return BlockAnswerResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.BLOCK_ANSWER, request)
      return BlockAnswerResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ blockAnswer failed:', error)
      throw error
    }
  }

  /**
   * Like an answer
   * @param {number} telegramId - Telegram user ID
   * @param {number} answerId - Answer ID to like
   * @returns {Promise<LikeAnswerResponse>}
   */
  async likeAnswer(telegramId, answerId) {
    try {
      debugLog.log('❤️ Liking answer:', { telegramId, answerId })
      
      const request = new LikeAnswerRequest(telegramId, answerId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for likeAnswer')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeCardPollResponses().likeAnswer()
        return LikeAnswerResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.LIKE_ANSWER, request)
      return LikeAnswerResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ likeAnswer failed:', error)
      throw error
    }
  }

  /**
   * Get an answer (Card Poll service)
   * @param {number} telegramId - Telegram user ID
   * @param {boolean} isSwipingTowardLeft - Swipe direction
   * @returns {Promise<GetCardPollAnswerResponse>}
   */
  async getAnswer(telegramId, isSwipingTowardLeft) {
    try {
      debugLog.log('💬 Getting answer (Card Poll):', { telegramId, isSwipingTowardLeft })
      
      const request = new GetCardPollAnswerRequest(telegramId, isSwipingTowardLeft)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getAnswer (Card Poll)')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeCardPollResponses().getAnswer()
        return GetCardPollAnswerResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_ANSWER, request)
      return GetCardPollAnswerResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getAnswer (Card Poll) failed:', error)
      throw error
    }
  }

  // ============================================================================
  // MESSAGE SERVICE METHODS
  // ============================================================================

  /**
   * Get matched users
   * @param {number} telegramId - Telegram user ID
   * @returns {Promise<GetMatchedUsersResponse>}
   */
  async getMatchedUsers(telegramId) {
    try {
      debugLog.log('💕 Getting matched users:', telegramId)
      
      const request = new GetMatchedUsersRequest(telegramId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getMatchedUsers')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeMessageResponses().getMatchedUsers()
        return GetMatchedUsersResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_MATCHED_USERS, request)
      return GetMatchedUsersResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getMatchedUsers failed:', error)
      throw error
    }
  }

  // ============================================================================
  // QUESTION ANSWER MANAGEMENT SERVICE METHODS
  // ============================================================================

  /**
   * Create a new question
   * @param {number} telegramId - Telegram user ID
   * @param {string} questionString - Question content
   * @returns {Promise<NewQuestionResponse>}
   */
  async newQuestion(telegramId, questionString) {
    try {
      debugLog.log('❓ Creating new question:', { telegramId, questionString })
      
      const request = new NewQuestionRequest(telegramId, questionString)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for newQuestion')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeQuestionManagementResponses().newQuestion()
        return NewQuestionResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.NEW_QUESTION, request)
      return NewQuestionResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ newQuestion failed:', error)
      throw error
    }
  }

  /**
   * Toggle question active status
   * @param {string} questionId - Question ID
   * @returns {Promise<ToggleQuestionActiveResponse>}
   */
  async toggleQuestionActive(questionId) {
    try {
      debugLog.log('🔄 Toggling question active:', questionId)
      
      const request = new ToggleQuestionActiveRequest(questionId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for toggleQuestionActive')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeQuestionManagementResponses().toggleQuestionActive()
        return ToggleQuestionActiveResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.TOGGLE_QUESTION_ACTIVE, request)
      return ToggleQuestionActiveResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ toggleQuestionActive failed:', error)
      throw error
    }
  }

  /**
   * Get answer list for a question
   * @param {string} questionId - Question ID
   * @returns {Promise<GetAnswerListResponse>}
   */
  async getAnswerListForAQuestion(questionId) {
    try {
      debugLog.log('📋 Getting answer list for question:', questionId)
      
      const request = new GetAnswerListRequest(questionId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getAnswerListForAQuestion')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeQuestionManagementResponses().getAnswerListForAQuestion()
        return GetAnswerListResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_ANSWER_LIST_FOR_A_QUESTION, request)
      return GetAnswerListResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getAnswerListForAQuestion failed:', error)
      throw error
    }
  }

  /**
   * Get question list
   * @param {number} telegramId - Telegram user ID
   * @returns {Promise<GetQuestionListResponse>}
   */
  async getQuestionList(telegramId) {
    try {
      debugLog.log('📝 Getting question list:', telegramId)
      
      const request = new GetQuestionListRequest(telegramId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getQuestionList')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeQuestionManagementResponses().getQuestionList()
        return GetQuestionListResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_QUESTION_LIST, request)
      return GetQuestionListResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getQuestionList failed:', error)
      throw error
    }
  }

  /**
   * Get answer (Question Answer Management service)
   * @param {number} telegramId - Telegram user ID
   * @returns {Promise<GetQAMAnswerResponse>}
   */
  async getAnswerQAM(telegramId) {
    try {
      debugLog.log('💬 Getting answer (QAM):', telegramId)
      
      const request = new GetQAMAnswerRequest(telegramId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getAnswerQAM')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeQuestionManagementResponses().getAnswer()
        return GetQAMAnswerResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_ANSWER_QAM, request)
      return GetQAMAnswerResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getAnswerQAM failed:', error)
      throw error
    }
  }

  /**
   * Get question info
   * @param {string} questionId - Question ID
   * @returns {Promise<GetQuestionInfoResponse>}
   */
  async getQuestionInfo(questionId) {
    try {
      debugLog.log('📋 Getting question info:', questionId)
      
      const request = new GetQuestionInfoRequest(questionId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getQuestionInfo')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeQuestionManagementResponses().getQuestionInfo()
        return GetQuestionInfoResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_QUESTION_INFO, request)
      return GetQuestionInfoResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getQuestionInfo failed:', error)
      throw error
    }
  }

  /**
   * Get answer info
   * @param {string} answerId - Answer ID
   * @returns {Promise<GetAnswerInfoResponse>}
   */
  async getAnswerInfo(answerId) {
    try {
      debugLog.log('💬 Getting answer info:', answerId)
      
      const request = new GetAnswerInfoRequest(answerId)
      validateRequest(request)
      
      // Check if fake mode is enabled
      if (this.FAKE_MODE) {
        debugLog.log('🎭 Using fake response for getAnswerInfo')
        await this.simulateDelay()
        const fakeResponse = this.generateFakeQuestionManagementResponses().getAnswerInfo()
        return GetAnswerInfoResponse.fromApiResponse(fakeResponse)
      }
      
      const response = await this.post(this.ENDPOINTS.GET_ANSWER_INFO, request)
      return GetAnswerInfoResponse.fromApiResponse(response.data)
    } catch (error) {
      debugLog.error('❌ getAnswerInfo failed:', error)
      throw error
    }
  }

  // ============================================================================
  // FAKE MODE METHODS
  // ============================================================================

  /**
   * Toggle fake mode on/off
   * @param {boolean} enabled - Whether to enable fake mode
   */
  toggleFakeMode(enabled = null) {
    if (enabled !== null) {
      this.FAKE_MODE = enabled
    } else {
      this.FAKE_MODE = !this.FAKE_MODE
    }
    
    debugLog.log(`🎭 Fake mode ${this.FAKE_MODE ? 'ENABLED' : 'DISABLED'}`)
    return this.FAKE_MODE
  }

  /**
   * Set fake response delay
   * @param {number} delay - Delay in milliseconds
   */
  setFakeDelay(delay) {
    this.FAKE_DELAY = delay
    debugLog.log(`⏱️ Fake delay set to ${delay}ms`)
  }

  /**
   * Simulate network delay
   */
  async simulateDelay() {
    if (this.FAKE_MODE && this.FAKE_DELAY > 0) {
      await new Promise(resolve => setTimeout(resolve, this.FAKE_DELAY))
    }
  }

  // ============================================================================
  // FAKE RESPONSE GENERATORS
  // ============================================================================

  /**
   * Generate fake user responses
   */
  generateFakeUserResponses() {
    return {
      createFemaleUser: () => ({
        success: true // 90% success rate
      }),
      
      createMaleUser: () => ({
        success: false
      }),
      
      getUserFromTelegramSession: () => ({
        gender: 2 // Random gender
      }),
      
      getUserExist: () => ({
        success: false // 70% chance user exists
      }),
      
      getUserInfo: () => ({
        gender: 1, // 1 or 2
        question_list: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
          `fake_question_${Date.now()}_${Math.random()}`
        ),
        answer_list: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          `fake_answer_${Date.now()}_${Math.random()}`
        ),
        paired_user: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          Math.floor(Math.random() * 1000000) + 100000
        ),
        profile_photo: Math.floor(Math.random() * 5) + 1,
        mode: Math.floor(Math.random() * 3) + 1,
        profile: {
        },
        model_id: `fake_model_${Date.now()}`,
        saved_list_question: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          `fake_saved_question_${Date.now()}_${Math.random()}`
        ),
        saved_list_answer: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => 
          `fake_saved_answer_${Date.now()}_${Math.random()}`
        )
      })
    }
  }

  /**
   * Generate fake card poll responses
   */
  generateFakeCardPollResponses() {
    const fakeQuestions = [
      "What's your favorite way to spend a weekend?",
      "If you could travel anywhere, where would you go?",
      "What's the most adventurous thing you've ever done?",
      "What's your ideal date night?",
      "What's your biggest fear?",
      "What's your dream job?",
      "What's your favorite movie genre?",
      "What's your biggest pet peeve?",
      "What's your favorite season and why?",
      "What's your biggest accomplishment?"
    ]

    const fakeAnswers = [
      "I love hiking and exploring nature!",
      "I enjoy trying new restaurants and cuisines.",
      "I'm a big fan of movie nights at home.",
      "I love traveling and experiencing new cultures.",
      "I enjoy reading books and learning new things.",
      "I'm passionate about fitness and healthy living.",
      "I love music and playing instruments.",
      "I enjoy cooking and experimenting with recipes.",
      "I'm a tech enthusiast and love gadgets.",
      "I enjoy photography and capturing moments."
    ]

    return {
      editAnswer: () => ({
        answer_id: `fake_answer_${Date.now()}`,
        answer_string: fakeAnswers[Math.floor(Math.random() * fakeAnswers.length)],
        is_draft: true
      }),
      
      toggleQuestionSave: () => ({
        is_saved: Math.random() > 0.5
      }),
      
      getQuestion: () => {
        const hasAnswer = Math.random() > 0.6
        return {
          question_id: `fake_question_${Date.now()}`,
          question_content: fakeQuestions[Math.floor(Math.random() * fakeQuestions.length)],
          is_saved: Math.random() > 0.3,
          answer_id: hasAnswer ? `fake_answer_${Date.now()}` : null,
          answer_string: hasAnswer ? fakeAnswers[Math.floor(Math.random() * fakeAnswers.length)] : null,
          answer_is_draft: hasAnswer ? Math.random() > 0.8 : null
        }
      },
      
      blockAnswer: () => ({
        success: Math.random() > 0.1
      }),
      
      likeAnswer: () => {
        const isLiked = Math.random() > 0.7
        return {
          paired_telegram_id: isLiked ? Math.floor(Math.random() * 1000000) + 100000 : null,
          is_liked: isLiked
        }
      },
      
      getAnswer: () => ({
        answer_id: `fake_answer_${Date.now()}`,
        answer_content: fakeAnswers[Math.floor(Math.random() * fakeAnswers.length)],
        question_string: fakeQuestions[Math.floor(Math.random() * fakeQuestions.length)],
        is_liked: Math.random() > 0.4
      })
    }
  }

  /**
   * Generate fake message responses
   */
  generateFakeMessageResponses() {
    return {
      getMatchedUsers: () => ({
        telegram_id_list: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
          Math.floor(Math.random() * 1000000) + 100000
        )
      })
    }
  }

  /**
   * Generate fake question management responses
   */
  generateFakeQuestionManagementResponses() {
    const fakeQuestions = [
      "What's your favorite color?",
      "Do you prefer cats or dogs?",
      "What's your favorite food?",
      "What's your dream vacation?",
      "What's your biggest fear?",
      "What's your favorite hobby?",
      "What's your ideal partner like?",
      "What's your biggest goal in life?",
      "What's your favorite book?",
      "What's your biggest pet peeve?"
    ]

    const fakeAnswers = [
      "I love blue!",
      "I prefer dogs, they're so loyal!",
      "I love Italian food!",
      "I'd love to visit Japan!",
      "I'm afraid of heights.",
      "I love playing guitar.",
      "Someone who makes me laugh.",
      "To travel the world!",
      "The Great Gatsby.",
      "People who are always late."
    ]

    return {
      newQuestion: () => ({
        success: Math.random() > 0.1
      }),
      
      toggleQuestionActive: () => ({
        success: Math.random() > 0.1
      }),
      
      getAnswerListForAQuestion: () => ({
        answer_list: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          `fake_answer_${Date.now()}_${Math.random()}`
        ),
        answer_string: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          fakeAnswers[Math.floor(Math.random() * fakeAnswers.length)]
        )
      }),
      
      getQuestionList: () => ({
        question_list: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
          `fake_question_${Date.now()}_${Math.random()}`
        ),
        question_strings: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
          fakeQuestions[Math.floor(Math.random() * fakeQuestions.length)]
        )
      }),
      
      getAnswer: () => ({
        answer_id_list: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          `fake_answer_${Date.now()}_${Math.random()}`
        ),
        question_id_list: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          `fake_question_${Date.now()}_${Math.random()}`
        ),
        answer_content: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          fakeAnswers[Math.floor(Math.random() * fakeAnswers.length)]
        ),
        question_content: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          fakeQuestions[Math.floor(Math.random() * fakeQuestions.length)]
        )
      }),
      
      getQuestionInfo: () => ({
        question_id: `fake_question_${Date.now()}`,
        content: fakeQuestions[Math.floor(Math.random() * fakeQuestions.length)],
        telegram_id: `fake_telegram_${Math.floor(Math.random() * 1000000) + 100000}`,
        is_draft: Math.random() > 0.8,
        created_at: new Date().toISOString(),
        answer_list: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
          `fake_answer_${Date.now()}_${Math.random()}`
        ),
        blocked_answer_list: Array.from({ length: Math.floor(Math.random() * 2) }, () => 
          `fake_blocked_answer_${Date.now()}_${Math.random()}`
        ),
        liked_answer_list: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          `fake_liked_answer_${Date.now()}_${Math.random()}`
        ),
        is_active: Math.random() > 0.2
      }),
      
      getAnswerInfo: () => ({
        answer_id: `fake_answer_${Date.now()}`,
        content: fakeAnswers[Math.floor(Math.random() * fakeAnswers.length)],
        question_id: `fake_question_${Date.now()}`,
        telegram_id: `fake_telegram_${Math.floor(Math.random() * 1000000) + 100000}`,
        is_draft: Math.random() > 0.8,
        created_at: new Date().toISOString(),
        liked_user_ids: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => 
          `fake_user_${Math.floor(Math.random() * 1000000) + 100000}`
        ),
        is_active: Math.random() > 0.1
      })
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get current loading state
   * @returns {boolean}
   */
  getLoadingState() {
    return this.isLoading.value
  }

  /**
   * Get current error state
   * @returns {Object|null}
   */
  getErrorState() {
    return this.error.value
  }

  /**
   * Clear current error
   */
  clearErrorState() {
    this.clearError()
  }

  /**
   * Set authentication token
   * @param {string} token - Auth token
   */
  setToken(token) {
    this.setAuthToken(token)
    debugLog.log('🔐 Auth token set')
  }

  /**
   * Get current authentication token
   * @returns {string|null}
   */
  getToken() {
    return this.getAuthToken()
  }

  /**
   * Get all available endpoints
   * @returns {Object}
   */
  getEndpoints() {
    return { ...this.ENDPOINTS }
  }

  /**
   * Get base URL
   * @returns {string}
   */
  getBaseUrl() {
    return this.BASE_URL
  }

  /**
   * Get fake mode status
   * @returns {boolean}
   */
  getFakeMode() {
    return this.FAKE_MODE
  }

  /**
   * Get fake delay setting
   * @returns {number}
   */
  getFakeDelay() {
    return this.FAKE_DELAY
  }
}

// Create and export a singleton instance
export const apiService = new APIService()

// Export the class for custom instances if needed
export default APIService

// ============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// ============================================================================

/*
HOW TO USE APIServices IN YOUR CODE:

1. BASIC IMPORT AND USAGE:
   import { apiService } from '@/services/APIServices.js'
   
   // Simple API call
   try {
     const response = await apiService.createMaleUser(123456789, 'john_doe', 1)
     if (response.success) {
       console.log('User created successfully!')
     }
   } catch (error) {
     console.error('Failed to create user:', error.message)
   }

2. VUE COMPONENT INTEGRATION:
   // In a Vue component
   import { apiService } from '@/services/APIServices.js'
   
   export default {
     data() {
       return {
         telegramId: 123456789,
         isLoading: false,
         userGender: null
       }
     },
     methods: {
       async createUser() {
         try {
           this.isLoading = true
           
           // Check if user exists first
           const existResponse = await apiService.getUserExist(this.telegramId)
           
           if (!existResponse.success) {
             // Create new user based on gender selection
             const response = await apiService.createMaleUser(this.telegramId, this.telegramUserName, 1)
             if (response.success) {
               this.$toast.success('User created successfully!')
             }
           } else {
             // Get user gender from session
             const genderResponse = await apiService.getUserFromTelegramSession(this.telegramId)
             this.userGender = genderResponse.gender
           }
         } catch (error) {
           this.$toast.error('Error: ' + error.message)
         } finally {
           this.isLoading = false
         }
       }
     }
   }

3. CARD POLL FUNCTIONALITY:
   // Handle question swiping and answering
   async function handleQuestionSwipe(telegramId, isSwipingLeft) {
     try {
       // Get a question
       const question = await apiService.getQuestion(telegramId, isSwipingLeft)
       
       console.log('Question:', question.question_content)
       console.log('Is saved:', question.is_saved)
       
       // If user has already answered this question
       if (question.answer_id) {
         console.log('Previous answer:', question.answer_string)
       }
       
       return question
     } catch (error) {
       console.error('Failed to get question:', error)
     }
   }
   
   // Edit or create an answer
   async function submitAnswer(telegramId, questionId, answerText, isDraft = false) {
     try {
       const response = await apiService.editAnswer(
         telegramId, 
         questionId, 
         answerText, 
         !isDraft, // isSend = !isDraft
         null,     // answerId (null for new answer)
         isDraft   // answerIsDraft
       )
       
       console.log('Answer saved:', response.answer_string)
       console.log('Is draft:', response.is_draft)
       
       return response
     } catch (error) {
       console.error('Failed to save answer:', error)
     }
   }
   
   // Like an answer (swipe right)
   async function likeAnswer(telegramId, answerId) {
     try {
       const response = await apiService.likeAnswer(telegramId, answerId)
       
       if (response.is_liked && response.paired_telegram_id) {
         console.log('🎉 Matched with user:', response.paired_telegram_id)
         // Show match notification
       }
       
       return response
     } catch (error) {
       console.error('Failed to like answer:', error)
     }
   }
   
   // Block an answer (swipe left)
   async function blockAnswer(telegramId, answerId) {
     try {
       const response = await apiService.blockAnswer(telegramId, answerId)
       
       if (response.success) {
         console.log('Answer blocked successfully')
       }
       
       return response
     } catch (error) {
       console.error('Failed to block answer:', error)
     }
   }

4. MESSAGE AND MATCHING:
   // Get matched users for messaging
   async function getMatches(telegramId) {
     try {
       const response = await apiService.getMatchedUsers(telegramId)
       
       console.log('Matched users:', response.telegram_id_list)
       
       // You can now show these users in a chat list
       return response.telegram_id_list
     } catch (error) {
       console.error('Failed to get matches:', error)
     }
   }

5. QUESTION MANAGEMENT:
   // Create a new question
   async function createQuestion(telegramId, questionText) {
     try {
       const response = await apiService.newQuestion(telegramId, questionText)
       
       if (response.success) {
         console.log('Question created successfully!')
       }
       
       return response
     } catch (error) {
       console.error('Failed to create question:', error)
     }
   }
   
   // Get all questions for a user
   async function getUserQuestions(telegramId) {
     try {
       const response = await apiService.getQuestionList(telegramId)
       
       console.log('Question IDs:', response.question_list)
       console.log('Question texts:', response.question_strings)
       
       return response
     } catch (error) {
       console.error('Failed to get questions:', error)
     }
   }
   
   // Toggle question active status
   async function toggleQuestion(questionId) {
     try {
       const response = await apiService.toggleQuestionActive(questionId)
       
       if (response.success) {
         console.log('Question status toggled')
       }
       
       return response
     } catch (error) {
       console.error('Failed to toggle question:', error)
     }
   }
   
   // Get detailed question information
   async function getQuestionDetails(questionId) {
     try {
       const response = await apiService.getQuestionInfo(questionId)
       
       console.log('Question content:', response.content)
       console.log('Created by:', response.telegram_id)
       console.log('Is draft:', response.is_draft)
       console.log('Is active:', response.is_active)
       console.log('Answer count:', response.answer_list.length)
       console.log('Blocked answers:', response.blocked_answer_list.length)
       console.log('Liked answers:', response.liked_answer_list.length)
       
       return response
     } catch (error) {
       console.error('Failed to get question info:', error)
     }
   }
   
   // Get detailed answer information
   async function getAnswerDetails(answerId) {
     try {
       const response = await apiService.getAnswerInfo(answerId)
       
       console.log('Answer content:', response.content)
       console.log('Question ID:', response.question_id)
       console.log('Created by:', response.telegram_id)
       console.log('Is draft:', response.is_draft)
       console.log('Is active:', response.is_active)
       console.log('Liked by users:', response.liked_user_ids.length)
       
       return response
     } catch (error) {
       console.error('Failed to get answer info:', error)
     }
   }

6. ERROR HANDLING PATTERNS:
   // Pattern 1: Try-catch with specific error handling
   async function safeApiCall(apiMethod, ...args) {
     try {
       const response = await apiMethod(...args)
       return { success: true, data: response }
     } catch (error) {
       console.error('API call failed:', error.message)
       
       // Handle specific error types
       if (error.response?.status === 401) {
         // Handle unauthorized
         console.log('User not authenticated')
       } else if (error.response?.status === 404) {
         // Handle not found
         console.log('Resource not found')
       }
       
       return { success: false, error: error.message }
     }
   }
   
   // Usage:
   const result = await safeApiCall(apiService.createMaleUser, 123456789, 1)
   if (result.success) {
     console.log('Success:', result.data)
   } else {
     console.log('Error:', result.error)
   }

7. LOADING AND ERROR STATE MANAGEMENT:
   // In Vue component
   export default {
     data() {
       return {
         isLoading: false,
         error: null
       }
     },
     methods: {
       async performApiCall() {
         this.isLoading = true
         this.error = null
         
         try {
           // Check global loading state
           if (apiService.getLoadingState()) {
             console.log('Another request is in progress')
           }
           
           const response = await apiService.createMaleUser(123456789, 1)
           
           // Check for global errors
           const globalError = apiService.getErrorState()
           if (globalError) {
             console.log('Global error:', globalError)
             apiService.clearErrorState()
           }
           
           return response
         } catch (error) {
           this.error = error.message
           throw error
         } finally {
           this.isLoading = false
         }
       }
     }
   }

8. AUTHENTICATION TOKEN MANAGEMENT:
   // Set auth token (if your API requires it)
   apiService.setToken('your-auth-token-here')
   
   // Get current token
   const token = apiService.getToken()
   console.log('Current token:', token)

9. ENDPOINT INFORMATION:
   // Get all available endpoints
   const endpoints = apiService.getEndpoints()
   console.log('Available endpoints:', endpoints)
   
   // Get base URL
   const baseUrl = apiService.getBaseUrl()
   console.log('API base URL:', baseUrl)

10. COMPLETE WORKFLOW EXAMPLE:
    // Complete user onboarding flow
    async function completeUserOnboarding(telegramId, gender, mode = null) {
      try {
        // Step 1: Check if user exists
        const existResponse = await apiService.getUserExist(telegramId)
        
        if (existResponse.success) {
          console.log('User already exists')
          return { status: 'exists' }
        }
        
            // Step 2: Create user based on gender
    let createResponse
    if (gender === 'female') {
      createResponse = await apiService.createFemaleUser(telegramId, telegramUserName, mode)
    } else {
      createResponse = await apiService.createMaleUser(telegramId, telegramUserName, mode)
    }
        
        if (!createResponse.success) {
          throw new Error('Failed to create user')
        }
        
        // Step 3: Get initial question
        const questionResponse = await apiService.getQuestion(telegramId, false)
        
        return {
          status: 'created',
          question: questionResponse
        }
        
      } catch (error) {
        console.error('Onboarding failed:', error)
        throw error
      }
    }
    
    // Usage:
    const result = await completeUserOnboarding(123456789, 'male', 1)
    console.log('Onboarding result:', result)

11. DEBUGGING:
    // All API calls are logged when DEBUG is true in debug.js
    // You'll see logs like:
    // 👤 Creating male user with telegram_id: 123456789 mode: 1
    // 📝 CreateMaleUserRequest created: { telegram_id: 123456789, mode: 1 }
    // 📝 CreateMaleUserResponse created: { success: true }
    
    // To disable debug logs, set DEBUG = false in debug.js

 12. TYPE SAFETY:
     // All responses are typed objects with proper validation
     const response = await apiService.getQuestion(123456789, true)
     
     // TypeScript/IDE will know these properties exist:
     response.question_id        // ✅ string
     response.question_content   // ✅ string
     response.is_saved          // ✅ boolean
     response.answer_id         // ✅ string | null
     response.answer_string     // ✅ string | null
     response.answer_is_draft   // ✅ boolean | null

 13. FAKE MODE FOR TESTING:
     // Enable fake mode for testing without real API calls
     apiService.toggleFakeMode(true)  // Enable fake mode
     apiService.toggleFakeMode(false) // Disable fake mode
     apiService.toggleFakeMode()      // Toggle current state
     
     // Set custom delay for fake responses
     apiService.setFakeDelay(1000) // 1 second delay
     
     // Check fake mode status
     const isFakeMode = apiService.getFakeMode()
     const fakeDelay = apiService.getFakeDelay()
     
     // ALL SERVICES SUPPORT FAKE MODE:
     // ✅ User Service (4 methods)
     // ✅ Card Poll Service (6 methods) 
     // ✅ Message Service (1 method)
     // ✅ Question Answer Management (5 methods)
     
     // Fake mode provides realistic test data:
     // - Random success/failure rates
     // - Realistic question and answer content
     // - Simulated network delays
     // - Proper response structure matching real API
     // - Varied data for comprehensive testing
     
     // Example with fake mode:
     apiService.toggleFakeMode(true)
     
         // Test user creation
    const fakeUser = await apiService.createMaleUser(123456789, 'test_user', 1)
    console.log('Fake user created:', fakeUser.success)
     
     // Test question retrieval
     const fakeQuestion = await apiService.getQuestion(123456789, true)
     console.log('Fake question:', fakeQuestion.question_content)
     
     // Test answer editing
     const fakeAnswer = await apiService.editAnswer(123456789, 'q123', 'My answer', true)
     console.log('Fake answer saved:', fakeAnswer.answer_string)
     
     // Test matching
     const fakeMatches = await apiService.getMatchedUsers(123456789)
     console.log('Fake matches:', fakeMatches.telegram_id_list)
     
     // Test question management
     const fakeQuestions = await apiService.getQuestionList(123456789)
     console.log('Fake questions:', fakeQuestions.question_strings)
     
     // Test question info
     const fakeQuestionInfo = await apiService.getQuestionInfo('q123')
     console.log('Fake question info:', fakeQuestionInfo.content)
     console.log('Answer count:', fakeQuestionInfo.answer_list.length)
     
     // Test answer info
     const fakeAnswerInfo = await apiService.getAnswerInfo('a456')
     console.log('Fake answer info:', fakeAnswerInfo.content)
     console.log('Liked by:', fakeAnswerInfo.liked_user_ids.length, 'users')
     
     // All 18 API methods work seamlessly in fake mode!
*/ 