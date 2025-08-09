/**
 * MCP Web Automation Tool - 认证工具
 * API 密钥验证和访问控制
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

const logger = require('./logger');

/**
 * API 密钥认证中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象  
 * @param {Function} next - Express next 函数
 * @param {String} validApiKey - 有效的 API 密钥
 */
function authenticateApiKey(req, res, next, validApiKey) {
    try {
        // 从请求头中获取 API 密钥
        const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
        
        // 检查是否提供了 API 密钥
        if (!apiKey) {
            logger.warn(`❌ 未提供 API 密钥 - IP: ${getClientIP(req)}`);
            return res.status(401).json({
                success: false,
                error: 'API key is required',
                message: 'Please provide X-API-Key header'
            });
        }
        
        // 处理 Authorization 头中的 Bearer token
        let providedKey = apiKey;
        if (apiKey.startsWith('Bearer ')) {
            providedKey = apiKey.substring(7);
        }
        
        // 验证 API 密钥
        if (providedKey !== validApiKey) {
            logger.warn(`❌ 无效的 API 密钥 - IP: ${getClientIP(req)}, Key: ${providedKey.substring(0, 10)}...`);
            return res.status(403).json({
                success: false,
                error: 'Invalid API key',
                message: 'The provided API key is not valid'
            });
        }
        
        // 验证成功，记录访问日志
        logger.debug(`✅ API 认证成功 - IP: ${getClientIP(req)}, Endpoint: ${req.method} ${req.path}`);
        
        // 在请求对象中添加认证信息
        req.authenticated = true;
        req.apiKey = providedKey;
        
        next();
        
    } catch (error) {
        logger.error('❌ API 认证过程中发生错误:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication error',
            message: 'Internal error during authentication'
        });
    }
}

/**
 * 获取客户端 IP 地址
 * @param {Object} req - Express 请求对象
 * @returns {String} 客户端 IP 地址
 */
function getClientIP(req) {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           'unknown';
}

/**
 * 验证 API 密钥强度
 * @param {String} apiKey - 要验证的 API 密钥
 * @returns {Object} 验证结果
 */
function validateApiKeyStrength(apiKey) {
    const result = {
        valid: true,
        score: 0,
        recommendations: []
    };
    
    // 检查长度
    if (apiKey.length < 16) {
        result.recommendations.push('API 密钥长度建议至少 16 位');
        result.score -= 20;
    } else if (apiKey.length >= 32) {
        result.score += 30;
    } else {
        result.score += 15;
    }
    
    // 检查字符复杂性
    const hasUpperCase = /[A-Z]/.test(apiKey);
    const hasLowerCase = /[a-z]/.test(apiKey);
    const hasNumbers = /[0-9]/.test(apiKey);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(apiKey);
    
    let complexity = 0;
    if (hasUpperCase) complexity++;
    if (hasLowerCase) complexity++;
    if (hasNumbers) complexity++;
    if (hasSpecialChars) complexity++;
    
    result.score += complexity * 10;
    
    if (complexity < 3) {
        result.recommendations.push('建议使用大小写字母、数字和特殊字符的组合');
    }
    
    // 检查是否为常见弱密钥
    const weakKeys = [
        'password',
        '123456',
        'qwerty',
        'admin',
        'test',
        'demo',
        'key',
        'secret',
        'mcp-demo-key-change-me-in-production'
    ];
    
    if (weakKeys.some(weak => apiKey.toLowerCase().includes(weak.toLowerCase()))) {
        result.recommendations.push('请避免使用常见的弱密钥');
        result.score -= 30;
    }
    
    // 检查是否为示例密钥
    if (apiKey === 'mcp-demo-key-change-me-in-production') {
        result.valid = false;
        result.recommendations.push('⚠️ 请立即更换示例 API 密钥！');
        result.score = 0;
    }
    
    // 计算最终分数
    result.score = Math.max(0, Math.min(100, result.score));
    
    return result;
}

/**
 * 生成安全的 API 密钥
 * @param {Number} length - 密钥长度（默认 32）
 * @returns {String} 生成的 API 密钥
 */
function generateApiKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

/**
 * 检查 IP 地址是否在白名单中
 * @param {String} ip - 客户端 IP
 * @param {Array} whitelist - IP 白名单
 * @returns {Boolean} 是否允许访问
 */
function isIPAllowed(ip, whitelist = []) {
    if (!whitelist || whitelist.length === 0) {
        return true; // 没有白名单限制
    }
    
    // 支持 CIDR 格式（简单实现）
    return whitelist.some(allowedIP => {
        if (allowedIP === ip) return true;
        
        // 支持通配符
        if (allowedIP.includes('*')) {
            const pattern = allowedIP.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(ip);
        }
        
        return false;
    });
}

/**
 * 简单的请求频率限制
 */
class RateLimiter {
    constructor(maxRequests = 60, windowMs = 60000) { // 默认每分钟60次请求
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    
    /**
     * 检查是否超过请求限制
     * @param {String} identifier - 标识符（通常是IP地址）
     * @returns {Boolean} 是否允许请求
     */
    isAllowed(identifier) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        // 获取或创建该标识符的请求记录
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }
        
        const userRequests = this.requests.get(identifier);
        
        // 清理过期的请求记录
        const validRequests = userRequests.filter(time => time > windowStart);
        this.requests.set(identifier, validRequests);
        
        // 检查是否超过限制
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        // 记录当前请求
        validRequests.push(now);
        
        return true;
    }
    
    /**
     * 获取剩余请求次数
     * @param {String} identifier - 标识符
     * @returns {Number} 剩余请求次数
     */
    getRemainingRequests(identifier) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        if (!this.requests.has(identifier)) {
            return this.maxRequests;
        }
        
        const userRequests = this.requests.get(identifier);
        const validRequests = userRequests.filter(time => time > windowStart);
        
        return Math.max(0, this.maxRequests - validRequests.length);
    }
    
    /**
     * 清理过期数据
     */
    cleanup() {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        for (const [identifier, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => time > windowStart);
            
            if (validRequests.length === 0) {
                this.requests.delete(identifier);
            } else {
                this.requests.set(identifier, validRequests);
            }
        }
    }
}

// 创建默认的请求限制器
const defaultRateLimiter = new RateLimiter();

// 定期清理过期数据
setInterval(() => {
    defaultRateLimiter.cleanup();
}, 60000); // 每分钟清理一次

module.exports = {
    authenticateApiKey,
    getClientIP,
    validateApiKeyStrength,
    generateApiKey,
    isIPAllowed,
    RateLimiter,
    defaultRateLimiter
};
