#!/usr/bin/env node

/**
 * 增强选择器功能测试脚本
 * 测试URL编码、动态内容加载、选择器降级等功能
 */

const axios = require('axios').default;

// 配置
const BASE_URL = 'http://localhost:29527';
const CLIENT_ID = 'selector_test';

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试用例
const testCases = [
    {
        name: '基础文本提取',
        selector: 'body',
        type: 'text',
        description: '测试基本的body文本提取'
    },
    {
        name: 'URL编码选择器测试',
        selector: '*[class*="comment reply"]',
        type: 'text',
        description: '测试包含空格的选择器（会被URL编码）'
    },
    {
        name: '复杂CSS选择器',
        selector: '.video-info .video-title, .title-container h1',
        type: 'text',
        description: '测试复杂的CSS选择器'
    },
    {
        name: '不存在的选择器（测试降级）',
        selector: '.nonexistent-selector-12345',
        type: 'text',
        description: '测试选择器不存在时的降级策略'
    },
    {
        name: '动态内容等待测试',
        selector: '.dynamic-content',
        type: 'text',
        options: {
            waitForContent: true,
            timeout: 10000,
            retryAttempts: 5
        },
        description: '测试动态内容加载等待'
    },
    {
        name: '自定义备选选择器',
        selector: '.comment-list',
        type: 'text',
        options: {
            fallbackSelectors: ['.reply-list', '.discussion', 'main', 'article']
        },
        description: '测试自定义备选选择器列表'
    },
    {
        name: 'HTML内容提取',
        selector: 'head',
        type: 'html',
        description: '测试HTML内容提取'
    },
    {
        name: '属性提取测试',
        selector: 'html',
        type: 'attribute',
        description: '测试元素属性提取（新功能）'
    },
    {
        name: '计算样式提取测试',
        selector: 'body',
        type: 'computed',
        description: '测试计算样式提取（新功能）'
    },
    {
        name: '最小长度验证',
        selector: 'title',
        type: 'text',
        options: {
            minLength: 5
        },
        description: '测试最小内容长度验证'
    }
];

// 网站测试列表
const testSites = [
    {
        name: 'Google',
        url: 'https://www.google.com',
        description: '静态内容网站'
    },
    {
        name: 'Bilibili',
        url: 'https://www.bilibili.com',
        description: '动态内容网站'
    }
];

class SelectorTester {
    constructor() {
        this.results = [];
    }

    async navigate(url) {
        try {
            log('blue', `\n🌐 导航到: ${url}`);
            const response = await axios.post(`${BASE_URL}/api/navigate`, {
                url: url,
                client_id: CLIENT_ID,
                wait_for_load: true
            });
            
            if (response.data.success) {
                log('green', `✅ 导航成功: ${response.data.data.title}`);
                return true;
            } else {
                log('red', `❌ 导航失败: ${response.data.error}`);
                return false;
            }
        } catch (error) {
            log('red', `❌ 导航异常: ${error.message}`);
            return false;
        }
    }

    async testSelector(testCase) {
        try {
            log('cyan', `\n🧪 测试: ${testCase.name}`);
            log('yellow', `   描述: ${testCase.description}`);
            log('yellow', `   选择器: ${testCase.selector}`);
            log('yellow', `   类型: ${testCase.type}`);
            
            // 构建请求参数
            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                selector: testCase.selector,
                type: testCase.type
            });
            
            // 添加选项参数
            if (testCase.options) {
                for (const [key, value] of Object.entries(testCase.options)) {
                    if (Array.isArray(value)) {
                        params.append(key, JSON.stringify(value));
                    } else {
                        params.append(key, value.toString());
                    }
                }
                log('yellow', `   选项: ${JSON.stringify(testCase.options)}`);
            }
            
            const startTime = Date.now();
            const response = await axios.get(`${BASE_URL}/api/content?${params.toString()}`);
            const duration = Date.now() - startTime;
            
            if (response.data.success) {
                const data = response.data.data;
                log('green', `✅ 提取成功 (${duration}ms)`);
                log('magenta', `   实际选择器: ${data.selector}`);
                log('magenta', `   内容长度: ${data.length}`);
                
                if (data.metadata) {
                    log('magenta', `   提取方法: ${data.metadata.extractionMethod}`);
                    if (data.metadata.retryCount > 0) {
                        log('magenta', `   重试次数: ${data.metadata.retryCount}`);
                    }
                }
                
                // 显示内容预览
                const preview = data.content.substring(0, 200);
                log('magenta', `   内容预览: ${preview}${data.content.length > 200 ? '...' : ''}`);
                
                this.results.push({
                    test: testCase.name,
                    success: true,
                    duration: duration,
                    selector: data.selector,
                    length: data.length,
                    metadata: data.metadata
                });
                
            } else {
                log('red', `❌ 提取失败: ${response.data.error}`);
                
                if (response.data.details) {
                    log('red', `   详细信息:`);
                    log('red', `   - 选择器: ${response.data.details.selector}`);
                    log('red', `   - 类型: ${response.data.details.type}`);
                    if (response.data.details.suggestions) {
                        log('red', `   - 建议:`);
                        response.data.details.suggestions.forEach((suggestion, index) => {
                            log('red', `     ${index + 1}. ${suggestion}`);
                        });
                    }
                }
                
                this.results.push({
                    test: testCase.name,
                    success: false,
                    error: response.data.error,
                    details: response.data.details
                });
            }
            
        } catch (error) {
            log('red', `❌ 测试异常: ${error.message}`);
            this.results.push({
                test: testCase.name,
                success: false,
                error: error.message,
                exception: true
            });
        }
    }

    async runSiteTests(site) {
        log('bright', `\n${'='.repeat(60)}`);
        log('bright', `🌍 测试网站: ${site.name} - ${site.description}`);
        log('bright', `${'='.repeat(60)}`);
        
        // 导航到网站
        const navigated = await this.navigate(site.url);
        if (!navigated) {
            log('red', `❌ 跳过 ${site.name} 的测试（导航失败）`);
            return;
        }
        
        // 等待页面稳定
        await this.sleep(2000);
        
        // 运行所有测试用例
        for (const testCase of testCases) {
            await this.testSelector(testCase);
            await this.sleep(1000); // 避免请求过快
        }
    }

    async runAllTests() {
        log('bright', `\n🚀 开始增强选择器功能测试`);
        log('bright', `📋 总共 ${testCases.length} 个测试用例，${testSites.length} 个测试网站`);
        
        for (const site of testSites) {
            await this.runSiteTests(site);
        }
        
        this.generateReport();
    }

    generateReport() {
        log('bright', `\n${'='.repeat(60)}`);
        log('bright', `📊 测试报告`);
        log('bright', `${'='.repeat(60)}`);
        
        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        const total = this.results.length;
        
        log('green', `✅ 成功: ${successful}/${total} (${(successful/total*100).toFixed(1)}%)`);
        log('red', `❌ 失败: ${failed}/${total} (${(failed/total*100).toFixed(1)}%)`);
        
        // 统计提取方法
        const methods = {};
        this.results.filter(r => r.success && r.metadata).forEach(r => {
            const method = r.metadata.extractionMethod || 'unknown';
            methods[method] = (methods[method] || 0) + 1;
        });
        
        log('magenta', `\n📈 提取方法统计:`);
        Object.entries(methods).forEach(([method, count]) => {
            log('magenta', `   ${method}: ${count} 次`);
        });
        
        // 显示失败的测试
        const failures = this.results.filter(r => !r.success);
        if (failures.length > 0) {
            log('yellow', `\n⚠️  失败的测试:`);
            failures.forEach(failure => {
                log('red', `   - ${failure.test}: ${failure.error}`);
            });
        }
        
        // 性能统计
        const successfulWithTiming = this.results.filter(r => r.success && r.duration);
        if (successfulWithTiming.length > 0) {
            const avgDuration = successfulWithTiming.reduce((sum, r) => sum + r.duration, 0) / successfulWithTiming.length;
            const maxDuration = Math.max(...successfulWithTiming.map(r => r.duration));
            const minDuration = Math.min(...successfulWithTiming.map(r => r.duration));
            
            log('blue', `\n⏱️  性能统计:`);
            log('blue', `   平均响应时间: ${avgDuration.toFixed(0)}ms`);
            log('blue', `   最快响应时间: ${minDuration}ms`);
            log('blue', `   最慢响应时间: ${maxDuration}ms`);
        }
        
        log('bright', `\n🎉 测试完成！`);
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 主函数
async function main() {
    const tester = new SelectorTester();
    
    try {
        await tester.runAllTests();
    } catch (error) {
        log('red', `❌ 测试框架异常: ${error.message}`);
        process.exit(1);
    }
}

// 检查依赖
try {
    require('axios');
} catch (error) {
    console.error('❌ 缺少axios依赖，请运行: npm install axios');
    process.exit(1);
}

// 运行测试
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 运行失败:', error.message);
        process.exit(1);
    });
}

module.exports = SelectorTester;