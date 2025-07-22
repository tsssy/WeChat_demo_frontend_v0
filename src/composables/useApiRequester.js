import { ref, readonly } from 'vue'
import { debugLog } from '../utils/debug.js'

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://lovetapoversea.xyz:4433')
const DEFAULT_TIMEOUT = 10000 // 10 seconds

// State
const isLoading = ref(false)
const error = ref(null)

// Request interceptor
const requestInterceptor = (config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // Add default headers
  config.headers = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
    ...config.headers
  }
  
  return config
}

// Response interceptor
const responseInterceptor = (response) => {
  // Clear any previous errors
  error.value = null
  return response
}

// Error interceptor
const errorInterceptor = (err) => {
  error.value = {
    message: err.message || 'An error occurred',
    status: err.response?.status,
    data: err.response?.data
  }
  
  // Handle specific error cases
  if (err.response?.status === 401) {
    // Unauthorized - redirect to login or clear token
    localStorage.removeItem('authToken')
    // You can add router navigation here if needed
  }
  
  return Promise.reject(err)
}

// Main request function
const makeRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    skipInterceptors = false
  } = options

  isLoading.value = true
  error.value = null

  try {
    // Prepare request config
    let config = {
      method,
      headers,
      timeout
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    // Apply request interceptor
    if (!skipInterceptors) {
      config = requestInterceptor(config)
    }

    // Create URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    debugLog.log('🚀 makeRequest called with:')
    debugLog.log('  - Method:', method)
    debugLog.log('  - Endpoint:', endpoint)
    debugLog.log('  - API_BASE_URL:', API_BASE_URL)
    debugLog.log('  - Full URL:', url)
    debugLog.log('  - Headers:', config.headers)
    debugLog.log('  - Body:', config.body)

    // Make the request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    debugLog.log('📡 Sending fetch request...')
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    
    debugLog.log('📨 Response received:')
    debugLog.log('  - Status:', response.status)
    debugLog.log('  - Status Text:', response.statusText)
    debugLog.log('  - Headers:', Object.fromEntries(response.headers.entries()))

    // Apply response interceptor
    if (!skipInterceptors) {
      responseInterceptor(response)
    }

    // Handle non-2xx responses
    if (!response.ok) {
      debugLog.log('❌ Response not OK, parsing error data...')
      const errorData = await response.json().catch(() => ({}))
      debugLog.log('❌ Error data:', errorData)
      throw {
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response: {
          status: response.status,
          data: errorData
        }
      }
    }

    // Parse response
    const contentType = response.headers.get('content-type')
    let data

    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
      debugLog.log('✅ JSON response parsed:', data)
    } else {
      data = await response.text()
      debugLog.log('✅ Text response received:', data)
    }

    const result = {
      data,
      status: response.status,
      headers: response.headers
    }
    
    debugLog.log('🎉 Request successful, returning:', result)
    return result

  } catch (err) {
    debugLog.log('💥 makeRequest caught error:', err)
    
    // Handle abort error
    if (err.name === 'AbortError') {
      debugLog.log('⏰ Request timeout')
      error.value = {
        message: 'Request timeout',
        status: 408
      }
      throw error.value
    }

    // Apply error interceptor
    if (!skipInterceptors) {
      errorInterceptor(err)
    }

    throw err
  } finally {
    isLoading.value = false
    debugLog.log('🏁 Request completed, loading set to false')
  }
}

// Convenience methods
const get = (endpoint, options = {}) => {
  return makeRequest(endpoint, { ...options, method: 'GET' })
}

const post = (endpoint, body, options = {}) => {
  return makeRequest(endpoint, { ...options, method: 'POST', body })
}

const put = (endpoint, body, options = {}) => {
  return makeRequest(endpoint, { ...options, method: 'PUT', body })
}

const patch = (endpoint, body, options = {}) => {
  return makeRequest(endpoint, { ...options, method: 'PATCH', body })
}

const del = (endpoint, options = {}) => {
  return makeRequest(endpoint, { ...options, method: 'DELETE' })
}

// File upload helper
const uploadFile = async (endpoint, file, options = {}) => {
  const formData = new FormData()
  formData.append('file', file)

  return makeRequest(endpoint, {
    ...options,
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type for FormData, let browser set it with boundary
      ...options.headers
    },
    skipInterceptors: true // Skip JSON content-type header
  })
}

// Clear error
const clearError = () => {
  error.value = null
}

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token)
  } else {
    localStorage.removeItem('authToken')
  }
}

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

export function useApiRequester() {
  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Methods
    makeRequest,
    get,
    post,
    put,
    patch,
    delete: del,
    uploadFile,
    clearError,
    setAuthToken,
    getAuthToken
  }
} 