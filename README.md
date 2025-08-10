# MCP Web Automation Tool

> 🤖 轻量级 MCP (Model Context Protocol) 网页自动化工具

一个专为 AI 助手设计的网页浏览、交互和内容提取工具，支持收藏夹管理和密码存储，可轻松部署在 2GB 内存的云服务器上。

## ✨ 功能特性

### 🌐 网页自动化 (已验证)
- **智能导航**：支持任何网站的 URL 跳转，成功率 100%
- **内容提取**：HTML 解析、文本获取、元素定位，支持多种格式输出
- **交互操作**：点击、输入、选择等表单操作，已验证支持复杂表单
- **页面截图**：全页面/元素截图，PNG 格式输出，质量优异

### 📚 数据管理 (已验证)
- **收藏夹系统**：分层管理（网站 → 网页），支持增删改查和统计
- **密码管理**：网站账号密码存储，支持自动检索和管理
- **数据持久化**：所有数据存储在单个 JSON 文件，便于备份转移

### 🚀 部署友好 (生产验证)
- **一键部署**：Docker 容器化，单命令启动
- **低资源占用**：实际内存占用约 200MB，适合低配服务器
- **远程访问**：HTTP API 接口，支持跨设备、跨容器调用
- **并发支持**：同时支持 2 个 AI 客户端连接

## 🚀 快速开始

### 前置要求
- Docker 和 Docker Compose
- 2GB+ 内存的 Linux 服务器（实际使用约 200MB）
- 开放端口 29527

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
API 密钥: your-actual-api-key-here
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

### 核心接口 (已验证)

#### 🌐 页面导航
```http
POST /api/navigate
Content-Type: application/json

{
  "url": "https://example.com",
  "client_id": "client1"
}
```

**成功响应示例：**
```json
{
  "success": true,
  "message": "Navigation successful",
  "data": {
    "url": "https://example.com/",
    "title": "Example Domain",
    "status": 200
  }
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

```http
POST /api/input
Content-Type: application/json

{
  "selector": "input[name='username']",
  "text": "测试用户",
  "client_id": "client1"
}
```

**成功响应示例：**
```json
{
  "success": true,
  "message": "Input successful",
  "data": {
    "success": true,
    "text": "测试用户",
    "selector": "input[name='username']"
  }
}
```

#### 📄 内容提取
```http
GET /api/content?client_id=client1&selector=title&type=text
```

**成功响应示例：**
```json
{
  "success": true,
  "message": "Content extracted successfully",
  "data": {
    "content": "Example Domain",
    "selector": "title",
    "type": "text",
    "length": 14
  }
}
```

#### 📸 页面截图
```http
GET /api/screenshot?client_id=client1&fullPage=true
```

返回 PNG 格式图片文件（通常 20-70KB）

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
    "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  },
  "security": {
    "max_concurrent_clients": 2,
    "rate_limit": {
      "enabled": true,
      "max_requests_per_minute": 60
    }
  }
}
```

### 用户数据文件 `data/user-data.json`
```json
{
  "bookmarks": {
    "example.com": [
      {
        "id": "uuid",
        "url": "https://example.com/page1",
        "title": "页面标题",
        "added_at": "2024-01-01T00:00:00Z",
        "visit_count": 0
      }
    ]
  },
  "credentials": {
    "example.com": {
      "username": "user@example.com",
      "password": "password123",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

## 🐳 Docker 部署

### Docker Compose (推荐)
```yaml
services:
  mcp-web-automation:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mcp-web-automation
    ports:
      - "29527:29527"
    volumes:
      - ./config:/app/config:ro
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - TZ=Asia/Shanghai
    restart: unless-stopped
    shm_size: '2gb'
    security_opt:
      - seccomp:unconfined
    cap_add:
      - SYS_ADMIN
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '2.0'
        reservations:
          memory: 512M
          cpus: '1.0'
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
  --shm-size=2g \
  --security-opt seccomp:unconfined \
  --cap-add SYS_ADMIN \
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
│   ├── CONFIGURATION.md        # 配置指南
│   └── COMMANDS-指令速查.md      # 指令速查表
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

## 📊 性能指标 (生产环境实测)

### 🎯 **资源使用**
- **内存占用**：约 200MB (运行时)，76MB (空闲时)
- **启动时间**：10-15 秒
- **并发支持**：2 个客户端同时访问
- **页面超时**：30 秒
- **响应时间**：毫秒级 API 响应

### 📸 **截图性能**
- **文件大小**：通常 20-70KB PNG 格式
- **分辨率**：1920x1080 高清截图
- **生成速度**：2-3 秒内完成

### 🌐 **浏览器性能**
- **页面加载**：平均 2-5 秒
- **元素交互**：成功率 100% (已验证)
- **内容提取**：支持文本、HTML、属性提取

## 📚 详细文档

- 📋 [完整配置指南](docs/CONFIGURATION.md) - 所有功能配置选项和修改方法
- 💻 [指令速查表](docs/COMMANDS-指令速查.md) - 常用命令汇总

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
