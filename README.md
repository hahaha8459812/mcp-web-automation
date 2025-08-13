# MCP Web Automation Tool

一个符合Model Context Protocol (MCP)规范的Web自动化工具，为AI助手提供强大的网页操作能力。

## ✨ 特性

- 🤖 **标准MCP协议** - 完全符合MCP规范，可与任何MCP兼容的AI客户端集成
- 🌐 **强大的Web自动化** - 网页导航、内容提取、元素交互、截图等
- 📱 **多种连接方式** - 支持stdio和HTTP/SSE传输
- 🔧 **智能选择器** - 自动降级、编码处理、动态等待
- 💾 **数据管理** - 书签和凭据管理
- 🚀 **高性能** - 优化的浏览器管理和资源复用

## 🛠️ 核心工具

| 工具名称 | 功能描述 |
|---------|---------|
| `web_navigate` | 导航到指定网页 |
| `web_extract_content` | 提取网页内容（文本/HTML/属性/样式） |
| `web_click_element` | 点击网页元素 |
| `web_input_text` | 输入文本到表单字段 |
| `web_screenshot` | 截取网页截图 |
| `web_manage_bookmarks` | 管理网站书签 |
| `web_manage_credentials` | 管理登录凭据 |

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动MCP服务器

**Stdio模式（推荐）**：
```bash
./start-mcp.sh stdio
```

**HTTP模式（远程访问）**：
```bash
./start-mcp.sh http
```

### 3. 配置AI客户端

#### Claude Desktop
在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "web-automation": {
      "command": "node",
      "args": ["src/mcp-server.js"],
      "cwd": "/path/to/mcp-web-automation-tool"
    }
  }
}
```

#### 远程连接
```json
{
  "mcpServers": {
    "web-automation": {
      "url": "http://your-server:29528/mcp"
    }
  }
}
```

## 📖 使用示例

### 基础导航和内容提取
```json
{
  "name": "web_navigate",
  "arguments": {
    "url": "https://example.com",
    "client_id": "session1"
  }
}
```

```json
{
  "name": "web_extract_content",
  "arguments": {
    "client_id": "session1",
    "selector": ".content",
    "type": "text"
  }
}
```

### 高级选择器功能
```json
{
  "name": "web_extract_content",
  "arguments": {
    "client_id": "session1",
    "selector": ".comments",
    "type": "text",
    "timeout": 10000,
    "retryAttempts": 5,
    "waitForContent": true,
    "fallbackSelectors": [".reply-list", ".discussion", "main"]
  }
}
```

### 元素交互
```json
{
  "name": "web_click_element",
  "arguments": {
    "client_id": "session1",
    "selector": "button.submit",
    "wait_for_navigation": true
  }
}
```

```json
{
  "name": "web_input_text",
  "arguments": {
    "client_id": "session1",
    "selector": "input[name='query']",
    "text": "搜索内容",
    "clear": true
  }
}
```

### 截图
```json
{
  "name": "web_screenshot",
  "arguments": {
    "client_id": "session1",
    "fullPage": true,
    "format": "png"
  }
}
```

## ⚙️ 配置

复制并编辑配置文件：
```bash
cp mcp-config.example.json mcp-config.json
```

主要配置项：
- `http.port`: HTTP服务端口（默认29528）
- `browser.headless`: 是否无头模式
- `browser.timeout`: 页面加载超时时间
- `logging.level`: 日志级别

## 🔧 管理命令

```bash
# 查看服务状态
./start-mcp.sh status

# 查看日志
./start-mcp.sh logs

# 测试服务
./start-mcp.sh test

# 停止服务
./start-mcp.sh stop

# 重启HTTP服务
./start-mcp.sh restart
```

## 📁 项目结构

```
mcp-web-automation-tool/
├── src/
│   ├── mcp-server.js              # MCP stdio服务器
│   ├── mcp-remote-server.js       # MCP HTTP服务器
│   ├── browser/
│   │   └── manager.js             # 浏览器管理
│   ├── data/
│   │   ├── bookmarks.js           # 书签管理
│   │   └── credentials.js         # 凭据管理
│   └── utils/
│       └── logger.js              # 日志工具
├── docs/                          # 文档目录
├── data/                          # 数据存储
├── logs/                          # 日志文件
├── mcp-config.json               # MCP配置文件
├── start-mcp.sh                  # 启动脚本
└── package.json                  # 项目依赖
```

## 🧪 高级功能

### 智能选择器优化
- **自动URL解码** - 处理编码的CSS选择器
- **降级策略** - 选择器失效时自动尝试备选方案
- **动态等待** - 智能等待异步内容加载
- **内容验证** - 验证提取内容的有效性

### 多种内容类型
- `text` - 提取文本内容
- `html` - 提取HTML内容
- `attribute` - 提取元素属性
- `computed` - 提取计算样式

### 会话管理
支持多个并发会话，每个session独立管理：
- 浏览器实例
- 页面状态
- 用户数据

## 🐛 故障排除

### 常见问题

**Q: MCP服务器无法启动**
- 检查Node.js版本（需要18+）
- 确认端口29528未被占用
- 查看日志：`./start-mcp.sh logs`

**Q: AI客户端连接失败**
- 确认服务器正在运行：`./start-mcp.sh status`
- 检查配置文件路径
- 验证网络连接

**Q: 选择器无法找到元素**
- 使用更通用的选择器
- 启用动态等待：`waitForContent: true`
- 检查页面是否完全加载

### 调试技巧

1. **启用详细日志**：
   ```json
   {
     "logging": {
       "level": "debug"
     }
   }
   ```

2. **测试连接**：
   ```bash
   ./start-mcp.sh test
   ```

3. **查看元数据**：
   ```json
   {
     "name": "web_extract_content",
     "arguments": {
       "selector": ".content",
       "type": "text"
     }
   }
   ```
   返回的metadata包含提取方法、重试次数等调试信息。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**享受使用MCP Web Automation Tool为您的AI助手增强Web操作能力！** 🚀
