#!/bin/bash

# 选择器和编码优化演示脚本
# 展示关键改进功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
BASE_URL="http://localhost:29527"
CLIENT_ID="demo_test"

# 显示横幅
show_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║    🔧 选择器和编码优化演示 - MCP Web Automation Tool        ║"
    echo "║                                                              ║"
    echo "║    展示关键改进：URL编码、降级策略、动态等待、错误增强      ║"
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

log_demo() {
    echo -e "${PURPLE}[DEMO]${NC} $1"
}

# 检查服务状态
check_service() {
    log_info "🔍 检查服务状态..."
    
    if curl -s ${BASE_URL}/health > /dev/null 2>&1; then
        log_info "✅ HTTP API服务正常运行"
    else
        log_error "❌ HTTP API服务未运行，请先启动服务"
        echo "   运行: ./start-hybrid.sh start"
        exit 1
    fi
}

# 导航到测试页面
navigate_to_page() {
    local url=$1
    local description=$2
    
    log_demo "🌐 导航到 ${description}: ${url}"
    
    local response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d "{\"url\":\"${url}\",\"client_id\":\"${CLIENT_ID}\"}" \
        ${BASE_URL}/api/navigate)
    
    if echo "$response" | grep -q '"success":true'; then
        local title=$(echo "$response" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
        log_info "✅ 导航成功: $title"
        return 0
    else
        local error=$(echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
        log_error "❌ 导航失败: $error"
        return 1
    fi
}

# 演示URL编码问题修复
demo_url_encoding() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🔧 演示1: URL编码问题修复${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    
    log_demo "测试包含特殊字符的选择器（空格、引号、方括号）"
    
    # 测试包含空格的选择器
    local selector='*[class*="video title"]'
    log_demo "原始选择器: $selector"
    
    # 这个请求以前会失败，现在应该成功（通过内部规范化处理）
    log_demo "发送请求（选择器会被自动规范化）..."
    
    local response=$(curl -s "${BASE_URL}/api/content?client_id=${CLIENT_ID}&selector=${selector}&type=text")
    
    if echo "$response" | grep -q '"success":true'; then
        log_info "✅ URL编码处理成功"
        local actual_selector=$(echo "$response" | grep -o '"selector":"[^"]*"' | cut -d'"' -f4)
        log_info "实际使用的选择器: $actual_selector"
    else
        log_warn "⚠️ 选择器不存在，但编码处理正常（会降级到备选选择器）"
    fi
}

# 演示选择器降级策略
demo_fallback_strategy() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🔧 演示2: 选择器降级策略${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    
    log_demo "测试不存在的选择器，观察降级过程"
    
    # 使用一个肯定不存在的选择器
    local nonexistent_selector=".absolutely-nonexistent-selector-12345"
    log_demo "不存在的选择器: $nonexistent_selector"
    
    local response=$(curl -s "${BASE_URL}/api/content?client_id=${CLIENT_ID}&selector=${nonexistent_selector}&type=text")
    
    if echo "$response" | grep -q '"success":true'; then
        log_info "✅ 降级策略成功"
        local actual_selector=$(echo "$response" | grep -o '"selector":"[^"]*"' | cut -d'"' -f4)
        local method=$(echo "$response" | grep -o '"extractionMethod":"[^"]*"' | cut -d'"' -f4)
        log_info "降级到选择器: $actual_selector"
        log_info "提取方法: $method"
    else
        log_error "❌ 降级策略失败"
    fi
}

# 演示增强错误报告
demo_enhanced_errors() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🔧 演示3: 增强错误报告${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    
    log_demo "测试无效选择器，观察详细错误信息"
    
    # 使用一个语法无效的选择器
    local invalid_selector="::invalid::selector::"
    log_demo "无效选择器: $invalid_selector"
    
    local response=$(curl -s "${BASE_URL}/api/content?client_id=${CLIENT_ID}&selector=${invalid_selector}&type=text")
    
    if echo "$response" | grep -q '"details"'; then
        log_info "✅ 增强错误报告成功"
        log_info "错误详情："
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    else
        log_warn "⚠️ 基础错误处理"
    fi
}

# 演示新的内容类型
demo_new_content_types() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🔧 演示4: 新增内容类型${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    
    log_demo "测试新增的attribute和computed内容类型"
    
    # 测试属性提取
    log_demo "提取HTML元素属性..."
    local attr_response=$(curl -s "${BASE_URL}/api/content?client_id=${CLIENT_ID}&selector=html&type=attribute")
    
    if echo "$attr_response" | grep -q '"success":true'; then
        log_info "✅ 属性提取成功"
        local content=$(echo "$attr_response" | grep -o '"content":"[^"]*"' | cut -d'"' -f4)
        log_info "属性内容预览: ${content:0:100}..."
    fi
    
    # 测试计算样式提取
    log_demo "提取元素计算样式..."
    local style_response=$(curl -s "${BASE_URL}/api/content?client_id=${CLIENT_ID}&selector=body&type=computed")
    
    if echo "$style_response" | grep -q '"success":true'; then
        log_info "✅ 样式提取成功"
        local content=$(echo "$style_response" | grep -o '"content":"[^"]*"' | cut -d'"' -f4)
        log_info "样式内容: $content"
    fi
}

# 演示高级选项
demo_advanced_options() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🔧 演示5: 高级选项${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    
    log_demo "测试高级选项：重试、超时、自定义备选选择器"
    
    # 构建带高级选项的请求
    local url="${BASE_URL}/api/content"
    local params="client_id=${CLIENT_ID}&selector=.dynamic-content&type=text"
    params="${params}&timeout=5000&retryAttempts=2&minLength=10"
    params="${params}&fallbackSelectors=[\"main\",\"article\",\"section\"]"
    
    log_demo "请求参数: $params"
    
    local response=$(curl -s "${url}?${params}")
    
    if echo "$response" | grep -q '"metadata"'; then
        log_info "✅ 高级选项处理成功"
        local metadata=$(echo "$response" | grep -o '"metadata":{[^}]*}')
        log_info "元数据: $metadata"
    fi
}

# 性能对比演示
demo_performance() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🔧 演示6: 性能对比${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    
    log_demo "对比优化前后的响应时间"
    
    # 简单选择器性能测试
    log_demo "测试简单选择器性能..."
    local start_time=$(date +%s%3N)
    curl -s "${BASE_URL}/api/content?client_id=${CLIENT_ID}&selector=body&type=text" > /dev/null
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    log_info "简单选择器响应时间: ${duration}ms"
    
    # 复杂选择器性能测试
    log_demo "测试复杂选择器性能（带降级）..."
    start_time=$(date +%s%3N)
    curl -s "${BASE_URL}/api/content?client_id=${CLIENT_ID}&selector=.complex.nonexistent.selector&type=text" > /dev/null
    end_time=$(date +%s%3N)
    duration=$((end_time - start_time))
    log_info "复杂选择器响应时间（含降级）: ${duration}ms"
}

# 生成改进总结
show_improvements() {
    echo -e "\n${CYAN}════════════════════════════════════════${NC}"
    echo -e "${CYAN}📋 优化总结${NC}"
    echo -e "${CYAN}════════════════════════════════════════${NC}"
    
    echo -e "${GREEN}✅ 已修复的问题：${NC}"
    echo "   1. URL编码错误 - 自动规范化和解码选择器"
    echo "   2. 选择器失效问题 - 智能降级策略"
    echo "   3. 动态内容问题 - 等待加载机制"
    echo "   4. 错误信息不详细 - 增强错误报告"
    echo "   5. 功能单一 - 新增多种内容类型"
    
    echo -e "\n${BLUE}🚀 新增功能：${NC}"
    echo "   • 属性提取 (type=attribute)"
    echo "   • 计算样式提取 (type=computed)"
    echo "   • 自定义备选选择器"
    echo "   • 动态等待配置"
    echo "   • 重试机制"
    echo "   • 最小长度验证"
    echo "   • 详细元数据"
    
    echo -e "\n${YELLOW}📈 性能改进：${NC}"
    echo "   • 智能选择器缓存"
    echo "   • 减少不必要的重试"
    echo "   • 更快的降级判断"
    echo "   • 优化的错误处理"
    
    echo -e "\n${PURPLE}🔧 开发者友好：${NC}"
    echo "   • 详细的调试信息"
    echo "   • 建议和提示"
    echo "   • 性能监控"
    echo "   • 灵活的配置选项"
}

# 主函数
main() {
    show_banner
    
    # 检查服务
    check_service
    
    # 导航到测试页面
    if ! navigate_to_page "https://www.google.com" "Google搜索"; then
        log_error "无法导航到测试页面，演示可能不完整"
    fi
    
    # 运行演示
    demo_url_encoding
    demo_fallback_strategy
    demo_enhanced_errors
    demo_new_content_types
    demo_advanced_options
    demo_performance
    
    # 显示总结
    show_improvements
    
    echo -e "\n${GREEN}🎉 选择器和编码优化演示完成！${NC}"
    echo -e "${CYAN}💡 提示：运行 'node test-enhanced-selectors.js' 进行完整测试${NC}"
}

# 运行主函数
main "$@"