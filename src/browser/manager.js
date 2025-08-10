const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class BrowserManager {
    constructor(config = {}) {
        this.config = {
            headless: true,
            timeout: 30000,
            max_clients: 2,
            ...config
        };
        
        this.browser = null;
        this.clients = new Map();
        this.isInitialized = false;
        
        logger.info('🌐 浏览器管理器初始化完成');
    }
    
    async initializeBrowser() {
        if (this.isInitialized && this.browser) {
            return this.browser;
        }
        
        try {
            logger.info('🚀 启动浏览器实例...');
            
            // 极简配置 - 只保留最必要的参数
            const launchOptions = {
                headless: 'new',  // 使用新的 headless 模式
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-default-browser-check',
                    '--disable-extensions',
                    '--disable-background-timer-throttling'
                ],
                ignoreHTTPSErrors: true,
                timeout: 60000,
                defaultViewport: { width: 1920, height: 1080 },
                protocolTimeout: 10000  // 协议超时设置
            };
            
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            }
            
            this.browser = await puppeteer.launch(launchOptions);
            this.isInitialized = true;
            
            logger.info('✅ 浏览器实例启动成功');
            
            this.browser.on('disconnected', () => {
                logger.warn('⚠️ 浏览器实例断开连接');
                this.isInitialized = false;
                this.browser = null;
                this.clients.clear();
            });
            
            return this.browser;
            
        } catch (error) {
            logger.error('❌ 浏览器启动失败:', error);
            throw new Error(`Browser initialization failed: ${error.message}`);
        }
    }
    
    async getClientSession(clientId) {
        if (!this.clients.has(clientId) && this.clients.size >= this.config.max_clients) {
            throw new Error(`Maximum number of clients (${this.config.max_clients}) exceeded`);
        }
        
        if (this.clients.has(clientId)) {
            const session = this.clients.get(clientId);
            try {
                await session.page.evaluate(() => document.readyState);
                return session;
            } catch (error) {
                logger.warn(`⚠️ 客户端 ${clientId} 的页面会话已失效，重新创建`);
                this.clients.delete(clientId);
            }
        }
        
        const browser = await this.initializeBrowser();
        
        try {
            const page = await browser.newPage();
            
            // 基本设置
            await page.setViewport({ width: 1920, height: 1080 });
            page.setDefaultTimeout(this.config.timeout);
            page.setDefaultNavigationTimeout(this.config.timeout);
            
            const session = {
                id: clientId,
                page: page,
                createdAt: new Date(),
                lastActivity: new Date(),
                currentUrl: null
            };
            
            this.clients.set(clientId, session);
            logger.info(`✅ 创建客户端会话: ${clientId}`);
            return session;
            
        } catch (error) {
            logger.error(`❌ 创建客户端会话失败 (${clientId}):`, error);
            throw new Error(`Failed to create client session: ${error.message}`);
        }
    }
    
    async navigate(clientId, url, options = {}) {
        const session = await this.getClientSession(clientId);
        
        try {
            logger.info(`🌐 导航到 ${url} (客户端: ${clientId})`);
            
            const response = await session.page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: this.config.timeout
            });
            
            session.currentUrl = url;
            session.lastActivity = new Date();
            
            const title = await session.page.title();
            
            const result = {
                url: session.page.url(),
                title: title,
                status: response ? response.status() : 200,
                success: true
            };
            
            logger.info(`✅ 导航成功: ${result.title} (${result.status})`);
            return result;
            
        } catch (error) {
            logger.error(`❌ 导航失败 (${clientId}):`, error);
            throw new Error(`Navigation failed: ${error.message}`);
        }
    }
    
    async extractContent(clientId, selector = 'body', type = 'text') {
        const session = await this.getClientSession(clientId);
        
        try {
            logger.debug(`📄 提取内容: ${selector} (类型: ${type})`);
            
            session.lastActivity = new Date();
            
            let content;
            
            switch (type.toLowerCase()) {
                case 'text':
                    content = await session.page.$eval(selector, el => el.textContent || '');
                    break;
                case 'html':
                    content = await session.page.$eval(selector, el => el.innerHTML || '');
                    break;
                default:
                    content = await session.page.$eval(selector, el => el.textContent || '');
            }
            
            return {
                content: content,
                selector: selector,
                type: type,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            logger.error(`❌ 内容提取失败 (${clientId}):`, error);
            throw new Error(`Content extraction failed: ${error.message}`);
        }
    }
    
    async clickElement(clientId, selector, options = {}) {
        const session = await this.getClientSession(clientId);
        
        try {
            logger.debug(`🖱️ 点击元素: ${selector}`);
            
            session.lastActivity = new Date();
            
            await session.page.waitForSelector(selector, {
                timeout: this.config.timeout
            });
            
            await session.page.click(selector);
            
            return {
                success: true,
                navigated: false
            };
            
        } catch (error) {
            logger.error(`❌ 点击失败 (${clientId}):`, error);
            throw new Error(`Click failed: ${error.message}`);
        }
    }
    
    async inputText(clientId, selector, text, options = {}) {
        const session = await this.getClientSession(clientId);
        const { clear = true } = options;
        
        try {
            logger.debug(`⌨️ 输入文本: ${selector}`);
            
            session.lastActivity = new Date();
            
            await session.page.waitForSelector(selector, {
                timeout: this.config.timeout
            });
            
            if (clear) {
                await session.page.click(selector, { clickCount: 3 });
            }
            
            await session.page.type(selector, text);
            
            return {
                success: true,
                text: text,
                selector: selector
            };
            
        } catch (error) {
            logger.error(`❌ 文本输入失败 (${clientId}):`, error);
            throw new Error(`Text input failed: ${error.message}`);
        }
    }
    
    async takeScreenshot(clientId, options = {}) {
        const session = await this.getClientSession(clientId);
        const { fullPage = true, format = 'png' } = options;
        
        try {
            logger.debug(`📸 截图请求 (客户端: ${clientId})`);
            
            session.lastActivity = new Date();
            
            const buffer = await session.page.screenshot({
                type: format,
                fullPage: fullPage
            });
            
            return {
                buffer: buffer,
                format: format,
                size: buffer.length,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            logger.error(`❌ 截图失败 (${clientId}):`, error);
            throw new Error(`Screenshot failed: ${error.message}`);
        }
    }
    
    async closeClientSession(clientId) {
        if (!this.clients.has(clientId)) {
            return false;
        }
        
        try {
            const session = this.clients.get(clientId);
            await session.page.close();
            this.clients.delete(clientId);
            
            logger.info(`✅ 关闭客户端会话: ${clientId}`);
            return true;
            
        } catch (error) {
            logger.error(`❌ 关闭会话失败 (${clientId}):`, error);
            return false;
        }
    }
    
    getClientStatus(clientId) {
        if (!this.clients.has(clientId)) {
            return null;
        }
        
        const session = this.clients.get(clientId);
        return {
            id: session.id,
            currentUrl: session.currentUrl,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            isActive: true
        };
    }
    
    getAllClientsStatus() {
        return {
            totalClients: this.clients.size,
            maxClients: this.config.max_clients,
            browserInitialized: this.isInitialized,
            clients: Array.from(this.clients.entries()).map(([clientId, session]) => ({
                id: clientId,
                currentUrl: session.currentUrl,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity
            }))
        };
    }
    
    async cleanup() {
        logger.info('🧹 开始清理浏览器资源...');
        
        try {
            const closePromises = Array.from(this.clients.keys()).map(clientId => 
                this.closeClientSession(clientId)
            );
            await Promise.all(closePromises);
            
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                this.isInitialized = false;
            }
            
            logger.info('✅ 浏览器资源清理完成');
            
        } catch (error) {
            logger.error('❌ 清理浏览器资源失败:', error);
        }
    }
}

module.exports = BrowserManager;
