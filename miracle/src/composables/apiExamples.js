import { useApiRequester } from './useApiRequester.js'
import { debugLog } from '../utils/debug.js'

// Example usage of the API requester
export const apiExamples = {
  // Example 1: Basic GET request
  async getUserProfile(userId) {
    const { get, isLoading, error } = useApiRequester()
    
    try {
      const response = await get(`/users/${userId}`)
      return response.data
    } catch (err) {
      debugLog.error('Failed to fetch user profile:', err)
      throw err
    }
  },

  // Example 2: POST request with data
  async createUser(userData) {
    const { post, isLoading, error } = useApiRequester()
    
    try {
      const response = await post('/users', userData)
      return response.data
    } catch (err) {
      debugLog.error('Failed to create user:', err)
      throw err
    }
  },

  // Example 3: PUT request to update data
  async updateUser(userId, userData) {
    const { put, isLoading, error } = useApiRequester()
    
    try {
      const response = await put(`/users/${userId}`, userData)
      return response.data
    } catch (err) {
      debugLog.error('Failed to update user:', err)
      throw err
    }
  },

  // Example 4: DELETE request
  async deleteUser(userId) {
    const { delete: del, isLoading, error } = useApiRequester()
    
    try {
      const response = await del(`/users/${userId}`)
      return response.data
    } catch (err) {
      throw err
    }
  },

  // Example 5: File upload
  async uploadAvatar(file) {
    const { uploadFile, isLoading, error } = useApiRequester()
    
    try {
      const response = await uploadFile('/users/avatar', file)
      return response.data
    } catch (err) {
      debugLog.error('Failed to upload avatar:', err)
      throw err
    }
  },

  // Example 6: Custom headers and timeout
  async getDataWithCustomOptions() {
    const { makeRequest, isLoading, error } = useApiRequester()
    
    try {
      const response = await makeRequest('/custom-endpoint', {
        method: 'GET',
        headers: {
          'X-Custom-Header': 'custom-value'
        },
        timeout: 5000 // 5 seconds
      })
      return response.data
    } catch (err) {
      debugLog.error('Failed to fetch data:', err)
      throw err
    }
  },

  // Example 7: Authentication
  async login(credentials) {
    const { post, setAuthToken, isLoading, error } = useApiRequester()
    
    try {
      const response = await post('/auth/login', credentials)
      
      // Store the auth token
      if (response.data.token) {
        setAuthToken(response.data.token)
      }
      
      return response.data
    } catch (err) {
      debugLog.error('Login failed:', err)
      throw err
    }
  },

  // Example 8: Logout
  async logout() {
    const { post, setAuthToken, isLoading, error } = useApiRequester()
    
    try {
      await post('/auth/logout')
    } catch (err) {
      debugLog.error('Logout request failed:', err)
    } finally {
      // Always clear the token
      setAuthToken(null)
    }
  }
} 