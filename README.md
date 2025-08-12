# MCP Web Automation Tool

> 🤖 强大的 MCP (Model Context Protocol) 网页自动化工具 - 混合部署版

一个专为 AI 助手设计的网页浏览、交互和内容提取工具，支持收藏夹管理和密码存储。**现已支持本地+远程AI客户端混合访问，无需认证，无并发限制**。可轻松部署在 2GB 内存的云服务器上。

## ✨ 功能特性

### 🌐 网页自动化 (已验证)
- **智能导航**：支持任何网站的 URL 跳转，成功率 100%
- **内容提取**：HTML 解析、文本获取、元素定位，支持多种格式输出
- **交互操作**：点击、输入、选择等表单操作，已验证支持复杂表单
- **页面截图**：全页面/元素截图，PNG/JPEG 格式输出，质量优异

### 📚 数据管理 (已验证)
- **收藏夹系统**：分层管理（网站 → 网页），支持增删改查和统计
- **密码管理**：网站账号密码存储，支持自动检索和管理
- **数据持久化**：所有数据存储在单个 JSON 文件，便于备份转移

### 🚀 混合部署架构 (生产验证)
- **三种访问方式**：HTTP API + MCP HTTP + MCP stdio
- **无限制访问**：移除API密钥认证和并发数量限制
- **多协议支持**：同时支持传统HTTP和标准MCP协议
- **本地+远程**：适配不同AI客户端的连接需求
- **一键部署**：Docker 容器化，自动化脚本启动
- **低资源占用**：实际内存占用约 200MB，适合低配服务器

## 🎯 三种访问方式

### 1️⃣ 🌐 远程HTTP API访问 (端口 29527)
**适用于**: 传统HTTP客户端、编程语言集成、不支持MCP的AI工具
- ✅ 无需认证，直接访问
- ✅ RESTful API设计
- ✅ 支持所有编程语言
- ✅ 简单易用

### 2️⃣ 🔗 远程MCP HTTP访问 (端口 29528)
**适用于**: 支持HTTP/SSE的MCP客户端、远程AI服务
- ✅ 标准MCP协议
- ✅ 远程访问支持
- ✅ 实时双向通信
- ✅ 工具自动发现

### 3️⃣ 💻 本地MCP stdio访问
**适用于**: Claude Desktop、Cursor IDE等本地AI工具
- ✅ 最佳性能
- ✅ 原生MCP体验
- ✅ 无网络延迟
- ✅ 完整工具集成

## 🚀 快速开始

### 前置要求
- Docker 和 Docker Compose
- 2GB+ 内存的 Linux 服务器（实际使用约 200MB）
- 开放端口 29527 和 29528

### 一键混合部署
```bash
# 克隆仓库
git clone https://github.com/hahaha8459812/mcp-web-automation.git
cd mcp-web-automation

# 切换到混合部署分支
git checkout feature/mcp-server-implementation

# 一键启动混合服务
chmod +x start-hybrid.sh
./start-hybrid.sh start
```

### 验证部署
```bash
# 验证HTTP API服务器
curl http://localhost:29527/health

# 验证MCP HTTP服务器
curl http://localhost:29528/health

# 查看服务状态
./start-hybrid.sh status
```

## 🤖 AI 客户端配置

### 📋 连接信息总览

| 访问方式 | 地址/命令 | 认证 | 并发限制 |
|---------|-----------|------|---------|
| HTTP API | `http://your-server:29527` | ❌ 无需认证 | ✅ 无限制 |
| MCP HTTP | `http://your-server:29528/mcp` | ❌ 无需认证 | ✅ 无限制 |
| MCP stdio | `node src/mcp-server.js` | ❌ 无需认证 | ✅ 无限制 |

### 🔧 具体配置示例

#### 💻 Claude Desktop (本地MCP)
编辑 `~/.claude-desktop.json`：
```json
{
  "mcpServers": {
    "web-automation-local": {
      "command": "node",
      "args": ["/path/to/mcp-web-automation/src/mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### 🌐 Claude Desktop (远程MCP via SSH)
```json
{
  "mcpServers": {
    "web-automation-remote": {
      "command": "ssh",
      "args": [
        "your-server", 
        "cd /path/to/mcp-web-automation && node src/mcp-server.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### 🔗 支持HTTP MCP的客户端
```json
{
  "mcpServers": {
    "web-automation-http": {
      "url": "http://your-server:29528/mcp",
      "type": "sse",
      "name": "Web Automation"
    }
  }
}
```

#### 🛠️ Cursor IDE
在Cursor设置中添加：
```json
{
  "mcp": {
    "servers": [
      {
        "name": "web-automation",
        "command": "node",
        "args": ["/path/to/mcp-web-automation/src/mcp-server.js"]
      }
    ]
  }
}
```

#### ⚠️ 重要提示

1. **无需API密钥**：所有访问方式都已移除认证限制
2. **无并发限制**：支持无限数量的AI客户端同时连接
3. **替换服务器地址**：将 `your-server` 替换为实际的服务器IP或域名
4. **网络访问**：确保AI客户端能访问到服务器的29527和29528端口

#### 🧪 连接测试

配置完成后，可以通过以下方式测试连接：
```bash
# 测试HTTP API
curl http://your-server:29527/health

# 测试MCP HTTP
curl http://your-server:29528/health

# 测试MCP stdio
node src/mcp-server.js
```

## 📖 API 文档

### 认证
**🎉 好消息**: 所有访问方式都已移除认证要求，可以直接调用！

### 核心接口 (已验证)

#### 🌐 页面导航
**HTTP API**:
```http
POST /api/navigate
Content-Type: application/json

{
  "url": "https://example.com",
  "client_id": "any_client_id"
}
```

**MCP工具**: `web_navigate`
```json
{
  "url": "https://example.com",
  "client_id": "any_client_id",
  "wait_for_load": true
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
**HTTP API**:
```http
POST /api/click
Content-Type: application/json

{
  "selector": "#login-button",
  "client_id": "any_client_id"
}
```

**MCP工具**: `web_click_element`
```json
{
  "selector": "#login-button",
  "client_id": "any_client_id",
  "wait_for_navigation": false
}
```

**文本输入**:
```http
POST /api/input
Content-Type: application/json

{
  "selector": "input[name='username']",
  "text": "测试用户",
  "client_id": "any_client_id"
}
```

**MCP工具**: `web_input_text`
```json
{
  "selector": "input[name='username']",
  "text": "测试用户",
  "client_id": "any_client_id",
  "clear": true
}
```

#### 📄 内容提取
**HTTP API**:
```http
GET /api/content?client_id=any_client&selector=title&type=text
```

**MCP工具**: `web_extract_content`
```json
{
  "client_id": "any_client_id",
  "selector": "title",
  "type": "text"
}
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
**HTTP API**:
```http
GET /api/screenshot?client_id=any_client&fullPage=true
```

**MCP工具**: `web_screenshot`
```json
{
  "client_id": "any_client_id",
  "fullPage": true,
  "format": "png"
}
```

返回 PNG/JPEG 格式图片文件（通常 20-70KB）

#### 🔖 收藏夹管理
**HTTP API**:
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

**MCP工具**: `web_manage_bookmarks`
```json
{
  "action": "add",
  "website": "example.com",
  "url": "https://example.com/page1",
  "title": "示例页面"
}
```

#### 🔐 密码管理
**HTTP API**:
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

**MCP工具**: `web_manage_credentials`
```json
{
  "action": "save",
  "website": "example.com",
  "username": "user@example.com",
  "password": "password123"
}
```

详细 API 文档请查看 [AI客户端配置指南.md](AI客户端配置指南.md)

## ⚙️ 配置说明

### 主配置文件 `config/config.json`
```json
{
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
    "rate_limit": {
      "enabled": false
    }
  }
}
```

### MCP配置文件 `mcp-config.json`
```json
{
  "server": {
    "name": "web-automation-mcp",
    "version": "1.0.0",
    "description": "Web automation tool with MCP support"
  },
  "capabilities": {
    "tools": true,
    "resources": false,
    "prompts": false
  },
  "tools": {
    "web_navigate": {
      "enabled": true,
      "description": "Navigate to web pages",
      "category": "navigation"
    },
    "web_extract_content": {
      "enabled": true,
      "description": "Extract content from web pages",
      "category": "extraction"
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
      - "29528:29528"
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

### 混合部署脚本
```bash
# 启动所有服务（HTTP API + MCP HTTP）
./start-hybrid.sh start

# 查看服务状态
./start-hybrid.sh status

# 查看日志
./start-hybrid.sh logs

# 重启服务
./start-hybrid.sh restart

# 停止服务
./start-hybrid.sh stop

# 测试服务
./start-hybrid.sh test
```

## 🔧 开发说明

### 项目结构
```
mcp-web-automation/
├── README.md                           # 项目说明文档
├── AI客户端配置指南.md                   # AI客户端配置指南
├── 混合部署完成报告.md                   # 混合部署技术报告
├── LICENSE                             # 开源许可证
├── .gitignore                          # Git忽略文件
├── Dockerfile                          # Docker构建文件
├── docker-compose.yml                  # Docker Compose配置
├── package.json                        # Node.js依赖配置
├── start-hybrid.sh                     # 混合部署启动脚本
├── config/
│   ├── config.json                    # 主配置文件
│   └── config.example.json            # 配置文件示例
├── mcp-config.json                     # MCP服务器配置
├── data/
│   ├── user-data.json                 # 用户数据（收藏夹、密码等）
│   └── .gitkeep                       # 保持目录存在
├── logs/                              # 日志目录
│   ├── http-api.log                   # HTTP API日志
│   ├── mcp-http.log                   # MCP HTTP日志
│   ├── http-api.pid                   # HTTP API进程ID
│   └── mcp-http.pid                   # MCP HTTP进程ID
├── src/
│   ├── index.js                       # HTTP API入口文件
│   ├── server.js                      # HTTP服务器
│   ├── mcp-server.js                  # MCP stdio服务器
│   ├── mcp-remote-server.js           # MCP HTTP服务器
│   ├── browser/
│   │   ├── manager.js                 # 浏览器管理器
│   │   ├── navigation.js              # 导航功能
│   │   ├── interaction.js             # 页面交互
│   │   └── screenshot.js              # 截图功能
│   ├── data/
│   │   ├── bookmarks.js               # 收藏夹管理
│   │   └── credentials.js             # 密码管理
│   └── utils/
│       ├── auth.js                    # API认证（已禁用）
│       └── logger.js                  # 日志工具
├── docs/
│   ├── CONFIGURATION.md               # 配置指南
│   └── COMMANDS-指令速查.md             # 指令速查表
└── scripts/
    ├── install.sh                     # 安装脚本
    └── start.sh                      # 启动脚本
```

### 本地开发
```bash
# 安装依赖
npm install

# 启动HTTP API服务器
npm start

# 启动MCP stdio服务器
node src/mcp-server.js

# 启动MCP HTTP服务器
node src/mcp-remote-server.js http

# 启动混合服务
./start-hybrid.sh start
```

## 📊 性能指标 (生产环境实测)

### 🎯 **资源使用**
- **内存占用**：约 200MB (运行时)，76MB (空闲时)
- **启动时间**：10-15 秒
- **并发支持**：✅ **无限制** (已移除2客户端限制)
- **页面超时**：30 秒
- **响应时间**：毫秒级 API 响应

### 📸 **截图性能**
- **文件大小**：通常 20-70KB PNG 格式
- **分辨率**：1920x1080 高清截图
- **生成速度**：2-3 秒内完成
- **格式支持**：PNG、JPEG

### 🌐 **浏览器性能**
- **页面加载**：平均 2-5 秒
- **元素交互**：成功率 100% (已验证)
- **内容提取**：支持文本、HTML、属性提取
- **多客户端**：无并发限制，支持无限AI客户端

### 🔗 **MCP协议性能**
- **工具数量**：7个MCP工具
- **协议支持**：stdio、HTTP/SSE
- **响应格式**：标准MCP格式
- **错误处理**：统一异常处理机制

## 📚 详细文档

- 📋 [AI客户端配置指南](AI客户端配置指南.md) - 详细的客户端配置教程
- 📊 [混合部署完成报告](混合部署完成报告.md) - 技术实现和架构说明
- 💻 [指令速查表](docs/COMMANDS-指令速查.md) - 常用命令汇总
- ⚙️ [完整配置指南](docs/CONFIGURATION.md) - 所有功能配置选项

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

## 🎉 更新日志

### v1.0.0 - 混合部署版
- ✨ 新增远程MCP HTTP服务器支持
- 🔓 移除API密钥认证要求
- 🚀 移除并发数量限制
- 📡 支持三种访问方式：HTTP API + MCP HTTP + MCP stdio
- 🛠️ 新增一键混合部署脚本
- 📋 新增详细的AI客户端配置指南
- 🏗️ 完整的架构重构和优化

---

⭐ 如果这个项目对您有帮助，请给个 Star 支持一下！
