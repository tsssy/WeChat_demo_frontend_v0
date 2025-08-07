#!/bin/bash

# 前端应用监控脚本
# 用于检查前端应用的各种状态

echo "🔍 前端应用状态监控"
echo "=================="

# 检查开发服务器状态
echo "📊 开发服务器状态:"
if pgrep -f "vite" > /dev/null; then
    echo "✅ 开发服务器正在运行"
    ps aux | grep -E "(vite|5173)" | grep -v grep
else
    echo "❌ 开发服务器未运行"
fi

echo ""

# 检查Nginx状态
echo "🌐 Nginx状态:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx正在运行"
else
    echo "❌ Nginx未运行"
fi

echo ""

# 检查端口监听
echo "🔌 端口监听状态:"
echo "端口 80: $(netstat -tlnp | grep :80 | wc -l) 个进程"
echo "端口 443: $(netstat -tlnp | grep :443 | wc -l) 个进程"
echo "端口 5173: $(netstat -tlnp | grep :5173 | wc -l) 个进程"
echo "端口 8000: $(netstat -tlnp | grep :8000 | wc -l) 个进程"

echo ""

# 检查文件部署
echo "📁 文件部署状态:"
if [ -f "/var/www/frontend/index.html" ]; then
    echo "✅ index.html 已部署"
    echo "   文件大小: $(ls -lh /var/www/frontend/index.html | awk '{print $5}')"
    echo "   修改时间: $(ls -l /var/www/frontend/index.html | awk '{print $6, $7, $8}')"
else
    echo "❌ index.html 未部署"
fi

if [ -d "/var/www/frontend/assets" ]; then
    echo "✅ assets 目录已部署"
    echo "   JS文件数量: $(find /var/www/frontend/assets -name "*.js" | wc -l)"
    echo "   CSS文件数量: $(find /var/www/frontend/assets -name "*.css" | wc -l)"
else
    echo "❌ assets 目录未部署"
fi

echo ""

# 测试页面访问
echo "🌍 页面访问测试:"
echo "测试诊断页面..."
if curl -s --noproxy "*" https://loveluretech.xyz/diagnose.html > /dev/null; then
    echo "✅ 诊断页面可访问"
else
    echo "❌ 诊断页面无法访问"
fi

echo "测试debug页面..."
if curl -s --noproxy "*" https://loveluretech.xyz/debug > /dev/null; then
    echo "✅ debug页面可访问"
else
    echo "❌ debug页面无法访问"
fi

echo "测试test页面..."
if curl -s --noproxy "*" https://loveluretech.xyz/test > /dev/null; then
    echo "✅ test页面可访问"
else
    echo "❌ test页面无法访问"
fi

echo ""

# 检查API状态
echo "🔧 API状态:"
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "✅ 后端API服务正常"
else
    echo "❌ 后端API服务异常"
fi

echo ""

# 检查Nginx日志
echo "📝 最近的Nginx访问日志:"
tail -5 /var/log/nginx/access.log 2>/dev/null || echo "无法读取访问日志"

echo ""

# 检查错误日志
echo "🚨 最近的Nginx错误日志:"
tail -5 /var/log/nginx/error.log 2>/dev/null || echo "无法读取错误日志"

echo ""
echo "✅ 监控完成" 