// url_config.js
// 统一管理后端WebSocket和API的base地址，方便维护和修改

// WebSocket基础地址
const WS_BASE_URL = 'wss://lovetapoversea.xyz:4433';
// API基础地址
const API_BASE_URL = 'https://lovetapoversea.xyz:4433';

// 导出常量，供其他文件引用
// （如果是浏览器环境，直接引入该文件即可访问全局变量）

// 如果需要兼容Node.js或模块化环境，可以使用如下导出方式：
// export { WS_BASE_URL, API_BASE_URL }; 