# 📚 MCP Web Automation Tool - HTTP API 使用指南

> 详细的API调用方法和示例

## 🚀 **快速启动**

### 1️⃣ **环境准备**
```bash
# 1. 安装依赖
npm install

# 2. 创建配置文件（如果没有）
cp config/config.example.json config/config.json

# 3. 启动服务
npm start
```

### 2️⃣ **验证服务**
```bash
# 健康检查（无需认证）
curl http://localhost:29527/health

# 预期返回：
{
  "status": "ok",
  "message": "MCP Web Automation Tool is running",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123,
  "memory": "200MB"
}
```

---

## 🔐 **API认证**

所有API请求（除了`/health`）都需要认证：

```bash
# 方式1：X-API-Key 头部
curl -H "X-API-Key: mcp-demo-key-change-me-in-production" \
     http://localhost:29527/api/navigate

# 方式2：Authorization 头部
curl -H "Authorization: Bearer mcp-demo-key-change-me-in-production" \
     http://localhost:29527/api/navigate
```

⚠️ **默认API密钥**：`mcp-demo-key-change-me-in-production`

---

## 🌐 **核心功能API**

### 1️⃣ **页面导航** - `POST /api/navigate`

**功能**：访问指定网页

```bash
# 基本导航
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "url": "https://www.baidu.com",
    "client_id": "client1",
    "wait_for_load": true
  }' \
  http://localhost:29527/api/navigate
```

**请求参数**：
- `url` (必需)：目标网页地址
- `client_id` (可选)：客户端标识，默认"default"
- `wait_for_load` (可选)：是否等待页面加载完成，默认true

**响应示例**：
```json
{
  "success": true,
  "message": "Navigation successful",
  "data": {
    "url": "https://www.baidu.com/",
    "title": "百度一下，你就知道",
    "status": 200
  }
}
```

---

### 2️⃣ **内容提取** - `GET /api/content`

**功能**：提取页面内容

```bash
# 提取页面标题
curl -H "X-API-Key: mcp-demo-key-change-me-in-production" \
     "http://localhost:29527/api/content?client_id=client1&selector=title&type=text"

# 提取整个页面文本
curl -H "X-API-Key: mcp-demo-key-change-me-in-production" \
     "http://localhost:29527/api/content?client_id=client1&selector=body&type=text"

# 提取HTML内容
curl -H "X-API-Key: mcp-demo-key-change-me-in-production" \
     "http://localhost:29527/api/content?client_id=client1&selector=.main&type=html"
```

**查询参数**：
- `client_id` (可选)：客户端标识，默认"default"
- `selector` (可选)：CSS选择器，默认"body"
- `type` (可选)：提取类型，"text"或"html"，默认"text"

**响应示例**：
```json
{
  "success": true,
  "message": "Content extracted successfully",
  "data": {
    "content": "百度一下，你就知道",
    "selector": "title",
    "type": "text",
    "length": 8
  }
}
```

---

### 3️⃣ **元素点击** - `POST /api/click`

**功能**：点击页面元素

```bash
# 点击搜索按钮
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "selector": "#su",
    "client_id": "client1",
    "wait_for_navigation": false
  }' \
  http://localhost:29527/api/click
```

**请求参数**：
- `selector` (必需)：元素的CSS选择器
- `client_id` (可选)：客户端标识，默认"default"
- `wait_for_navigation` (可选)：是否等待页面跳转，默认false

---

### 4️⃣ **文本输入** - `POST /api/input`

**功能**：在表单元素中输入文本

```bash
# 在搜索框输入文本
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "selector": "#kw",
    "text": "人工智能",
    "client_id": "client1",
    "clear": true
  }' \
  http://localhost:29527/api/input
```

**请求参数**：
- `selector` (必需)：输入框的CSS选择器
- `text` (必需)：要输入的文本
- `client_id` (可选)：客户端标识，默认"default"
- `clear` (可选)：输入前是否清空，默认true

---

### 5️⃣ **页面截图** - `GET /api/screenshot`

**功能**：截取页面图片

```bash
# 全页面截图
curl -H "X-API-Key: mcp-demo-key-change-me-in-production" \
     "http://localhost:29527/api/screenshot?client_id=client1&fullPage=true" \
     --output screenshot.png

# 指定格式和质量
curl -H "X-API-Key: mcp-demo-key-change-me-in-production" \
     "http://localhost:29527/api/screenshot?client_id=client1&format=jpeg&quality=90" \
     --output screenshot.jpg
```

**查询参数**：
- `client_id` (可选)：客户端标识，默认"default"
- `fullPage` (可选)：是否全页面截图，默认"true"
- `format` (可选)：图片格式，"png"或"jpeg"，默认"png"
- `quality` (可选)：图片质量，1-100，默认80

---

### 6️⃣ **收藏夹管理** - `POST /api/bookmarks`

**功能**：管理网页收藏夹

```bash
# 添加收藏
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "action": "add",
    "website": "baidu.com",
    "url": "https://www.baidu.com",
    "title": "百度首页"
  }' \
  http://localhost:29527/api/bookmarks

# 查看收藏
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "action": "list",
    "website": "baidu.com"
  }' \
  http://localhost:29527/api/bookmarks

# 删除收藏
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "action": "delete",
    "website": "baidu.com",
    "bookmark_id": "bookmark-uuid-here"
  }' \
  http://localhost:29527/api/bookmarks
```

---

### 7️⃣ **密码管理** - `POST /api/credentials`

**功能**：管理网站登录凭证

```bash
# 保存密码
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "action": "save",
    "website": "example.com",
    "username": "user@example.com",
    "password": "password123"
  }' \
  http://localhost:29527/api/credentials

# 获取密码
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "action": "get",
    "website": "example.com"
  }' \
  http://localhost:29527/api/credentials

# 列出所有网站
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{
    "action": "list"
  }' \
  http://localhost:29527/api/credentials
```

---

## 🎯 **完整使用示例**

### 百度搜索自动化

```bash
# 1. 访问百度首页
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{"url": "https://www.baidu.com", "client_id": "search_demo"}' \
  http://localhost:29527/api/navigate

# 2. 在搜索框输入关键词
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{"selector": "#kw", "text": "人工智能", "client_id": "search_demo"}' \
  http://localhost:29527/api/input

# 3. 点击搜索按钮
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-demo-key-change-me-in-production" \
  -d '{"selector": "#su", "client_id": "search_demo", "wait_for_navigation": true}' \
  http://localhost:29527/api/click

# 4. 截图保存结果
curl -H "X-API-Key: mcp-demo-key-change-me-in-production" \
     "http://localhost:29527/api/screenshot?client_id=search_demo&fullPage=true" \
     --output search_result.png

# 5. 提取搜索结果
curl -H "X-API-Key: mcp-demo-key-change-me-in-production" \
     "http://localhost:29527/api/content?client_id=search_demo&selector=.result&type=text"
```

---

## 🔧 **常见问题排查**

### 问题1：连接失败
```bash
# 检查服务状态
curl http://localhost:29527/health

# 如果失败，检查进程
ps aux | grep node
netstat -tulpn | grep 29527
```

### 问题2：认证失败
```bash
# 确认API密钥正确
grep "api_key" config/config.json

# 检查请求头格式
curl -v -H "X-API-Key: your-key" http://localhost:29527/api/navigate
```

### 问题3：浏览器错误
```bash
# 检查容器日志（如果使用Docker）
docker-compose logs -f

# 或查看Node.js日志
npm start
```

---

## 🎛️ **配置管理**

### 修改API密钥
```bash
# 编辑配置文件
vim config/config.json

# 生成新密钥
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32

# 重启服务
npm start
```

### 修改端口
```bash
# 编辑config.json
{
  "server": {
    "port": 8080,  # 改为新端口
    "host": "0.0.0.0"
  }
}

# 重启服务
npm start
```

---

## 🚀 **编程语言集成示例**

### Python示例
```python
import requests

API_KEY = "mcp-demo-key-change-me-in-production"
BASE_URL = "http://localhost:29527"

headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}

# 导航
response = requests.post(f"{BASE_URL}/api/navigate", 
                        json={"url": "https://www.baidu.com", "client_id": "python_client"},
                        headers=headers)
print(response.json())

# 截图
screenshot = requests.get(f"{BASE_URL}/api/screenshot?client_id=python_client", 
                         headers=headers)
with open("screenshot.png", "wb") as f:
    f.write(screenshot.content)
```

### JavaScript示例
```javascript
const axios = require('axios');

const API_KEY = "mcp-demo-key-change-me-in-production";
const BASE_URL = "http://localhost:29527";

const headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
};

// 导航
async function navigate() {
    const response = await axios.post(`${BASE_URL}/api/navigate`, {
        url: "https://www.baidu.com",
        client_id: "js_client"
    }, { headers });
    
    console.log(response.data);
}

navigate();
```

---

## 📊 **性能说明**

- **并发限制**：同时支持2个客户端（client1, client2）
- **请求限制**：每分钟60次请求
- **内存占用**：约200MB
- **响应时间**：通常 < 3秒
- **截图大小**：通常20-70KB PNG格式

---

**🎉 现在您可以通过HTTP API完全控制浏览器进行网页自动化了！**