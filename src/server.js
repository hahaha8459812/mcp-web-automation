/**
 * MCP Web Automation Tool - HTTP 服务器
 * 处理所有 API 请求和路由
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const logger = require('./utils/logger');
const { authenticateApiKey } = require('./utils/auth');
const BrowserManager = require('./browser/manager');
const BookmarkManager = require('./data/bookmarks');
const CredentialManager = require('./data/credentials');

/**
 * 创建 HTTP 服务器
 * @param {Object} config - 配置对象
 * @returns {Object} Express 应用实例
 */
async function createServer(config) {
    const app = express();
    
    // 初始化组件
    const browserManager = new BrowserManager(config.browser || {});
    const bookmarkManager = new BookmarkManager();
    const credentialManager = new CredentialManager();
    
    // 中间件配置
    setupMiddleware(app, config);
    
    // 设置路由
    setupRoutes(app, config, {
        browserManager,
        bookmarkManager,
        credentialManager
    });
    
    // 错误处理
    setupErrorHandling(app);
    
    logger.info('🔧 HTTP 服务器初始化完成');
    return app;
}

/**
 * 设置中间件
 */
function setupMiddleware(app, config) {
    // 安全中间件
    app.use(helmet({
        contentSecurityPolicy: false, // 允许内联脚本（文档页面需要）
        crossOriginEmbedderPolicy: false
    }));
    
    // CORS 设置
    app.use(cors({
        origin: '*', // 允许所有来源（个人服务器使用）
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }));
    
    // 请求解析
    app.use(express.json({ limit: '10mb' })); // 支持大型截图数据
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // 日志中间件
    if (config.logging?.level !== 'error') {
        app.use(morgan('combined', {
            stream: {
                write: (message) => logger.info(message.trim())
            }
        }));
    }
    
    // 静态文件服务（用于文档等）
    app.use('/docs', express.static(path.join(__dirname, '../docs')));
}

/**
 * 设置路由
 */
function setupRoutes(app, config, managers) {
    const { browserManager, bookmarkManager, credentialManager } = managers;
    
    // ==================== 健康检查 ====================
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            message: 'MCP Web Automation Tool is running',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
        });
    });
    
    // ==================== API 文档 ====================
    app.get('/', (req, res) => {
        res.json({
            name: 'MCP Web Automation Tool',
            version: '1.0.0',
            description: '轻量级 MCP 网页自动化工具',
            endpoints: {
                health: 'GET /health',
                navigate: 'POST /api/navigate',
                content: 'GET /api/content',
                click: 'POST /api/click',
                input: 'POST /api/input',
                screenshot: 'GET /api/screenshot',
                bookmarks: 'POST /api/bookmarks',
                credentials: 'POST /api/credentials'
            },
            authentication: 'Required: X-API-Key header'
        });
    });
    
    // ==================== API 认证中间件 ====================
    // 注释掉认证中间件，允许无限制访问
    // app.use('/api', (req, res, next) => {
    //     authenticateApiKey(req, res, next, config.api_key);
    // });
    
    // ==================== 浏览器导航 ====================
    app.post('/api/navigate', async (req, res) => {
        try {
            const { url, client_id = 'default', wait_for_load = true } = req.body;
            
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }
            
            logger.info(`🌐 导航请求: ${url} (客户端: ${client_id})`);
            
            const result = await browserManager.navigate(client_id, url, { wait_for_load });
            
            res.json({
                success: true,
                message: 'Navigation successful',
                data: {
                    url: result.url,
                    title: result.title,
                    status: result.status
                }
            });
            
        } catch (error) {
            logger.error('❌ 导航失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ==================== 内容提取 ====================
    app.get('/api/content', async (req, res) => {
        try {
            const { client_id = 'default', selector = 'body', type = 'text' } = req.query;
            
            logger.info(`📄 内容提取请求 (客户端: ${client_id})`);
            
            const result = await browserManager.extractContent(client_id, selector, type);
            
            res.json({
                success: true,
                message: 'Content extracted successfully',
                data: {
                    content: result.content,
                    selector: selector,
                    type: type,
                    length: result.content?.length || 0
                }
            });
            
        } catch (error) {
            logger.error('❌ 内容提取失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ==================== 元素点击 ====================
    app.post('/api/click', async (req, res) => {
        try {
            const { selector, client_id = 'default', wait_for_navigation = false } = req.body;
            
            if (!selector) {
                return res.status(400).json({ error: 'Selector is required' });
            }
            
            logger.info(`🖱️ 点击请求: ${selector} (客户端: ${client_id})`);
            
            const result = await browserManager.clickElement(client_id, selector, {
                wait_for_navigation
            });
            
            res.json({
                success: true,
                message: 'Click successful',
                data: result
            });
            
        } catch (error) {
            logger.error('❌ 点击失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ==================== 文本输入 ====================
    app.post('/api/input', async (req, res) => {
        try {
            const { selector, text, client_id = 'default', clear = true } = req.body;
            
            if (!selector || text === undefined) {
                return res.status(400).json({ error: 'Selector and text are required' });
            }
            
            logger.info(`⌨️ 输入请求: ${selector} (客户端: ${client_id})`);
            
            const result = await browserManager.inputText(client_id, selector, text, { clear });
            
            res.json({
                success: true,
                message: 'Input successful',
                data: result
            });
            
        } catch (error) {
            logger.error('❌ 输入失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ==================== 页面截图 ====================
    app.get('/api/screenshot', async (req, res) => {
        try {
            const { 
                client_id = 'default', 
                fullPage = 'true', 
                element = null,
                format = 'png',
                quality = 80
            } = req.query;
            
            logger.info(`📸 截图请求 (客户端: ${client_id})`);
            
            const options = {
                fullPage: fullPage === 'true',
                format: format,
                quality: parseInt(quality),
                element: element
            };
            
            const result = await browserManager.takeScreenshot(client_id, options);
            
            // 设置响应头
            res.set({
                'Content-Type': `image/${format}`,
                'Content-Length': result.buffer.length,
                'X-Screenshot-Info': JSON.stringify({
                    width: result.width,
                    height: result.height,
                    format: result.format
                })
            });
            
            res.send(result.buffer);
            
        } catch (error) {
            logger.error('❌ 截图失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ==================== 收藏夹管理 ====================
    app.post('/api/bookmarks', async (req, res) => {
        try {
            const { action, website, url, title, bookmark_id } = req.body;
            
            if (!action) {
                return res.status(400).json({ error: 'Action is required' });
            }
            
            logger.info(`🔖 收藏夹操作: ${action}`);
            
            let result;
            
            switch (action) {
                case 'add':
                    if (!website || !url || !title) {
                        return res.status(400).json({ error: 'Website, URL and title are required for add action' });
                    }
                    result = await bookmarkManager.addBookmark(website, url, title);
                    break;
                    
                case 'list':
                    result = await bookmarkManager.getBookmarks(website);
                    break;
                    
                case 'delete':
                    if (!website || !bookmark_id) {
                        return res.status(400).json({ error: 'Website and bookmark_id are required for delete action' });
                    }
                    result = await bookmarkManager.deleteBookmark(website, bookmark_id);
                    break;
                    
                case 'update':
                    if (!website || !bookmark_id) {
                        return res.status(400).json({ error: 'Website and bookmark_id are required for update action' });
                    }
                    result = await bookmarkManager.updateBookmark(website, bookmark_id, { url, title });
                    break;
                    
                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }
            
            res.json({
                success: true,
                message: `Bookmark ${action} successful`,
                data: result
            });
            
        } catch (error) {
            logger.error('❌ 收藏夹操作失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ==================== 密码管理 ====================
    app.post('/api/credentials', async (req, res) => {
        try {
            const { action, website, username, password } = req.body;
            
            if (!action) {
                return res.status(400).json({ error: 'Action is required' });
            }
            
            logger.info(`🔐 密码管理操作: ${action}`);
            
            let result;
            
            switch (action) {
                case 'save':
                    if (!website || !username || !password) {
                        return res.status(400).json({ error: 'Website, username and password are required for save action' });
                    }
                    result = await credentialManager.saveCredential(website, username, password);
                    break;
                    
                case 'get':
                    if (!website) {
                        return res.status(400).json({ error: 'Website is required for get action' });
                    }
                    result = await credentialManager.getCredential(website);
                    break;
                    
                case 'list':
                    result = await credentialManager.listWebsites();
                    break;
                    
                case 'delete':
                    if (!website) {
                        return res.status(400).json({ error: 'Website is required for delete action' });
                    }
                    result = await credentialManager.deleteCredential(website);
                    break;
                    
                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }
            
            res.json({
                success: true,
                message: `Credential ${action} successful`,
                data: result
            });
            
        } catch (error) {
            logger.error('❌ 密码管理操作失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // ==================== 404 处理 ====================
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            message: 'Please check the API documentation'
        });
    });
}

/**
 * 设置错误处理
 */
function setupErrorHandling(app) {
    // 全局错误处理中间件
    app.use((error, req, res, next) => {
        logger.error('❌ 服务器错误:', error);
        
        // 不泄露内部错误信息到客户端
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        res.status(error.status || 500).json({
            success: false,
            error: isDevelopment ? error.message : 'Internal server error',
            ...(isDevelopment && { stack: error.stack })
        });
    });
}

module.exports = { createServer };
