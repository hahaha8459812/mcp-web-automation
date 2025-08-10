/**
 * MCP Web Automation Tool - 浏览器管理器
 * 管理 Puppeteer 浏览器实例和页面会话
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class BrowserManager {
    constructor(config = {}) {
        this.config = {
            headless: config.headless !== false,
            timeout: config.timeout || 30000,
            user_agent: config.user_agent || 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: config.viewport || { width: 1920, height: 1080 },
            max_clients: config.max_clients || 2,
            ...config
        };
        
        this.browser = null;
        this.clients = new Map(); // 存储客户端会话
        this.isInitialized = false;
        
        // 绑定方法上下文
        this.cleanup = this.cleanup.bind(this);
        
        logger.info('🌐 浏览器管理器初始化完成');
    }
    
    /**
     * 初始化浏览器实例
     */
    async initializeBrowser() {
        if (this.isInitialized && this.browser) {
            return this.browser;
        }
        
        try {
            logger.info('🚀 启动浏览器实例...');
            
            const launchOptions = {
                headless: this.config.headless,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',      // 减少共享内存使用
                    '--disable-gpu',                // 禁用GPU（节省内存）
                    '--disable-extensions',         // 禁用扩展
                    '--disable-plugins',            // 禁用插件
                    '--disable-images',             // 禁用图片加载（可选）
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--no-first-run',
                    '--no-default-browser-check',
                    '--no-pings',
                    '--no-zygote',
                    '--single-process',             // 单进程模式（节省内存）
                    '--memory-pressure-off',        // 关闭内存压力检测
                    `--max-old-space-size=256`,     // 限制V8内存使用
                    '--js-flags="--max-old-space-size=256"'
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-software-rasterizer',
                    '--disable-background-networking',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--metrics-recording-only',
                    '--no-crash-upload',
                    '--disable-crash-reporter'
                ],
                defaultViewport: this.config.viewport,
                ignoreHTTPSErrors: true,
                timeout: this.config.timeout
            };
            
            // 在 Docker 环境中使用系统 Chrome
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            }
            
            this.browser = await puppeteer.launch(launchOptions);
            this.isInitialized = true;
            
            logger.info('✅ 浏览器实例启动成功');
            
            // 监听浏览器断开事件
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
    
    /**
     * 获取或创建客户端会话
     */
    async getClientSession(clientId) {
        // 检查客户端数量限制
        if (!this.clients.has(clientId) && this.clients.size >= this.config.max_clients) {
            throw new Error(`Maximum number of clients (${this.config.max_clients}) exceeded`);
        }
        
        // 如果客户端会话已存在，返回现有会话
        if (this.clients.has(clientId)) {
            const session = this.clients.get(clientId);
            
            // 检查页面是否仍然有效
            try {
                await session.page.evaluate(() => document.readyState);
                return session;
            } catch (error) {
                logger.warn(`⚠️ 客户端 ${clientId} 的页面会话已失效，重新创建`);
                this.clients.delete(clientId);
            }
        }
        
        // 确保浏览器已初始化
        const browser = await this.initializeBrowser();
        
        try {
            // 创建新的页面会话
            const page = await browser.newPage();
            
            // 设置用户代理
            await page.setUserAgent(this.config.user_agent);
            
            // 设置视口大小
            await page.setViewport(this.config.viewport);
            
            // 设置默认超时
            page.setDefaultTimeout(this.config.timeout);
            page.setDefaultNavigationTimeout(this.config.timeout);
            
            // 禁用图片和CSS加载（可选，节省带宽）
            // await page.setRequestInterception(true);
            // page.on('request', (req) => {
            //     if(req.resourceType() == 'image' || req.resourceType() == 'stylesheet'){
            //         req.abort();
            //     } else {
            //         req.continue();
            //     }
            // });
            
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
    
    /**
     * 导航到指定URL
     */
    async navigate(clientId, url, options = {}) {
        const session = await this.getClientSession(clientId);
        const { wait_for_load = true, wait_for_selector = null } = options;
        
        try {
            logger.info(`🌐 导航到 ${url} (客户端: ${clientId})`);
            
            const navigationPromise = session.page.goto(url, {
                waitUntil: wait_for_load ? 'networkidle2' : 'domcontentloaded',
                timeout: this.config.timeout
            });
            
            const response = await navigationPromise;
            
            // 更新会话信息
            session.currentUrl = url;
            session.lastActivity = new Date();
            
            // 等待特定选择器（如果指定）
            if (wait_for_selector) {
                await session.page.waitForSelector(wait_for_selector, {
                    timeout: this.config.timeout
                });
            }
            
            // 获取页面标题
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
    
    /**
     * 提取页面内容
     */
    async extractContent(clientId, selector = 'body', type = 'text') {
        const session = await this.getClientSession(clientId);
        
        try {
            logger.debug(`📄 提取内容: ${selector} (类型: ${type})`);
            
            session.lastActivity = new Date();
            
            let content;
            
            switch (type.toLowerCase()) {
                case 'text':
                    content = await session.page.$eval(selector, el => el.textContent);
                    break;
                case 'html':
                    content = await session.page.$eval(selector, el => el.innerHTML);
                    break;
                case 'outer_html':
                    content = await session.page.$eval(selector, el => el.outerHTML);
                    break;
                case 'value':
                    content = await session.page.$eval(selector, el => el.value || el.textContent);
                    break;
                case 'attribute':
                    // 需要在 options 中指定属性名
                    content = await session.page.$eval(selector, el => {
                        const attrs = {};
                        for (const attr of el.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                        return attrs;
                    });
                    break;
                default:
                    content = await session.page.$eval(selector, el => el.textContent);
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
    
    /**
     * 点击元素
     */
    async clickElement(clientId, selector, options = {}) {
        const session = await this.getClientSession(clientId);
        const { wait_for_navigation = false, delay = 100 } = options;
        
        try {
            logger.debug(`🖱️ 点击元素: ${selector}`);
            
            session.lastActivity = new Date();
            
            // 等待元素出现
            await session.page.waitForSelector(selector, {
                timeout: this.config.timeout
            });
            
            // 滚动到元素位置
            await session.page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, selector);
            
            // 等待一下让页面稳定
            await session.page.waitForTimeout(delay);
            
            if (wait_for_navigation) {
                // 等待导航的点击
                const [response] = await Promise.all([
                    session.page.waitForNavigation({ waitUntil: 'networkidle2' }),
                    session.page.click(selector)
                ]);
                
                return {
                    success: true,
                    navigated: true,
                    newUrl: session.page.url(),
                    response: response ? response.status() : null
                };
            } else {
                // 普通点击
                await session.page.click(selector);
                
                return {
                    success: true,
                    navigated: false
                };
            }
            
        } catch (error) {
            logger.error(`❌ 点击失败 (${clientId}):`, error);
            throw new Error(`Click failed: ${error.message}`);
        }
    }
    
    /**
     * 输入文本
     */
    async inputText(clientId, selector, text, options = {}) {
        const session = await this.getClientSession(clientId);
        const { clear = true, delay = 50 } = options;
        
        try {
            logger.debug(`⌨️ 输入文本: ${selector}`);
            
            session.lastActivity = new Date();
            
            // 等待元素出现
            await session.page.waitForSelector(selector, {
                timeout: this.config.timeout
            });
            
            // 聚焦元素
            await session.page.focus(selector);
            
            if (clear) {
                // 清空现有内容
                await session.page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) {
                        element.value = '';
                        element.textContent = '';
                    }
                }, selector);
            }
            
            // 输入文本
            await session.page.type(selector, text, { delay });
            
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
    
    /**
     * 截图
     */
    async takeScreenshot(clientId, options = {}) {
        const session = await this.getClientSession(clientId);
        const {
            fullPage = true,
            element = null,
            format = 'png',
            quality = 80,
            clip = null
        } = options;
        
        try {
            logger.debug(`📸 截图请求 (客户端: ${clientId})`);
            
            session.lastActivity = new Date();
            
            const screenshotOptions = {
                type: format,
                fullPage: element ? false : fullPage
            };
            
            // 设置图片质量（仅对 JPEG 有效）
            if (format === 'jpeg' || format === 'jpg') {
                screenshotOptions.quality = quality;
            }
            
            // 如果指定了区域截图
            if (clip) {
                screenshotOptions.clip = clip;
            }
            
            let buffer;
            
            if (element) {
                // 元素截图
                const elementHandle = await session.page.$(element);
                if (!elementHandle) {
                    throw new Error(`Element not found: ${element}`);
                }
                buffer = await elementHandle.screenshot(screenshotOptions);
                await elementHandle.dispose();
            } else {
                // 页面截图
                buffer = await session.page.screenshot(screenshotOptions);
            }
            
            const result = {
                buffer: buffer,
                format: format,
                size: buffer.length,
                timestamp: new Date().toISOString()
            };
            
            // 获取页面尺寸信息
            const dimensions = await session.page.evaluate(() => {
                return {
                    width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                    scrollWidth: document.documentElement.scrollWidth,
                    scrollHeight: document.documentElement.scrollHeight
                };
            });
            
            result.width = dimensions.width;
            result.height = dimensions.height;
            
            logger.debug(`✅ 截图完成: ${result.size} bytes (${result.width}x${result.height})`);
            
            return result;
            
        } catch (error) {
            logger.error(`❌ 截图失败 (${clientId}):`, error);
            throw new Error(`Screenshot failed: ${error.message}`);
        }
    }
    
    /**
     * 关闭客户端会话
     */
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
    
    /**
     * 获取客户端状态
     */
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
    
    /**
     * 获取所有客户端状态
     */
    getAllClientsStatus() {
        const status = {
            totalClients: this.clients.size,
            maxClients: this.config.max_clients,
            browserInitialized: this.isInitialized,
            clients: []
        };
        
        for (const [clientId, session] of this.clients.entries()) {
            status.clients.push({
                id: clientId,
                currentUrl: session.currentUrl,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity
            });
        }
        
        return status;
    }
    
    /**
     * 清理资源
     */
    async cleanup() {
        logger.info('🧹 开始清理浏览器资源...');
        
        try {
            // 关闭所有客户端会话
            const closePromises = Array.from(this.clients.keys()).map(clientId => 
                this.closeClientSession(clientId)
            );
            await Promise.all(closePromises);
            
            // 关闭浏览器
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
