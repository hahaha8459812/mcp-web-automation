
### 🎯 项目概述

**MCP Web Automation Tool** 是一个基于 Model Context Protocol (MCP) 的轻量级网页自动化工具，专为 AI 助手提供强大的网页浏览和交互能力。该工具以 Docker 容器形式部署在服务器上，通过 HTTP API 为远程 AI 客户端提供网页自动化服务。

### 🏗️ 架构设计

```
┌─────────────────┐    HTTP API    ┌──────────────────┐    Puppeteer    ┌─────────────────┐
│   AI 客户端     │ ──────────────→ │  MCP 服务器      │ ──────────────→ │   Chrome 浏览器  │
│ (Claude/GPT等)  │                 │  (Docker容器)    │                 │   (Headless)    │
└─────────────────┘                 └──────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │   数据存储       │
                                    │ (JSON文件)       │
                                    └──────────────────┘
```

### 🔧 技术栈

- **后端框架**: Node.js + Express
- **浏览器引擎**: Puppeteer + Chrome Headless
- **容器化**: Docker + Docker Compose
- **数据存储**: JSON 文件 (便于备份和迁移)
- **认证机制**: API Key (Header: X-API-Key)
- **通信协议**: HTTP REST API

### 🌟 核心功能模块

#### 1. 🌐 网页导航模块 (`/api/navigate`)
- URL 跳转和页面加载
- 支持等待页面完全加载
- 返回页面标题、URL 和加载状态

#### 2. 📄 内容提取模块 (`/api/content`)
- HTML 内容提取
- 文本内容获取
- 元素属性读取
- 支持 CSS 选择器定位

#### 3. 🖱️ 页面交互模块
- **点击操作** (`/api/click`): 元素点击、链接跳转
- **文本输入** (`/api/input`): 表单填写、搜索框输入
- 支持等待导航完成

#### 4. 📸 截图功能 (`/api/screenshot`)
- 全页面截图
- 指定元素截图
- 多格式支持 (PNG/JPEG)
- 可配置质量参数

#### 5. 🔖 收藏夹管理 (`/api/bookmarks`)
- 分层收藏系统 (网站 → 网页)
- CRUD 操作 (增删改查)
- 搜索和统计功能
- 访问记录跟踪

#### 6. 🔐 密码管理 (`/api/credentials`)
- 网站登录凭证存储
- 用户名密码管理
- 自动登录支持
- 明文存储 (个人服务器安全)

### 📊 系统特性

#### 🎯 性能优化
- **轻量级设计**: 总内存占用约 300MB
- **资源限制**: Docker 内存限制 512MB，CPU 限制 1 核
- **浏览器优化**: 禁用 GPU、扩展，启用内存压力管理
- **并发控制**: 最大支持 2 个并发客户端

#### 🔒 安全特性
- API 密钥认证
- 频率限制保护
- 容器隔离运行
- 非 root 用户执行

#### 🔄 高可用性
- 健康检查机制
- 自动重启策略
- 优雅关闭处理
- 错误恢复机制

### 📂 项目结构详解

```
mcp-web-automation/
├── src/                          # 源代码目录
│   ├── index.js                 # 主入口 - 应用启动和环境检查
│   ├── server.js                # HTTP服务器 - Express路由和中间件
│   ├── browser/
│   │   └── manager.js           # 浏览器管理器 - Puppeteer封装
│   ├── data/
│   │   ├── bookmarks.js         # 收藏夹管理器 - JSON文件操作
│   │   └── credentials.js       # 密码管理器 - 凭证存储
│   └── utils/
│       ├── auth.js              # 认证工具 - API密钥验证
│       └── logger.js            # 日志工具 - 格式化日志输出
├── config/
│   ├── config.json              # 主配置文件
│   └── config.example.json      # 配置模板
├── data/
│   └── user-data.json           # 用户数据存储
├── scripts/
│   ├── install.sh               # 一键安装脚本
│   └── start.sh                 # 服务管理脚本
└── docs/                        # 项目文档
    ├── CONFIGURATION.md         # 完整配置指南
    └── COMMANDS-指令速查.md      # 常用命令参考
```

### 🔗 API 接口规范

#### 认证方式
```http
X-API-Key: your-api-key-here
```

#### 标准响应格式
```json
{
  "success": true,
  "message": "操作描述",
  "data": {
    // 具体数据
  }
}
```

#### 错误响应格式
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 🎯 使用场景

1. **AI 助手网页浏览**: 让 AI 能够访问和解析网页内容
2. **自动化表单填写**: 批量处理网页表单提交
3. **内容监控抓取**: 定期检查网页内容变化
4. **网站功能测试**: 自动化 Web 应用测试
5. **数据收集整理**: 结构化提取网页数据

### 🔧 开发和维护要点

#### 关键配置项
- `config/config.json`: 服务器端口、浏览器设置、功能开关
- `docker-compose.yml`: 资源限制、端口映射、卷挂载
- 环境变量: `NODE_ENV`, `LOG_LEVEL`, `TZ`

#### 重要文件路径
- 用户数据: `/app/data/user-data.json`
- 日志文件: `/app/logs/mcp-web-automation.log`
- 配置文件: `/app/config/config.json`

#### 常用维护命令
```bash
# 服务管理
./scripts/start.sh [start|stop|restart|status|logs]

# 数据备份
./scripts/start.sh backup

# 容器操作
docker-compose [up|down|build|logs]
```

### 🎨 扩展指南

#### 添加新功能
1. 在 `src/server.js` 中添加新的路由
2. 在对应模块中实现功能逻辑
3. 更新 API 文档
4. 添加错误处理和日志记录

#### 性能调优
1. 调整 `docker-compose.yml` 中的资源限制
2. 优化 `src/browser/manager.js` 中的浏览器参数
3. 配置 `config/config.json` 中的并发数和超时时间

#### 安全增强
1. 实现更复杂的认证机制
2. 添加 IP 白名单限制
3. 加密存储敏感数据
4. 添加审计日志

---

### 📝 开发注意事项

1. **内存管理**: 注意浏览器实例的创建和销毁，避免内存泄漏
2. **错误处理**: 所有异步操作都应包含 try-catch 错误处理
3. **日志记录**: 重要操作需要记录详细日志便于调试
4. **配置验证**: 启动时验证配置文件的完整性和有效性
5. **容器优化**: 保持 Docker 镜像精简，及时清理无用资源

这个文档应该能帮助 Cursor 的 AI 工作流更好地理解项目结构和设计理念。
