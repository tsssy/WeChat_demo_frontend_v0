// NetworkManager.js
// 统一管理所有 HTTP 请求方法和实际的请求与响应
// 包含 get、post 等方法，支持拦截器和错误处理
// Author: Miracle Demo Frontend

import { ref } from 'vue'
import { debugLog } from '../utils/debug.js'

// API 基础地址，可根据环境变量配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://lovetapoversea.xyz:4433')
const DEFAULT_TIMEOUT = 10000 // 默认超时时间 10 秒

// 全局 loading 和 error 状态
const isLoading = ref(false)
const error = ref(null)

// 请求拦截器：可在此统一添加 token、header 等
function requestInterceptor(config) {
  // 从本地存储获取 token
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }
  // 默认请求头
  config.headers = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
    ...config.headers
  }
  return config
}

// 响应拦截器：可统一处理响应数据
function responseInterceptor(response) {
  error.value = null // 清除之前的错误
  return response
}

// 错误拦截器：统一处理错误
function errorInterceptor(err) {
  error.value = {
    message: err.message || '请求发生错误',
    status: err.response?.status,
    data: err.response?.data
  }
  // 401 未授权处理
  if (err.response?.status === 401) {
    localStorage.removeItem('authToken')
    // 可在此添加跳转到登录页逻辑
  }
  return Promise.reject(err)
}

// 核心请求方法
async function makeRequest(endpoint, options = {}) {
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
    // 构建请求配置
    let config = {
      method,
      headers,
      timeout
    }
    // 非 GET 请求添加 body
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }
    // 应用请求拦截器
    if (!skipInterceptors) {
      config = requestInterceptor(config)
    }
    // 拼接完整 URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    debugLog.log('🌐 [NetworkManager] 请求信息:', { method, url, headers: config.headers, body: config.body })
    // 发起请求
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    const response = await fetch(url, { ...config, signal: controller.signal })
    clearTimeout(timeoutId)
    // 处理响应
    let data = await response.json()
    if (!skipInterceptors) {
      data = responseInterceptor(data)
    }
    isLoading.value = false
    return data
  } catch (err) {
    isLoading.value = false
    errorInterceptor(err)
    throw err
  }
}

// GET 请求
function get(endpoint, options = {}) {
  return makeRequest(endpoint, { ...options, method: 'GET' })
}
// POST 请求
function post(endpoint, body, options = {}) {
  return makeRequest(endpoint, { ...options, method: 'POST', body })
}
// PUT 请求
function put(endpoint, body, options = {}) {
  return makeRequest(endpoint, { ...options, method: 'PUT', body })
}
// PATCH 请求
function patch(endpoint, body, options = {}) {
  return makeRequest(endpoint, { ...options, method: 'PATCH', body })
}
// DELETE 请求
function del(endpoint, options = {}) {
  return makeRequest(endpoint, { ...options, method: 'DELETE' })
}

// 清除错误
function clearError() {
  error.value = null
}
// 设置 token
function setAuthToken(token) {
  localStorage.setItem('authToken', token)
}
// 获取 token
function getAuthToken() {
  return localStorage.getItem('authToken')
}

// 导出统一接口
export const NetworkManager = {
  get,
  post,
  put,
  patch,
  del,
  isLoading,
  error,
  clearError,
  setAuthToken,
  getAuthToken
} 