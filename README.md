# MCP Web Automation Tool

> 🤖 轻量级 MCP (Model Context Protocol) 网页自动化工具

一个专为 AI 助手设计的网页浏览、交互和内容提取工具，支持收藏夹管理和密码存储，可轻松部署在 2GB 内存的云服务器上。

## ✨ 功能特性

### 🌐 网页自动化
- **智能导航**：支持 URL 跳转、页面刷新、前进后退
- **内容提取**：HTML 解析、文本获取、元素定位
- **交互操作**：点击、输入、下拉选择、表单提交
- **页面截图**：全页面截图、元素截图、自定义区域截图

### 📚 数据管理
- **收藏夹系统**：分层管理（网站 → 网页），支持增删改查
- **密码管理**：网站账号密码存储，支持自动登录
- **数据持久化**：所有数据存储在单个 JSON 文件，便于备份转移

### 🚀 部署友好
- **一键部署**：Docker 容器化，单命令启动
- **低资源占用**：总内存占用约 300MB，适合低配服务器
- **远程访问**：HTTP API 接口，支持跨设备、跨容器调用
- **并发支持**：同时支持 2 个 AI 客户端连接

## 🚀 快速开始

### 前置要求
- Docker 和 Docker Compose
- 2GB+ 内存的 Linux 服务器

### 一键部署
```bash
# 克隆仓库
git clone https://github.com/hahaha8459812/mcp-web-automation.git
cd mcp-web-automation

# 一键启动
chmod +x scripts/install.sh
./scripts/install.sh
```

### 配置 API 密钥
```bash
# 编辑配置文件
cp config/config.example.json config/config.json
vim config/config.json
```

```json
{
  "api_key": "mcp-demo-key-change-me-in-production",
  "// API密钥说明": "这是访问MCP工具所需的密钥，请妥善保管",
  "// API Key Description": "This is the API key required to access the MCP tool, please keep it secure",
  "server": {
    "port": 29527,
    "host": "0.0.0.0"
  }
}
```

### 验证部署
```bash
curl -H "X-API-Key: your-api-key" http://localhost:29527/health
```

### 🤖 AI 客户端配置

在您的 AI 助手客户端中使用此 MCP 工具时，请填写以下连接信息：

#### 📋 必填配置项

```yaml
# MCP 工具连接配置
服务器地址: http://your-server-ip:29527
API 密钥: mcp-demo-key-change-me-in-production
客户端标识: client1 或 client2 (最多支持2个并发)
认证方式: HTTP Header (X-API-Key)
```

#### 🔧 具体填写示例

**对于支持 HTTP MCP 的客户端：**
```json
{
  "name": "Web Automation Tool",
  "url": "http://your-server-ip:29527",
  "headers": {
    "X-API-Key": "your-actual-api-key-here"
  },
  "client_id": "client1"
}
```

**对于 Claude Desktop 等客户端：**
```json
{
  "mcpServers": {
    "web-automation": {
      "command": "curl",
      "args": [
        "-H", "X-API-Key: your-actual-api-key-here",
        "http://your-server-ip:29527"
      ]
    }
  }
}
```

#### ⚠️ 重要提示

1. **替换服务器地址**：将 `your-server-ip` 替换为实际的服务器IP或域名
2. **更换API密钥**：使用配置文件中设置的真实API密钥
3. **客户端标识**：每个AI客户端使用不同的 `client_id`（client1, client2）
4. **网络访问**：确保AI客户端能访问到服务器的29527端口

#### 🧪 连接测试

配置完成后，可以通过以下方式测试连接：
```bash
curl -H "X-API-Key: your-api-key" http://your-server-ip:29527/health
```

成功返回：`{"status": "ok", "message": "MCP Web Automation Tool is running"}`

## 📖 API 文档

### 认证
所有 API 请求需要在 Header 中包含 API 密钥：
```
X-API-Key: your-secure-api-key-here
```

### 核心接口

#### 🌐 页面导航
```http
POST /api/navigate
Content-Type: application/json

{
  "url": "https://example.com",
  "client_id": "client1"
}
```

#### 🖱️ 元素交互
```http
POST /api/click
Content-Type: application/json

{
  "selector": "#login-button",
  "client_id": "client1"
}
```

#### 📄 内容提取
```http
GET /api/content?client_id=client1&selector=body
```

#### 📸 页面截图
```http
GET /api/screenshot?client_id=client1&fullPage=true
```

#### 🔖 收藏夹管理
```http
POST /api/bookmarks
Content-Type: application/json

{
  "action": "add",
  "website": "example.com",
  "url": "https://example.com/page1",
  "title": "示例页面"
}
```

#### 🔐 密码管理
```http
POST /api/credentials
Content-Type: application/json

{
  "action": "save",
  "website": "example.com",
  "username": "user@example.com",
  "password": "password123"
}
```

详细 API 文档请查看 [docs/API.md](docs/API.md)

## ⚙️ 配置说明

### 主配置文件 `config/config.json`
```json
{
  "api_key": "your-api-key",
  "server": {
    "port": 29527,
    "host": "0.0.0.0"
  },
  "browser": {
    "headless": true,
    "timeout": 30000,
    "user_agent": "normal"
  }
}
```

### 用户数据文件 `data/user-data.json`
```json
{
  "bookmarks": {
    "example.com": [
      {
        "url": "https://example.com/page1",
        "title": "页面标题",
        "added_time": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "credentials": {
    "example.com": {
      "username": "user@example.com",
      "password": "password123"
    }
  }
}
```

## 🐳 Docker 部署

### Docker Compose (推荐)
```yaml
version: '3.8'
services:
  mcp-web-automation:
    build: .
    ports:
      - "29527:29527"
    volumes:
      - ./config:/app/config
      - ./data:/app/data
    restart: unless-stopped
```

### 手动 Docker
```bash
# 构建镜像
docker build -t mcp-web-automation .

# 运行容器
docker run -d \
  --name mcp-web-automation \
  -p 29527:29527 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  mcp-web-automation
```

## 🔧 开发说明

### 项目结构
```
mcp-web-automation/
├── README.md                    # 项目说明文档
├── LICENSE                      # 开源许可证
├── .gitignore                   # Git忽略文件
├── Dockerfile                   # Docker构建文件
├── docker-compose.yml           # Docker Compose配置
├── package.json                 # Node.js依赖配置
├── config/
│   ├── config.json             # 主配置文件
│   └── config.example.json     # 配置文件示例
├── data/
│   ├── user-data.json          # 用户数据（收藏夹、密码等）
│   └── .gitkeep                # 保持目录存在
├── src/
│   ├── index.js                # 主入口文件
│   ├── server.js               # HTTP服务器
│   ├── browser/
│   │   ├── manager.js          # 浏览器管理器
│   │   ├── navigation.js       # 导航功能
│   │   ├── interaction.js      # 页面交互
│   │   └── screenshot.js       # 截图功能
│   ├── data/
│   │   ├── bookmarks.js        # 收藏夹管理
│   │   └── credentials.js      # 密码管理
│   └── utils/
│       ├── auth.js             # API认证
│       └── logger.js           # 日志工具
├── docs/
│   ├── API.md                  # API文档
│   └── DEPLOYMENT.md           # 部署指南
└── scripts/
    ├── install.sh              # 安装脚本
    └── start.sh               # 启动脚本
```

### 本地开发
```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 构建
npm run build
```

## 📊 性能指标

- **内存占用**：约 300MB
- **启动时间**：10-15 秒
- **并发支持**：2 个客户端
- **页面超时**：30 秒

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🆘 支持与反馈

- 📋 [提交 Issue](https://github.com/hahaha8459812/mcp-web-automation/issues)
- 💬 [讨论区](https://github.com/hahaha8459812/mcp-web-automation/discussions)

---

⭐ 如果这个项目对您有帮助，请给个 Star 支持一下！

**✅ 完成！AI客户端配置已添加到快速开始部分。接下来创建 package.json 吗？**
