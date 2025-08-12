#!/bin/bash

# MCP Web Automation Tool - 启动脚本
# 启动符合Model Context Protocol的AI工具服务

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

# 显示横幅
show_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║    🤖 MCP Web Automation Tool v${PROJECT_VERSION}                     ║"
    echo "║                                                              ║"
    echo "║    Model Context Protocol 网页自动化工具                       ║"
    echo "║    为 AI 助手提供标准化的网页交互能力                            ║"
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
    if [ ! -f "config/config.json" ]; then
        log_warn "⚠️  配置文件不存在，正在创建..."
        cp config/config.example.json config/config.json
    fi
    
    # 创建必要目录
    mkdir -p data logs
    
    log_info "✅ 环境检查完成"
}

# 启动MCP服务器
start_mcp_server() {
    log_info "🚀 启动 MCP Web Automation Server..."
    
    # 设置环境变量
    export NODE_ENV=production
    export MCP_SERVER=true
    
    # 启动MCP服务器
    node src/mcp-server.js
}

# 测试MCP连接
test_mcp_connection() {
    log_info "🧪 测试 MCP 连接..."
    
    # 创建测试脚本
    cat > /tmp/mcp_test.js << 'EOF'
const { spawn } = require('child_process');

const server = spawn('node', ['src/mcp-server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

// 发送初始化请求
const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {
            tools: {}
        },
        clientInfo: {
            name: "test-client",
            version: "1.0.0"
        }
    }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

// 发送工具列表请求
setTimeout(() => {
    const toolsRequest = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {}
    };
    server.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 1000);

server.stdout.on('data', (data) => {
    try {
        const response = JSON.parse(data.toString());
        console.log('📨 MCP Response:', JSON.stringify(response, null, 2));
        
        if (response.id === 2 && response.result && response.result.tools) {
            console.log('✅ MCP服务器正常工作，工具数量:', response.result.tools.length);
            server.kill();
            process.exit(0);
        }
    } catch (e) {
        // 忽略解析错误
    }
});

server.stderr.on('data', (data) => {
    console.error('❌ Server Error:', data.toString());
});

setTimeout(() => {
    console.log('⏰ 测试超时');
    server.kill();
    process.exit(1);
}, 10000);
EOF

    node /tmp/mcp_test.js
    rm /tmp/mcp_test.js
}

# 显示使用说明
show_usage() {
    echo -e "${BLUE}用法: $0 [选项]${NC}"
    echo ""
    echo "选项:"
    echo "  start     启动 MCP 服务器"
    echo "  test      测试 MCP 连接"
    echo "  help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start    # 启动服务器"
    echo "  $0 test     # 测试连接"
    echo ""
    echo -e "${YELLOW}注意: 此脚本启动的是符合 MCP 协议的服务器，用于 AI 客户端集成${NC}"
}

# 主函数
main() {
    show_banner
    
    case "${1:-start}" in
        "start")
            check_environment
            start_mcp_server
            ;;
        "test")
            check_environment
            test_mcp_connection
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