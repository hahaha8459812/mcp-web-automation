#!/bin/bash

# MCP Web Automation Tool - 一键安装脚本
# 自动检查环境、配置和启动服务
# 
# @author hahaha8459812
# @version 1.0.0

set -e  # 遇到错误时退出

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
DEFAULT_PORT=29527

# 显示横幅
show_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║    🤖 MCP Web Automation Tool v${PROJECT_VERSION}                     ║"
    echo "║                                                              ║"
    echo "║    轻量级 MCP (Model Context Protocol) 网页自动化工具          ║"
    echo "║    一键部署脚本 - 快速启动您的自动化服务                        ║"
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        return 1
    fi
    return 0
}

# 检查系统环境
check_system() {
    log_step "检查系统环境..."
    
    # 检查操作系统
    OS="$(uname -s)"
    case "${OS}" in
        Linux*)     OS_TYPE=Linux;;
        Darwin*)    OS_TYPE=Mac;;
        *)          OS_TYPE="UNKNOWN:${OS}"
    esac
    
    if [ "$OS_TYPE" != "Linux" ]; then
        log_warn "检测到非Linux系统: $OS_TYPE"
        log_warn "该脚本主要为Linux系统设计，其他系统可能需要手动配置"
    else
        log_info "✅ 系统类型: $OS_TYPE"
    fi
    
    # 检查内存
    if [ -f /proc/meminfo ]; then
        TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        TOTAL_MEM_GB=$((TOTAL_MEM / 1024 / 1024))
        
        if [ $TOTAL_MEM_GB -lt 2 ]; then
            log_warn "⚠️  系统内存: ${TOTAL_MEM_GB}GB (建议至少2GB)"
            log_warn "   低内存环境可能影响性能"
        else
            log_info "✅ 系统内存: ${TOTAL_MEM_GB}GB"
        fi
    fi
    
    # 检查磁盘空间
    DISK_AVAIL=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ $DISK_AVAIL -lt 2 ]; then
        log_warn "⚠️  可用磁盘空间: ${DISK_AVAIL}GB (建议至少2GB)"
    else
        log_info "✅ 可用磁盘空间: ${DISK_AVAIL}GB"
    fi
}

# 检查 Docker
check_docker() {
    log_step "检查 Docker 环境..."
    
    if ! check_command docker; then
        log_error "❌ Docker 未安装！"
        log_info "请先安装 Docker，参考: https://docs.docker.com/get-docker/"
        log_info ""
        log_info "Ubuntu/Debian 快速安装命令:"
        log_info "  curl -fsSL https://get.docker.com -o get-docker.sh"
        log_info "  sudo sh get-docker.sh"
        log_info "  sudo usermod -aG docker \$USER"
        exit 1
    fi
    
    # 检查 Docker 版本
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    log_info "✅ Docker 版本: $DOCKER_VERSION"
    
    # 检查 Docker 守护进程
    if ! docker info >/dev/null 2>&1; then
        log_error "❌ Docker 守护进程未运行！"
        log_info "请启动 Docker 守护进程:"
        log_info "  sudo systemctl start docker"
        log_info "  sudo systemctl enable docker"
        exit 1
    fi
    
    log_info "✅ Docker 守护进程运行正常"
    
    # 检查 Docker Compose
    if check_command docker-compose; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f3 | cut -d ',' -f1)
        log_info "✅ Docker Compose 版本: $COMPOSE_VERSION"
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version --short)
        log_info "✅ Docker Compose (内置) 版本: $COMPOSE_VERSION"
        # 创建别名以兼容
        alias docker-compose='docker compose'
    else
        log_error "❌ Docker Compose 未找到！"
        log_info "请安装 Docker Compose"
        exit 1
    fi
}

# 检查端口占用
check_port() {
    log_step "检查端口占用..."
    
    if command -v ss >/dev/null 2>&1; then
        if ss -tuln | grep -q ":$DEFAULT_PORT "; then
            log_warn "⚠️  端口 $DEFAULT_PORT 已被占用"
            log_info "请检查并关闭占用端口的程序，或修改配置文件中的端口号"
            
            # 显示占用端口的进程
            log_info "占用端口的进程信息:"
            ss -tulnp | grep ":$DEFAULT_PORT " || true
            
            read -p "是否继续安装? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "安装已取消"
                exit 1
            fi
        else
            log_info "✅ 端口 $DEFAULT_PORT 可用"
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tuln | grep -q ":$DEFAULT_PORT "; then
            log_warn "⚠️  端口 $DEFAULT_PORT 已被占用"
            # 类似处理...
        else
            log_info "✅ 端口 $DEFAULT_PORT 可用"
        fi
    else
        log_warn "⚠️  无法检查端口占用（缺少 ss 或 netstat 命令）"
    fi
}

# 创建配置文件
setup_config() {
    log_step "设置配置文件..."
    
    # 检查配置文件是否存在
    if [ -f "config/config.json" ]; then
        log_info "✅ 配置文件 config/config.json 已存在"
        
        # 检查是否为默认API密钥
        if grep -q "mcp-demo-key-change-me-in-production" "config/config.json"; then
            log_warn "⚠️  检测到默认 API 密钥，建议修改！"
            
            # 生成随机API密钥
            if check_command openssl; then
                NEW_API_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
                log_info "💡 建议使用以下随机生成的 API 密钥:"
                echo -e "${CYAN}$NEW_API_KEY${NC}"
                echo
                
                read -p "是否自动替换为新的 API 密钥? (Y/n): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                    # 备份原配置文件
                    cp config/config.json config/config.json.backup
                    
                    # 替换API密钥
                    sed -i "s/mcp-demo-key-change-me-in-production/$NEW_API_KEY/g" config/config.json
                    log_info "✅ API 密钥已更新"
                    log_info "原配置文件备份为: config/config.json.backup"
                fi
            else
                log_info "💡 请手动修改 config/config.json 中的 api_key"
            fi
        fi
    else
        if [ -f "config/config.example.json" ]; then
            log_info "📁 复制配置文件模板..."
            cp config/config.example.json config/config.json
            
            # 生成随机API密钥
            if check_command openssl; then
                NEW_API_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
                sed -i "s/mcp-demo-key-change-me-in-production/$NEW_API_KEY/g" config/config.json
                log_info "✅ 配置文件已创建并设置随机 API 密钥"
                log_info "🔑 您的 API 密钥: $NEW_API_KEY"
                echo -e "${YELLOW}请妥善保管此密钥！${NC}"
            else
                log_info "✅ 配置文件已创建"
                log_warn "⚠️  请手动修改 config/config.json 中的 api_key"
            fi
        else
            log_error "❌ 未找到配置文件模板 config/config.example.json"
            exit 1
        fi
    fi
    
    # 确保 data 目录存在
    if [ ! -d "data" ]; then
        mkdir -p data
        log_info "📁 创建数据目录: data/"
    fi
    
    # 确保 logs 目录存在
    if [ ! -d "logs" ]; then
        mkdir -p logs
        log_info "📁 创建日志目录: logs/"
    fi
}

# 构建和启动服务
start_service() {
    log_step "构建和启动服务..."
    
    # 停止可能存在的旧容器
    log_info "🛑 停止旧容器..."
    docker-compose down >/dev/null 2>&1 || true
    
    # 构建镜像
    log_info "🔨 构建 Docker 镜像..."
    if docker-compose build --no-cache; then
        log_info "✅ 镜像构建完成"
    else
        log_error "❌ 镜像构建失败"
        exit 1
    fi
    
    # 启动服务
    log_info "🚀 启动服务..."
    if docker-compose up -d; then
        log_info "✅ 服务启动成功"
    else
        log_error "❌ 服务启动失败"
        exit 1
    fi
    
    # 等待服务启动
    log_info "⏳ 等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_info "✅ 服务运行正常"
    else
        log_error "❌ 服务启动异常"
        log_info "查看日志:"
        docker-compose logs --tail=20
        exit 1
    fi
}

# 健康检查
health_check() {
    log_step "健康检查..."
    
    local max_attempts=12
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "检查服务健康状态 (${attempt}/${max_attempts})..."
        
        if curl -s http://localhost:$DEFAULT_PORT/health >/dev/null 2>&1; then
            log_info "✅ 服务健康检查通过"
            return 0
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log_warn "⚠️  健康检查超时，但服务可能仍在启动中"
    log_info "请稍后手动检查: curl http://localhost:$DEFAULT_PORT/health"
    return 1
}

# 显示完成信息
show_completion() {
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║  🎉 ${PROJECT_NAME} 安装完成！                    ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    # 获取 API 密钥
    API_KEY="未设置"
    if [ -f "config/config.json" ]; then
        API_KEY=$(grep -o '"api_key": *"[^"]*"' config/config.json | cut -d '"' -f4)
    fi
    
    log_info "🌐 服务地址: http://localhost:$DEFAULT_PORT"
    log_info "🔑 API 密钥: $API_KEY"
    log_info "📖 API 文档: http://localhost:$DEFAULT_PORT/"
    log_info "❤️  健康检查: http://localhost:$DEFAULT_PORT/health"
    echo
    
    log_info "📋 常用命令:"
    echo -e "  查看服务状态: ${CYAN}docker-compose ps${NC}"
    echo -e "  查看服务日志: ${CYAN}docker-compose logs -f${NC}"
    echo -e "  停止服务:     ${CYAN}docker-compose down${NC}"
    echo -e "  重启服务:     ${CYAN}docker-compose restart${NC}"
    echo
    
    log_info "🔧 AI 客户端配置:"
    echo -e "  服务器地址: ${CYAN}http://$(hostname -I | awk '{print $1}'):$DEFAULT_PORT${NC}"
    echo -e "  API 密钥:   ${CYAN}$API_KEY${NC}"
    echo -e "  认证方式:   ${CYAN}X-API-Key Header${NC}"
    echo
    
    log_info "💡 如需外网访问，请确保防火墙已开放端口 $DEFAULT_PORT"
    
    # 提供快速测试命令
    echo -e "${YELLOW}快速测试命令:${NC}"
    echo -e "${CYAN}curl -H \"X-API-Key: $API_KEY\" http://localhost:$DEFAULT_PORT/health${NC}"
    echo
}

# 主函数
main() {
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
        log_error "❌ 请在项目根目录运行此脚本！"
        log_info "当前目录: $(pwd)"
        log_info "请确保存在 package.json 和 docker-compose.yml 文件"
        exit 1
    fi
    
    show_banner
    
    log_info "开始安装 $PROJECT_NAME v$PROJECT_VERSION"
    echo
    
    check_system
    echo
    
    check_docker
    echo
    
    check_port
    echo
    
    setup_config
    echo
    
    start_service
    echo
    
    if health_check; then
        echo
        show_completion
    else
        echo
        log_warn "安装完成，但健康检查未通过"
        log_info "服务可能仍在启动中，请稍后检查"
        show_completion
    fi
}

# 错误处理
trap 'log_error "脚本执行失败，行号: $LINENO"' ERR

# 执行主函数
main "$@"
