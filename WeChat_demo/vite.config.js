import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Vite 配置文件
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    // 开发环境代理配置
    proxy: {
      '/api': {
        // 代理到生产环境API服务器
        target: 'https://loveluretech.xyz',
        changeOrigin: true,
        secure: true, // 启用 HTTPS
        rewrite: (path) => path // 保持原有路径，包含 /api
      }
    }
  }
}) 