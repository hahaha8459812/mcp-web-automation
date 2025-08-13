# 🔧 故障排除指南

> MCP Web Automation Tool 常见问题解决方案

## 🚨 常见问题快速检查

在排查问题前，首先进行基础检查：
```bash
# 查看MCP服务状态
./start-mcp.sh status

# 查看服务日志
./start-mcp.sh logs

# 测试MCP服务
./start-mcp.sh test
```

---

## 🎯 **服务启动问题**

### 1️⃣ **MCP服务启动失败**

#### 问题症状
```
❌ MCP HTTP服务器启动失败
❌ 端口29528被占用
❌ 服务无响应
```

#### 诊断步骤
```bash
# 1. 检查端口占用
lsof -i :29528

# 2. 检查Node.js进程
ps aux | grep node

# 3. 查看启动日志
./start-mcp.sh logs

# 4. 检查配置文件
jq . mcp-config.json
```

#### 解决方案
```bash
# 强制停止占用端口的进程
lsof -ti:29528 | xargs kill -9

# 清理PID文件
rm -f logs/*.pid

# 重启MCP服务
./start-mcp.sh restart
```

### 2️⃣ **Node.js版本问题**

#### 问题症状
```
❌ 语法错误或模块不兼容
❌ 启动时出现版本警告
```

#### 检查版本
```bash
node --version  # 需要 18.0.0 或更高版本
npm --version
```

#### 解决方案
```bash
# 安装Node.js 18+
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 3️⃣ **依赖安装问题**

#### 问题症状
```
❌ 模块找不到
❌ 依赖版本冲突
```

#### 解决方案
```bash
# 清理并重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 检查依赖
npm list --depth=0
```

---

## 🔌 **MCP连接问题**

### 1️⃣ **AI客户端连接失败**

#### 问题症状
```
❌ Claude Desktop无法连接
❌ MCP工具不可用
❌ 连接超时
```

#### stdio连接诊断
```bash
# 测试stdio服务
timeout 5s node src/mcp-server.js

# 检查MCP服务器响应
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node src/mcp-server.js
```

#### HTTP连接诊断
```bash
# 测试HTTP健康检查
curl http://localhost:29528/health

# 测试MCP HTTP端点
curl http://localhost:29528/mcp

# 检查网络连接
telnet localhost 29528
```

#### 解决方案

**本地stdio连接**：
```json
{
  "mcpServers": {
    "web-automation": {
      "command": "node",
      "args": ["src/mcp-server.js"],
      "cwd": "/正确的/项目/路径"
    }
  }
}
```

**远程HTTP连接**：
```json
{
  "mcpServers": {
    "web-automation": {
      "url": "http://server-ip:29528/mcp"
    }
  }
}
```

### 2️⃣ **配置文件问题**

#### 问题症状
```
❌ 配置文件不存在
❌ JSON语法错误
❌ 路径配置错误
```

#### 诊断步骤
```bash
# 验证配置文件存在
ls -la mcp-config.json

# 验证JSON语法
jq . mcp-config.json

# 检查路径权限
ls -la src/mcp-server.js
```

#### 解决方案
```bash
# 创建配置文件
cp mcp-config.example.json mcp-config.json

# 修复JSON语法
jq . mcp-config.json || echo "JSON语法错误"

# 设置正确权限
chmod +x start-mcp.sh
chmod 644 mcp-config.json
```

---

## 🌐 **网络和端口问题**

### 1️⃣ **端口冲突**

#### 问题症状
```
❌ 端口29528已被占用
❌ 服务启动失败
```

#### 诊断命令
```bash
# 检查端口占用
lsof -i :29528
netstat -tlnp | grep 29528
ss -tlnp | grep 29528

# 查看进程详情
ps aux | grep node
```

#### 解决方案
```bash
# 方案1: 杀死占用进程
lsof -ti:29528 | xargs kill -9

# 方案2: 更改端口
# 编辑 mcp-config.json
{
  "http": {
    "port": 30000
  }
}

# 方案3: 使用环境变量
HTTP_PORT=30000 ./start-mcp.sh http
```

### 2️⃣ **防火墙问题**

#### 问题症状
```
❌ 远程无法访问
❌ 连接被拒绝
```

#### 解决方案
```bash
# Ubuntu/Debian
sudo ufw allow 29528

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=29528/tcp
sudo firewall-cmd --reload

# 检查防火墙状态
sudo ufw status
sudo firewall-cmd --list-ports
```

---

## 🖥️ **浏览器引擎问题**

### 1️⃣ **Chrome/Chromium启动失败**

#### 问题症状
```
❌ 浏览器无法启动
❌ 沙盒模式错误
❌ 共享内存不足
```

#### 诊断步骤
```bash
# 检查Chrome是否可用
which google-chrome || which chromium-browser

# 测试手动启动Chrome
google-chrome --version
```

#### 解决方案

**Docker环境**：
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

**内存不足**：
```json
{
  "browser": {
    "args": [
      "--memory-pressure-off",
      "--max_old_space_size=1024",
      "--disable-background-timer-throttling"
    ]
  }
}
```

**自定义Chrome路径**：
```bash
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium ./start-mcp.sh stdio
```

### 2️⃣ **页面加载超时**

#### 问题症状
```
❌ 页面加载超时
❌ 网络请求失败
```

#### 解决方案
```json
{
  "browser": {
    "timeout": 60000,
    "args": [
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor"
    ]
  }
}
```

---

## 📁 **文件权限问题**

### 1️⃣ **脚本权限不足**

#### 问题症状
```
❌ Permission denied
❌ 脚本无法执行
```

#### 解决方案
```bash
# 设置执行权限
chmod +x start-mcp.sh

# 检查文件权限
ls -la start-mcp.sh

# 设置目录权限
chmod 755 .
chmod 755 src/
```

### 2️⃣ **日志文件权限问题**

#### 问题症状
```
❌ 无法写入日志
❌ 日志目录不存在
```

#### 解决方案
```bash
# 创建日志目录
mkdir -p logs

# 设置权限
chmod 755 logs/
touch logs/mcp-http.log
chmod 644 logs/mcp-http.log

# 检查磁盘空间
df -h
```

---

## 🔍 **调试和诊断工具**

### 1️⃣ **详细日志调试**

```bash
# 启用调试模式
LOG_LEVEL=debug ./start-mcp.sh http

# 查看详细启动日志
NODE_ENV=development ./start-mcp.sh stdio

# 实时查看日志
tail -f logs/mcp-http.log
```

### 2️⃣ **网络连接测试**

```bash
# 测试本地连接
curl -v http://localhost:29528/health

# 测试远程连接  
curl -v http://server-ip:29528/health

# 测试MCP端点
curl -v http://localhost:29528/mcp
```

### 3️⃣ **进程监控**

```bash
# 监控Node.js进程
watch 'ps aux | grep node'

# 监控端口状态
watch 'lsof -i :29528'

# 监控系统资源
top
htop
```

---

## 💾 **数据和存储问题**

### 1️⃣ **数据文件丢失**

#### 问题症状
```
❌ 书签数据丢失
❌ 凭据无法保存
```

#### 解决方案
```bash
# 检查数据目录
ls -la data/

# 创建数据文件
mkdir -p data
echo '{"bookmarks":{},"credentials":{}}' > data/user-data.json

# 设置权限
chmod 644 data/user-data.json
```

### 2️⃣ **磁盘空间不足**

#### 问题症状
```
❌ 无法写入文件
❌ 服务异常退出
```

#### 解决方案
```bash
# 检查磁盘空间
df -h

# 清理日志文件
find logs/ -name "*.log" -mtime +7 -delete

# 清理临时文件
rm -rf /tmp/puppeteer_dev_chrome_profile-*
```

---

## 🚨 **紧急恢复指南**

### 完全重置服务

```bash
# 1. 停止所有服务
./start-mcp.sh stop
pkill -f node

# 2. 清理进程和文件
rm -f logs/*.pid
rm -f logs/*.log

# 3. 重新安装依赖
rm -rf node_modules
npm install

# 4. 重新创建配置
cp mcp-config.example.json mcp-config.json

# 5. 重启服务
./start-mcp.sh http
```

### 备份和恢复

```bash
# 备份用户数据
cp -r data/ data_backup_$(date +%Y%m%d)

# 备份配置
cp mcp-config.json mcp-config.backup.json

# 恢复数据
cp -r data_backup_20231201/ data/
```

---

## 📊 **性能问题诊断**

### 1️⃣ **内存使用过高**

#### 诊断命令
```bash
# 查看内存使用
free -h
ps aux --sort=-%mem | head -10

# 监控Node.js进程
ps aux | grep node | awk '{print $2, $4, $11}' | sort -k2 -nr
```

#### 解决方案
```json
{
  "browser": {
    "args": [
      "--memory-pressure-off",
      "--max_old_space_size=512"
    ]
  },
  "logging": {
    "level": "warn"
  }
}
```

### 2️⃣ **响应速度慢**

#### 优化配置
```json
{
  "browser": {
    "timeout": 15000,
    "args": [
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding"
    ]
  }
}
```

---

## 📋 **常见错误码对照表**

| 错误码 | 含义 | 解决方案 |
|--------|------|---------|
| `EADDRINUSE` | 端口被占用 | 更改端口或杀死占用进程 |
| `ENOENT` | 文件不存在 | 检查文件路径和权限 |
| `EACCES` | 权限不足 | 设置正确的文件权限 |
| `ECONNREFUSED` | 连接被拒绝 | 检查服务状态和防火墙 |
| `TIMEOUT` | 连接超时 | 增加超时时间或检查网络 |
| `MODULE_NOT_FOUND` | 模块未找到 | 重新安装依赖 |

---

## 🆘 **获取帮助**

### 收集诊断信息

```bash
# 生成诊断报告
echo "=== 系统信息 ===" > diagnosis.txt
uname -a >> diagnosis.txt
node --version >> diagnosis.txt
npm --version >> diagnosis.txt

echo "=== 服务状态 ===" >> diagnosis.txt
./start-mcp.sh status >> diagnosis.txt

echo "=== 端口状态 ===" >> diagnosis.txt
lsof -i :29528 >> diagnosis.txt

echo "=== 最新日志 ===" >> diagnosis.txt
tail -50 logs/mcp-http.log >> diagnosis.txt

echo "=== 配置文件 ===" >> diagnosis.txt
cat mcp-config.json >> diagnosis.txt
```

### 快速自检脚本

```bash
#!/bin/bash
echo "🔍 MCP Web Automation 自检..."

# 检查Node.js版本
if node --version | grep -q "v1[8-9]\|v[2-9][0-9]"; then
    echo "✅ Node.js版本正常"
else
    echo "❌ Node.js版本过低，需要18+"
fi

# 检查端口
if lsof -i :29528 >/dev/null 2>&1; then
    echo "⚠️  端口29528被占用"
else
    echo "✅ 端口29528可用"
fi

# 检查配置文件
if jq . mcp-config.json >/dev/null 2>&1; then
    echo "✅ 配置文件格式正确"
else
    echo "❌ 配置文件JSON格式错误"
fi

# 检查依赖
if [ -d "node_modules" ]; then
    echo "✅ 依赖已安装"
else
    echo "❌ 需要运行 npm install"
fi

echo "🎉 自检完成"
```

---

**💡 如果问题仍然存在，请检查系统日志或联系技术支持，并提供诊断信息。**
