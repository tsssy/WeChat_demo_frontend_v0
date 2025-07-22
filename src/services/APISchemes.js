import { debugLog } from '../utils/debug.js'

/**
 * API Schemes - Defines request and response schemas for all API endpoints
 * This file contains the data structures for all API communications
 */

// ============================================================================
// USER SERVICE SCHEMES
// ============================================================================

/**
 * Create Female User
 */
export class CreateFemaleUserRequest {
  constructor(telegram_id, telegram_user_name, mode = null) {
    this.telegram_id = telegram_id
    this.telegram_user_name = telegram_user_name
    this.mode = mode // Optional: 1 or 3
    debugLog.log('📝 CreateFemaleUserRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (!this.telegram_user_name || typeof this.telegram_user_name !== 'string') {
      throw new Error('telegram_user_name must be a valid string')
    }
    if (this.mode !== null && ![1, 2, 3].includes(this.mode)) {
      throw new Error('mode must be either 1 or 3')
    }
    return true
  }
}

export class CreateFemaleUserResponse {
  constructor(success) {
    this.success = success
    debugLog.log('📝 CreateFemaleUserResponse created:', this)
  }

  static fromApiResponse(data) {
    return new CreateFemaleUserResponse(data.success)
  }
}

/**
 * Create Male User
 */
export class CreateMaleUserRequest {
  constructor(telegram_id, telegram_user_name, mode = null) {
    this.telegram_id = telegram_id
    this.telegram_user_name = telegram_user_name
    this.mode = mode // Optional: 1 or 3
    debugLog.log('📝 CreateMaleUserRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (!this.telegram_user_name || typeof this.telegram_user_name !== 'string') {
      throw new Error('telegram_user_name must be a valid string')
    }
    if (this.mode !== null && ![1, 2, 3].includes(this.mode)) {
      throw new Error('mode must be either 1 or 3')
    }
    return true
  }
}

export class CreateMaleUserResponse {
  constructor(success) {
    this.success = success
    debugLog.log('📝 CreateMaleUserResponse created:', this)
  }

  static fromApiResponse(data) {
    return new CreateMaleUserResponse(data.success)
  }
}

/**
 * Get User from Telegram Session
 */
export class GetTelegramSessionGenderRequest {
  constructor(telegram_id) {
    this.telegram_id = telegram_id
    debugLog.log('📝 GetTelegramSessionGenderRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    return true
  }
}

export class GetTelegramSessionGenderResponse {
  constructor(gender) {
    this.gender = gender // 1 or 3
    debugLog.log('📝 GetTelegramSessionGenderResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetTelegramSessionGenderResponse(data.gender)
  }
}

/**
 * Get User Exist
 */
export class GetUserExistRequest {
  constructor(telegram_id) {
    this.telegram_id = telegram_id
    debugLog.log('📝 GetUserExistRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    return true
  }
}

export class GetUserExistResponse {
  constructor(success) {
    this.success = success
    debugLog.log('📝 GetUserExistResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetUserExistResponse(data.success)
  }
}

/**
 * Get User Info
 */
export class GetUserInfoRequest {
  constructor(telegram_id) {
    this.telegram_id = telegram_id
    debugLog.log('📝 GetUserInfoRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    return true
  }
}

export class GetUserInfoResponse {
  constructor(gender, question_list, answer_list, paired_user, profile_photo, mode, profile, model_id, saved_list_question, saved_list_answer) {
    this.gender = gender
    this.question_list = question_list
    this.answer_list = answer_list
    this.paired_user = paired_user
    this.profile_photo = profile_photo
    this.mode = mode
    this.profile = profile
    this.model_id = model_id
    this.saved_list_question = saved_list_question
    this.saved_list_answer = saved_list_answer
    debugLog.log('📝 GetUserInfoResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetUserInfoResponse(
      data.gender,
      data.question_list,
      data.answer_list,
      data.paired_user,
      data.profile_photo,
      data.mode,
      data.profile,
      data.model_id,
      data.saved_list_question,
      data.saved_list_answer
    )
  }
}

// ============================================================================
// CARD POLL SERVICE SCHEMES
// ============================================================================

/**
 * Edit Answer
 */
export class EditAnswerRequest {
  constructor(telegram_id, question_id, new_answer, is_send, answer_id = null, answer_is_draft = null) {
    this.telegram_id = telegram_id
    this.question_id = question_id
    this.new_answer = new_answer
    this.is_send = is_send
    this.answer_id = answer_id
    this.answer_is_draft = answer_is_draft
    debugLog.log('📝 EditAnswerRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (!this.question_id || typeof this.question_id !== 'string') {
      throw new Error('question_id must be a valid string')
    }
    if (!this.new_answer || typeof this.new_answer !== 'string') {
      throw new Error('new_answer must be a valid string')
    }
    if (typeof this.is_send !== 'boolean') {
      throw new Error('is_send must be a boolean')
    }
    if (this.answer_id !== null && typeof this.answer_id !== 'string') {
      throw new Error('answer_id must be a valid string or null')
    }
    if (this.answer_is_draft !== null && typeof this.answer_is_draft !== 'boolean') {
      throw new Error('answer_is_draft must be a boolean or null')
    }
    return true
  }
}

export class EditAnswerResponse {
  constructor(answer_id, answer_string, is_draft) {
    this.answer_id = answer_id
    this.answer_string = answer_string
    this.is_draft = is_draft
    debugLog.log('📝 EditAnswerResponse created:', this)
  }

  static fromApiResponse(data) {
    return new EditAnswerResponse(data.answer_id, data.answer_string, data.is_draft)
  }
}

/**
 * Toggle Question Save
 */
export class ToggleQuestionSaveRequest {
  constructor(telegram_id, question_id) {
    this.telegram_id = telegram_id
    this.question_id = question_id
    debugLog.log('📝 ToggleQuestionSaveRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (!this.question_id || typeof this.question_id !== 'string') {
      throw new Error('question_id must be a valid string')
    }
    return true
  }
}

export class ToggleQuestionSaveResponse {
  constructor(is_saved) {
    this.is_saved = is_saved
    debugLog.log('📝 ToggleQuestionSaveResponse created:', this)
  }

  static fromApiResponse(data) {
    return new ToggleQuestionSaveResponse(data.is_saved)
  }
}

/**
 * Get Question
 */
export class GetQuestionRequest {
  constructor(telegram_id, is_swiping_toward_left) {
    this.telegram_id = telegram_id
    this.is_swiping_toward_left = is_swiping_toward_left
    debugLog.log('📝 GetQuestionRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (typeof this.is_swiping_toward_left !== 'boolean') {
      throw new Error('is_swiping_toward_left must be a boolean')
    }
    return true
  }
}

export class GetQuestionResponse {
  constructor(question_id, question_content, is_saved, answer_id = null, answer_string = null, answer_is_draft = null) {
    this.question_id = question_id
    this.question_content = question_content
    this.is_saved = is_saved
    this.answer_id = answer_id
    this.answer_string = answer_string
    this.answer_is_draft = answer_is_draft
    debugLog.log('📝 GetQuestionResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetQuestionResponse(
      data.question_id,
      data.question_content,
      data.is_saved,
      data.answer_id,
      data.answer_string,
      data.answer_is_draft
    )
  }
}

/**
 * Block Answer
 */
export class BlockAnswerRequest {
  constructor(telegram_id, answer_id) {
    this.telegram_id = telegram_id
    this.answer_id = answer_id
    debugLog.log('📝 BlockAnswerRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (!this.answer_id || typeof this.answer_id !== 'string') {
      throw new Error('answer_id must be a valid string')
    }
    return true
  }
}

export class BlockAnswerResponse {
  constructor(success) {
    this.success = success
    debugLog.log('📝 BlockAnswerResponse created:', this)
  }

  static fromApiResponse(data) {
    return new BlockAnswerResponse(data.success)
  }
}

/**
 * Like Answer
 */
export class LikeAnswerRequest {
  constructor(telegram_id, answer_id) {
    this.telegram_id = telegram_id
    this.answer_id = answer_id
    debugLog.log('📝 LikeAnswerRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (!this.answer_id || typeof this.answer_id !== 'string') {
      throw new Error('answer_id must be a valid string')
    }
    return true
  }
}

export class LikeAnswerResponse {
  constructor(paired_telegram_id, is_liked) {
    this.paired_telegram_id = paired_telegram_id
    this.is_liked = is_liked
    debugLog.log('📝 LikeAnswerResponse created:', this)
  }

  static fromApiResponse(data) {
    return new LikeAnswerResponse(data.paired_telegram_id, data.is_liked)
  }
}

/**
 * Get Answer (from card poll)
 */
export class GetCardPollAnswerRequest {
  constructor(telegram_id, is_swiping_toward_left) {
    this.telegram_id = telegram_id
    this.is_swiping_toward_left = is_swiping_toward_left
    debugLog.log('📝 GetCardPollAnswerRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (typeof this.is_swiping_toward_left !== 'boolean') {
      throw new Error('is_swiping_toward_left must be a boolean')
    }
    return true
  }
}

export class GetCardPollAnswerResponse {
  constructor(answer_id, answer_content, question_string, is_liked) {
    this.answer_id = answer_id
    this.answer_content = answer_content
    this.question_string = question_string
    this.is_liked = is_liked
    debugLog.log('📝 GetCardPollAnswerResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetCardPollAnswerResponse(
      data.answer_id,
      data.answer_content,
      data.question_string,
      data.is_liked
    )
  }
}

// ============================================================================
// MESSAGE SERVICE SCHEMES
// ============================================================================

/**
 * Get Matched Users
 */
export class GetMatchedUsersRequest {
  constructor(telegram_id) {
    this.telegram_id = telegram_id
    debugLog.log('📝 GetMatchedUsersRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    return true
  }
}

export class GetMatchedUsersResponse {
  constructor(telegram_id_list) {
    this.telegram_id_list = telegram_id_list
    debugLog.log('📝 GetMatchedUsersResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetMatchedUsersResponse(data.telegram_id_list)
  }
}

// ============================================================================
// QUESTION ANSWER MANAGEMENT SERVICE SCHEMES
// ============================================================================

/**
 * New Question
 */
export class NewQuestionRequest {
  constructor(telegram_id, question_string) {
    this.telegram_id = telegram_id
    this.question_string = question_string
    debugLog.log('📝 NewQuestionRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    if (!this.question_string || typeof this.question_string !== 'string') {
      throw new Error('question_string must be a valid string')
    }
    return true
  }
}

export class NewQuestionResponse {
  constructor(success) {
    this.success = success
    debugLog.log('📝 NewQuestionResponse created:', this)
  }

  static fromApiResponse(data) {
    return new NewQuestionResponse(data.success)
  }
}

/**
 * Toggle Question Active
 */
export class ToggleQuestionActiveRequest {
  constructor(question_id) {
    this.question_id = question_id
    debugLog.log('📝 ToggleQuestionActiveRequest created:', this)
  }

  validate() {
    if (!this.question_id || typeof this.question_id !== 'string') {
      throw new Error('question_id must be a valid string')
    }
    return true
  }
}

export class ToggleQuestionActiveResponse {
  constructor(success) {
    this.success = success
    debugLog.log('📝 ToggleQuestionActiveResponse created:', this)
  }

  static fromApiResponse(data) {
    return new ToggleQuestionActiveResponse(data.success)
  }
}

/**
 * Get Answer List for a Question
 */
export class GetAnswerListRequest {
  constructor(question_id) {
    this.question_id = question_id
    debugLog.log('📝 GetAnswerListRequest created:', this)
  }

  validate() {
    if (!this.question_id || typeof this.question_id !== 'string') {
      throw new Error('question_id must be a valid string')
    }
    return true
  }
}

export class GetAnswerListResponse {
  constructor(answer_list, answer_string) {
    this.answer_list = answer_list
    this.answer_string = answer_string
    debugLog.log('📝 GetAnswerListResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetAnswerListResponse(data.answer_list, data.answer_string)
  }
}

/**
 * Get Question List
 */
export class GetQuestionListRequest {
  constructor(telegram_id) {
    this.telegram_id = telegram_id
    debugLog.log('📝 GetQuestionListRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    return true
  }
}

export class GetQuestionListResponse {
  constructor(question_list, question_strings) {
    this.question_list = question_list
    this.question_strings = question_strings
    debugLog.log('📝 GetQuestionListResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetQuestionListResponse(data.question_list, data.question_strings)
  }
}

/**
 * Get Answer (from question answer management)
 */
export class GetQAMAnswerRequest {
  constructor(telegram_id) {
    this.telegram_id = telegram_id
    debugLog.log('📝 GetQAMAnswerRequest created:', this)
  }

  validate() {
    if (!this.telegram_id || typeof this.telegram_id !== 'number') {
      throw new Error('telegram_id must be a valid integer')
    }
    return true
  }
}

export class GetQAMAnswerResponse {
  constructor(answer_id_list, question_id_list, answer_content, question_content) {
    this.answer_id_list = answer_id_list
    this.question_id_list = question_id_list
    this.answer_content = answer_content
    this.question_content = question_content
    debugLog.log('📝 GetQAMAnswerResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetQAMAnswerResponse(
      data.answer_id_list,
      data.question_id_list,
      data.answer_content,
      data.question_content
    )
  }
}

/**
 * Get Question Info
 */
export class GetQuestionInfoRequest {
  constructor(question_id) {
    this.question_id = question_id
    debugLog.log('📝 GetQuestionInfoRequest created:', this)
  }

  validate() {
    if (!this.question_id || typeof this.question_id !== 'string') {
      throw new Error('question_id must be a valid string')
    }
    return true
  }
}

export class GetQuestionInfoResponse {
  constructor(question_id, content, telegram_id, is_draft, created_at, answer_list, blocked_answer_list, liked_answer_list, is_active) {
    this.question_id = question_id
    this.content = content
    this.telegram_id = telegram_id
    this.is_draft = is_draft
    this.created_at = created_at
    this.answer_list = answer_list
    this.blocked_answer_list = blocked_answer_list
    this.liked_answer_list = liked_answer_list
    this.is_active = is_active
    debugLog.log('📝 GetQuestionInfoResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetQuestionInfoResponse(
      data.question_id,
      data.content,
      data.telegram_id,
      data.is_draft,
      data.created_at,
      data.answer_list,
      data.blocked_answer_list,
      data.liked_answer_list,
      data.is_active
    )
  }
}

/**
 * Get Answer Info
 */
export class GetAnswerInfoRequest {
  constructor(answer_id) {
    this.answer_id = answer_id
    debugLog.log('📝 GetAnswerInfoRequest created:', this)
  }

  validate() {
    if (typeof this.answer_id !== 'string') {
      throw new Error('answer_id must be a string')
    }
    return true
  }
}

export class GetAnswerInfoResponse {
  constructor(answer_id, content, question_id, telegram_id, is_draft, created_at, liked_user_ids, is_active) {
    this.answer_id = answer_id
    this.content = content
    this.question_id = question_id
    this.telegram_id = telegram_id
    this.is_draft = is_draft
    this.created_at = created_at
    this.liked_user_ids = liked_user_ids
    this.is_active = is_active
    debugLog.log('📝 GetAnswerInfoResponse created:', this)
  }

  static fromApiResponse(data) {
    return new GetAnswerInfoResponse(
      data.answer_id,
      data.content,
      data.question_id,
      data.telegram_id,
      data.is_draft,
      data.created_at,
      data.liked_user_ids,
      data.is_active
    )
  }
}

// ============================================================================
// SCHEME VALIDATION UTILITIES
// ============================================================================

/**
 * Utility function to validate all request schemas
 * @param {Object} request - The request object to validate
 * @returns {boolean} - True if valid, throws error if invalid
 */
export function validateRequest(request) {
  if (request && typeof request.validate === 'function') {
    return request.validate()
  }
  throw new Error('Request object must have a validate method')
}

/**
 * Utility function to create response objects from API data
 * @param {string} responseClass - The response class name
 * @param {Object} data - The API response data
 * @returns {Object} - The response object
 */
export function createResponse(responseClass, data) {
  if (responseClass && typeof responseClass.fromApiResponse === 'function') {
    return responseClass.fromApiResponse(data)
  }
  throw new Error('Response class must have a fromApiResponse method')
}

debugLog.log('🚀 APISchemes.js loaded successfully')

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
HOW TO USE APISchemes IN YOUR CODE:

1. IMPORT THE SCHEMAS:
   import { 
     CreateMaleUserRequest, 
     CreateMaleUserResponse,
     validateRequest,
     createResponse 
   } from './APISchemes.js'

2. CREATE REQUEST OBJECTS:
   // Create a request with validation
   const request = new CreateMaleUserRequest(123456789, 'john_doe', 1)
   request.validate() // Validates the data before sending

3. HANDLE API RESPONSES:
   // When you get data from API, convert it to response object
   const apiData = { success: true }
   const response = CreateMaleUserResponse.fromApiResponse(apiData)

4. COMPLETE API CALL EXAMPLE:
   async function createUserExample() {
     try {
       // Create and validate request
       const request = new CreateMaleUserRequest(123456789, 'john_doe', 1)
       validateRequest(request)
       
       // Make API call (this would be in APIServices)
       const apiResponse = await apiService.createMaleUser(request)
       
       // Convert API response to typed object
       const response = CreateMaleUserResponse.fromApiResponse(apiResponse)
       
       // Use the typed response
       if (response.success) {
         console.log('User created successfully!')
       }
     } catch (error) {
       console.error('Validation or API error:', error)
     }
   }

5. FORM DATA VALIDATION EXAMPLE:
   function handleUserForm(formData) {
     try {
       const telegramId = parseInt(formData.telegram_id)
       const telegramUserName = formData.telegram_user_name
       const mode = parseInt(formData.mode)
       
       const request = new CreateMaleUserRequest(telegramId, telegramUserName, mode)
       request.validate() // Will throw error if data is invalid
       
       // If validation passes, proceed with API call
       return request
     } catch (error) {
       // Handle validation errors
       console.error('Form validation failed:', error.message)
       return null
     }
   }

6. RESPONSE HANDLING EXAMPLE:
   function handleQuestionResponse(apiData) {
     try {
       const response = GetQuestionResponse.fromApiResponse(apiData)
       
       // Now you have typed access to all fields
       console.log('Question ID:', response.question_id)
       console.log('Question Content:', response.question_content)
       console.log('Is Saved:', response.is_saved)
       
       // Optional fields are safely accessible
       if (response.answer_id) {
         console.log('User has answered:', response.answer_string)
       }
       
       return response
     } catch (error) {
       console.error('Failed to parse response:', error)
       return null
     }
   }

7. BATCH VALIDATION EXAMPLE:
   function validateMultipleRequests(requests) {
     const validRequests = []
     const errors = []
     
     requests.forEach((request, index) => {
       try {
         validateRequest(request)
         validRequests.push(request)
       } catch (error) {
         errors.push({ index, error: error.message })
       }
     })
     
     return { validRequests, errors }
   }

8. VUE COMPONENT EXAMPLE:
   // In a Vue component
   import { CreateFemaleUserRequest, CreateFemaleUserResponse } from '@/services/APISchemes.js'
   
   export default {
     data() {
       return {
         telegramId: null,
         isLoading: false
       }
     },
     methods: {
       async createUser() {
         try {
           this.isLoading = true
           
           // Create and validate request
           const request = new CreateFemaleUserRequest(this.telegramId, this.telegramUserName, this.mode)
           request.validate()
           
           // Make API call
           const apiResponse = await this.$api.createFemaleUser(request)
           
           // Parse response
           const response = CreateFemaleUserResponse.fromApiResponse(apiResponse)
           
           if (response.success) {
             this.$toast.success('User created successfully!')
           }
         } catch (error) {
           this.$toast.error('Failed to create user: ' + error.message)
         } finally {
           this.isLoading = false
         }
       }
     }
   }

9. ERROR HANDLING PATTERNS:
   // Pattern 1: Try-catch with specific error types
   try {
     const request = new CreateMaleUserRequest(123, 'test_user', 1)
     request.validate()
   } catch (error) {
     if (error.message.includes('telegram_id')) {
       // Handle telegram_id specific error
     } else if (error.message.includes('telegram_user_name')) {
       // Handle telegram_user_name specific error
     } else if (error.message.includes('mode')) {
       // Handle mode specific error
     }
   }

   // Pattern 2: Validation before API call
   function safeApiCall(requestClass, ...args) {
     try {
       const request = new requestClass(...args)
       request.validate()
       return request
     } catch (error) {
       debugLog.error('Request validation failed:', error)
       return null
     }
   }

10. TYPE SAFETY BENEFITS:
    // With schemas, you get compile-time and runtime type safety
    const response = GetQuestionResponse.fromApiResponse(apiData)
    
    // TypeScript/IDE will know these properties exist
    response.question_id        // ✅ Known to be string
    response.question_content   // ✅ Known to be string
    response.is_saved          // ✅ Known to be boolean
    response.answer_id         // ✅ Known to be string | null
    
    // vs without schemas (unsafe)
    apiData.question_id        // ❌ Unknown type, could be undefined
    apiData.random_field       // ❌ No validation, could be anything

11. DEBUGGING WITH SCHEMAS:
    // All schema operations are logged when DEBUG is true
    const request = new CreateMaleUserRequest(123, 1)
    // Console: 📝 CreateMaleUserRequest created: { telegram_id: 123, mode: 1 }
    
    const response = CreateMaleUserResponse.fromApiResponse({ success: true })
    // Console: 📝 CreateMaleUserResponse created: { success: true }

12. INTEGRATION WITH APIServices:
    // In APIServices.js, you would use schemas like this:
    async createMaleUser(telegramId, mode) {
      const request = new CreateMaleUserRequest(telegramId, mode)
      request.validate()
      
      const apiResponse = await this.post('/api/v1/users/create_male_user', request)
      return CreateMaleUserResponse.fromApiResponse(apiResponse)
    }
*/ 