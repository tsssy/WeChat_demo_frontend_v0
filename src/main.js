import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Import debug configuration
import { DEBUG, debugLog } from './utils/debug.js'

// Make debug utilities globally available
window.DEBUG = DEBUG
window.debugLog = debugLog

// Log application startup (only in debug mode)
debugLog.log('🚀 Application starting...', { DEBUG, isProduction: import.meta.env.PROD })

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
