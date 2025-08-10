# 🔧 故障排除指南

> MCP Web Automation Tool 常见问题解决方案

## 🚨 常见问题

### 1️⃣ **浏览器初始化失败**

#### 问题症状
```
Browser initialization failed: Protocol error (Target.setAutoAttach): Target closed
Browser initialization failed: TargetCloseError
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
```

如果仍然失败，尝试完全重新构建：
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 2️⃣ **容器健康检查失败**

#### 问题症状
```
STATUS: Up X minutes (unhealthy)
```

#### 解决方案
这通常不影响实际功能，但可以通过以下方式修复：

```bash
# 检查服务是否实际正常
curl -H "X-API-Key: your-key" http://localhost:29527/health

# 如果返回正常JSON，说明服务工作正常
# 健康检查配置问题不影响使用
```

### 3️⃣ **端口占用问题**

#### 问题症状
```
Error: Port 29527 already in use
```

#### 解决方案
```bash
# 查看端口占用
sudo netstat -tulnp | grep 29527
sudo ss -tulnp | grep 29527

# 停止占用端口的进程
sudo kill -9 <PID>

# 或修改配置使用其他端口
vim config/config.json
# 修改 "port": 29527 为其他端口
```

### 4️⃣ **API 认证失败**

#### 问题症状
```json
{"success": false, "error": "API key is required"}
{"success": false, "error": "Invalid API key"}
```

#### 解决方案
```bash
# 检查当前API密钥
grep "api_key" config/config.json

# 确保请求头正确
curl -H "X-API-Key: your-actual-key" http://localhost:29527/health

# 生成新的API密钥
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
```

### 5️⃣ **客户端数量超限**

#### 问题症状
```json
{"success": false, "error": "Maximum number of clients (2) exceeded"}
```

#### 解决方案
```bash
# 重启服务清理所有会话
./scripts/start.sh restart

# 或等待会话自动过期，然后使用不同的client_id
# 支持的client_id: client1, client2
```

### 6️⃣ **元素交互失败**

#### 问题症状
```json
{"success": false, "error": "Node is either not clickable or not an Element"}
```

#### 解决方案
```bash
# 1. 先检查元素是否存在
curl -H "X-API-Key: your-key" \
     "http://localhost:29527/api/content?client_id=test&selector=your-selector&type=html"

# 2. 尝试不同的选择器
# 常用选择器格式：
# - ID: #element-id
# - Class: .class-name  
# - Name: input[name="field-name"]
# - Type: input[type="text"]

# 3. 等待页面加载完成后再交互
# 在导航后添加适当延迟
```

### 7️⃣ **内存不足问题**

#### 问题症状
```
Container killed (OOMKilled)
Memory usage: 1000MB+ / 1GB
```

#### 解决方案
```bash
# 增加Docker资源限制
vim docker-compose.yml

# 修改内存限制
deploy:
  resources:
    limits:
      memory: 2G        # 增加到2GB
      cpus: '2.0'
```

### 8️⃣ **网络连接问题**

#### 问题症状
```
curl: (7) Failed to connect to localhost port 29527
```

#### 解决方案
```bash
# 1. 检查容器状态
docker-compose ps

# 2. 检查端口映射
docker port mcp-web-automation

# 3. 检查防火墙
sudo ufw status
sudo ufw allow 29527

# 4. 检查服务绑定地址
# config.json 中确保 "host": "0.0.0.0"
```

## 🔍 诊断工具

### 快速健康检查脚本
```bash
#!/bin/bash
echo "🔍 MCP Web Automation 健康检查"

API_KEY=$(grep -o '"api_key": *"[^"]*"' config/config.json | cut -d '"' -f4)

echo "1. 容器状态:"
docker-compose ps

echo "2. 健康检查:"
curl -s -H "X-API-Key: $API_KEY" http://localhost:29527/health | head -100

echo "3. 内存使用:"
docker stats --no-stream --format "{{.MemUsage}}" $(docker ps -q --filter name=mcp-web-automation)

echo "4. 最近日志:"
docker-compose logs --tail=10
```

### 完整功能测试脚本
```bash
#!/bin/bash
API_KEY=$(grep -o '"api_key": *"[^"]*"' config/config.json | cut -d '"' -f4)

echo "🧪 完整功能测试"

# 测试导航
echo "1. 测试导航..."
curl -s -X POST -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" \
     -d '{"url":"https://httpbin.org/get","client_id":"test"}' \
     http://localhost:29527/api/navigate

# 测试内容提取  
echo "2. 测试内容提取..."
curl -s -H "X-API-Key: $API_KEY" \
     "http://localhost:29527/api/content?client_id=test&selector=body&type=text"

# 测试截图
echo "3. 测试截图..."
curl -s -H "X-API-Key: $API_KEY" \
     "http://localhost:29527/api/screenshot?client_id=test" \
     --output test-screenshot.png

if [ -f test-screenshot.png ] && [ $(wc -c < test-screenshot.png) -gt 1000 ]; then
    echo "✅ 所有功能正常"
else
    echo "❌ 截图功能异常"
fi
```

## 📞 获取帮助（AI建议写的，看看就得了，你问了我也不会，不如去问ai，本项目完全使用claude-sonnet-4编写，你去问claude-sonnet-4应该可以解决所有问题）

如果以上解决方案都无法解决问题：

1. **收集诊断信息**：
   ```bash
   # 生成完整诊断报告
   echo "=== 系统信息 ===" > diagnostic.txt
   uname -a >> diagnostic.txt
   docker --version >> diagnostic.txt
   
   echo "=== 容器状态 ===" >> diagnostic.txt  
   docker-compose ps >> diagnostic.txt
   
   echo "=== 服务日志 ===" >> diagnostic.txt
   docker-compose logs --tail=50 >> diagnostic.txt
   
   echo "=== 配置文件 ===" >> diagnostic.txt
   cat config/config.json >> diagnostic.txt
   ```

2. **提交 Issue**：[GitHub Issues](https://github.com/hahaha8459812/mcp-web-automation/issues)

3. **包含以下信息**：
   - 操作系统版本
   - Docker 版本
   - 错误信息截图
   - 诊断报告内容
   - 复现步骤

---

*最后更新: 2025-08-10*
```
