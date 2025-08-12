# 🔄 MCP Web Automation Tool - 改造为真正的MCP服务

> 将现有HTTP API服务改造成符合Model Context Protocol规范的AI工具服务

## 📋 **改造概述**

### 🎯 **目标**
将当前的HTTP REST API服务改造成真正的MCP（Model Context Protocol）服务，让AI客户端（如Claude Desktop、ChatGPT等）可以直接通过标准MCP协议调用网页自动化功能。

### 🔍 **现状分析**
**当前架构**：HTTP REST API服务
- ✅ 功能完整：导航、内容提取、截图、收藏夹、密码管理
- ✅ 性能良好：支持并发，响应快速
- ❌ 协议不符：使用HTTP而非MCP协议
- ❌ 集成复杂：AI客户端无法直接调用

**目标架构**：标准MCP服务
- ✅ 协议标准：符合MCP规范
- ✅ AI友好：支持Claude Desktop等客户端直接调用
- ✅ 功能保持：所有现有功能保持不变
- ✅ 部署简单：一键启动，自动注册工具

---

## 🚀 **改造方案**

### 方案1：双协议并存（推荐）
保持现有HTTP API的同时，新增MCP协议支持

**优势**：
- ✅ 向后兼容：现有HTTP API继续可用
- ✅ 渐进式迁移：可以逐步测试和优化
- ✅ 灵活性强：同时支持HTTP和MCP调用

### 方案2：完全替换
完全使用MCP协议替代HTTP API

**优势**：
- ✅ 架构统一：单一协议，维护简单
- ✅ 性能优化：专为AI交互优化
- ❌ 兼容性：可能影响现有集成

### 方案3：网关代理
使用MCP网关将现有HTTP API包装成MCP服务

**优势**：
- ✅ 零代码改动：无需修改现有服务
- ✅ 快速实现：使用现成工具
- ❌ 额外复杂性：增加网关层

---

## 🔧 **技术实现详解**

### 1️⃣ **MCP协议基础**

MCP使用stdio进行通信，消息格式为JSON-RPC 2.0：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

### 2️⃣ **必需的MCP方法**

#### **初始化方法**
- `initialize`: 服务器初始化
- `notifications/initialized`: 初始化完成通知

#### **工具管理方法**  
- `tools/list`: 列出所有可用工具
- `tools/call`: 调用指定工具

#### **可选方法**
- `resources/list`: 列出资源
- `prompts/list`: 列出提示模板

### 3️⃣ **工具定义规范**

每个现有API功能需要定义为MCP工具：

```json
{
  "name": "web_navigate",
  "description": "Navigate to a web page",
  "inputSchema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "The URL to navigate to"
      },
      "client_id": {
        "type": "string", 
        "description": "Client identifier",
        "default": "default"
      }
    },
    "required": ["url"]
  }
}
```

---

## 🛠️ **实现步骤**

### Step 1: 创建MCP服务器基础架构
```javascript
// src/mcp-server.js
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

class MCPWebAutomationServer {
    constructor() {
        this.server = new Server(
            {
                name: "web-automation",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );
        
        this.setupToolHandlers();
    }
}
```

### Step 2: 注册工具
```javascript
// 注册网页导航工具
this.server.setRequestHandler('tools/list', async () => {
    return {
        tools: [
            {
                name: "web_navigate",
                description: "Navigate to a web page and return page information",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string", description: "URL to navigate to" },
                        client_id: { type: "string", description: "Client ID", default: "default" }
                    },
                    required: ["url"]
                }
            },
            {
                name: "web_extract_content", 
                description: "Extract content from current page",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: { type: "string", description: "CSS selector", default: "body" },
                        type: { type: "string", enum: ["text", "html"], default: "text" },
                        client_id: { type: "string", description: "Client ID", default: "default" }
                    }
                }
            },
            {
                name: "web_screenshot",
                description: "Take a screenshot of current page", 
                inputSchema: {
                    type: "object",
                    properties: {
                        client_id: { type: "string", description: "Client ID", default: "default" },
                        fullPage: { type: "boolean", description: "Full page screenshot", default: true }
                    }
                }
            },
            // ... 其他工具
        ]
    };
});
```

### Step 3: 实现工具调用
```javascript
this.server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;
    
    switch (name) {
        case "web_navigate":
            return await this.handleNavigate(args);
        case "web_extract_content":
            return await this.handleExtractContent(args);
        case "web_screenshot":
            return await this.handleScreenshot(args);
        // ... 其他工具处理
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});
```

### Step 4: 复用现有业务逻辑
```javascript
async handleNavigate(args) {
    try {
        // 复用现有的 browserManager.navigate 方法
        const result = await this.browserManager.navigate(
            args.client_id || 'default',
            args.url,
            { wait_for_load: true }
        );
        
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully navigated to ${result.url}\nTitle: ${result.title}\nStatus: ${result.status}`
                }
            ]
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text", 
                    text: `Navigation failed: ${error.message}`
                }
            ],
            isError: true
        };
    }
}
```

---

## 📦 **新的项目结构**

```
mcp-web-automation/
├── src/
│   ├── index.js                 # 保持原有HTTP服务入口
│   ├── mcp-server.js           # 新增：MCP服务器入口
│   ├── mcp/
│   │   ├── server.js           # MCP服务器实现
│   │   ├── tools/              # MCP工具定义
│   │   │   ├── navigation.js   
│   │   │   ├── content.js
│   │   │   ├── screenshot.js
│   │   │   ├── bookmarks.js
│   │   │   └── credentials.js
│   │   └── handlers/           # MCP请求处理器
│   │       └── index.js
│   ├── browser/                # 保持原有浏览器管理
│   ├── data/                   # 保持原有数据管理
│   └── utils/                  # 保持原有工具
├── package.json                # 新增MCP SDK依赖
├── mcp-config.json            # MCP服务配置
└── start-mcp.sh               # MCP服务启动脚本
```

---

## 🎯 **MCP工具映射表**

| 现有HTTP API | MCP工具名称 | 功能描述 |
|-------------|------------|----------|
| `POST /api/navigate` | `web_navigate` | 页面导航 |
| `GET /api/content` | `web_extract_content` | 内容提取 |
| `POST /api/click` | `web_click_element` | 元素点击 |
| `POST /api/input` | `web_input_text` | 文本输入 |
| `GET /api/screenshot` | `web_screenshot` | 页面截图 |
| `POST /api/bookmarks` | `web_manage_bookmarks` | 收藏夹管理 |
| `POST /api/credentials` | `web_manage_credentials` | 密码管理 |

---

## 🚀 **快速实现 - 推荐步骤**

### 方案1实现（双协议并存）

1. **安装MCP SDK依赖**
```bash
npm install @modelcontextprotocol/sdk
```

2. **创建MCP服务器文件**
3. **添加工具注册和处理逻辑**  
4. **创建启动脚本**
5. **配置AI客户端连接**

### 预期效果
- ✅ HTTP API继续工作：`http://localhost:29527`
- ✅ MCP服务同时运行：通过stdio协议
- ✅ AI客户端可直接调用：Claude Desktop、ChatGPT等

---

## 🔗 **AI客户端配置示例**

### Claude Desktop配置
```json
{
  "mcpServers": {
    "web-automation": {
      "command": "node",
      "args": ["/path/to/mcp-web-automation/src/mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### ChatGPT配置
```json
{
  "tools": [
    {
      "type": "mcp",
      "mcp": {
        "server_path": "/path/to/mcp-web-automation/src/mcp-server.js",
        "name": "web-automation"
      }
    }
  ]
}
```

---

## 🎉 **改造完成后的优势**

1. **AI原生支持**：AI可以直接调用网页自动化功能
2. **标准化协议**：符合MCP规范，兼容性好
3. **功能完整**：保留所有现有功能
4. **性能优化**：专为AI交互优化的通信协议
5. **易于集成**：AI客户端一键配置即可使用

**您希望我立即开始实现哪个方案？推荐从方案1（双协议并存）开始！** 🚀