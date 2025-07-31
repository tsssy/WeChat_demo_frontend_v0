// Global debug configuration
// Import manual debug control from config instead of using environment variables
import { DEBUG_CONFIG } from './config.js'

export const DEBUG = DEBUG_CONFIG.enabled
export const IS_DEVELOPMENT = import.meta.env.DEV
export const IS_PRODUCTION = import.meta.env.PROD

// Debug configuration object using config.js settings
export const debugConfig = {
  enabled: DEBUG_CONFIG.enabled,
  showUserInfo: DEBUG_CONFIG.showUserInfo,
  showApiCalls: DEBUG_CONFIG.showApiCalls,
  showWebSocket: DEBUG_CONFIG.showWebSocket,
  showRouteChanges: DEBUG_CONFIG.showRouteChanges,
  showEventBus: DEBUG_CONFIG.showEventBus,
  environment: IS_DEVELOPMENT ? 'development' : 'production'
}

// Enhanced debug logger utility with categories
export const debugLog = {
  log: (...args) => {
    if (DEBUG) {
      console.log(`[DEBUG]`, ...args)
    }
  },
  error: (...args) => {
    if (DEBUG) {
      console.error(`[ERROR]`, ...args)
    }
  },
  warn: (...args) => {
    if (DEBUG) {
      console.warn(`[WARN]`, ...args)
    }
  },
  info: (...args) => {
    if (DEBUG) {
      console.info(`[INFO]`, ...args)
    }
  },
  debug: (...args) => {
    if (DEBUG) {
      console.debug(`[DEBUG]`, ...args)
    }
  },
  // Categorized logging
  user: (...args) => {
    if (DEBUG && debugConfig.showUserInfo) {
      console.log(`[USER]`, ...args)
    }
  },
  api: (...args) => {
    if (DEBUG && debugConfig.showApiCalls) {
      console.log(`[API]`, ...args)
    }
  },
  websocket: (...args) => {
    if (DEBUG && debugConfig.showWebSocket) {
      console.log(`[WS]`, ...args)
    }
  },
  route: (...args) => {
    if (DEBUG && debugConfig.showRouteChanges) {
      console.log(`[ROUTE]`, ...args)
    }
  },
  event: (...args) => {
    if (DEBUG && debugConfig.showEventBus) {
      console.log(`[EVENT]`, ...args)
    }
  }
}

// Development helpers
export const devHelpers = {
  // Show current environment info
  showEnvironment: () => {
    if (DEBUG) {
      console.group(`🛠️ Environment Info`)
      console.log('Mode:', import.meta.env.MODE)
      console.log('Development:', IS_DEVELOPMENT)
      console.log('Production:', IS_PRODUCTION)
      console.log('Base URL:', import.meta.env.BASE_URL)
      console.log('Debug Config:', debugConfig)
      console.groupEnd()
    }
  },
  
  // Performance timing helper
  time: (label) => {
    if (DEBUG) {
      console.time(`⏱️ ${label}`)
    }
  },
  
  timeEnd: (label) => {
    if (DEBUG) {
      console.timeEnd(`⏱️ ${label}`)
    }
  },

  // Memory usage (if available)
  showMemory: () => {
    if (DEBUG && performance.memory) {
      console.log(`💾 Memory:`, {
        used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      })
    }
  }
}

// Override console methods globally when DEBUG is false
if (!DEBUG) {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  }

  // Override console methods to do nothing in production
  console.log = () => {}
  console.warn = () => {}
  console.info = () => {}
  console.debug = () => {}

  // Keep errors in production for critical issues
  // console.error = () => {} // Commented out to keep errors visible

  // Provide a way to restore console methods if needed
  window.__restoreConsole = () => {
    console.log = originalConsole.log
    console.error = originalConsole.error
    console.warn = originalConsole.warn
    console.info = originalConsole.info
    console.debug = originalConsole.debug
  }
}

// Initialize debug mode on import
if (DEBUG) {
  console.log(`🚀 Debug mode enabled (${import.meta.env.MODE})`)
  devHelpers.showEnvironment()
} 