# 💻 Commands Reference - 指令速查表

> MCP Web Automation Tool 常用命令汇总 | Common commands for MCP Web Automation Tool

## 🚀 **Project Deployment - 项目部署**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `git clone https://github.com/hahaha8459812/mcp-web-automation.git` | 克隆项目 Clone project | 首次部署 First deployment |
| `git checkout feature/mcp-server-implementation` | 切换到MCP分支 Switch to MCP branch | 获取最新MCP功能 Get latest MCP features |
| `npm install` | 安装依赖 Install dependencies | 首次运行必需 Required for first run |
| `chmod +x start-mcp.sh` | 赋予MCP脚本执行权限 Grant execute permission | MCP服务必需 Required for MCP service |

## 🔧 **MCP Service Management - MCP服务管理**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `./start-mcp.sh stdio` | 启动stdio服务 Start stdio service | 前台运行，本地连接 Foreground, local connection |
| `./start-mcp.sh http` | 启动HTTP服务 Start HTTP service | 后台运行，远程连接 Background, remote connection |
| `./start-mcp.sh stop` | 停止MCP服务 Stop MCP services | 停止所有后台服务 Stop all background services |
| `./start-mcp.sh restart` | 重启HTTP服务 Restart HTTP service | 重启后台HTTP服务 Restart background HTTP service |
| `./start-mcp.sh status` | 查看服务状态 Check service status | 显示服务状态 Show service status |
| `./start-mcp.sh logs` | 查看服务日志 View service logs | 显示HTTP服务日志 Show HTTP service logs |
| `./start-mcp.sh test` | 测试服务 Test services | 自动测试MCP服务 Auto test MCP services |
| `./start-mcp.sh help` | 查看帮助 View help | 详细用法说明 Detailed usage instructions |

## 🛠️ **Direct Service Commands - 直接服务命令**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `node src/mcp-server.js` | 直接启动stdio服务 Direct start stdio service | 前台运行，调试用 Foreground, for debugging |
| `node src/mcp-remote-server.js stdio` | 启动stdio服务 Start stdio service | 等价于上面命令 Equivalent to above |
| `node src/mcp-remote-server.js http` | 启动HTTP服务 Start HTTP service | 前台运行HTTP服务 Foreground HTTP service |

## 📊 **System Monitoring - 系统监控**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `curl http://localhost:29528/health` | HTTP服务健康检查 HTTP service health check | 检查MCP HTTP服务 Check MCP HTTP service |
| `ps aux \| grep node` | 查看Node.js进程 View Node.js processes | 检查运行中的服务 Check running services |
| `lsof -i :29528` | 检查端口占用 Check port usage | MCP HTTP端口 MCP HTTP port |
| `free -h` | 查看内存使用 View memory usage | 系统资源监控 System resource monitoring |
| `df -h` | 查看磁盘使用 View disk usage | 存储空间监控 Storage monitoring |

## 🔍 **Process Management - 进程管理**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `pkill -f "mcp-remote-server"` | 强制停止MCP服务 Force stop MCP service | 紧急停止 Emergency stop |
| `pkill -f "mcp-server"` | 强制停止stdio服务 Force stop stdio service | 紧急停止 Emergency stop |
| `nohup command &` | 后台运行命令 Run command in background | 服务持久化 Service persistence |
| `jobs` | 查看后台任务 View background jobs | 当前会话任务 Current session jobs |

## 📁 **File Management - 文件管理**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `tail -f logs/mcp-http.log` | 实时查看HTTP日志 Follow HTTP logs | 持续输出 Continuous output |
| `tail -100 logs/mcp-http.log` | 查看最新100行日志 View last 100 lines | 最近日志 Recent logs |
| `cat logs/mcp-http.pid` | 查看进程ID View process ID | HTTP服务PID HTTP service PID |
| `ls -la data/` | 查看数据文件 View data files | 用户数据 User data |
| `ls -la logs/` | 查看日志文件 View log files | 服务日志 Service logs |

## ⚙️ **Configuration - 配置管理**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `cp mcp-config.example.json mcp-config.json` | 创建配置文件 Create config file | 首次配置 Initial configuration |
| `nano mcp-config.json` | 编辑MCP配置 Edit MCP config | 配置编辑 Configuration editing |
| `jq . mcp-config.json` | 验证JSON格式 Validate JSON format | 配置验证 Configuration validation |
| `mkdir -p data logs` | 创建必要目录 Create required directories | 目录初始化 Directory initialization |

## 🧪 **Testing & Debugging - 测试调试**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `NODE_ENV=development node src/mcp-server.js` | 开发模式启动 Start in development mode | 详细日志 Verbose logging |
| `DEBUG=* node src/mcp-remote-server.js http` | 调试模式启动 Start in debug mode | 调试信息 Debug information |
| `timeout 5s node src/mcp-server.js` | 限时测试stdio Testing stdio with timeout | 连接测试 Connection testing |

## 🔄 **Git Operations - Git操作**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `git status` | 查看git状态 Check git status | 文件状态 File status |
| `git pull origin feature/mcp-server-implementation` | 拉取最新代码 Pull latest code | 更新项目 Update project |
| `git log --oneline -10` | 查看提交历史 View commit history | 最近10次提交 Last 10 commits |

## 🛡️ **Security & Permissions - 安全权限**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `chmod +x start-mcp.sh` | 设置脚本执行权限 Set script execute permission | 脚本权限 Script permission |
| `chown -R user:user .` | 设置文件所有者 Set file ownership | 文件权限 File ownership |
| `umask 022` | 设置默认权限 Set default permissions | 安全设置 Security setting |

## 🚨 **Emergency Operations - 紧急操作**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `./start-mcp.sh stop && ./start-mcp.sh http` | 重启服务 Restart service | 快速重启 Quick restart |
| `pkill -f node && ./start-mcp.sh http` | 强制重启 Force restart | 彻底重启 Complete restart |
| `rm -f logs/*.pid` | 清理PID文件 Clean PID files | 清理残留 Clean residuals |
| `cp -r data data_backup_$(date +%Y%m%d)` | 备份数据 Backup data | 数据安全 Data safety |

## 📈 **Performance Monitoring - 性能监控**

| 命令 Command | 说明 Description | 备注 Notes |
|------|------|------|
| `top` | 查看系统性能 View system performance | 实时监控 Real-time monitoring |
| `htop` | 增强版性能监控 Enhanced performance monitoring | 需要安装 Requires installation |
| `iostat 1` | 磁盘IO监控 Disk I/O monitoring | 磁盘性能 Disk performance |
| `netstat -tlnp \| grep 29528` | 网络连接监控 Network connection monitoring | 端口监控 Port monitoring |

## 💡 **Common Issues - 常见问题**

| 问题 Issue | 命令 Command | 说明 Description |
|------|------|------|
| 端口被占用 Port occupied | `lsof -ti:29528 \| xargs kill -9` | 强制释放端口 Force release port |
| 服务启动失败 Service start failed | `./start-mcp.sh logs` | 查看错误日志 Check error logs |
| 配置文件错误 Config file error | `jq . mcp-config.json` | 验证JSON语法 Validate JSON syntax |
| 权限不足 Permission denied | `chmod +x start-mcp.sh` | 设置执行权限 Set execute permission |
| 依赖缺失 Dependencies missing | `npm install` | 重新安装依赖 Reinstall dependencies |

---

## 📚 **Quick Start Sequence - 快速启动序列**

```bash
# 1. 克隆项目
git clone https://github.com/hahaha8459812/mcp-web-automation.git
cd mcp-web-automation-tool

# 2. 切换分支
git checkout feature/mcp-server-implementation

# 3. 安装依赖
npm install

# 4. 创建配置
cp mcp-config.example.json mcp-config.json

# 5. 启动服务
chmod +x start-mcp.sh
./start-mcp.sh http

# 6. 验证服务
./start-mcp.sh status
curl http://localhost:29528/health
```

---

**💡 Tip**: 使用 `./start-mcp.sh help` 查看所有可用选项和详细说明。
```
