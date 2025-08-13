# 🤖 AI客户端配置指南

> MCP Web Automation Tool 的AI客户端配置完整指南

## 🎯 **连接方式概览**

MCP Web Automation Tool 支持两种连接方式：

1. **💻 MCP stdio** - 本地连接（推荐），适用于 Claude Desktop、Cursor IDE 等
2. **🔗 MCP HTTP** - 远程连接，适用于支持HTTP/SSE的MCP客户端

---

## 🚀 **服务器部署**

### 启动MCP服务
```bash
# 启动本地stdio服务（前台运行）
./start-mcp.sh stdio

# 启动远程HTTP服务（后台运行）
./start-mcp.sh http

# 查看服务状态
./start-mcp.sh status

# 查看日志
./start-mcp.sh logs
```

### 服务地址
- **MCP HTTP端点**: `http://your-server:29528/mcp`
- **健康检查**: `http://your-server:29528/health`

---

## 🔧 **AI客户端配置**

### 1️⃣ **Claude Desktop (本地连接)**

编辑 `~/.claude-desktop.json` 或 `~/claude_desktop_config.json`：

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

### 2️⃣ **Claude Desktop (远程连接)**

```json
{
  "mcpServers": {
    "web-automation-remote": {
      "url": "http://your-server:29528/mcp"
    }
  }
}
```

### 3️⃣ **Claude Desktop (通过SSH访问远程服务器)**

```json
{
  "mcpServers": {
    "web-automation-ssh": {
      "command": "ssh",
      "args": [
        "your-server", 
        "cd /path/to/mcp-web-automation-tool && node src/mcp-server.js"
      ]
    }
  }
}
```

### 4️⃣ **Cursor IDE**

在Cursor设置中添加MCP服务器：

```json
{
  "mcp": {
    "servers": [
      {
        "name": "web-automation",
        "command": "node",
        "args": ["/path/to/mcp-web-automation-tool/src/mcp-server.js"]
      }
    ]
  }
}
```

### 5️⃣ **支持HTTP MCP的通用客户端**

```json
{
  "mcpServers": {
    "web-automation": {
      "url": "http://your-server:29528/mcp",
      "type": "sse"
    }
  }
}
```

### 6️⃣ **其他MCP兼容工具**

通用配置格式：

```yaml
server_name: web-automation
protocol: stdio  # 或 http-sse
command: node /path/to/mcp-web-automation-tool/src/mcp-server.js
# 或远程连接
url: http://your-server:29528/mcp
```

---

## 🛠️ **MCP工具说明**

所有MCP客户端都可以使用以下7个工具：

### 1. **web_navigate** - 页面导航
```json
{
  "name": "web_navigate",
  "arguments": {
    "url": "https://example.com",
    "client_id": "session1",
    "wait_for_load": true
  }
}
```

### 2. **web_extract_content** - 内容提取
```json
{
  "name": "web_extract_content",
  "arguments": {
    "client_id": "session1",
    "selector": ".content",
    "type": "text",
    "timeout": 10000,
    "retryAttempts": 3,
    "waitForContent": true
  }
}
```

### 3. **web_click_element** - 元素点击
```json
{
  "name": "web_click_element",
  "arguments": {
    "client_id": "session1",
    "selector": "button.submit",
    "wait_for_navigation": false
  }
}
```

### 4. **web_input_text** - 文本输入
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

### 5. **web_screenshot** - 页面截图
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

### 6. **web_manage_bookmarks** - 书签管理
```json
{
  "name": "web_manage_bookmarks",
  "arguments": {
    "action": "add",
    "website": "example.com",
    "url": "https://example.com/page",
    "title": "示例页面"
  }
}
```

### 7. **web_manage_credentials** - 凭据管理
```json
{
  "name": "web_manage_credentials",
  "arguments": {
    "action": "save",
    "website": "example.com",
    "username": "user@example.com",
    "password": "password123"
  }
}
```

---

## 🧪 **测试和验证**

### 测试MCP连接
```bash
# 测试本地stdio服务
node src/mcp-server.js

# 测试远程HTTP服务
curl http://your-server:29528/health

# 测试服务状态
./start-mcp.sh test
```

### 验证工具可用性
在AI客户端中尝试以下命令：

```
请帮我访问Google首页并截图
请提取百度首页的标题
请在搜索框输入"人工智能"并点击搜索
```

---

## 🔧 **故障排查**

### 常见问题

1. **MCP连接失败**
   ```bash
   # 检查服务状态
   ./start-mcp.sh status
   
   # 查看日志
   ./start-mcp.sh logs
   
   # 重启服务
   ./start-mcp.sh restart
   ```

2. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :29528
   
   # 停止占用进程
   ./start-mcp.sh stop
   ```

3. **配置文件路径错误**
   - 确保 `cwd` 路径指向正确的项目目录
   - 确保 `src/mcp-server.js` 文件存在
   - 检查Node.js版本（需要18+）

4. **权限问题**
   ```bash
   # 确保脚本有执行权限
   chmod +x start-mcp.sh
   ```

### 日志文件位置
- MCP HTTP日志：`logs/mcp-http.log`
- 进程ID文件：`logs/mcp-http.pid`

---

## 📋 **配置示例**

### 完整的Claude Desktop配置
```json
{
  "mcpServers": {
    "web-automation-local": {
      "command": "node",
      "args": ["src/mcp-server.js"],
      "cwd": "/home/user/mcp-web-automation-tool"
    },
    "web-automation-remote": {
      "url": "http://192.168.1.100:29528/mcp"
    }
  }
}
```

### Docker环境配置
如果在Docker中运行：

```json
{
  "mcpServers": {
    "web-automation-docker": {
      "command": "docker",
      "args": [
        "exec", 
        "mcp-web-automation", 
        "node", 
        "src/mcp-server.js"
      ]
    }
  }
}
```

---

## 🎉 **使用示例**

### AI助手对话示例

**用户**: 请帮我访问GitHub并搜索"mcp"相关的仓库

**AI**: 我来帮您访问GitHub并搜索MCP相关仓库。

**工具调用过程**:
1. `web_navigate` - 访问GitHub首页
2. `web_input_text` - 在搜索框输入"mcp"
3. `web_click_element` - 点击搜索按钮
4. `web_screenshot` - 截图保存结果

### 高级用法示例

**智能内容提取**:
```json
{
  "name": "web_extract_content",
  "arguments": {
    "selector": ".repo-list-item",
    "type": "text",
    "waitForContent": true,
    "retryAttempts": 5,
    "fallbackSelectors": [".repository", ".repo", "main"]
  }
}
```

---

## 📞 **技术支持**

如果遇到问题：

1. **查看日志**: `./start-mcp.sh logs`
2. **重启服务**: `./start-mcp.sh restart`  
3. **测试连接**: `./start-mcp.sh test`
4. **检查配置**: 确保路径和端口正确
5. **检查防火墙**: 确保29528端口可访问（远程连接）

### 性能优化建议

- 使用本地stdio连接获得最佳性能
- 为不同会话使用不同的`client_id`
- 启用智能等待和重试机制
- 定期清理无用的浏览器会话

---

**现在您可以在任何支持MCP的AI客户端中使用这个强大的网页自动化工具了！** 🚀