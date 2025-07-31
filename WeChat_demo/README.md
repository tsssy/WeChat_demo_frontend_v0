# WeChat Demo Frontend

这是一个基于Vue 3的前端项目，用于演示WeChat相关功能。

## 项目结构

```
WeChat_demo/
├── src/
│   ├── views/          # 页面组件
│   ├── components/     # 通用组件
│   ├── services/       # API服务
│   ├── stores/         # 状态管理
│   ├── utils/          # 工具函数
│   ├── assets/         # 静态资源
│   ├── composables/    # 组合式函数
│   ├── wsclients/      # WebSocket客户端
│   ├── App.vue         # 根组件
│   ├── main.js         # 入口文件
│   └── router.js       # 路由配置
├── public/             # 公共资源
├── package.json        # 项目配置
├── vite.config.js      # Vite配置
└── index.html          # HTML入口
```

## 开发环境

- Node.js
- Vue 3
- Vite
- Pinia (状态管理)
- Vue Router

## 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 功能特性

- 响应式设计
- 状态管理
- 路由管理
- API集成
- WebSocket支持

## 开发指南

请参考各个页面的具体实现和API接口文档。 