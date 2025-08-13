# MCP Web Automation Tool - 项目介绍文档

## 🎯 项目概述

MCP Web Automation Tool 是一个专为AI助手设计的Web自动化工具，完全符合Model Context Protocol (MCP)规范。该工具为AI客户端提供强大的网页操作能力，包括导航、内容提取、元素交互、截图等功能。

### 核心特性
- **标准MCP协议**：完全符合MCP规范，确保与所有MCP兼容的AI客户端无缝集成
- **双重连接模式**：支持stdio（本地）和HTTP/SSE（远程）两种连接方式
- **智能Web自动化**：提供7个核心MCP工具，覆盖所有常见Web操作需求
- **高级选择器引擎**：智能降级、编码处理、动态等待机制
- **数据管理能力**：内置书签和凭据管理系统

## 🏗️ 技术架构

### 架构设计图
```
┌─────────────────────────────────────────────────────────────┐
│                    AI客户端生态系统                          │
├─────────────────┬───────────────────────┬───────────────────┤
│  Claude Desktop │     远程AI服务         │   Cursor IDE      │
│  (本地stdio)    │   (HTTP/SSE连接)      │  (本地stdio)      │
└─────────────────┴───────────────────────┴───────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────┐
│             MCP Web Automation Tool                      │
├─────────────────────────────┼─────────────────────────────┤
│  ┌─────────────────┐       │       ┌─────────────────┐   │
│  │  MCP Stdio      │       │       │  MCP HTTP       │   │
│  │  服务器         │       │       │  服务器         │   │
│  │  (本地连接)     │       │       │  (远程连接)     │   │
│  └─────────────────┘       │       └─────────────────┘   │
│            │                │                │           │
│            └────────────────┼────────────────┘           │
│                             │                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              MCP工具管理器                         │ │
│  │  ┌─────────────────┬─────────────────┬─────────────┐ │ │
│  │  │  web_navigate   │ web_extract_    │ web_click_  │ │ │
│  │  │                 │ content         │ element     │ │ │
│  │  ├─────────────────┼─────────────────┼─────────────┤ │ │
│  │  │ web_input_text  │ web_screenshot  │ web_manage_ │ │ │
│  │  │                 │                 │ bookmarks   │ │ │
│  │  ├─────────────────┴─────────────────┼─────────────┤ │ │
│  │  │           web_manage_credentials   │             │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
│                             │                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              核心服务管理器                         │ │
│  │  ┌─────────────────┬─────────────────┬─────────────┐ │ │
│  │  │  浏览器管理器   │   书签管理器    │ 凭据管理器  │ │ │
│  │  │  - Chrome控制   │   - 分类存储    │ - 加密存储  │ │ │
│  │  │  - 会话管理     │   - 增删改查    │ - 自动检索  │ │ │
│  │  │  - 资源优化     │   - 统计分析    │ - 安全管理  │ │ │
│  │  └─────────────────┴─────────────────┴─────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────┐
│                     目标网站生态                         │
├─────────────────────────────┼─────────────────────────────┤
│  Google │ Bilibili │ GitHub │ Stack Overflow │ 任意网站  │
└─────────────────────────────┼─────────────────────────────┘
```

### 技术栈

#### 后端技术
- **Node.js 18+**：现代JavaScript运行环境
- **@modelcontextprotocol/sdk**：官方MCP SDK
- **Express.js**：HTTP服务器框架（用于MCP HTTP传输）
- **Puppeteer**：Chrome自动化引擎
- **Zod**：TypeScript优先的模式验证库

#### 协议和传输
- **MCP (Model Context Protocol)**：AI助手工具集成标准
- **stdio Transport**：本地进程间通信
- **HTTP/SSE Transport**：远程网络通信
- **JSON-RPC 2.0**：MCP底层通信协议

#### 数据存储
- **JSON文件存储**：轻量级数据持久化
- **内存缓存**：会话状态管理
- **加密存储**：敏感凭据保护

## 🛠️ 核心功能模块

### 1. MCP服务器引擎
- **双模式支持**：stdio和HTTP/SSE传输
- **工具注册系统**：动态MCP工具管理
- **模式验证**：基于Zod的输入验证
- **错误处理**：统一异常处理机制

### 2. Web自动化引擎
- **浏览器生命周期管理**：Chrome实例创建、复用、清理
- **多会话支持**：并发客户端的独立会话管理
- **智能选择器系统**：编码处理、降级策略、动态等待
- **高级内容提取**：文本、HTML、属性、计算样式

### 3. 数据管理系统
- **书签管理**：分层存储（网站→页面），支持完整CRUD操作
- **凭据管理**：加密存储，自动检索，安全管理
- **会话状态**：浏览器实例、页面状态、用户上下文

### 4. 增强功能特性
- **动态内容等待**：检测加载指示器，等待异步内容
- **多格式截图**：PNG/JPEG格式，全页面/视窗截图
- **错误恢复**：自动重试、降级处理、详细诊断
- **性能优化**：资源复用、智能缓存、并发控制

## 🎭 MCP工具详解

### 1. web_navigate - 网页导航
```typescript
interface NavigateInput {
  url: string;                    // 目标URL
  client_id?: string;             // 会话标识符
  wait_for_load?: boolean;        // 是否等待页面加载完成
}
```

**功能特性**：
- 支持任意HTTP/HTTPS网站
- 智能加载检测
- 错误状态处理
- 会话隔离

### 2. web_extract_content - 内容提取
```typescript
interface ExtractInput {
  client_id?: string;             // 会话标识符
  selector?: string;              // CSS选择器
  type?: 'text' | 'html' | 'attribute' | 'computed';
  timeout?: number;               // 超时时间
  waitForContent?: boolean;       // 等待动态内容
  retryAttempts?: number;         // 重试次数
  minLength?: number;             // 最小内容长度
  fallbackSelectors?: string[];   // 备选选择器
}
```

**增强特性**：
- 智能选择器降级
- URL编码自动处理
- 动态内容等待
- 多重备选策略

### 3. web_click_element - 元素点击
```typescript
interface ClickInput {
  client_id?: string;             // 会话标识符
  selector: string;               // 目标元素选择器
  wait_for_navigation?: boolean;  // 等待页面导航
}
```

### 4. web_input_text - 文本输入
```typescript
interface InputInput {
  client_id?: string;             // 会话标识符
  selector: string;               // 输入字段选择器
  text: string;                   // 输入文本
  clear?: boolean;                // 清空字段
}
```

### 5. web_screenshot - 截图
```typescript
interface ScreenshotInput {
  client_id?: string;             // 会话标识符
  fullPage?: boolean;             // 全页面截图
  format?: 'png' | 'jpeg';        // 图片格式
}
```

### 6. web_manage_bookmarks - 书签管理
```typescript
interface BookmarkInput {
  action: 'add' | 'list' | 'delete' | 'update';
  website?: string;               // 网站域名
  url?: string;                   // 书签URL
  title?: string;                 // 书签标题
  bookmark_id?: string;           // 书签ID
}
```

### 7. web_manage_credentials - 凭据管理
```typescript
interface CredentialInput {
  action: 'save' | 'get' | 'list' | 'delete';
  website?: string;               // 网站域名
  username?: string;              // 用户名
  password?: string;              // 密码
}
```

## 📊 系统特性

### 性能特性
- **低内存占用**：运行时约200MB，空闲时76MB
- **快速响应**：毫秒级MCP工具响应
- **高并发**：支持无限制并发客户端
- **资源优化**：智能浏览器实例复用

### 安全特性
- **会话隔离**：每个client_id独立的浏览器上下文
- **数据加密**：敏感凭据AES加密存储
- **无状态设计**：MCP工具间无依赖关系
- **错误边界**：完善的异常处理和恢复机制

### 可扩展性
- **模块化设计**：清晰的功能边界和接口定义
- **插件架构**：支持自定义MCP工具扩展
- **配置驱动**：丰富的配置选项和运行时调整
- **标准协议**：基于MCP标准，确保兼容性

## 🗂️ 项目结构详解

```
mcp-web-automation-tool/
├── src/                          # 源代码目录
│   ├── mcp-server.js            # MCP stdio服务器入口
│   ├── mcp-remote-server.js     # MCP HTTP服务器入口
│   ├── browser/                 # 浏览器管理模块
│   │   └── manager.js           # 浏览器生命周期和会话管理
│   ├── data/                    # 数据管理模块
│   │   ├── bookmarks.js         # 书签管理系统
│   │   └── credentials.js       # 凭据管理系统
│   └── utils/                   # 工具模块
│       └── logger.js            # 日志记录工具
├── docs/                        # 文档目录
│   ├── COMMANDS-指令速查.md      # 命令速查表
│   ├── CONFIGURATION.md         # 配置指南
│   ├── TROUBLESHOOTING.md       # 故障排除
│   └── 意义不明的部署教程.md     # 部署教程
├── data/                        # 数据存储目录
│   ├── user-data.json           # 用户数据文件
│   └── .gitkeep                 # 目录占位文件
├── logs/                        # 日志存储目录
├── mcp-config.json              # MCP服务器配置
├── start-mcp.sh                 # 服务启动脚本
├── package.json                 # Node.js项目配置
└── README.md                    # 项目说明文档
```

### 关键文件说明

#### 服务器文件
- **`src/mcp-server.js`**：stdio传输的MCP服务器，适用于本地AI客户端
- **`src/mcp-remote-server.js`**：HTTP/SSE传输的MCP服务器，支持远程访问

#### 核心模块
- **`src/browser/manager.js`**：浏览器实例管理、会话控制、页面操作
- **`src/data/bookmarks.js`**：书签的CRUD操作、分类管理、数据持久化
- **`src/data/credentials.js`**：凭据的加密存储、检索、管理

#### 配置和脚本
- **`mcp-config.json`**：MCP服务器运行配置
- **`start-mcp.sh`**：统一的服务管理脚本

## 🔄 工作流程

### MCP工具调用流程
```
1. AI客户端 → MCP协议请求
2. MCP服务器 → 工具路由和验证
3. 工具管理器 → 参数解析和处理
4. 核心服务 → 实际Web操作
5. 结果处理 → 格式化和返回
6. MCP服务器 → 标准MCP响应
7. AI客户端 → 接收处理结果
```

### 浏览器会话管理
```
1. 客户端请求 → 会话检查
2. 会话管理器 → 实例创建/复用
3. 页面操作 → 目标网站交互
4. 状态维护 → 会话数据更新
5. 资源清理 → 超时和无效会话清理
```

## 🎯 使用场景

### AI助手增强
- **信息收集**：从网站提取最新信息
- **自动化任务**：执行重复性Web操作
- **内容整理**：批量收集和整理网页内容
- **截图记录**：记录网页状态和变化

### 开发和测试
- **Web自动化测试**：作为测试工具的后端引擎
- **内容监控**：定期检查网站内容变化
- **数据爬取**：结构化数据提取和处理
- **UI测试**：用户界面自动化测试

### 个人助理功能
- **书签管理**：智能网站收藏和分类
- **密码管理**：安全的登录凭据存储
- **信息提取**：从复杂页面提取关键信息
- **多账号管理**：不同网站的会话隔离

---

**MCP Web Automation Tool** 为AI助手提供了一个强大、灵活、标准化的Web操作能力，通过符合MCP规范的设计确保了与各种AI客户端的无缝集成。
