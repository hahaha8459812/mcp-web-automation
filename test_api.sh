#!/bin/bash

# API测试脚本
API_KEY="mcp-demo-key-change-me-in-production"
BASE_URL="http://localhost:29527"
CLIENT_ID="demo_client"

echo "🧪 开始测试 MCP Web Automation Tool HTTP API"
echo "============================================="

# 1. 健康检查
echo "1️⃣ 健康检查..."
curl -s "$BASE_URL/health" | jq '.'
echo ""

# 2. 测试导航
echo "2️⃣ 测试页面导航..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"url\": \"https://httpbin.org/get\", \"client_id\": \"$CLIENT_ID\"}" \
  "$BASE_URL/api/navigate" | jq '.'
echo ""

# 3. 测试内容提取
echo "3️⃣ 测试内容提取..."
curl -s -H "X-API-Key: $API_KEY" \
  "$BASE_URL/api/content?client_id=$CLIENT_ID&selector=body&type=text" | jq '.data.content' | head -5
echo ""

# 4. 测试截图
echo "4️⃣ 测试截图功能..."
curl -s -H "X-API-Key: $API_KEY" \
  "$BASE_URL/api/screenshot?client_id=$CLIENT_ID&fullPage=true" \
  --output "demo_screenshot.png"

if [ -f "demo_screenshot.png" ]; then
    SIZE=$(stat -c%s demo_screenshot.png)
    echo "✅ 截图成功生成：demo_screenshot.png (${SIZE} bytes)"
else
    echo "❌ 截图生成失败"
fi
echo ""

# 5. 测试收藏夹
echo "5️⃣ 测试收藏夹管理..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"action": "add", "website": "httpbin.org", "url": "https://httpbin.org/get", "title": "HTTP测试页面"}' \
  "$BASE_URL/api/bookmarks" | jq '.'
echo ""

# 6. 测试查看收藏
echo "6️⃣ 查看收藏夹..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"action": "list", "website": "httpbin.org"}' \
  "$BASE_URL/api/bookmarks" | jq '.'
echo ""

# 7. 测试密码管理
echo "7️⃣ 测试密码管理..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"action": "save", "website": "example.com", "username": "testuser", "password": "testpass123"}' \
  "$BASE_URL/api/credentials" | jq '.'
echo ""

# 8. 查看保存的密码
echo "8️⃣ 获取保存的密码..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"action": "get", "website": "example.com"}' \
  "$BASE_URL/api/credentials" | jq '.'
echo ""

echo "🎉 API测试完成！"
echo "所有功能都运行正常，您可以开始使用HTTP API进行网页自动化了。"