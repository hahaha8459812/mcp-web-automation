#!/usr/bin/env node

/**
 * MCP Web Automation Tool - 主入口文件
 * 轻量级 MCP (Model Context Protocol) 网页自动化工具
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { createServer } = require('./server');
const logger = require('./utils/logger');

// 应用信息
const APP_NAME = 'MCP Web Automation Tool';
const APP_VERSION = '1.0.0';
const DEFAULT_PORT = 29527;

/**
 * 主启动函数
 */
async function main() {
    try {
        // 显示启动横幅
        showBanner();
        
        // 检查环境
        await checkEnvironment();
        
        // 加载配置
        const config = await loadConfig();
        
        // 初始化数据目录
        await initializeDataDirectories();
        
        // 创建并启动服务器
        const server = await createServer(config);
        
        // 启动服务器
        const port = config.server?.port || DEFAULT_PORT;
        const host = config.server?.host || '0.0.0.0';
        
        server.listen(port, host, () => {
            logger.info(`🚀 ${APP_NAME} v${APP_VERSION} 启动成功!`);
            logger.info(`📡 服务器运行在: http://${host}:${port}`);
            logger.info(`🔐 API 密钥已配置，请确保客户端使用正确的密钥访问`);
            logger.info(`📚 API 文档: http://${host}:${port}/docs`);
            logger.info(`❤️  健康检查: http://${host}:${port}/health`);
            logger.info(`---`);
            logger.info(`🎯 支持的功能:`);
            logger.info(`   • 网页导航和内容提取`);
            logger.info(`   • 页面元素交互`);
            logger.info(`   • 页面截图`);
            logger.info(`   • 收藏夹管理`);
            logger.info(`   • 密码管理`);
            logger.info(`   • 同时支持 ${config.security?.max_concurrent_clients || 2} 个客户端`);
        });
        
        // 优雅关闭处理
        setupGracefulShutdown(server);
        
    } catch (error) {
        logger.error('❌ 启动失败:', error);
        process.exit(1);
    }
}

/**
 * 显示启动横幅
 */
function showBanner() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🤖 MCP Web Automation Tool v${APP_VERSION}                     ║
║                                                              ║
║    轻量级 MCP (Model Context Protocol) 网页自动化工具          ║
║    为 AI 助手提供强大的网页浏览和交互能力                        ║
║                                                              ║
║    GitHub: https://github.com/hahaha8459812/mcp-web-automation ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
}

/**
 * 检查运行环境
 */
async function checkEnvironment() {
    logger.info('🔍 检查运行环境...');
    
    // 检查 Node.js 版本
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
        throw new Error(`需要 Node.js 18.0.0 或更高版本，当前版本: ${nodeVersion}`);
    }
    
    logger.info(`✅ Node.js 版本: ${nodeVersion}`);
    
    // 检查内存
    const totalMemory = Math.round(process.memoryUsage().rss / 1024 / 1024);
    logger.info(`📊 当前内存使用: ${totalMemory}MB`);
    
    // 检查必要目录
    const requiredDirs = ['config', 'data', 'logs'];
    for (const dir of requiredDirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logger.info(`📁 创建目录: ${dir}/`);
        }
    }
    
    logger.info('✅ 环境检查完成');
}

/**
 * 加载配置文件
 */
async function loadConfig() {
    logger.info('⚙️  加载配置文件...');
    
    const configPath = path.join(process.cwd(), 'config', 'config.json');
    const exampleConfigPath = path.join(process.cwd(), 'config', 'config.example.json');
    
    // 检查配置文件是否存在
    if (!fs.existsSync(configPath)) {
        if (fs.existsSync(exampleConfigPath)) {
            logger.warn('⚠️  未找到 config.json，请复制 config.example.json 并修改');
            logger.warn('   执行: cp config/config.example.json config/config.json');
        } else {
            logger.warn('⚠️  未找到配置文件，使用默认配置');
        }
        
        // 使用默认配置
        return getDefaultConfig();
    }
    
    try {
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // 验证必要配置
        if (!config.api_key || config.api_key === 'mcp-demo-key-change-me-in-production') {
            logger.warn('⚠️  请修改 API 密钥！当前使用的是示例密钥');
        }
        
        logger.info('✅ 配置文件加载完成');
        return config;
        
    } catch (error) {
        logger.error('❌ 配置文件解析失败:', error.message);
        logger.info('💡 使用默认配置继续启动...');
        return getDefaultConfig();
    }
}

/**
 * 获取默认配置
 */
function getDefaultConfig() {
    return {
        api_key: 'mcp-demo-key-change-me-in-production',
        server: {
            port: DEFAULT_PORT,
            host: '0.0.0.0'
        },
        browser: {
            headless: true,
            timeout: 30000,
            user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        security: {
            max_concurrent_clients: 2,
            rate_limit: {
                enabled: true,
                max_requests_per_minute: 60
            }
        },
        logging: {
            level: 'info'
        },
        features: {
            screenshots: { enabled: true },
            bookmarks: { enabled: true },
            credentials: { enabled: true }
        }
    };
}

/**
 * 初始化数据目录
 */
async function initializeDataDirectories() {
    logger.info('📁 初始化数据目录...');
    
    const dataPath = path.join(process.cwd(), 'data', 'user-data.json');
    
    // 如果用户数据文件不存在，创建初始文件
    if (!fs.existsSync(dataPath)) {
        const initialData = {
            bookmarks: {},
            credentials: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
        logger.info('📝 创建初始用户数据文件');
    }
    
    logger.info('✅ 数据目录初始化完成');
}

/**
 * 设置优雅关闭
 */
function setupGracefulShutdown(server) {
    const shutdown = (signal) => {
        logger.info(`\n📡 接收到 ${signal} 信号，开始优雅关闭...`);
        
        server.close(() => {
            logger.info('✅ HTTP 服务器已关闭');
            logger.info('👋 MCP Web Automation Tool 已停止');
            process.exit(0);
        });
        
        // 强制关闭超时
        setTimeout(() => {
            logger.error('❌ 强制关闭超时，立即退出');
            process.exit(1);
        }, 10000);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
        logger.error('❌ 未捕获的异常:', error);
        process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('❌ 未处理的 Promise 拒绝:', reason);
        process.exit(1);
    });
}

// 直接运行时启动应用
if (require.main === module) {
    main().catch((error) => {
        console.error('启动失败:', error);
        process.exit(1);
    });
}

module.exports = { main };
