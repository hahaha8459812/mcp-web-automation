# ⚙️ MCP Web Automation Tool 配置指南

> 完整的功能配置清单和参数说明

## 📋 配置文件总览

本工具提供了丰富的配置选项，支持灵活的自定义设置。所有配置分为以下几个层次：

- 🔧 **主配置文件**：`config/config.json`
- 🌍 **环境变量**：Docker 和系统环境
- 🐳 **容器配置**：`docker-compose.yml`
- 🚀 **启动参数**：浏览器引擎配置

---

## 1️⃣ **主配置文件** `config/config.json`

### 🔐 安全配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `api_key` | `mcp-demo-key-change-me-in-production` | API访问密钥 | ⭐⭐⭐ |
| `security.max_concurrent_clients` | `2` | 最大并发客户端数 | ⭐⭐ |
| `security.rate_limit.enabled` | `true` | 是否启用频率限制 | ⭐⭐ |
| `security.rate_limit.max_requests_per_minute` | `60` | 每分钟最大请求数 | ⭐⭐ |

### 🌐 服务器配置
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `server.port` | `29527` | 监听端口 | ⭐⭐⭐ |
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
| `logging.file` | `logs/mcp-web-automation.log` | 日志文件路径 | ⭐ |
| `logging.max_file_size` | `10MB` | 单个日志文件最大大小 | ⭐ |
| `logging.max_files` | `5` | 保留日志文件数量 | ⭐ |

### ✨ 功能开关
| 配置项 | 默认值 | 说明 | 重要性 |
|--------|--------|------|---------|
| `features.screenshots.enabled` | `true` | 截图功能开关 | ⭐⭐ |
| `features.screenshots.max_width` | `1920` | 截图最大宽度 | ⭐ |
| `features.screenshots.max_height` | `1080` | 截图最大高度 | ⭐ |
| `features.screenshots.quality` | `80` | 截图质量(0-100) | ⭐ |
| `features.bookmarks.enabled` | `true` | 收藏夹功能开关 | ⭐⭐ |
| `features.bookmarks.max_per_website` | `100` | 每个网站最大收藏数 | ⭐ |
| `features.credentials.enabled` | `true` | 密码管理功能开关 | ⭐⭐ |
| `features.credentials.encryption` | `true` | 密码加密(当前为明文) | ⭐ |

---

## 2️⃣ **环境变量配置**

### 🌍 Docker 环境变量
| 变量名 | 默认值 | 说明 | 配置位置 |
|--------|--------|------|---------|
| `NODE_ENV` | `production` | 运行环境 | `docker-compose.yml` |
| `TZ` | `Asia/Shanghai` | 时区设置 | `docker-compose.yml` |
| `LOG_LEVEL` | `info` | 日志级别 | 环境变量 |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium-browser` | Chrome可执行文件路径 | `Dockerfile` |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | `true` | 跳过Chromium下载 | `Dockerfile` |

---

## 3️⃣ **Docker 配置** `docker-compose.yml`

### 🐳 容器资源配置
| 配置项 | 默认值 | 说明 | 修改建议 |
|--------|--------|------|---------|
| `ports` | `29527:29527` | 端口映射 | 可改为其他端口 |
| `restart` | `unless-stopped` | 重启策略 | 建议保持 |
| `deploy.resources.limits.memory` | `512M` | 内存限制 | 可根据服务器调整 |
| `deploy.resources.limits.cpus` | `1.0` | CPU限制 | 可根据服务器调整 |
| `deploy.resources.reservations.memory` | `256M` | 内存预留 | 建议至少256M |
| `deploy.resources.reservations.cpus` | `0.5` | CPU预留 | 建议至少0.5 |

### 📂 数据卷挂载
| 配置项 | 说明 | 权限 |
|--------|------|------|
| `./config:/app/config:ro` | 配置文件(只读) | 只读 |
| `./data:/app/data` | 用户数据(读写) | 读写 |
| `./logs:/app/logs` | 日志文件(读写) | 读写 |

---

## 4️⃣ **浏览器启动参数** `src/browser/manager.js`

### 🚀 Puppeteer 启动配置
| 参数 | 状态 | 说明 | 修改建议 |
|------|------|------|---------|
| `--no-sandbox` | 启用 | 禁用沙盒模式 | ❌ 不建议修改 |
| `--disable-setuid-sandbox` | 启用 | 禁用setuid沙盒 | ❌ 不建议修改 |
| `--disable-dev-shm-usage` | 启用 | 减少共享内存使用 | ⚠️ 低内存必需 |
| `--disable-gpu` | 启用 | 禁用GPU | ✅ 可根据需要启用 |
| `--disable-images` | 注释 | 禁用图片加载 | ✅ 节省带宽可启用 |
| `--single-process` | 启用 | 单进程模式 | ⚠️ 低内存建议保持 |
| `--max-old-space-size=256` | `256MB` | V8内存限制 | ✅ 可调整 |

---

## 5️⃣ **API 功能配置**

### 🌐 功能开关控制
| 功能 | 默认状态 | 控制位置 | 说明 |
|------|---------|---------|------|
| 内容提取 | ✅ 启用 | 代码固定 | 支持text/html/value等类型 |
| 元素交互 | ✅ 启用 | 代码固定 | 点击、输入、选择操作 |
| 页面导航 | ✅ 启用 | 代码固定 | URL跳转、刷新等 |
| 页面截图 | 🔧 可配置 | `features.screenshots` | 可通过配置文件禁用 |
| 收藏夹管理 | 🔧 可配置 | `features.bookmarks` | 可通过配置文件禁用 |
| 密码管理 | 🔧 可配置 | `features.credentials` | 可通过配置文件禁用 |

---

## 6️⃣ **数据存储配置**

### 📁 数据文件结构
| 文件类型 | 路径 | 说明 | 可修改性 |
|---------|------|------|----------|
| 用户数据 | `data/user-data.json` | 收藏夹和密码数据 | ❌ 路径固定 |
| 配置文件 | `config/config.json` | 主配置文件 | ✅ 内容可修改 |
| 日志文件 | `logs/*.log` | 应用日志 | ✅ 路径可配置 |
| 备份文件 | `backups/` | 自动备份目录 | ❌ 脚本固定 |

---

## 🛠️ **常见配置修改**

### 🔧 修改监听端口
1. 编辑 `config/config.json`：
   ```json
   {
     "server": {
       "port": 8080,
       "host": "0.0.0.0"
     }
   }
