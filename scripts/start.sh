#!/bin/bash

# MCP Web Automation Tool - 启动脚本
# 用于启动、停止和管理服务
# 
# @author hahaha8459812
# @version 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="MCP Web Automation Tool"
DEFAULT_PORT=29527

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

# 显示帮助信息
show_help() {
    echo -e "${CYAN}$PROJECT_NAME - 启动脚本${NC}"
    echo
    echo "用法: $0 [命令]"
    echo
    echo "可用命令:"
    echo -e "  ${GREEN}start${NC}     启动服务"
    echo -e "  ${GREEN}stop${NC}      停止服务"
    echo -e "  ${GREEN}restart${NC}   重启服务"
    echo -e "  ${GREEN}status${NC}    查看服务状态"
    echo -e "  ${GREEN}logs${NC}      查看服务日志"
    echo -e "  ${GREEN}update${NC}    更新并重启服务"
    echo -e "  ${GREEN}health${NC}    健康检查"
    echo -e "  ${GREEN}cleanup${NC}   清理旧容器和镜像"
    echo -e "  ${GREEN}backup${NC}    备份用户数据"
    echo -e "  ${GREEN}help${NC}      显示此帮助信息"
    echo
    echo "示例:"
    echo -e "  $0 start          # 启动服务"
    echo -e "  $0 logs -f        # 实时查看日志"
    echo -e "  $0 restart        # 重启服务"
    echo
}

# 检查 Docker
check_docker() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
        log_error "Docker Compose 未找到！请先安装 Docker 和 Docker Compose"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker 守护进程未运行！请启动 Docker"
        exit 1
    fi
}

# 检查项目目录
check_project() {
    if [ ! -f "docker-compose.yml" ]; then
        log_error "未找到 docker-compose.yml 文件，请在项目根目录运行此脚本"
        exit 1
    fi
}

# 启动服务
start_service() {
    log_info "启动 $PROJECT_NAME..."
    
    # 检查配置文件
    if [ ! -f "config/config.json" ]; then
        log_warn "配置文件不存在，从模板创建..."
        if [ -f "config/config.example.json" ]; then
            cp config/config.example.json config/config.json
            log_warn "⚠️  请修改 config/config.json 中的 API 密钥"
        else
            log_error "配置文件模板不存在！"
            exit 1
        fi
    fi
    
    # 启动容器
    docker-compose up -d
    
    log_info "✅ 服务启动完成"
    log_info "🌐 访问地址: http://localhost:$DEFAULT_PORT"
    
    # 等待服务启动并检查状态
    sleep 5
    show_status
}

# 停止服务
stop_service() {
    log_info "停止 $PROJECT_NAME..."
    docker-compose down
    log_info "✅ 服务已停止"
}

# 重启服务
restart_service() {
    log_info "重启 $PROJECT_NAME..."
    docker-compose restart
    log_info "✅ 服务已重启"
    
    # 等待服务启动并检查状态
    sleep 5
    show_status
}

# 显示服务状态
show_status() {
    echo
    log_info "服务状态:"
    docker-compose ps
    
    echo
    log_info "容器资源使用情况:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" $(docker-compose ps -q) 2>/dev/null || log_warn "无法获取资源使用情况"
    
    # 检查服务是否响应
    echo
    if curl -s http://localhost:$DEFAULT_PORT/health >/dev/null 2>&1; then
        log_info "✅ 服务运行正常"
        
        # 获取API密钥并显示访问信息
        if [ -f "config/config.json" ]; then
            API_KEY=$(grep -o '"api_key": *"[^"]*"' config/config.json | cut -d '"' -f4)
            log_info "🔑 API 密钥: $API_KEY"
            log_info "🧪 测试命令: curl -H \"X-API-Key: $API_KEY\" http://localhost:$DEFAULT_PORT/health"
        fi
    else
        log_warn "⚠️  服务可能未正常启动"
    fi
}

# 查看日志
show_logs() {
    local args="$*"
    if [ -z "$args" ]; then
        args="--tail=50"
    fi
    
    log_info "查看服务日志..."
    docker-compose logs $args
}

# 更新服务
update_service() {
    log_info "更新 $PROJECT_NAME..."
    
    # 备份用户数据
    backup_data
    
    # 停止服务
    docker-compose down
    
    # 重新构建镜像
    log_info "重新构建镜像..."
    docker-compose build --no-cache
    
    # 启动服务
    docker-compose up -d
    
    log_info "✅ 服务更新完成"
    
    # 等待服务启动并检查状态
    sleep 5
    show_status
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    if curl -s http://localhost:$DEFAULT_PORT/health; then
        echo
        log_info "✅ 健康检查通过"
    else
        log_error "❌ 健康检查失败"
        log_info "请检查服务状态:"
        docker-compose ps
        return 1
    fi
}

# 清理资源
cleanup_resources() {
    log_info "清理无用的容器和镜像..."
    
    read -p "这将删除所有停止的容器和无用的镜像，确定继续吗？(y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 清理停止的容器
        docker container prune -f
        
        # 清理无用的镜像
        docker image prune -f
        
        # 清理无用的网络
        docker network prune -f
        
        # 清理无用的数据卷
        docker volume prune -f
        
        log_info "✅ 清理完成"
        
        # 显示磁盘使用情况
        echo
        log_info "Docker 磁盘使用情况:"
        docker system df
    else
        log_info "清理操作已取消"
    fi
}

# 备份用户数据
backup_data() {
    local backup_dir="backups"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="${backup_dir}/backup_${timestamp}.tar.gz"
    
    log_info "备份用户数据..."
    
    # 创建备份目录
    mkdir -p "$backup_dir"
    
    # 备份数据和配置文件
    tar -czf "$backup_file" data/ config/ logs/ 2>/dev/null || {
        log_warn "部分文件备份失败，继续进行..."
        tar -czf "$backup_file" --ignore-failed-read data/ config/ logs/ 2>/dev/null || true
    }
    
    if [ -f "$backup_file" ]; then
        log_info "✅ 备份完成: $backup_file"
        
        # 只保留最近10个备份文件
        ls -t ${backup_dir}/backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
        log_info "📁 备份文件清理完成（保留最近10个备份）"
    else
        log_error "❌ 备份失败"
        return 1
    fi
}

# 显示系统信息
show_system_info() {
    log_info "系统信息:"
    echo "  操作系统: $(uname -s -r)"
    echo "  Docker版本: $(docker --version)"
    
    if command -v docker-compose &> /dev/null; then
        echo "  Docker Compose版本: $(docker-compose --version)"
    elif docker compose version &> /dev/null 2>&1; then
        echo "  Docker Compose版本: $(docker compose version --short)"
    fi
    
    echo "  项目目录: $(pwd)"
    
    if [ -f "config/config.json" ]; then
        local port=$(grep -o '"port": *[0-9]*' config/config.json | grep -o '[0-9]*')
        echo "  配置端口: ${port:-$DEFAULT_PORT}"
    fi
}

# 主函数
main() {
    local command="${1:-help}"
    shift 2>/dev/null || true
    
    # 检查环境
    check_docker
    check_project
    
    case "$command" in
        "start")
            start_service
            ;;
        "stop")
            stop_service
            ;;
        "restart")
            restart_service
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$@"
            ;;
        "update")
            update_service
            ;;
        "health")
            health_check
            ;;
        "cleanup")
            cleanup_resources
            ;;
        "backup")
            backup_data
            ;;
        "info")
            show_system_info
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            echo
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
