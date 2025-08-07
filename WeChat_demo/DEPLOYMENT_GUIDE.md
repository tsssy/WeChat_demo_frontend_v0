# 🚀 WeChat Demo 前端部署完整指南

## 📋 目录

1. [环境准备](#环境准备)
2. [项目结构](#项目结构)
3. [部署流程](#部署流程)
4. [常见问题解决](#常见问题解决)
5. [服务管理](#服务管理)
6. [监控和维护](#监控和维护)

## 🌍 环境准备

### 服务器环境
- **操作系统**: Ubuntu 22.04 LTS
- **Node.js**: 18.x 或更高版本
- **Nginx**: 1.24.0
- **Python**: 3.8+ (后端API服务)

### 域名和SSL证书
- **域名**: loveluretech.xyz
- **SSL证书**: 已配置在 `/etc/ssl/aliyun/`

## 📁 项目结构

```
/root/FrontendProjects/WeChat_demo_frontend_v0/
├── WeChat_demo/                    # 主要项目目录
│   ├── src/                       # Vue.js 源代码
│   │   ├── views/                 # 页面组件
│   │   ├── stores/                # Pinia 状态管理
│   │   ├── services/              # API 服务
│   │   └── assets/                # 静态资源
│   ├── dist/                      # 构建输出目录
│   ├── node_modules/              # 依赖包
│   ├── package.json               # 项目配置
│   ├── vite.config.js             # Vite 构建配置
│   ├── .env.production            # 生产环境配置
│   └── monitor.sh                 # 监控脚本
├── miracle/                       # 参考项目（保留）
└── .git/                          # Git 版本控制
```

## 🚀 部署流程

### 第一步：环境准备

```bash
# 1. 进入项目目录
cd /root/FrontendProjects/WeChat_demo_frontend_v0/WeChat_demo

# 2. 检查 Node.js 版本
node --version
npm --version

# 3. 配置 npm 镜像（解决网络问题）
npm config set registry https://registry.npmmirror.com
npm config set disturl https://npmmirror.com/dist
```

### 第二步：安装依赖

```bash
# 安装项目依赖
npm install

# 如果遇到网络问题，使用以下命令
npm install --registry=https://registry.npmmirror.com
```

### 第三步：环境配置

```bash
# 检查生产环境配置
cat .env.production

# 确保配置正确
VITE_API_BASE_URL=https://loveluretech.xyz/api
VITE_APP_TITLE=WeChat Demo Frontend
VITE_APP_VERSION=1.0.0
```

### 第四步：构建项目

```bash
# 构建生产版本
npm run build

# 检查构建结果
ls -la dist/
```

### 第五步：部署到 Nginx

```bash
# 1. 备份当前部署
sudo cp -r /var/www/frontend /var/www/frontend.backup.$(date +%Y%m%d_%H%M%S)

# 2. 部署新构建的文件
sudo cp -r dist/* /var/www/frontend/

# 3. 设置正确的权限
sudo chown -R www-data:www-data /var/www/frontend
sudo chmod -R 755 /var/www/frontend

# 4. 重启 Nginx
sudo systemctl reload nginx
```

### 第六步：启动开发服务器（可选）

```bash
# 启动开发服务器（用于调试）
nohup npm run dev > dev.log 2>&1 &

# 检查开发服务器状态
ps aux | grep vite
netstat -tlnp | grep 5173
```

## 🔧 Nginx 配置

### 配置文件位置
- **主配置**: `/etc/nginx/nginx.conf`
- **站点配置**: `/etc/nginx/sites-available/default`
- **启用配置**: `/etc/nginx/sites-enabled/default`

### 当前配置内容

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name www.loveluretech.xyz loveluretech.xyz;
    return 301 https://$host$request_uri;
}

# Main server configuration
server {
    listen 443 ssl http2;
    server_name www.loveluretech.xyz loveluretech.xyz;

    # SSL 证书配置
    ssl_certificate /etc/ssl/aliyun/www.loveluretech.xyz.pem;
    ssl_certificate_key /etc/ssl/aliyun/www.loveluretech.xyz.key;

    # 前端静态文件
    root /var/www/frontend;
    index index.html;

    # 前端路由处理 (SPA应用)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Debug页面代理（开发环境）
    location /debug {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚨 常见问题解决

### 问题1：npm 安装失败

**症状**: `npm install` 卡住或失败

**解决方案**:
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install

# 或者使用 yarn
npm install -g yarn
yarn install
```

### 问题2：API 路径重复错误

**症状**: 404 错误，URL 显示 `/api/v1/v1/...`

**解决方案**:
```bash
# 检查环境变量配置
cat .env.production

# 确保配置正确
VITE_API_BASE_URL=https://loveluretech.xyz/api

# 重新构建
npm run build
```

### 问题3：开发服务器主机限制

**症状**: Vite 开发服务器拒绝外部访问

**解决方案**:
```bash
# 修改 vite.config.js
server: {
  host: '0.0.0.0',
  port: 5173,
  allowedHosts: ['loveluretech.xyz', 'www.loveluretech.xyz']
}

# 重启开发服务器
pkill -f vite
nohup npm run dev > dev.log 2>&1 &
```

### 问题4：浏览器代理问题

**症状**: 请求被重定向到本地代理

**解决方案**:
1. 在浏览器中禁用代理
2. 将 `loveluretech.xyz` 添加到代理例外列表
3. 清除浏览器缓存

### 问题5：Nginx 配置错误

**症状**: 502 错误或页面无法访问

**解决方案**:
```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 重启 Nginx
sudo systemctl restart nginx
```

## 🛠️ 服务管理

### 检查服务状态

```bash
# 运行监控脚本
./monitor.sh

# 检查各个服务
sudo systemctl status nginx
ps aux | grep vite
ps aux | grep python
netstat -tlnp | grep -E "(80|443|5173|8000)"
```

### 重启服务

```bash
# 重启 Nginx
sudo systemctl restart nginx

# 重启开发服务器
pkill -f vite
nohup npm run dev > dev.log 2>&1 &

# 重启后端 API 服务
sudo systemctl restart your-api-service
```

### 停止服务

```bash
# 停止 Nginx
sudo systemctl stop nginx

# 停止开发服务器
pkill -f vite

# 停止后端 API 服务
sudo systemctl stop your-api-service
```

## 📊 监控和维护

### 监控脚本

```bash
# 运行完整监控
./monitor.sh

# 实时监控
watch -n 5 ./monitor.sh
```

### 日志查看

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 开发服务器日志
tail -f dev.log
```

### 备份和恢复

```bash
# 备份当前部署
sudo cp -r /var/www/frontend /var/www/frontend.backup.$(date +%Y%m%d_%H%M%S)

# 恢复备份
sudo cp -r /var/www/frontend.backup.20250807_120000/* /var/www/frontend/
```

## 🔄 更新部署流程

### 完整更新流程

```bash
# 1. 进入项目目录
cd /root/FrontendProjects/WeChat_demo_frontend_v0/WeChat_demo

# 2. 拉取最新代码
git pull

# 3. 安装依赖（如果需要）
npm install

# 4. 构建项目
npm run build

# 5. 备份当前部署
sudo cp -r /var/www/frontend /var/www/frontend.backup.$(date +%Y%m%d_%H%M%S)

# 6. 部署新版本
sudo cp -r dist/* /var/www/frontend/

# 7. 设置权限
sudo chown -R www-data:www-data /var/www/frontend
sudo chmod -R 755 /var/www/frontend

# 8. 重启 Nginx
sudo systemctl reload nginx

# 9. 验证部署
./monitor.sh
```

## 📝 重要文件位置

| 文件/目录 | 位置 | 说明 |
|-----------|------|------|
| 前端源码 | `/root/FrontendProjects/WeChat_demo_frontend_v0/WeChat_demo/src/` | Vue.js 源代码 |
| 构建输出 | `/root/FrontendProjects/WeChat_demo_frontend_v0/WeChat_demo/dist/` | 构建后的文件 |
| 部署目录 | `/var/www/frontend/` | Nginx 服务的静态文件 |
| Nginx 配置 | `/etc/nginx/sites-available/default` | 站点配置 |
| SSL 证书 | `/etc/ssl/aliyun/` | SSL 证书文件 |
| 环境配置 | `.env.production` | 生产环境变量 |
| 监控脚本 | `monitor.sh` | 服务监控脚本 |

## 🎯 快速命令参考

```bash
# 构建和部署
npm run build && sudo cp -r dist/* /var/www/frontend/ && sudo systemctl reload nginx

# 检查服务状态
./monitor.sh

# 查看实时日志
sudo tail -f /var/log/nginx/access.log

# 重启所有服务
sudo systemctl restart nginx && pkill -f vite && nohup npm run dev > dev.log 2>&1 &
```

---

## 📞 故障排除联系

如果遇到问题，请按以下顺序检查：

1. 运行 `./monitor.sh` 检查服务状态
2. 查看 Nginx 错误日志
3. 检查 API 服务是否正常运行
4. 验证环境变量配置
5. 确认网络连接和代理设置

---

**最后更新**: 2025年8月7日  
**版本**: 1.0.0  
**维护者**: 系统管理员 