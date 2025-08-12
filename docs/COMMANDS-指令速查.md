# 💻 Commands Reference - 指令速查表

> 项目开发和维护常用命令汇总 - 混合部署版 | Common commands for project development and maintenance - Hybrid deployment version

## 🚀 **Project Deployment - 项目部署**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `git clone https://github.com/hahaha8459812/mcp-web-automation.git` | 克隆项目 Clone project | 首次部署 First deployment |
| `git checkout feature/mcp-server-implementation` | 切换到混合部署分支 Switch to hybrid deployment branch | 获取最新混合部署功能 Get latest hybrid features |
| `chmod +x start-hybrid.sh` | 赋予混合部署脚本执行权限 Grant execute permission | 混合部署必需 Required for hybrid deployment |
| `./start-hybrid.sh start` | 一键启动混合服务 One-click hybrid deployment | 自动启动HTTP API + MCP HTTP Automatically start HTTP API + MCP HTTP |
| `chmod +x scripts/install.sh` | 赋予安装脚本执行权限 Grant execute permission | 传统部署 Traditional deployment |
| `./scripts/install.sh` | 一键传统安装部署 One-click traditional installation | 仅HTTP API Only HTTP API |

## 🔧 **Hybrid Service Management - 混合服务管理**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `./start-hybrid.sh start` | 启动混合服务 Start hybrid services | HTTP API (29527) + MCP HTTP (29528) |
| `./start-hybrid.sh stop` | 停止混合服务 Stop hybrid services | 停止所有服务 Stop all services |
| `./start-hybrid.sh restart` | 重启混合服务 Restart hybrid services | 完全重启 Complete restart |
| `./start-hybrid.sh status` | 查看混合服务状态 Check hybrid services status | 显示所有服务状态 Show all services status |
| `./start-hybrid.sh logs` | 查看混合服务日志 View hybrid services logs | HTTP API + MCP HTTP 日志 HTTP API + MCP HTTP logs |
| `./start-hybrid.sh test` | 测试混合服务 Test hybrid services | 自动测试所有接口 Auto test all interfaces |
| `./start-hybrid.sh help` | 查看混合脚本帮助 View hybrid script help | 详细用法说明 Detailed usage instructions |

## 🛠️ **Individual Service Management - 单独服务管理**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `npm start` | 启动HTTP API服务器 Start HTTP API server | 端口29527 Port 29527 |
| `node src/mcp-server.js` | 启动MCP stdio服务器 Start MCP stdio server | 本地AI客户端连接 Local AI client connection |
| `node src/mcp-remote-server.js http` | 启动MCP HTTP服务器 Start MCP HTTP server | 端口29528 Port 29528 |
| `node src/mcp-remote-server.js stdio` | 启动MCP stdio服务器 Start MCP stdio server | 同上，等价命令 Same as above, equivalent command |

## 🔧 **Traditional Service Management - 传统服务管理**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `./scripts/start.sh start` | 启动传统服务 Start traditional service | 仅HTTP API Only HTTP API |
| `./scripts/start.sh stop` | 停止传统服务 Stop traditional service | - |
| `./scripts/start.sh restart` | 重启传统服务 Restart traditional service | - |
| `./scripts/start.sh status` | 查看传统服务状态 Check traditional service status | 显示容器状态和资源使用 Show container status and resource usage |
| `./scripts/start.sh logs` | 查看传统日志 View traditional logs | 显示最近50行 Show last 50 lines |
| `./scripts/start.sh logs -f` | 实时查看传统日志 Follow traditional logs | 持续输出 Continuous output |
| `./scripts/start.sh health` | 传统健康检查 Traditional health check | 测试API响应 Test API response |
| `./scripts/start.sh backup` | 备份用户数据 Backup user data | 自动打包 Auto archive |
| `./scripts/start.sh update` | 更新传统服务 Update traditional service | 重新构建并启动 Rebuild and restart |
| `./scripts/start.sh cleanup` | 清理资源 Cleanup resources | 删除无用容器镜像 Remove unused containers/images |

## 🐳 **Docker Native Commands - Docker 原生命令**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `docker-compose up -d` | 后台启动服务 Start service in background | 传统HTTP API Traditional HTTP API |
| `docker-compose down` | 停止并删除容器 Stop and remove containers | - |
| `docker-compose ps` | 查看容器状态 View container status | - |
| `docker-compose logs -f` | 查看实时日志 Follow logs | - |
| `docker-compose build --no-cache` | 重新构建镜像 Rebuild images | 强制重建 Force rebuild |
| `docker-compose restart` | 重启容器 Restart containers | - |
| `docker system prune -f` | 清理无用资源 Prune unused resources | 慎用 Use carefully |
| `docker stats` | 查看容器资源使用 View container resource usage | 实时监控 Real-time monitoring |

## 🌐 **API Testing Commands - API 测试命令**

### HTTP API Testing (端口 29527)
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `curl http://localhost:29527/health` | HTTP API健康检查 HTTP API health check | ✅ 无需认证 No auth required |
| `curl http://localhost:29527/` | 查看HTTP API文档 View HTTP API docs | ✅ 无需认证 No auth required |
| `curl -X POST -H "Content-Type: application/json" -d '{"url":"https://example.com","client_id":"test"}' http://localhost:29527/api/navigate` | 测试页面导航 Test navigation | ✅ 无需认证 No auth required |
| `curl "http://localhost:29527/api/content?client_id=test&selector=title"` | 测试内容提取 Test content extraction | ✅ 无需认证 No auth required |
| `curl "http://localhost:29527/api/screenshot?client_id=test" --output screenshot.png` | 测试截图下载 Test screenshot download | ✅ 无需认证 No auth required |

### MCP HTTP Testing (端口 29528)
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `curl http://localhost:29528/health` | MCP HTTP健康检查 MCP HTTP health check | ✅ 无需认证 No auth required |
| `curl http://localhost:29528/mcp` | 测试MCP HTTP连接 Test MCP HTTP connection | SSE连接端点 SSE connection endpoint |

### MCP stdio Testing
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"1.0.0","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' \| node src/mcp-server.js` | 测试MCP stdio连接 Test MCP stdio connection | 发送初始化消息 Send initialize message |
| `timeout 5s node src/mcp-server.js` | 快速测试MCP stdio Test MCP stdio quickly | 5秒超时测试 5 second timeout test |

## 📁 **File Operations - 文件操作**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `cp config/config.example.json config/config.json` | 复制配置文件 Copy config file | 首次配置 Initial setup |
| `vim config/config.json` | 编辑HTTP配置文件 Edit HTTP config file | 或用其他编辑器 Or use other editors |
| `vim mcp-config.json` | 编辑MCP配置文件 Edit MCP config file | MCP服务器配置 MCP server configuration |
| `cat config/config.json` | 查看HTTP配置文件 View HTTP config file | - |
| `cat mcp-config.json` | 查看MCP配置文件 View MCP config file | - |
| `ls -la data/` | 查看数据目录 List data directory | - |
| `ls -la logs/` | 查看日志目录 List logs directory | 混合部署日志 Hybrid deployment logs |
| `tail -f logs/http-api.log` | 查看HTTP API日志 View HTTP API log | 实时日志 Real-time log |
| `tail -f logs/mcp-http.log` | 查看MCP HTTP日志 View MCP HTTP log | 实时日志 Real-time log |
| `du -sh *` | 查看目录大小 Check directory size | 检查磁盘使用 Check disk usage |

## 🔍 **Troubleshooting - 故障排查**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `./start-hybrid.sh logs` | 查看混合服务日志 View hybrid services logs | 故障诊断 Fault diagnosis |
| `docker-compose logs --tail=100` | 查看最近100行容器日志 View last 100 container log lines | 传统服务 Traditional service |
| `ps aux \| grep node` | 查看Node.js进程 Check Node.js processes | 查看运行的服务 Check running services |
| `netstat -tulnp \| grep 29527` | 检查HTTP API端口占用 Check HTTP API port usage | Linux |
| `netstat -tulnp \| grep 29528` | 检查MCP HTTP端口占用 Check MCP HTTP port usage | Linux |
| `ss -tulnp \| grep 29527` | 检查HTTP API端口占用 Check HTTP API port usage | 现代Linux Modern Linux |
| `ss -tulnp \| grep 29528` | 检查MCP HTTP端口占用 Check MCP HTTP port usage | 现代Linux Modern Linux |
| `lsof -i :29527` | 查看HTTP API端口使用 View HTTP API port usage | 详细端口信息 Detailed port info |
| `lsof -i :29528` | 查看MCP HTTP端口使用 View MCP HTTP port usage | 详细端口信息 Detailed port info |
| `free -h` | 查看内存使用 Check memory usage | 系统资源 System resources |
| `df -h` | 查看磁盘使用 Check disk usage | 系统资源 System resources |
| `docker system df` | 查看Docker磁盘使用 Check Docker disk usage | Docker资源 Docker resources |

## 🛠️ **System Management - 系统管理**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `systemctl status docker` | 查看Docker服务状态 Check Docker service status | SystemD系统 SystemD systems |
| `systemctl start docker` | 启动Docker服务 Start Docker service | SystemD系统 SystemD systems |
| `systemctl enable docker` | 设置Docker开机启动 Enable Docker auto-start | SystemD系统 SystemD systems |
| `usermod -aG docker $USER` | 添加用户到docker组 Add user to docker group | 需要重新登录 Requires re-login |
| `docker --version` | 查看Docker版本 Check Docker version | - |
| `docker-compose --version` | 查看Compose版本 Check Compose version | - |
| `node --version` | 查看Node.js版本 Check Node.js version | 检查环境 Check environment |
| `npm --version` | 查看npm版本 Check npm version | 检查环境 Check environment |

## 📊 **Monitoring Commands - 监控命令**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `watch ./start-hybrid.sh status` | 实时查看混合服务状态 Watch hybrid services status | 每2秒刷新 Refresh every 2s |
| `watch 'curl -s http://localhost:29527/health'` | 实时监控HTTP API健康状态 Monitor HTTP API health | 每2秒请求 Request every 2s |
| `watch 'curl -s http://localhost:29528/health'` | 实时监控MCP HTTP健康状态 Monitor MCP HTTP health | 每2秒请求 Request every 2s |
| `watch docker-compose ps` | 实时查看容器状态 Watch container status | 每2秒刷新 Refresh every 2s |
| `htop` | 查看系统资源使用 View system resource usage | 需要安装htop Requires htop |
| `iotop` | 查看磁盘IO View disk IO | 需要安装iotop Requires iotop |

## 🔄 **Common Combined Operations - 常用组合操作**
| 操作 Operation | 命令组合 Command Combination | 说明 Description |
|------|----------|------|
| **完全混合部署 Complete hybrid deployment** | `git checkout feature/mcp-server-implementation && ./start-hybrid.sh start` | 获取最新版本并启动 Get latest version and start |
| **完全重新部署 Complete redeployment** | `./start-hybrid.sh stop && docker-compose down && docker-compose build --no-cache && ./start-hybrid.sh start` | 停止→重建→启动 Stop→Rebuild→Start |
| **查看所有服务状态 View all services status** | `./start-hybrid.sh status && docker-compose ps` | 混合服务+容器状态 Hybrid services + container status |
| **查看最新日志并持续监控 View recent logs and monitor** | `./start-hybrid.sh logs` | 显示HTTP API + MCP HTTP日志 Show HTTP API + MCP HTTP logs |
| **完整健康检查 Complete health check** | `curl http://localhost:29527/health && curl http://localhost:29528/health` | HTTP API + MCP HTTP健康检查 HTTP API + MCP HTTP health check |
| **故障完整检查 Complete troubleshooting check** | `./start-hybrid.sh status && ./start-hybrid.sh logs` | 状态+日志 Status + logs |

## 💡 **Useful Aliases - 实用别名** 
*可添加到 ~/.bashrc | Can be added to ~/.bashrc*

```bash
# MCP Hybrid Project Aliases - MCP 混合项目别名
alias mcp-start='./start-hybrid.sh start'
alias mcp-stop='./start-hybrid.sh stop'
alias mcp-restart='./start-hybrid.sh restart'
alias mcp-status='./start-hybrid.sh status'
alias mcp-logs='./start-hybrid.sh logs'
alias mcp-test='./start-hybrid.sh test'

# Individual Service Aliases - 单独服务别名
alias mcp-http='npm start'
alias mcp-stdio='node src/mcp-server.js'
alias mcp-remote='node src/mcp-remote-server.js http'

# Quick Health Checks - 快速健康检查
alias mcp-health-http='curl -s http://localhost:29527/health | jq .'
alias mcp-health-mcp='curl -s http://localhost:29528/health | jq .'
alias mcp-health-all='curl -s http://localhost:29527/health && echo && curl -s http://localhost:29528/health'

# Development Aliases - 开发别名
alias mcp-dev='npm install && ./start-hybrid.sh start'
alias mcp-clean='./start-hybrid.sh stop && docker system prune -f'
```

## 🔑 **Authentication Management - 认证管理**
| 操作 Operation | 命令 Command | 说明 Description |
|------|------|------|
| **检查认证状态 Check auth status** | `grep -A 5 "api_key\|authenticat" config/config.json` | 查看配置中的认证设置 View auth settings in config |
| **验证无认证访问 Verify no-auth access** | `curl http://localhost:29527/health` | ✅ 应该无需认证成功 Should succeed without auth |
| **验证MCP无认证访问 Verify MCP no-auth access** | `curl http://localhost:29528/health` | ✅ 应该无需认证成功 Should succeed without auth |

## 📋 **Quick Reference - 快速参考**

### 🚨 **Emergency Commands - 紧急命令**
```bash
# 立即停止所有混合服务 Stop all hybrid services immediately
./start-hybrid.sh stop

# 立即停止所有容器 Stop all containers immediately
docker-compose down

# 强制删除所有相关进程 Force kill all related processes
pkill -f "node.*mcp" || true

# 查看系统资源 Check system resources
free -h && df -h

# 快速重启混合服务 Quick restart hybrid services
./start-hybrid.sh restart
```

### ✅ **Health Check Commands - 健康检查命令**
```bash
# 基础混合健康检查 Basic hybrid health check
./start-hybrid.sh test

# HTTP API健康检查 HTTP API health check
curl http://localhost:29527/health

# MCP HTTP健康检查 MCP HTTP health check
curl http://localhost:29528/health

# 完整状态检查 Complete status check
./start-hybrid.sh status

# 所有服务健康检查 All services health check
curl -s http://localhost:29527/health && echo && curl -s http://localhost:29528/health
```

### 🔧 **Development Commands - 开发命令**
```bash
# 安装依赖并启动开发环境 Install dependencies and start dev environment
npm install && ./start-hybrid.sh start

# 单独启动HTTP API开发 Start HTTP API development separately
npm run dev

# 单独启动MCP stdio开发 Start MCP stdio development separately
node src/mcp-server.js

# 单独启动MCP HTTP开发 Start MCP HTTP development separately
node src/mcp-remote-server.js http

# 查看实时日志开发 View real-time logs for development
tail -f logs/http-api.log logs/mcp-http.log
```

---

## 📝 **Usage Notes - 使用说明**

- 🎉 **无认证访问 No Auth Required**: 所有服务已移除认证要求，可直接访问
- 🚀 **无并发限制 No Concurrency Limits**: 支持无限数量的AI客户端同时连接
- 🔌 **端口说明 Port Information**: HTTP API使用29527端口，MCP HTTP使用29528端口
- 🛡️ **权限要求 Permission Requirements**: 某些命令需要 sudo 权限
- 💻 **系统兼容 System Compatibility**: 部分命令仅适用于 Linux 系统
- 📚 **更多帮助 More Help**: 使用 `./start-hybrid.sh help` 查看混合脚本帮助
- 🔧 **开发模式 Development Mode**: 可以单独启动各个服务进行开发和调试
- 📊 **监控建议 Monitoring Recommendations**: 建议使用 `./start-hybrid.sh status` 定期检查服务状态

### 🎯 **Three Access Methods - 三种访问方式**
1. **🌐 HTTP API**: `http://localhost:29527` - 传统REST API
2. **🔗 MCP HTTP**: `http://localhost:29528/mcp` - 远程MCP协议  
3. **💻 MCP stdio**: `node src/mcp-server.js` - 本地MCP协议

---

*最后更新 Last Updated: 2025-08-12 | 混合部署版 Hybrid Deployment Version*
```
