# ⚙️ MCP Web Automation Tool 配置指南 - 混合部署版

> 完整的功能配置清单和参数说明 - 支持HTTP API + MCP HTTP + MCP stdio三种访问方式

## 📋 配置文件总览

本工具提供了丰富的配置选项，支持混合部署架构的灵活自定义设置。所有配置分为以下几个层次：

- 🔧 **HTTP服务配置**：`config/config.json`
- 🔗 **MCP服务配置**：`mcp-config.json`
- 🌍 **环境变量**：Docker 和系统环境
- 🐳 **容器配置**：`docker-compose.yml`
- 🚀 **启动参数**：浏览器引擎配置
- 📜 **混合部署脚本**：`start-hybrid.sh`

---

## 🎯 **混合部署架构概览**

### 三种访问方式配置
| 访问方式 | 配置文件 | 端口 | 认证 | 用途 |
|---------|---------|------|------|------|
| **HTTP API** | `config/config.json` | 29527 | ❌ 已禁用 | 传统REST API |
| **MCP HTTP** | `mcp-config.json` | 29528 | ❌ 已禁用 | 远程MCP服务 |
| **MCP stdio** | `mcp-config.json` | - | ❌ 已禁用 | 本地MCP服务 |

---

## 1️⃣ **HTTP服务配置** `config/config.json`

### 🔐 安全配置 (已禁用认证)
| 配置项 | 默认值 | 说明 | 状态 |
|--------|--------|------|------|
| `api_key` | ~~已移除~~ | ~~API访问密钥~~ | ❌ **已禁用** |
| `security.max_concurrent_clients` | ~~已移除~~ | ~~最大并发客户端数~~ | ✅ **无限制** |
| `security.rate_limit.enabled` | `false` | 频率限制开关 | ❌ **已禁用** |
| `security.rate_limit.max_requests_per_minute` | ~~已移除~~ | ~~每分钟最大请求数~~ | ✅ **无限制** |

### 🌐 HTTP服务器配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `server.port` | `29527` | HTTP API监听端口 | ⭐⭐⭐ |
| `server.host` | `0.0.0.0` | 绑定地址 | ⭐⭐ |

### 🖥️ 浏览器配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `browser.headless` | `true` | 无头模式开关 | ⭐⭐ |
| `browser.timeout` | `30000` | 页面超时时间(ms) | ⭐⭐ |
| `browser.user_agent` | Chrome标准UA | 用户代理字符串 | ⭐ |
| `browser.viewport.width` | `1920` | 浏览器窗口宽度 | ⭐ |
| `browser.viewport.height` | `1080` | 浏览器窗口高度 | ⭐ |

### 📝 日志配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `logging.level` | `info` | 日志级别(error/warn/info/debug) | ⭐⭐ |
| `logging.file` | `logs/http-api.log` | HTTP API日志文件路径 | ⭐ |
| `logging.max_file_size` | `10MB` | 单个日志文件最大大小 | ⭐ |
| `logging.max_files` | `5` | 保留日志文件数量 | ⭐ |

### ✨ 功能开关
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `features.screenshots.enabled` | `true` | 截图功能开关 | ⭐⭐ |
| `features.screenshots.max_width` | `1920` | 截图最大宽度 | ⭐ |
| `features.screenshots.max_height` | `1080` | 截图最大高度 | ⭐ |
| `features.screenshots.quality` | `80` | 截图质量(0-100) | ⭐ |
| `features.screenshots.formats` | `["png", "jpeg"]` | 支持的截图格式 | ⭐ |
| `features.bookmarks.enabled` | `true` | 收藏夹功能开关 | ⭐⭐ |
| `features.bookmarks.max_per_website` | ~~已移除~~ | ~~每个网站最大收藏数~~ | ✅ **无限制** |
| `features.credentials.enabled` | `true` | 密码管理功能开关 | ⭐⭐ |
| `features.credentials.encryption` | `true` | 密码加密(当前为明文) | ⭐ |

---

## 2️⃣ **MCP服务配置** `mcp-config.json`

### 🔗 MCP服务器配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `server.name` | `web-automation-mcp` | MCP服务器名称 | ⭐⭐ |
| `server.version` | `1.0.0` | MCP服务器版本 | ⭐ |
| `server.description` | `Web automation tool with MCP support` | 服务器描述 | ⭐ |

### 🛠️ MCP能力配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `capabilities.tools` | `true` | 支持工具调用 | ⭐⭐⭐ |
| `capabilities.resources` | `false` | 支持资源访问 | ⭐ |
| `capabilities.prompts` | `false` | 支持提示模板 | ⭐ |

### 🔧 MCP工具配置
| 工具名称 | 启用状态 | 描述 | 分类 |
|---------|----------|------|------|
| `web_navigate` | ✅ `enabled: true` | 页面导航 | navigation |
| `web_extract_content` | ✅ `enabled: true` | 内容提取 | extraction |
| `web_click_element` | ✅ `enabled: true` | 元素点击 | interaction |
| `web_input_text` | ✅ `enabled: true` | 文本输入 | interaction |
| `web_screenshot` | ✅ `enabled: true` | 页面截图 | capture |
| `web_manage_bookmarks` | ✅ `enabled: true` | 收藏夹管理 | data |
| `web_manage_credentials` | ✅ `enabled: true` | 密码管理 | data |

### 🌐 MCP HTTP服务配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `http.port` | `29528` | MCP HTTP监听端口 | ⭐⭐⭐ |
| `http.host` | `0.0.0.0` | 绑定地址 | ⭐⭐ |
| `http.cors.enabled` | `true` | 启用CORS | ⭐⭐ |
| `http.cors.origin` | `*` | 允许的源 | ⭐ |

### 📝 MCP日志配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `logging.level` | `info` | MCP日志级别 | ⭐⭐ |
| `logging.file` | `logs/mcp-http.log` | MCP HTTP日志文件 | ⭐ |
| `logging.format` | `json` | 日志格式 | ⭐ |

### 🤖 AI客户端配置示例
| 客户端类型 | 配置方式 | 示例 |
|----------|----------|------|
| **Claude Desktop** | 本地stdio | `"command": "node", "args": ["src/mcp-server.js"]` |
| **远程SSH** | SSH连接 | `"command": "ssh", "args": ["server", "node src/mcp-server.js"]` |
| **HTTP MCP** | SSE连接 | `"url": "http://server:29528/mcp", "type": "sse"` |
| **Cursor IDE** | 本地命令 | `"command": "node", "args": ["src/mcp-server.js"]` |

---

## 3️⃣ **环境变量配置**

### 🌍 Docker 环境变量
| 变量名 | 默认值 | 说明 | 配置位置 |
|--------|--------|------|---------|
| `NODE_ENV` | `production` | 运行环境 | `docker-compose.yml` |
| `TZ` | `Asia/Shanghai` | 时区设置 | `docker-compose.yml` |
| `LOG_LEVEL` | `info` | 日志级别 | 环境变量 |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium-browser` | Chrome可执行文件路径 | `Dockerfile` |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | `true` | 跳过Chromium下载 | `Dockerfile` |

### 🔧 混合部署环境变量
| 变量名 | 默认值 | 说明 | 用途 |
|--------|--------|------|------|
| `HTTP_API_PORT` | `29527` | HTTP API端口 | `start-hybrid.sh` |
| `MCP_HTTP_PORT` | `29528` | MCP HTTP端口 | `start-hybrid.sh` |
| `MCP_MODE` | `hybrid` | MCP运行模式 | 启动脚本 |

---

## 4️⃣ **Docker 配置** `docker-compose.yml`

### 🐳 容器资源配置 (已更新支持混合部署)
| 配置项 | 默认值 | 说明 | 修改建议 |
|--------|--------|------|---------|
| `ports` | `["29527:29527", "29528:29528"]` | 端口映射 | 支持双端口 |
| `restart` | `unless-stopped` | 重启策略 | 建议保持 |
| `deploy.resources.limits.memory` | `1G` | 内存限制 | 混合部署需要更多内存 |
| `deploy.resources.limits.cpus` | `2.0` | CPU限制 | 混合部署需要更多CPU |
| `deploy.resources.reservations.memory` | `512M` | 内存预留 | 建议至少512M |
| `deploy.resources.reservations.cpus` | `1.0` | CPU预留 | 建议至少1.0 |

### 📂 数据卷挂载 (已更新)
| 配置项 | 说明 | 权限 | 新增 |
|--------|------|------|------|
| `./config:/app/config:ro` | HTTP配置文件(只读) | 只读 | - |
| `./mcp-config.json:/app/mcp-config.json:ro` | MCP配置文件(只读) | 只读 | ✅ **新增** |
| `./data:/app/data` | 用户数据(读写) | 读写 | - |
| `./logs:/app/logs` | 日志文件(读写) | 读写 | ✅ **增强** |

---

## 5️⃣ **混合部署脚本配置** `start-hybrid.sh`

### 🚀 脚本参数配置
| 配置项 | 默认值 | 说明 | 修改方法 |
|--------|--------|------|---------|
| `HTTP_API_PORT` | `29527` | HTTP API端口 | 修改脚本中的变量 |
| `MCP_HTTP_PORT` | `29528` | MCP HTTP端口 | 修改脚本中的变量 |
| `PROJECT_VERSION` | `1.0.0` | 项目版本 | 修改脚本中的变量 |
| `LOG_LEVEL` | `info` | 日志级别 | 环境变量或脚本变量 |

### 🎛️ 脚本功能开关
| 功能 | 状态 | 说明 | 配置方式 |
|------|------|------|---------|
| **HTTP API启动** | ✅ 默认启用 | 启动HTTP API服务器 | `start_http_api()` |
| **MCP HTTP启动** | ✅ 默认启用 | 启动MCP HTTP服务器 | `start_mcp_http()` |
| **进程管理** | ✅ 默认启用 | PID跟踪和清理 | `logs/*.pid` |
| **健康检查** | ✅ 默认启用 | 自动验证服务状态 | `curl` 检查 |
| **日志管理** | ✅ 默认启用 | 日志文件轮转 | `logs/` 目录 |

---

## 6️⃣ **浏览器启动参数** `src/browser/manager.js`

### 🚀 Puppeteer 启动配置 (支持多服务)
| 参数 | 状态 | 说明 | 修改建议 |
|------|------|------|---------|
| `--no-sandbox` | ✅ 启用 | 禁用沙盒 | Docker容器必需 |
| `--disable-setuid-sandbox` | ✅ 启用 | 禁用SUID沙盒 | Docker容器必需 |
| `--disable-dev-shm-usage` | ✅ 启用 | 禁用/dev/shm | 内存不足时必需 |
| `--disable-gpu` | ✅ 启用 | 禁用GPU加速 | 服务器环境建议 |
| `--no-first-run` | ✅ 启用 | 跳过首次运行 | 自动化必需 |
| `--disable-extensions` | ✅ 启用 | 禁用扩展 | 性能优化 |
| `--disable-background-timer-throttling` | ✅ 启用 | 禁用后台限流 | 性能优化 |
| `--disable-web-security` | ❌ 禁用 | 禁用Web安全 | 安全考虑 |

### 🌐 多客户端支持配置
| 配置项 | 设置 | 说明 | 支持范围 |
|--------|------|------|---------|
| **并发限制** | ✅ **已移除** | 无客户端数量限制 | 无限制 |
| **会话隔离** | ✅ 启用 | 每个客户端独立浏览器会话 | 完全隔离 |
| **资源共享** | ✅ 优化 | 共享浏览器实例，独立页面 | 内存优化 |
| **超时管理** | ✅ 独立 | 每个客户端独立超时 | 30秒/客户端 |

---

## 🔧 **完整配置示例**

### HTTP服务配置 `config/config.json`
```json
{
  "server": {
    "port": 29527,
    "host": "0.0.0.0"
  },
  "browser": {
    "headless": true,
    "timeout": 30000,
    "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  },
  "security": {
    "rate_limit": {
      "enabled": false
    }
  },
  "logging": {
    "level": "info",
    "file": "logs/http-api.log",
    "max_file_size": "10MB",
    "max_files": 5
  },
  "features": {
    "screenshots": {
      "enabled": true,
      "max_width": 1920,
      "max_height": 1080,
      "quality": 80,
      "formats": ["png", "jpeg"]
    },
    "bookmarks": {
      "enabled": true
    },
    "credentials": {
      "enabled": true,
      "encryption": true
    }
  }
}
```

### MCP服务配置 `mcp-config.json`
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
    },
    "web_click_element": {
      "enabled": true,
      "description": "Click on web page elements",
      "category": "interaction"
    },
    "web_input_text": {
      "enabled": true,
      "description": "Input text into form fields",
      "category": "interaction"
    },
    "web_screenshot": {
      "enabled": true,
      "description": "Take screenshots of web pages",
      "category": "capture"
    },
    "web_manage_bookmarks": {
      "enabled": true,
      "description": "Manage website bookmarks",
      "category": "data"
    },
    "web_manage_credentials": {
      "enabled": true,
      "description": "Manage website credentials",
      "category": "data"
    }
  },
  "http": {
    "port": 29528,
    "host": "0.0.0.0",
    "cors": {
      "enabled": true,
      "origin": "*"
    }
  },
  "logging": {
    "level": "info",
    "file": "logs/mcp-http.log",
    "format": "json"
  },
  "ai_clients": {
    "claude_desktop": {
      "local": {
        "command": "node",
        "args": ["src/mcp-server.js"]
      },
      "remote": {
        "command": "ssh",
        "args": ["server", "node /path/to/mcp-web-automation/src/mcp-server.js"]
      }
    },
    "http_mcp": {
      "url": "http://server:29528/mcp",
      "type": "sse"
    }
  }
}
```

### Docker Compose配置 `docker-compose.yml`
```yaml
services:
  mcp-web-automation:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mcp-web-automation
    ports:
      - "29527:29527"  # HTTP API
      - "29528:29528"  # MCP HTTP
    volumes:
      - ./config:/app/config:ro
      - ./mcp-config.json:/app/mcp-config.json:ro
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - TZ=Asia/Shanghai
      - HTTP_API_PORT=29527
      - MCP_HTTP_PORT=29528
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

---

## 📋 **配置修改指南**

### 🔧 常见配置修改

#### 1. 修改端口号
```bash
# HTTP API端口 (config/config.json)
"server": { "port": 29527 }

# MCP HTTP端口 (mcp-config.json)  
"http": { "port": 29528 }

# 混合脚本端口 (start-hybrid.sh)
HTTP_API_PORT=29527
MCP_HTTP_PORT=29528

# Docker端口映射 (docker-compose.yml)
ports:
  - "29527:29527"
  - "29528:29528"
```

#### 2. 启用/禁用功能
```bash
# 禁用截图功能
"features": { "screenshots": { "enabled": false } }

# 禁用特定MCP工具
"tools": { "web_screenshot": { "enabled": false } }

# 修改日志级别
"logging": { "level": "debug" }
```

#### 3. 性能优化配置
```bash
# 增加内存限制
"deploy": { "resources": { "limits": { "memory": "2G" } } }

# 调整浏览器超时
"browser": { "timeout": 60000 }

# 优化截图质量
"features": { "screenshots": { "quality": 60 } }
```

### ⚠️ **配置注意事项**

1. **端口冲突检查**: 确保29527和29528端口未被占用
2. **内存设置**: 混合部署建议至少1GB内存
3. **文件权限**: 确保日志目录具有写权限
4. **网络访问**: 确保AI客户端能访问到配置的端口
5. **配置同步**: 修改配置后需要重启相应服务

### 🔄 **配置重载**
```bash
# 重载HTTP API配置
./start-hybrid.sh restart

# 重载MCP配置  
pkill -f "mcp-server\|mcp-remote-server" && ./start-hybrid.sh start

# 重载Docker配置
docker-compose down && docker-compose up -d
```

---

*最后更新 Last Updated: 2025-08-12 | 混合部署版 Hybrid Deployment Version*
