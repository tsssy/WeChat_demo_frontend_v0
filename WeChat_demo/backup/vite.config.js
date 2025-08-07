import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '/', // 使用绝对路径，适配OSS托管
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
      host: '0.0.0.0', // 允许外部访问
      port: 5173, // 指定端口
      allowedHosts: ['loveluretech.xyz', 'www.loveluretech.xyz'], // 允许的主机
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://loveluretech.xyz',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    // 生产环境构建配置
    build: {
      // 输出目录
      outDir: 'dist',
      // 生成静态资源的存放目录
      assetsDir: 'assets',
      // 小于此阈值的导入或引用资源将内联为 base64 编码
      assetsInlineLimit: 4096,
      // 启用/禁用 CSS 代码拆分
      cssCodeSplit: true,
      // 构建后是否生成 source map 文件
      sourcemap: mode === 'development',
      // 自定义底层的 Rollup 打包配置
      rollupOptions: {
        output: {
          // 用于控制输出的文件名格式
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          // 手动分块策略
          manualChunks: {
            // 将Vue相关库单独打包
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // 将工具库单独打包
            'utils': ['@/services/api.js']
          }
        }
      },
      // 构建优化
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // 生产环境移除console
          drop_debugger: mode === 'production' // 生产环境移除debugger
        }
      }
    },
    // 环境变量配置
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE || 'WeChat Demo Frontend')
    }
  }
}) 