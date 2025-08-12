# 🤖 AI客户端配置指南 - 混合部署版

> 支持本地和远程AI客户端无限制访问MCP Web Automation服务

## 🎯 **部署架构概览**

我们提供了三种访问方式：

1. **🌐 HTTP API** (端口 29527) - 传统REST API，无需认证
2. **🔗 MCP HTTP** (端口 29528) - 远程MCP服务，通过HTTP/SSE访问
3. **💻 MCP stdio** - 本地MCP服务，通过标准输入输出

---

## 🚀 **服务器部署**

### 一键启动混合服务
```bash
# 启动所有服务
chmod +x start-hybrid.sh
./start-hybrid.sh start

# 查看服务状态
./start-hybrid.sh status

# 查看日志
./start-hybrid.sh logs
```

### 服务器地址
- **HTTP API**: `http://your-server:29527`
- **MCP HTTP**: `http://your-server:29528/mcp`
- **健康检查**: `http://your-server:29527/health`

---

## 🔧 **AI客户端配置**

### 1️⃣ **Claude Desktop (本地MCP)**

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

### 2️⃣ **Claude Desktop (远程MCP via SSH)**

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

### 3️⃣ **支持HTTP MCP的客户端**

对于支持HTTP/SSE MCP连接的客户端：

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

### 4️⃣ **Cursor IDE**

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

### 5️⃣ **其他支持MCP的工具**

通用配置格式：

```yaml
server_name: web-automation
protocol: stdio  # 或 http-sse
command: node /path/to/mcp-web-automation/src/mcp-server.js
# 或
url: http://your-server:29528/mcp
```

---

## 🌐 **HTTP API集成**

对于不支持MCP的AI工具，可以直接使用HTTP API：

### Python集成示例
```python
import requests

BASE_URL = "http://your-server:29527"

# 页面导航
def navigate_to_page(url):
    response = requests.post(f"{BASE_URL}/api/navigate", 
                           json={"url": url, "client_id": "python_client"})
    return response.json()

# 内容提取
def extract_content(selector="body", content_type="text"):
    response = requests.get(f"{BASE_URL}/api/content", 
                          params={"selector": selector, "type": content_type, 
                                "client_id": "python_client"})
    return response.json()

# 页面截图
def take_screenshot():
    response = requests.get(f"{BASE_URL}/api/screenshot", 
                          params={"client_id": "python_client", "fullPage": True})
    
    with open("screenshot.png", "wb") as f:
        f.write(response.content)
    return "screenshot.png"

# 使用示例
result = navigate_to_page("https://www.google.com")
print(result)

content = extract_content("title", "text")
print(content)

screenshot_file = take_screenshot()
print(f"截图保存为: {screenshot_file}")
```

### JavaScript/Node.js集成示例
```javascript
const axios = require('axios');

class WebAutomationClient {
    constructor(baseUrl = 'http://your-server:29527') {
        this.baseUrl = baseUrl;
        this.clientId = 'js_client';
    }

    async navigate(url) {
        const response = await axios.post(`${this.baseUrl}/api/navigate`, {
            url: url,
            client_id: this.clientId
        });
        return response.data;
    }

    async extractContent(selector = 'body', type = 'text') {
        const response = await axios.get(`${this.baseUrl}/api/content`, {
            params: {
                selector: selector,
                type: type,
                client_id: this.clientId
            }
        });
        return response.data;
    }

    async clickElement(selector) {
        const response = await axios.post(`${this.baseUrl}/api/click`, {
            selector: selector,
            client_id: this.clientId
        });
        return response.data;
    }

    async inputText(selector, text) {
        const response = await axios.post(`${this.baseUrl}/api/input`, {
            selector: selector,
            text: text,
            client_id: this.clientId
        });
        return response.data;
    }

    async takeScreenshot() {
        const response = await axios.get(`${this.baseUrl}/api/screenshot`, {
            params: { client_id: this.clientId },
            responseType: 'arraybuffer'
        });
        
        const fs = require('fs');
        fs.writeFileSync('screenshot.png', response.data);
        return 'screenshot.png';
    }
}

// 使用示例
async function demo() {
    const client = new WebAutomationClient();
    
    // 访问网页
    await client.navigate('https://www.baidu.com');
    
    // 提取标题
    const title = await client.extractContent('title', 'text');
    console.log('页面标题:', title.data.content);
    
    // 在搜索框输入文本
    await client.inputText('#kw', 'AI自动化');
    
    // 点击搜索按钮
    await client.clickElement('#su');
    
    // 截图
    await client.takeScreenshot();
    console.log('截图已保存');
}

demo();
```

---

## 🎛️ **配置选项说明**

### MCP工具列表
所有MCP客户端都可以使用以下7个工具：

1. **`web_navigate`** - 页面导航
   - 参数：`url`, `client_id`, `wait_for_load`
   
2. **`web_extract_content`** - 内容提取
   - 参数：`selector`, `type`, `client_id`
   
3. **`web_click_element`** - 元素点击
   - 参数：`selector`, `client_id`, `wait_for_navigation`
   
4. **`web_input_text`** - 文本输入
   - 参数：`selector`, `text`, `client_id`, `clear`
   
5. **`web_screenshot`** - 页面截图
   - 参数：`client_id`, `fullPage`, `format`
   
6. **`web_manage_bookmarks`** - 收藏夹管理
   - 参数：`action`, `website`, `url`, `title`, `bookmark_id`
   
7. **`web_manage_credentials`** - 密码管理
   - 参数：`action`, `website`, `username`, `password`

### 访问限制
- ✅ **无API密钥要求**：已移除认证限制
- ✅ **无并发限制**：支持无限数量客户端同时访问
- ✅ **无请求频率限制**：可以高频调用API

---

## 🧪 **测试和验证**

### 测试MCP连接
```bash
# 测试本地MCP stdio
node src/mcp-server.js

# 测试远程服务
curl http://your-server:29527/health
curl http://your-server:29528/health
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
   ./start-hybrid.sh status
   
   # 查看日志
   ./start-hybrid.sh logs
   ```

2. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :29527
   lsof -i :29528
   
   # 修改端口（在脚本中）
   HTTP_API_PORT=29527
   MCP_HTTP_PORT=29528
   ```

3. **权限问题**
   ```bash
   # 确保脚本有执行权限
   chmod +x start-hybrid.sh
   chmod +x start-mcp.sh
   ```

### 日志文件位置
- HTTP API日志：`logs/http-api.log`
- MCP HTTP日志：`logs/mcp-http.log`
- 进程ID文件：`logs/*.pid`

---

## 🎉 **使用示例**

### AI助手对话示例

**用户**: 请帮我访问GitHub并搜索"mcp"相关的仓库

**AI**: 我来帮您访问GitHub并搜索MCP相关仓库。

1. 首先访问GitHub首页
2. 然后在搜索框输入"mcp"
3. 点击搜索按钮
4. 最后截图保存结果

**工具调用过程**:
1. `web_navigate(url="https://github.com")`
2. `web_input_text(selector="input[name='q']", text="mcp")`
3. `web_click_element(selector="button[type='submit']")`
4. `web_screenshot(fullPage=true)`

---

## 📞 **技术支持**

如果遇到问题：

1. **查看日志**: `./start-hybrid.sh logs`
2. **重启服务**: `./start-hybrid.sh restart`
3. **测试连接**: `./start-hybrid.sh test`
4. **检查配置**: 确保路径和端口正确

**现在您可以在任何设备上使用AI客户端连接到这个强大的网页自动化服务了！** 🚀