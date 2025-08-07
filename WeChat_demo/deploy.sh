#!/bin/bash

echo "🚀 WeChat Demo 前端快速部署脚本"
echo "================================"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 步骤1：检查环境
echo "📋 步骤1: 检查环境..."
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm 未安装"
    exit 1
fi

print_status "Node.js 版本: $(node --version)"
print_status "npm 版本: $(npm --version)"

# 步骤2：配置npm镜像
echo ""
echo "📋 步骤2: 配置npm镜像..."
npm config set registry https://registry.npmmirror.com
npm config set disturl https://npmmirror.com/dist
print_status "npm镜像配置完成"

# 步骤3：安装依赖
echo ""
echo "📋 步骤3: 安装依赖..."
if [ ! -d "node_modules" ]; then
    npm install
    print_status "依赖安装完成"
else
    print_warning "node_modules 已存在，跳过安装"
fi

# 步骤4：检查环境配置
echo ""
echo "📋 步骤4: 检查环境配置..."
if [ ! -f ".env.production" ]; then
    print_error ".env.production 文件不存在"
    exit 1
fi

print_status "环境配置文件存在"

# 步骤5：构建项目
echo ""
echo "📋 步骤5: 构建项目..."
npm run build

if [ ! -d "dist" ]; then
    print_error "构建失败，dist 目录不存在"
    exit 1
fi

print_status "项目构建完成"

# 步骤6：备份当前部署
echo ""
echo "📋 步骤6: 备份当前部署..."
if [ -d "/var/www/frontend" ]; then
    sudo cp -r /var/www/frontend /var/www/frontend.backup.$(date +%Y%m%d_%H%M%S)
    print_status "当前部署已备份"
else
    print_warning "部署目录不存在，跳过备份"
fi

# 步骤7：部署到Nginx
echo ""
echo "📋 步骤7: 部署到Nginx..."
sudo cp -r dist/* /var/www/frontend/
sudo chown -R www-data:www-data /var/www/frontend
sudo chmod -R 755 /var/www/frontend
print_status "文件部署完成"

# 步骤8：重启Nginx
echo ""
echo "📋 步骤8: 重启Nginx..."
sudo systemctl reload nginx
print_status "Nginx 重启完成"

# 步骤9：验证部署
echo ""
echo "📋 步骤9: 验证部署..."
if [ -f "monitor.sh" ]; then
    ./monitor.sh
else
    echo "监控脚本不存在，跳过验证"
fi

echo ""
echo "🎉 部署完成！"
echo "🌐 访问地址: https://loveluretech.xyz"
echo ""
echo "📝 常用命令："
echo "  - 检查状态: ./monitor.sh"
echo "  - 查看日志: sudo tail -f /var/log/nginx/error.log"
echo "  - 重启服务: sudo systemctl restart nginx" 