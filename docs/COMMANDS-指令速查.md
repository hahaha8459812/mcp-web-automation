# 💻 Commands Reference - 指令速查表

> 项目开发和维护常用命令汇总 | Common commands for project development and maintenance

## 🚀 **Project Deployment - 项目部署**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `git clone https://github.com/hahaha8459812/mcp-web-automation.git` | 克隆项目 Clone project | 首次部署 First deployment |
| `chmod +x scripts/install.sh` | 赋予安装脚本执行权限 Grant execute permission | Linux必需 Required for Linux |
| `./scripts/install.sh` | 一键安装部署 One-click installation | 自动化安装 Automated installation |
| `chmod +x scripts/start.sh` | 赋予启动脚本执行权限 Grant execute permission | Linux必需 Required for Linux |

## 🔧 **Service Management - 服务管理**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `./scripts/start.sh start` | 启动服务 Start service | - |
| `./scripts/start.sh stop` | 停止服务 Stop service | - |
| `./scripts/start.sh restart` | 重启服务 Restart service | - |
| `./scripts/start.sh status` | 查看服务状态 Check service status | 显示容器状态和资源使用 Show container status and resource usage |
| `./scripts/start.sh logs` | 查看日志 View logs | 显示最近50行 Show last 50 lines |
| `./scripts/start.sh logs -f` | 实时查看日志 Follow logs | 持续输出 Continuous output |
| `./scripts/start.sh health` | 健康检查 Health check | 测试API响应 Test API response |
| `./scripts/start.sh backup` | 备份用户数据 Backup user data | 自动打包 Auto archive |
| `./scripts/start.sh update` | 更新服务 Update service | 重新构建并启动 Rebuild and restart |
| `./scripts/start.sh cleanup` | 清理资源 Cleanup resources | 删除无用容器镜像 Remove unused containers/images |

## 🐳 **Docker Native Commands - Docker 原生命令**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `docker-compose up -d` | 后台启动服务 Start service in background | - |
| `docker-compose down` | 停止并删除容器 Stop and remove containers | - |
| `docker-compose ps` | 查看容器状态 View container status | - |
| `docker-compose logs -f` | 查看实时日志 Follow logs | - |
| `docker-compose build --no-cache` | 重新构建镜像 Rebuild images | 强制重建 Force rebuild |
| `docker-compose restart` | 重启容器 Restart containers | - |
| `docker system prune -f` | 清理无用资源 Prune unused resources | 慎用 Use carefully |
| `docker stats` | 查看容器资源使用 View container resource usage | 实时监控 Real-time monitoring |

## 🌐 **API Testing Commands - API 测试命令**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `curl http://localhost:29527/health` | 健康检查 Health check | 无需认证 No auth required |
| `curl -H "X-API-Key: YOUR_KEY" http://localhost:29527/health` | 带认证的健康检查 Authenticated health check | 替换YOUR_KEY Replace YOUR_KEY |
| `curl http://localhost:29527/` | 查看API文档 View API docs | 无需认证 No auth required |
| `curl -X POST -H "Content-Type: application/json" -H "X-API-Key: YOUR_KEY" -d '{"url":"https://example.com","client_id":"test"}' http://localhost:29527/api/navigate` | 测试页面导航 Test navigation | 替换YOUR_KEY Replace YOUR_KEY |
| `curl -H "X-API-Key: YOUR_KEY" "http://localhost:29527/api/content?client_id=test&selector=title"` | 测试内容提取 Test content extraction | 替换YOUR_KEY Replace YOUR_KEY |
| `curl -H "X-API-Key: YOUR_KEY" "http://localhost:29527/api/screenshot?client_id=test" --output screenshot.png` | 测试截图下载 Test screenshot download | 替换YOUR_KEY Replace YOUR_KEY |

## 📁 **File Operations - 文件操作**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `cp config/config.example.json config/config.json` | 复制配置文件 Copy config file | 首次配置 Initial setup |
| `vim config/config.json` | 编辑配置文件 Edit config file | 或用其他编辑器 Or use other editors |
| `cat config/config.json` | 查看配置文件 View config file | - |
| `ls -la data/` | 查看数据目录 List data directory | - |
| `tail -f logs/mcp-web-automation.log` | 查看日志文件 View log file | 如果启用文件日志 If file logging enabled |
| `du -sh *` | 查看目录大小 Check directory size | 检查磁盘使用 Check disk usage |

## 🔍 **Troubleshooting - 故障排查**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `docker-compose logs --tail=100` | 查看最近100行日志 View last 100 log lines | 故障诊断 Fault diagnosis |
| `docker inspect mcp-web-automation` | 查看容器详细信息 Inspect container details | 高级调试 Advanced debugging |
| `netstat -tulnp \| grep 29527` | 检查端口占用 Check port usage | Linux |
| `ss -tulnp \| grep 29527` | 检查端口占用 Check port usage | 现代Linux Modern Linux |
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

## 📊 **Monitoring Commands - 监控命令**
| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `watch docker-compose ps` | 实时查看容器状态 Watch container status | 每2秒刷新 Refresh every 2s |
| `watch 'curl -s http://localhost:29527/health'` | 实时监控API健康状态 Monitor API health | 每2秒请求 Request every 2s |
| `htop` | 查看系统资源使用 View system resource usage | 需要安装htop Requires htop |
| `iotop` | 查看磁盘IO View disk IO | 需要安装iotop Requires iotop |

## 🔄 **Common Combined Operations - 常用组合操作**
| 操作 Operation | 命令组合 Command Combination | 说明 Description |
|------|----------|------|
| **完全重新部署 Complete redeployment** | `docker-compose down && docker-compose build --no-cache && docker-compose up -d` | 停止→重建→启动 Stop→Rebuild→Start |
| **查看最新日志并持续监控 View recent logs and monitor** | `docker-compose logs --tail=20 -f` | 显示最近20行并持续输出 Show last 20 lines and follow |
| **备份后更新 Backup then update** | `./scripts/start.sh backup && ./scripts/start.sh update` | 安全更新 Safe update |
| **故障完整检查 Complete troubleshooting check** | `./scripts/start.sh status && docker-compose logs --tail=50` | 状态+日志 Status + logs |

## 💡 **Useful Aliases - 实用别名** 
*可添加到 ~/.bashrc | Can be added to ~/.bashrc*

```bash
# MCP Project Aliases - MCP 项目别名
alias mcp-start='./scripts/start.sh start'
alias mcp-stop='./scripts/start.sh stop'
alias mcp-restart='./scripts/start.sh restart'
alias mcp-status='./scripts/start.sh status'
alias mcp-logs='./scripts/start.sh logs -f'
alias mcp-health='curl -H "X-API-Key: YOUR_API_KEY" http://localhost:29527/health'
alias mcp-backup='./scripts/start.sh backup'
alias mcp-update='./scripts/start.sh update'
```

## 🔑 **API Key Management - API密钥管理**
| 操作 Operation | 命令 Command | 说明 Description |
|------|------|------|
| **生成随机密钥 Generate random key** | `openssl rand -base64 32 \| tr -d "=+/" \| cut -c1-32` | 32位随机字符串 32-char random string |
| **查看当前密钥 View current key** | `grep -o '"api_key": *"[^"]*"' config/config.json \| cut -d '"' -f4` | 从配置文件提取 Extract from config |
| **替换密钥 Replace key** | `sed -i 's/OLD_KEY/NEW_KEY/g' config/config.json` | 替换OLD_KEY和NEW_KEY Replace OLD_KEY and NEW_KEY |

## 📋 **Quick Reference - 快速参考**

### 🚨 **Emergency Commands - 紧急命令**
```bash
# 立即停止所有容器 Stop all containers immediately
docker-compose down

# 强制删除所有相关容器 Force remove all related containers
docker rm -f $(docker ps -aq --filter "name=mcp")

# 查看系统资源 Check system resources
free -h && df -h

# 快速重启 Quick restart
./scripts/start.sh restart
```

### ✅ **Health Check Commands - 健康检查命令**
```bash
# 基础健康检查 Basic health check
curl http://localhost:29527/health

# 带认证的健康检查 Authenticated health check
curl -H "X-API-Key: $(grep -o '"api_key": *"[^"]*"' config/config.json | cut -d '"' -f4)" http://localhost:29527/health

# 完整状态检查 Complete status check
./scripts/start.sh status && ./scripts/start.sh health
```

---

## 📝 **Usage Notes - 使用说明**

- 🔑 **替换密钥 Replace Keys**: 将 `YOUR_KEY` 和 `YOUR_API_KEY` 替换为实际的API密钥
- 🔌 **端口修改 Port Changes**: 如果修改了端口，请更新命令中的端口号
- 🛡️ **权限要求 Permission Requirements**: 某些命令需要 sudo 权限
- 💻 **系统兼容 System Compatibility**: 部分命令仅适用于 Linux 系统
- 📚 **更多帮助 More Help**: 使用 `./scripts/start.sh help` 查看脚本帮助

---

*最后更新 Last Updated: 2024-01-01*
```
