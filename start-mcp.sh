#!/bin/bash

# MCP Web Automation Tool - 启动脚本
# 专注于MCP协议的Web自动化工具

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="MCP Web Automation Tool"
PROJECT_VERSION="1.0.0"
MCP_HTTP_PORT=29528

# 显示横幅
show_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║    🚀 MCP Web Automation Tool v${PROJECT_VERSION}                   ║"
    echo "║                                                              ║"
    echo "║    📡 Model Context Protocol Web自动化工具                  ║"
    echo "║    支持本地stdio和远程HTTP连接                                ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 打印日志信息
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境
check_environment() {
    log_info "🔍 检查运行环境..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    log_info "✅ Node.js 版本: $NODE_VERSION"
    
    # 检查npm依赖
    if [ ! -d "node_modules" ]; then
        log_warn "⚠️  依赖未安装，正在安装..."
        npm install
    fi
    
    # 检查配置文件
    if [ ! -f "mcp-config.json" ]; then
        log_warn "⚠️  MCP配置文件不存在，正在创建..."
        cp mcp-config.example.json mcp-config.json 2>/dev/null || echo '{"server":{"name":"web-automation","version":"1.0.0"},"capabilities":{"tools":7},"http":{"port":29528,"host":"0.0.0.0"}}' > mcp-config.json
    fi
    
    # 创建必要目录
    mkdir -p data logs
    
    log_info "✅ 环境检查完成"
}

# 启动MCP HTTP服务器
start_mcp_http() {
    log_info "🔗 启动MCP HTTP服务器 (端口 ${MCP_HTTP_PORT})..."
    
    # 检查端口是否被占用
    if lsof -Pi :${MCP_HTTP_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "⚠️  端口 ${MCP_HTTP_PORT} 已被占用，尝试停止现有进程..."
        pkill -f "node.*mcp-remote-server.js.*http" || true
        sleep 2
    fi
    
    # 启动MCP HTTP服务器
    nohup node src/mcp-remote-server.js http > logs/mcp-http.log 2>&1 &
    MCP_HTTP_PID=$!
    
    # 等待启动
    sleep 3
    
    # 验证启动
    if curl -s http://localhost:${MCP_HTTP_PORT}/health > /dev/null; then
        log_info "✅ MCP HTTP服务器启动成功 (PID: ${MCP_HTTP_PID})"
        echo ${MCP_HTTP_PID} > logs/mcp-http.pid
    else
        log_error "❌ MCP HTTP服务器启动失败"
        return 1
    fi
}

# 启动MCP stdio服务器
start_mcp_stdio() {
    log_info "💻 启动MCP stdio服务器..."
    
    # 直接运行stdio服务器（前台运行）
    node src/mcp-server.js
}

# 显示服务状态
show_status() {
    echo ""
    log_info "🎯 MCP服务状态概览:"
    echo ""
    
    # MCP HTTP状态
    if curl -s http://localhost:${MCP_HTTP_PORT}/health > /dev/null; then
        echo -e "${GREEN}✅ MCP HTTP服务器${NC} - http://localhost:${MCP_HTTP_PORT}"
        echo -e "   🔗 MCP连接端点: http://localhost:${MCP_HTTP_PORT}/mcp"
        echo -e "   ❤️  健康检查: http://localhost:${MCP_HTTP_PORT}/health"
        echo -e "   🌐 远程访问: 支持任何设备连接"
    else
        echo -e "${RED}❌ MCP HTTP服务器${NC} - 未运行"
    fi
    
    echo ""
    
    # MCP stdio状态
    echo -e "${YELLOW}📡 MCP stdio服务器${NC} - 本地连接："
    echo -e "   💻 启动命令: ./start-mcp.sh stdio"
    echo -e "   🔧 AI客户端: 配置stdio连接到 node src/mcp-server.js"
    
    echo ""
    log_info "🎉 MCP Web Automation Tool 已就绪！"
    echo ""
    echo -e "${BLUE}🔗 远程MCP连接:${NC}"
    echo "   连接到 http://your-server:${MCP_HTTP_PORT}/mcp"
    echo ""
    echo -e "${BLUE}💻 本地MCP连接:${NC}"
    echo "   运行: node src/mcp-server.js"
    echo ""
}

# 停止所有服务
stop_services() {
    log_info "🛑 停止MCP服务..."
    
    # 停止MCP HTTP
    if [ -f logs/mcp-http.pid ]; then
        MCP_HTTP_PID=$(cat logs/mcp-http.pid)
        if kill -0 $MCP_HTTP_PID 2>/dev/null; then
            kill $MCP_HTTP_PID
            log_info "✅ MCP HTTP服务器已停止"
        fi
        rm -f logs/mcp-http.pid
    fi
    
    # 清理其他可能的进程
    pkill -f "node.*mcp-remote-server.js" || true
    pkill -f "node.*mcp-server.js" || true
    
    log_info "✅ 所有MCP服务已停止"
}

# 重启服务
restart_services() {
    log_info "🔄 重启MCP服务..."
    stop_services
    sleep 2
    start_mcp_http
    show_status
}

# 查看日志
show_logs() {
    echo -e "${BLUE}📋 MCP服务日志:${NC}"
    echo ""
    
    if [ -f logs/mcp-http.log ]; then
        echo -e "${GREEN}=== MCP HTTP日志 ===${NC}"
        tail -20 logs/mcp-http.log
        echo ""
    fi
}

# 测试MCP服务
test_services() {
    log_info "🧪 测试MCP服务..."
    
    # 测试MCP HTTP
    echo -e "${BLUE}测试MCP HTTP...${NC}"
    if curl -s http://localhost:${MCP_HTTP_PORT}/health | python3 -c "import sys,json; print('✅ 健康检查通过'); print('服务信息:', json.load(sys.stdin)['message'])" 2>/dev/null; then
        echo -e "${GREEN}✅ MCP HTTP服务正常${NC}"
    else
        echo -e "${RED}❌ MCP HTTP服务异常${NC}"
    fi
    
    # 测试MCP stdio
    echo -e "${BLUE}测试MCP stdio...${NC}"
    timeout 3s node src/mcp-server.js &> /dev/null && echo -e "${GREEN}✅ MCP stdio正常${NC}" || echo -e "${YELLOW}⚠️  MCP stdio需要手动测试${NC}"
}

# 显示使用说明
show_usage() {
    echo -e "${BLUE}用法: $0 [选项]${NC}"
    echo ""
    echo "选项:"
    echo "  http      启动MCP HTTP服务器（后台运行）"
    echo "  stdio     启动MCP stdio服务器（前台运行）"
    echo "  stop      停止所有MCP服务"
    echo "  restart   重启MCP HTTP服务"
    echo "  status    查看服务状态"
    echo "  logs      查看服务日志"
    echo "  test      测试所有服务"
    echo "  help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 http     # 启动HTTP MCP服务器"
    echo "  $0 stdio    # 启动stdio MCP服务器"
    echo "  $0 status   # 查看状态"
    echo ""
    echo -e "${YELLOW}注意: 大多数AI客户端推荐使用stdio模式${NC}"
}

# 信号处理
cleanup() {
    echo ""
    log_info "🔄 接收到退出信号，正在清理..."
    stop_services
    exit 0
}

trap cleanup SIGINT SIGTERM

# 主函数
main() {
    show_banner
    
    case "${1:-help}" in
        "http")
            check_environment
            start_mcp_http
            show_status
            ;;
        "stdio")
            check_environment
            start_mcp_stdio
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            check_environment
            restart_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "test")
            test_services
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            log_error "未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"