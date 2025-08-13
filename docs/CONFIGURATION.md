# ⚙️ MCP Web Automation Tool 配置指南

> 完整的MCP服务配置和参数说明

## 📋 配置概览

MCP Web Automation Tool 提供灵活的配置选项，支持两种连接模式：

- 💻 **MCP stdio**: 本地进程间通信
- 🔗 **MCP HTTP**: 远程网络连接

所有配置选项统一在 `mcp-config.json` 文件中管理。

---

## 📄 **主配置文件** `mcp-config.json`

### 基础结构
```json
{
  "_comment": "MCP Web Automation Tool 配置文件",
  "server": {
    "name": "web-automation",
    "version": "1.0.0",
    "description": "MCP Web自动化工具"
  },
  "http": {
    "port": 29528,
    "host": "0.0.0.0"
  },
  "browser": {
    "headless": true,
    "timeout": 30000,
    "user_agent": "Mozilla/5.0...",
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  },
  "capabilities": {
    "tools": 7,
    "resources": false,
    "prompts": false
  },
  "logging": {
    "level": "info",
    "file": "logs/mcp-web-automation.log",
    "max_file_size": "10MB",
    "max_files": 5
  },
  "features": {
    "screenshots": {
      "enabled": true,
      "max_width": 1920,
      "max_height": 1080,
      "quality": 80
    },
    "bookmarks": {
      "enabled": true,
      "max_per_website": 100
    },
    "credentials": {
      "enabled": true,
      "encryption": true
    }
  }
}
```

---

## 🛠️ **详细配置参数**

### 1. 服务器基础配置 `server`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | string | "web-automation" | MCP服务器名称 |
| `version` | string | "1.0.0" | 服务器版本 |
| `description` | string | "MCP Web自动化工具" | 服务器描述 |

### 2. HTTP传输配置 `http`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `port` | number | 29528 | HTTP服务端口 |
| `host` | string | "0.0.0.0" | 监听主机，0.0.0.0允许远程访问 |

**端口选择建议**：
- `29528`: 默认端口（推荐）
- 避免使用常用端口（80, 443, 3000等）
- 确保防火墙允许该端口

### 3. 浏览器引擎配置 `browser`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `headless` | boolean | true | 无头模式，true=无界面 |
| `timeout` | number | 30000 | 页面加载超时时间（毫秒） |
| `user_agent` | string | Chrome UA | 浏览器用户代理字符串 |
| `viewport.width` | number | 1920 | 视窗宽度 |
| `viewport.height` | number | 1080 | 视窗高度 |

**浏览器优化建议**：
```json
{
  "browser": {
    "headless": true,
    "timeout": 30000,
    "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  }
}
```

### 4. MCP能力配置 `capabilities`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tools` | number | 7 | 支持的MCP工具数量 |
| `resources` | boolean | false | 是否支持资源访问 |
| `prompts` | boolean | false | 是否支持提示模板 |

### 5. 日志配置 `logging`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `level` | string | "info" | 日志级别：error, warn, info, debug |
| `file` | string | "logs/mcp-web-automation.log" | 日志文件路径 |
| `max_file_size` | string | "10MB" | 单个日志文件最大大小 |
| `max_files` | number | 5 | 保留的日志文件数量 |

**日志级别说明**：
- `error`: 仅错误信息
- `warn`: 警告和错误
- `info`: 常规信息（推荐生产环境）
- `debug`: 详细调试信息（开发环境）

### 6. 功能特性配置 `features`

#### 截图功能 `screenshots`
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | true | 启用截图功能 |
| `max_width` | number | 1920 | 截图最大宽度 |
| `max_height` | number | 1080 | 截图最大高度 |
| `quality` | number | 80 | JPEG质量（1-100） |

#### 书签管理 `bookmarks`
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | true | 启用书签功能 |
| `max_per_website` | number | 100 | 每个网站最大书签数 |

#### 凭据管理 `credentials`
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | true | 启用凭据管理 |
| `encryption` | boolean | true | 启用密码加密存储 |

---

## 🌍 **环境变量配置**

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `NODE_ENV` | "production" | Node.js运行环境 |
| `MCP_CONFIG_PATH` | "./mcp-config.json" | 配置文件路径 |
| `LOG_LEVEL` | "info" | 覆盖配置文件中的日志级别 |
| `HTTP_PORT` | 29528 | 覆盖HTTP端口 |
| `PUPPETEER_EXECUTABLE_PATH` | - | 自定义Chrome可执行文件路径 |

**使用示例**：
```bash
# 开发模式启动
NODE_ENV=development LOG_LEVEL=debug ./start-mcp.sh http

# 自定义端口
HTTP_PORT=30000 ./start-mcp.sh http

# 自定义Chrome路径
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium ./start-mcp.sh stdio
```

---

## 🔧 **高级配置选项**

### 1. 性能优化配置
```json
{
  "browser": {
    "headless": true,
    "timeout": 30000,
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox", 
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding"
    ],
    "pool_size": 1,
    "max_pages": 10
  }
}
```

### 2. 安全配置
```json
{
  "security": {
    "allowed_domains": ["*"],
    "blocked_domains": ["malware.com"],
    "max_redirect_count": 5,
    "user_data_encryption": true
  }
}
```

### 3. 网络配置
```json
{
  "network": {
    "proxy": null,
    "timeout": 30000,
    "retry_attempts": 3,
    "user_agent_rotation": false
  }
}
```

---

## 📁 **配置文件位置**

### 标准配置路径
```
mcp-web-automation-tool/
├── mcp-config.json              # 主配置文件
├── mcp-config.example.json      # 配置模板
├── data/
│   └── user-data.json           # 用户数据（书签、凭据）
└── logs/
    ├── mcp-http.log             # HTTP服务日志
    └── mcp-http.pid             # HTTP服务进程ID
```

### 配置文件优先级
1. 环境变量（最高优先级）
2. `mcp-config.json`
3. 代码中的默认值（最低优先级）

---

## 🛠️ **配置验证和测试**

### 1. 验证配置文件语法
```bash
# 验证JSON格式
jq . mcp-config.json

# 检查配置完整性
node -e "console.log(JSON.parse(require('fs').readFileSync('mcp-config.json', 'utf8')))"
```

### 2. 测试配置生效
```bash
# 启动服务并测试
./start-mcp.sh http
curl http://localhost:29528/health

# 查看实际使用的配置
./start-mcp.sh logs | grep "配置" | tail -5
```

### 3. 配置调试
```bash
# 开启详细日志查看配置加载过程
LOG_LEVEL=debug ./start-mcp.sh http
```

---

## 🎯 **常用配置场景**

### 1. 开发环境配置
```json
{
  "browser": {
    "headless": false,
    "timeout": 60000
  },
  "logging": {
    "level": "debug"
  },
  "features": {
    "screenshots": {
      "quality": 100
    }
  }
}
```

### 2. 生产环境配置
```json
{
  "browser": {
    "headless": true,
    "timeout": 30000
  },
  "logging": {
    "level": "info",
    "max_file_size": "50MB",
    "max_files": 10
  },
  "http": {
    "host": "0.0.0.0",
    "port": 29528
  }
}
```

### 3. 高性能配置
```json
{
  "browser": {
    "headless": true,
    "timeout": 15000,
    "args": [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-background-timer-throttling"
    ]
  },
  "logging": {
    "level": "warn"
  }
}
```

### 4. 受限环境配置
```json
{
  "browser": {
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process"
    ]
  },
  "features": {
    "screenshots": {
      "max_width": 1280,
      "max_height": 720,
      "quality": 70
    }
  }
}
```

---

## 🚨 **常见配置问题**

### 1. 端口冲突
**问题**: 端口29528被占用
**解决**: 
```json
{
  "http": {
    "port": 30000
  }
}
```

### 2. Chrome启动失败
**问题**: 在Docker或受限环境中Chrome无法启动
**解决**:
```json
{
  "browser": {
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  }
}
```

### 3. 内存不足
**问题**: 服务器内存不足
**解决**:
```json
{
  "browser": {
    "args": [
      "--memory-pressure-off",
      "--max_old_space_size=1024"
    ]
  },
  "logging": {
    "level": "warn"
  }
}
```

### 4. 网络超时
**问题**: 页面加载超时
**解决**:
```json
{
  "browser": {
    "timeout": 60000
  }
}
```

---

## 📊 **配置监控**

### 查看当前配置
```bash
# 查看完整配置
cat mcp-config.json | jq .

# 查看特定配置项
cat mcp-config.json | jq .browser

# 查看日志配置
cat mcp-config.json | jq .logging
```

### 配置修改后重启
```bash
# 修改配置后重启HTTP服务
./start-mcp.sh restart

# 验证新配置生效
curl http://localhost:29528/health
```

---

## 💡 **最佳实践**

1. **备份配置**: 修改前备份 `mcp-config.json`
2. **分环境配置**: 开发、测试、生产使用不同配置
3. **日志管理**: 定期清理日志文件，避免磁盘占满
4. **性能监控**: 监控内存和CPU使用情况
5. **安全考虑**: 生产环境不要使用debug日志级别
6. **版本控制**: 将配置文件纳入版本控制（注意排除敏感信息）

---

**📝 配置修改后请重启服务以使更改生效：`./start-mcp.sh restart`**
