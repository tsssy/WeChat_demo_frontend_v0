// Test script to verify debug functionality
import { DEBUG, debugLog } from './debug.js'

console.log('=== Debug Test Script ===')
console.log('DEBUG variable:', DEBUG)
console.log('Environment:', import.meta.env.MODE)
console.log('Is Production:', import.meta.env.PROD)

// Test debugLog functions
console.log('Testing debugLog.log...')
debugLog.log('This should only show in development mode')

console.log('Testing debugLog.error...')
debugLog.error('This error should only show in development mode')

console.log('Testing debugLog.warn...')
debugLog.warn('This warning should only show in development mode')

console.log('Testing debugLog.info...')
debugLog.info('This info should only show in development mode')

console.log('Testing debugLog.debug...')
debugLog.debug('This debug should only show in development mode')

console.log('=== End Debug Test ===')

// Export for use in other files
export { DEBUG, debugLog } 