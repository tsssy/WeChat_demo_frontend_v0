#!/bin/bash

echo "🧹 开始安全清理项目文件..."
echo "========================"

# 备份重要文件
echo "📦 备份重要文件..."
mkdir -p backup
cp -r src/ backup/
cp package.json backup/
cp vite.config.js backup/
cp .env.production backup/

# 删除临时文件
echo "🗑️ 删除临时文件..."
rm -f dev.log
rm -f diagnose.html

# 删除过时的脚本和文档
echo "🗑️ 删除过时文件..."
rm -f build_real_vue.sh
rm -f QUICK_START.md

# 删除根目录的文档文件（可选）
echo "🗑️ 删除根目录文档文件..."
rm -f ../抽卡游戏前端调用指南.md
rm -f ../AI_Interface_Documentation.md

# 删除开发工具配置文件（可选）
echo "🗑️ 删除开发工具配置文件..."
rm -f ../.editorconfig
rm -f ../.prettierrc.json
rm -rf ../.vscode/

# 注意：保留miracle目录，因为它包含有用的前端组件
echo "✅ 保留miracle目录（包含有用的前端组件）"

echo "✅ 安全清理完成！"
echo ""
echo "📁 保留的核心文件："
echo "  - src/ (源代码)"
echo "  - package.json (项目配置)"
echo "  - vite.config.js (构建配置)"
echo "  - .env.production (环境变量)"
echo "  - monitor.sh (监控脚本)"
echo "  - miracle/ (保留，包含有用的前端组件)"
echo ""
echo "📦 备份文件保存在 backup/ 目录"
echo "🔄 如需恢复，请运行: cp -r backup/* ." 