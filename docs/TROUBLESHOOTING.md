# 🔧 故障排除指南 - 混合部署版

> MCP Web Automation Tool 常见问题解决方案 - 支持HTTP API + MCP HTTP + MCP stdio

## 🚨 混合部署常见问题

### ⚙️ **混合服务状态检查**
在排查问题前，首先检查混合服务状态：
```bash
# 查看所有服务状态
./start-hybrid.sh status

# 查看详细日志
./start-hybrid.sh logs

# 测试所有服务
./start-hybrid.sh test
```

---

## 🎯 **服务启动问题**

### 1️⃣ **混合服务启动失败**

#### 问题症状
```
❌ HTTP API服务器启动失败
❌ MCP HTTP服务器启动失败
❌ 端口冲突或服务无响应
```

#### 解决方案

**步骤1: 检查端口占用**
```bash
# 检查HTTP API端口 (29527)
lsof -i :29527
netstat -tulnp | grep 29527

# 检查MCP HTTP端口 (29528)
lsof -i :29528
netstat -tulnp | grep 29528

# 如果端口被占用，停止占用进程
sudo kill -9 <PID>
```

**步骤2: 检查Node.js环境**
```bash
# 验证Node.js版本
node --version  # 应该是 v18+ 或 v20+

# 验证npm依赖
npm list --depth=0

# 重新安装依赖（如果有问题）
rm -rf node_modules package-lock.json
npm install
```

**步骤3: 清理并重启**
```bash
# 停止所有混合服务
./start-hybrid.sh stop

# 清理进程
pkill -f "node.*mcp" || true

# 重新启动
./start-hybrid.sh start
```

### 2️⃣ **浏览器初始化失败**

#### 问题症状
```
Browser initialization failed: Protocol error (Target.setAutoAttach): Target closed
Browser initialization failed: TargetCloseError
Error: Could not find browser instance
```

#### 解决方案
检查 `docker-compose.yml` 配置是否包含必要的参数：

```yaml
services:
  mcp-web-automation:
    # ... 其他配置
    shm_size: '2gb'                    # 共享内存大小
    security_opt:
      - seccomp:unconfined             # 安全配置
    cap_add:
      - SYS_ADMIN                      # 系统权限
    ports:
      - "29527:29527"                  # HTTP API端口
      - "29528:29528"                  # MCP HTTP端口
```

如果仍然失败，尝试完全重新构建：
```bash
docker-compose down
docker-compose build --no-cache
./start-hybrid.sh start
```

### 3️⃣ **容器健康检查失败**

#### 问题症状
```
STATUS: Up X minutes (unhealthy)
```

#### 解决方案
这通常不影响实际功能，但可以通过以下方式修复：

```bash
# 检查HTTP API服务是否正常
curl http://localhost:29527/health

# 检查MCP HTTP服务是否正常
curl http://localhost:29528/health

# 如果返回正常JSON，说明服务工作正常
# 健康检查配置问题不影响使用
```

---

## 🔗 **MCP协议问题**

### 4️⃣ **MCP stdio连接失败**

#### 问题症状
```
Error: MCP server connection failed
TypeError: Cannot read properties of undefined (reading 'method')
Connection timeout
```

#### 解决方案

**步骤1: 验证MCP服务器启动**
```bash
# 手动测试MCP stdio服务器
node src/mcp-server.js

# 应该看到服务器等待stdio输入
# 按Ctrl+C退出
```

**步骤2: 检查AI客户端配置**
```json
// Claude Desktop配置示例
{
  "mcpServers": {
    "web-automation": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-web-automation/src/mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**步骤3: 测试MCP通信**
```bash
# 发送MCP初始化消息测试
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"1.0.0","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node src/mcp-server.js
```

### 5️⃣ **MCP HTTP连接失败**

#### 问题症状
```
Cannot connect to MCP HTTP endpoint
SSE connection failed
Error: connect ECONNREFUSED
```

#### 解决方案

**步骤1: 检查MCP HTTP服务状态**
```bash
# 检查服务是否运行
curl http://localhost:29528/health

# 检查SSE端点
curl http://localhost:29528/mcp
```

**步骤2: 检查防火墙和网络**
```bash
# 检查防火墙状态
sudo ufw status

# 临时开放端口（如果需要）
sudo ufw allow 29528

# 检查网络连接
telnet localhost 29528
```

**步骤3: 验证CORS设置**
```bash
# 测试跨域请求
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:29528/mcp
```

---

## 🌐 **HTTP API问题**

### 6️⃣ **API访问被拒绝（已解决）**

#### 问题症状
```json
{"success": false, "error": "API key is required"}
{"success": false, "error": "Invalid API key"}
```

#### ✅ **解决方案**
**好消息**: 在混合部署版中，API认证已被完全移除！

```bash
# 现在可以直接访问，无需API密钥
curl http://localhost:29527/health
curl -X POST -H "Content-Type: application/json" \
     -d '{"url":"https://example.com","client_id":"test"}' \
     http://localhost:29527/api/navigate
```

### 7️⃣ **客户端数量限制（已解决）**

#### 问题症状
```json
{"success": false, "error": "Maximum number of clients (2) exceeded"}
```

#### ✅ **解决方案**
**好消息**: 在混合部署版中，客户端数量限制已被完全移除！

```bash
# 现在支持无限数量的并发客户端
# 可以同时运行多个AI客户端而不会收到限制错误
```

---

## 💾 **数据和存储问题**

### 8️⃣ **数据文件损坏**

#### 问题症状
```
Error: Cannot read user data file
JSON parse error in data/user-data.json
```

#### 解决方案
```bash
# 检查数据文件格式
cat data/user-data.json | jq .

# 如果格式错误，恢复默认结构
cp data/user-data.json data/user-data.json.backup
cat > data/user-data.json << 'EOF'
{
  "bookmarks": {},
  "credentials": {}
}
EOF

# 重启服务
./start-hybrid.sh restart
```

### 9️⃣ **日志文件过大**

#### 问题症状
```
Disk space running low
Log files consuming too much space
```

#### 解决方案
```bash
# 查看日志文件大小
du -sh logs/

# 清理旧日志
./start-hybrid.sh stop
rm -f logs/*.log.old
truncate -s 0 logs/http-api.log
truncate -s 0 logs/mcp-http.log
./start-hybrid.sh start

# 或设置日志轮转
# 编辑配置文件增加日志轮转设置
```

---

## 🖥️ **性能问题**

### 🔟 **内存不足**

#### 问题症状
```
Error: Cannot allocate memory
Browser crashed: out of memory
Container killed (OOMKilled)
```

#### 解决方案

**步骤1: 检查内存使用**
```bash
# 查看系统内存
free -h

# 查看容器内存使用
docker stats

# 查看Node.js进程内存
ps aux | grep node
```

**步骤2: 优化内存配置**
```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G          # 增加内存限制
    reservations:
      memory: 1G          # 增加内存预留
```

**步骤3: 优化浏览器参数**
```javascript
// src/browser/manager.js
const args = [
    '--max-old-space-size=512',        // 限制V8内存
    '--disable-dev-shm-usage',         // 禁用/dev/shm
    // ... 其他参数
];
```

### 1️⃣1️⃣ **响应速度慢**

#### 问题症状
```
API requests timing out
Slow page loading
High response latency
```

#### 解决方案

**步骤1: 检查资源使用**
```bash
# 查看CPU使用率
top
htop

# 查看网络延迟
ping google.com
```

**步骤2: 优化配置**
```json
// config/config.json
{
  "browser": {
    "timeout": 60000,              // 增加超时时间
    "viewport": {
      "width": 1280,               // 减小窗口大小
      "height": 720
    }
  },
  "features": {
    "screenshots": {
      "quality": 60                // 降低截图质量
    }
  }
}
```

---

## 🔍 **网络连接问题**

### 1️⃣2️⃣ **无法访问外部网站**

#### 问题症状
```
Navigation failed: net::ERR_NAME_NOT_RESOLVED
Timeout waiting for page load
Connection refused
```

#### 解决方案

**步骤1: 检查网络连接**
```bash
# 在容器内测试网络
docker exec -it mcp-web-automation ping google.com
docker exec -it mcp-web-automation nslookup google.com

# 检查DNS设置
cat /etc/resolv.conf
```

**步骤2: 检查代理设置**
```bash
# 如果使用代理，配置环境变量
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
```

### 1️⃣3️⃣ **远程访问问题**

#### 问题症状
```
Cannot access service from other devices
Connection refused from remote IP
Firewall blocking access
```

#### 解决方案

**步骤1: 检查防火墙**
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 29527
sudo ufw allow 29528

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --add-port=29527/tcp --permanent
sudo firewall-cmd --add-port=29528/tcp --permanent
sudo firewall-cmd --reload
```

**步骤2: 检查服务绑定**
```bash
# 确保服务绑定到0.0.0.0而不是127.0.0.1
netstat -tulnp | grep :29527
netstat -tulnp | grep :29528
```

---

## 🛠️ **开发和调试**

### 1️⃣4️⃣ **开发环境问题**

#### 问题症状
```
Cannot start development server
Module not found errors
Dependencies conflict
```

#### 解决方案

**步骤1: 重置开发环境**
```bash
# 清理依赖
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 验证安装
npm list --depth=0
```

**步骤2: 单独启动服务调试**
```bash
# 启动HTTP API（开发模式）
NODE_ENV=development node src/index.js

# 启动MCP stdio（调试模式）
DEBUG=* node src/mcp-server.js

# 启动MCP HTTP（详细日志）
LOG_LEVEL=debug node src/mcp-remote-server.js http
```

### 1️⃣5️⃣ **日志调试**

#### 启用详细日志
```json
// config/config.json
{
  "logging": {
    "level": "debug"
  }
}
```

```json
// mcp-config.json
{
  "logging": {
    "level": "debug",
    "format": "pretty"
  }
}
```

#### 实时查看日志
```bash
# 查看HTTP API日志
tail -f logs/http-api.log

# 查看MCP HTTP日志
tail -f logs/mcp-http.log

# 查看混合服务日志
./start-hybrid.sh logs
```

---

## 📋 **诊断命令清单**

### 🔧 **快速诊断脚本**
```bash
#!/bin/bash
echo "=== MCP Web Automation 混合部署诊断 ==="

echo "1. 检查Node.js环境..."
node --version
npm --version

echo "2. 检查端口状态..."
lsof -i :29527 2>/dev/null || echo "端口29527可用"
lsof -i :29528 2>/dev/null || echo "端口29528可用"

echo "3. 检查服务状态..."
curl -s http://localhost:29527/health || echo "HTTP API未响应"
curl -s http://localhost:29528/health || echo "MCP HTTP未响应"

echo "4. 检查进程..."
ps aux | grep node | grep -v grep

echo "5. 检查内存..."
free -h

echo "6. 检查磁盘..."
df -h

echo "7. 检查日志文件..."
ls -la logs/

echo "=== 诊断完成 ==="
```

### 📊 **状态检查命令**
```bash
# 综合状态检查
./start-hybrid.sh status && \
curl -s http://localhost:29527/health | jq . && \
curl -s http://localhost:29528/health | jq . && \
echo "✅ 所有服务正常"

# 完整测试
./start-hybrid.sh test
```

---

## 🆘 **获取帮助**

### 📞 **支持渠道**
1. **查看详细日志**: `./start-hybrid.sh logs`
2. **检查配置文档**: [CONFIGURATION.md](CONFIGURATION.md)
3. **查看命令参考**: [COMMANDS-指令速查.md](COMMANDS-指令速查.md)
4. **提交Issue**: [GitHub Issues](https://github.com/hahaha8459812/mcp-web-automation/issues)

### 🐛 **报告问题时请提供**
```bash
# 收集诊断信息
echo "=== 系统信息 ===" > debug-info.txt
uname -a >> debug-info.txt
echo "=== Node.js版本 ===" >> debug-info.txt
node --version >> debug-info.txt
echo "=== 服务状态 ===" >> debug-info.txt
./start-hybrid.sh status >> debug-info.txt
echo "=== 最近日志 ===" >> debug-info.txt
tail -50 logs/http-api.log >> debug-info.txt
tail -50 logs/mcp-http.log >> debug-info.txt
```

---

*最后更新 Last Updated: 2025-08-12 | 混合部署版 Hybrid Deployment Version*
```
