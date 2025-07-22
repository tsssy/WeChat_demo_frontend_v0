# Debug System Documentation

## Overview

This project implements a global debug system that controls console printing throughout the application. The system automatically disables console logging in production mode while keeping it enabled during development.

## How It Works

### Global Debug Variable

The debug system is controlled by a global variable `DEBUG` located in `src/utils/debug.js`:

```javascript
export const DEBUG = import.meta.env.PROD ? false : true
```

- **Development mode**: `DEBUG = true` (console logging enabled)
- **Production mode**: `DEBUG = false` (console logging disabled)

### Debug Logger Utility

The system provides a `debugLog` object with methods that mirror console methods:

```javascript
export const debugLog = {
  log: (...args) => { if (DEBUG) console.log(...args) },
  error: (...args) => { if (DEBUG) console.error(...args) },
  warn: (...args) => { if (DEBUG) console.warn(...args) },
  info: (...args) => { if (DEBUG) console.info(...args) },
  debug: (...args) => { if (DEBUG) console.debug(...args) }
}
```

### Console Override

When `DEBUG` is false (production mode), the system automatically overrides all console methods to prevent any logging:

```javascript
if (!DEBUG) {
  console.log = () => {}
  console.error = () => {}
  console.warn = () => {}
  console.info = () => {}
  console.debug = () => {}
}
```

## Usage

### Import the Debug Utilities

```javascript
import { DEBUG, debugLog } from './utils/debug.js'
```

### Replace Console Statements

Instead of:
```javascript
console.log('User created:', user)
console.error('Failed to create user:', err)
```

Use:
```javascript
debugLog.log('User created:', user)
debugLog.error('Failed to create user:', err)
```

### Global Access

The debug utilities are also available globally through the window object:

```javascript
// Access from any component
window.DEBUG // boolean
window.debugLog.log('message')
```

## Files Updated

The following files have been updated to use the debug system:

### Core Files
- `src/main.js` - Global setup
- `src/utils/debug.js` - Debug system implementation

### Services
- `src/services/APIServices.js` - API service logging

### Composables
- `src/composables/useApiRequester.js` - API request logging
- `src/composables/apiExamples.js` - Example API usage

### Components
- `src/Entry.vue` - Telegram WebApp integration
- `src/GenderSelection.vue` - Gender selection logic
- `src/ModeSelection.vue` - Mode selection and API calls
- `src/components/ExampleApiUsage.vue` - API usage examples

## Testing

To test the debug system:

1. **Development mode**: Run `npm run dev` - all debug logs will appear
2. **Production mode**: Run `npm run build` and serve the dist folder - no debug logs will appear

You can also import and run the test script:
```javascript
import './utils/testDebug.js'
```

## Benefits

1. **Clean Production Logs**: No console spam in production
2. **Development Debugging**: Full logging during development
3. **Automatic Control**: No manual toggling required
4. **Performance**: Console methods are completely disabled in production
5. **Consistent API**: Same interface as console methods

## Manual Override

If you need to temporarily restore console methods in production (for debugging), you can call:

```javascript
window.__restoreConsole()
```

This will restore the original console methods for debugging purposes. 