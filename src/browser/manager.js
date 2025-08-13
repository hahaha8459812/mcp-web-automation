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
        // 移除客户端数量限制，允许无限制并发
        // if (!this.clients.has(clientId) && this.clients.size >= this.config.max_clients) {
        //     throw new Error(`Maximum number of clients (${this.config.max_clients}) exceeded`);
        // }
        
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
    
    async extractContent(clientId, selector = 'body', type = 'text', options = {}) {
        const session = await this.getClientSession(clientId);
        
        try {
            // 规范化和验证选择器
            const normalizedSelector = this.normalizeSelector(selector);
            const validatedSelector = this.validateSelector(normalizedSelector);
            
            logger.debug(`📄 提取内容: ${validatedSelector} (类型: ${type})`);
            
            session.lastActivity = new Date();
            
            // 配置选项
            const config = {
                timeout: options.timeout || this.config.timeout,
                waitForContent: options.waitForContent !== false,
                retryAttempts: options.retryAttempts || 3,
                fallbackSelectors: options.fallbackSelectors || this.generateFallbackSelectors(validatedSelector),
                ...options
            };
            
            // 使用增强的内容提取策略
            const result = await this.extractContentWithStrategy(session, validatedSelector, type, config);
            
            return {
                content: result.content,
                selector: result.actualSelector,
                type: type,
                timestamp: new Date().toISOString(),
                metadata: {
                    length: result.content?.length || 0,
                    isEmpty: !result.content || result.content.trim().length === 0,
                    extractionMethod: result.method,
                    retryCount: result.retryCount || 0
                }
            };
            
        } catch (error) {
            logger.error(`❌ 内容提取失败 (${clientId}):`, error);
            
            // 提供详细的错误信息
            const enhancedError = this.enhanceError(error, selector, type);
            throw enhancedError;
        }
    }

    /**
     * 规范化选择器，处理编码和格式问题
     */
    normalizeSelector(selector) {
        if (!selector || typeof selector !== 'string') {
            return 'body';
        }
        
        // URL解码（如果已编码）
        let normalized = selector;
        try {
            // 检查是否包含URL编码字符
            if (normalized.includes('%')) {
                normalized = decodeURIComponent(normalized);
            }
        } catch (e) {
            logger.warn(`⚠️ 选择器解码失败，使用原始值: ${selector}`);
        }
        
        // 移除多余空格并标准化
        normalized = normalized.trim();
        
        // 处理常见的问题字符
        normalized = normalized
            .replace(/\s+/g, ' ')  // 多个空格合并为一个
            .replace(/\s*([>+~])\s*/g, '$1')  // 移除选择器操作符周围的空格
            .replace(/\s*,\s*/g, ',');  // 标准化逗号分隔的选择器
            
        return normalized;
    }

    /**
     * 验证选择器的有效性
     */
    validateSelector(selector) {
        // 基本验证
        if (!selector || selector.length > 1000) {
            throw new Error('选择器无效或过长');
        }
        
        // 检查危险字符
        const dangerousPatterns = [
            /javascript:/i,
            /<script/i,
            /on\w+\s*=/i
        ];
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(selector)) {
                throw new Error('选择器包含不安全内容');
            }
        }
        
        // 尝试验证CSS选择器语法
        try {
            // 使用document.querySelector验证语法（在浏览器环境中）
            // 这里我们先返回原值，在实际页面中验证
            return selector;
        } catch (e) {
            logger.warn(`⚠️ 选择器语法可能有问题: ${selector}`);
            return selector;
        }
    }

    /**
     * 生成备用选择器列表
     */
    generateFallbackSelectors(originalSelector) {
        const fallbacks = [];
        
        // 如果原选择器很复杂，提供简化版本
        if (originalSelector.includes(' ')) {
            // 提取最后一个元素作为备选
            const parts = originalSelector.split(/\s+/);
            fallbacks.push(parts[parts.length - 1]);
        }
        
        // 通用备选方案
        if (originalSelector.includes('comment')) {
            fallbacks.push(
                '*[class*="comment"]',
                '*[class*="reply"]',
                '.comment',
                '.reply',
                '*[data-v*="comment"]'
            );
        }
        
        if (originalSelector.includes('video')) {
            fallbacks.push(
                '*[class*="video"]',
                'video',
                '.video-info',
                '.video-title'
            );
        }
        
        // 最终备选
        fallbacks.push('main', 'article', 'section', 'div', 'body');
        
        // 去重并过滤原选择器
        return [...new Set(fallbacks)].filter(s => s !== originalSelector);
    }

    /**
     * 增强的内容提取策略
     */
    async extractContentWithStrategy(session, selector, type, config) {
        const attempts = [];
        let lastError = null;
        
        // 准备选择器列表（原选择器 + 备选）
        const selectorsToTry = [selector, ...config.fallbackSelectors];
        
        for (const currentSelector of selectorsToTry) {
            for (let attempt = 0; attempt < config.retryAttempts; attempt++) {
                try {
                    logger.debug(`🔄 尝试选择器: ${currentSelector} (第${attempt + 1}次)`);
                    
                    // 等待内容加载（如果启用）
                    if (config.waitForContent && attempt === 0) {
                        await this.waitForContentLoad(session, currentSelector, config.timeout);
                    }
                    
                    // 尝试提取内容
                    const result = await this.performExtraction(session, currentSelector, type);
                    
                    // 验证结果
                    if (this.isValidContent(result, config)) {
                        return {
                            content: result,
                            actualSelector: currentSelector,
                            method: 'direct',
                            retryCount: attempt
                        };
                    }
                    
                    attempts.push({
                        selector: currentSelector,
                        attempt: attempt + 1,
                        result: result?.substring(0, 100) + '...',
                        isEmpty: !result || result.trim().length === 0
                    });
                    
                } catch (error) {
                    lastError = error;
                    attempts.push({
                        selector: currentSelector,
                        attempt: attempt + 1,
                        error: error.message
                    });
                    
                    // 短暂等待后重试
                    if (attempt < config.retryAttempts - 1) {
                        await this.sleep(500 * (attempt + 1));
                    }
                }
            }
        }
        
        // 如果所有尝试都失败，返回页面的基本信息
        logger.warn(`⚠️ 所有选择器尝试失败，返回页面基本信息`);
        
        try {
            const fallbackContent = await this.getFallbackContent(session, type);
            return {
                content: fallbackContent,
                actualSelector: 'body',
                method: 'fallback',
                retryCount: config.retryAttempts,
                attempts: attempts
            };
        } catch (finalError) {
            throw new Error(`内容提取完全失败: ${lastError?.message || finalError.message}`);
        }
    }

    /**
     * 等待内容动态加载
     */
    async waitForContentLoad(session, selector, timeout) {
        try {
            // 等待选择器出现
            await session.page.waitForSelector(selector, { 
                timeout: Math.min(timeout, 5000),
                visible: false
            });
            
            // 额外等待内容稳定
            await this.sleep(1000);
            
            // 检查是否有动态加载指示器
            const loadingIndicators = [
                '.loading',
                '.spinner',
                '*[class*="loading"]',
                '*[class*="spinner"]'
            ];
            
            for (const indicator of loadingIndicators) {
                try {
                    await session.page.waitForSelector(indicator, { 
                        timeout: 2000,
                        hidden: true
                    });
                } catch (e) {
                    // 忽略超时，继续检查下一个
                }
            }
            
        } catch (error) {
            logger.debug(`⏳ 等待内容加载超时: ${selector}`);
            // 不抛出错误，继续尝试提取
        }
    }

    /**
     * 执行实际的内容提取
     */
    async performExtraction(session, selector, type) {
        switch (type.toLowerCase()) {
            case 'text':
                return await session.page.$eval(selector, el => {
                    // 更智能的文本提取
                    if (el.textContent) {
                        return el.textContent.trim();
                    }
                    return el.innerText?.trim() || '';
                });
                
            case 'html':
                return await session.page.$eval(selector, el => el.innerHTML || '');
                
            case 'attribute':
                // 支持属性提取
                return await session.page.$eval(selector, el => {
                    const attrs = {};
                    for (const attr of el.attributes) {
                        attrs[attr.name] = attr.value;
                    }
                    return JSON.stringify(attrs);
                });
                
            case 'computed':
                // 支持计算样式提取
                return await session.page.$eval(selector, el => {
                    const style = window.getComputedStyle(el);
                    return JSON.stringify({
                        display: style.display,
                        visibility: style.visibility,
                        opacity: style.opacity
                    });
                });
                
            default:
                return await session.page.$eval(selector, el => el.textContent?.trim() || '');
        }
    }

    /**
     * 验证提取的内容是否有效
     */
    isValidContent(content, config) {
        if (!content) return false;
        
        const trimmed = content.trim();
        if (trimmed.length === 0) return false;
        
        // 检查最小长度要求
        if (config.minLength && trimmed.length < config.minLength) {
            return false;
        }
        
        // 检查是否包含有意义的内容
        const meaningfulPatterns = [
            /\w{3,}/,  // 至少包含3个字母的单词
            /[\u4e00-\u9fff]{2,}/,  // 至少包含2个中文字符
            /\d+/  // 包含数字
        ];
        
        return meaningfulPatterns.some(pattern => pattern.test(trimmed));
    }

    /**
     * 获取备用内容
     */
    async getFallbackContent(session, type) {
        try {
            // 尝试获取页面标题和URL
            const title = await session.page.title();
            const url = session.page.url();
            
            // 尝试获取页面的关键信息
            const pageInfo = await session.page.evaluate(() => {
                return {
                    title: document.title,
                    url: location.href,
                    textLength: document.body?.textContent?.length || 0,
                    hasContent: !!document.body?.textContent?.trim()
                };
            });
            
            if (type === 'html') {
                return `<html><head><title>${title}</title></head><body><p>内容提取失败，页面信息：${JSON.stringify(pageInfo)}</p></body></html>`;
            }
            
            return `页面标题: ${title}\n页面URL: ${url}\n页面状态: ${pageInfo.hasContent ? '有内容' : '无内容'}\n文本长度: ${pageInfo.textLength}`;
            
        } catch (error) {
            return `内容提取失败: ${error.message}`;
        }
    }

    /**
     * 增强错误信息
     */
    enhanceError(originalError, selector, type) {
        const errorInfo = {
            message: originalError.message,
            selector: selector,
            type: type,
            timestamp: new Date().toISOString(),
            suggestions: []
        };
        
        // 根据错误类型提供建议
        if (originalError.message.includes('failed to find element')) {
            errorInfo.suggestions.push('选择器可能不存在，尝试使用更通用的选择器');
            errorInfo.suggestions.push('页面可能还在加载，尝试增加等待时间');
        }
        
        if (originalError.message.includes('timeout')) {
            errorInfo.suggestions.push('选择器查找超时，尝试简化选择器');
            errorInfo.suggestions.push('页面加载缓慢，尝试增加超时时间');
        }
        
        const enhancedError = new Error(`内容提取增强错误: ${JSON.stringify(errorInfo, null, 2)}`);
        enhancedError.originalError = originalError;
        enhancedError.errorInfo = errorInfo;
        
        return enhancedError;
    }

    /**
     * 工具方法：睡眠
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
