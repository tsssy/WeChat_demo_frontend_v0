// Global debug configuration
// Set to false in production to disable all console logging
// export const DEBUG = import.meta.env.PROD ? false : true
export const DEBUG = true //change to false before merge

// Debug logger utility
export const debugLog = {
  log: (...args) => {
    if (DEBUG) {
      console.log(...args)
    }
  },
  error: (...args) => {
    if (DEBUG) {
      console.error(...args)
    }
  },
  warn: (...args) => {
    if (DEBUG) {
      console.warn(...args)
    }
  },
  info: (...args) => {
    if (DEBUG) {
      console.info(...args)
    }
  },
  debug: (...args) => {
    if (DEBUG) {
      console.debug(...args)
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
  console.error = () => {}
  console.warn = () => {}
  console.info = () => {}
  console.debug = () => {}

  // Provide a way to restore console methods if needed
  window.__restoreConsole = () => {
    console.log = originalConsole.log
    console.error = originalConsole.error
    console.warn = originalConsole.warn
    console.info = originalConsole.info
    console.debug = originalConsole.debug
  }
} 