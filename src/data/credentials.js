/**
 * MCP Web Automation Tool - 密码管理器
 * 管理网站登录凭证的增删改查操作
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class CredentialManager {
    constructor() {
        this.dataFile = path.join(process.cwd(), 'data', 'user-data.json');
        this.logger = logger.child('CredentialManager');
        
        // 确保数据文件存在
        this.initializeDataFile();
        
        this.logger.info('🔐 密码管理器初始化完成');
    }
    
    /**
     * 初始化数据文件
     */
    initializeDataFile() {
        try {
            // 确保data目录存在
            const dataDir = path.dirname(this.dataFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            // 如果数据文件不存在，创建初始结构
            if (!fs.existsSync(this.dataFile)) {
                const initialData = {
                    bookmarks: {},
                    credentials: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    version: '1.0.0'
                };
                
                this.writeDataFile(initialData);
                this.logger.info('📁 创建初始数据文件');
            }
            
        } catch (error) {
            this.logger.error('❌ 初始化数据文件失败:', error);
            throw new Error(`Failed to initialize data file: ${error.message}`);
        }
    }
    
    /**
     * 读取数据文件
     */
    readDataFile() {
        try {
            const data = fs.readFileSync(this.dataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            this.logger.error('❌ 读取数据文件失败:', error);
            
            // 尝试恢复默认数据结构
            const defaultData = {
                bookmarks: {},
                credentials: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version: '1.0.0'
            };
            
            this.writeDataFile(defaultData);
            return defaultData;
        }
    }
    
    /**
     * 写入数据文件
     */
    writeDataFile(data) {
        try {
            // 更新时间戳
            data.updated_at = new Date().toISOString();
            
            // 创建备份（保留最近一次）
            if (fs.existsSync(this.dataFile)) {
                const backupFile = this.dataFile + '.backup';
                fs.copyFileSync(this.dataFile, backupFile);
            }
            
            // 写入新数据
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf8');
            
        } catch (error) {
            this.logger.error('❌ 写入数据文件失败:', error);
            throw new Error(`Failed to write data file: ${error.message}`);
        }
    }
    
    /**
     * 验证网站域名格式
     */
    validateWebsite(website) {
        if (!website || typeof website !== 'string') {
            throw new Error('Website must be a non-empty string');
        }
        
        // 移除协议前缀和路径
        let cleanWebsite = website.toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]
            .split('?')[0]
            .split('#')[0];
            
        // 基本域名格式验证
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(cleanWebsite)) {
            throw new Error('Invalid website format');
        }
        
        return cleanWebsite;
    }
    
    /**
     * 验证用户名格式
     */
    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            throw new Error('Username must be a non-empty string');
        }
        
        const trimmed = username.trim();
        if (trimmed.length === 0) {
            throw new Error('Username cannot be empty');
        }
        
        return trimmed;
    }
    
    /**
     * 验证密码格式
     */
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }
        
        if (password.length === 0) {
            throw new Error('Password cannot be empty');
        }
        
        return password; // 密码保持原样，不进行trim
    }
    
    /**
     * 保存凭证
     */
    async saveCredential(website, username, password, options = {}) {
        try {
            // 验证参数
            const validWebsite = this.validateWebsite(website);
            const validUsername = this.validateUsername(username);
            const validPassword = this.validatePassword(password);
            
            // 读取当前数据
            const data = this.readDataFile();
            
            // 确保 credentials 对象存在
            if (!data.credentials) {
                data.credentials = {};
            }
            
            // 检查是否已存在凭证
            const existingCredential = data.credentials[validWebsite];
            const isUpdate = existingCredential !== undefined;
            
            // 创建凭证对象
            const credentialData = {
                id: existingCredential?.id || uuidv4(),
                website: validWebsite,
                username: validUsername,
                password: validPassword, // 注意：明文存储（根据需求）
                description: options.description || '',
                tags: options.tags || [],
                created_at: existingCredential?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_used: existingCredential?.last_used || null,
                use_count: existingCredential?.use_count || 0
            };
            
            // 保存凭证
            data.credentials[validWebsite] = credentialData;
            
            // 写入数据文件
            this.writeDataFile(data);
            
            const action = isUpdate ? '更新' : '保存';
            this.logger.info(`✅ ${action}凭证: ${validUsername}@${validWebsite}`);
            
            // 返回结果时不包含密码
            const safeCredential = { ...credentialData };
            delete safeCredential.password;
            
            return {
                success: true,
                action: isUpdate ? 'updated' : 'created',
                credential: safeCredential,
                website: validWebsite
            };
            
        } catch (error) {
            this.logger.error('❌ 保存凭证失败:', error);
            throw new Error(`Failed to save credential: ${error.message}`);
        }
    }
    
    /**
     * 获取凭证
     */
    async getCredential(website, includePassword = true) {
        try {
            const validWebsite = this.validateWebsite(website);
            
            // 读取数据
            const data = this.readDataFile();
            
            if (!data.credentials || !data.credentials[validWebsite]) {
                return {
                    success: false,
                    message: 'Credential not found',
                    website: validWebsite
                };
            }
            
            const credential = { ...data.credentials[validWebsite] };
            
            // 根据参数决定是否包含密码
            if (!includePassword) {
                delete credential.password;
            }
            
            this.logger.debug(`🔍 获取凭证: ${credential.username}@${validWebsite}`);
            
            return {
                success: true,
                credential: credential,
                website: validWebsite
            };
            
        } catch (error) {
            this.logger.error('❌ 获取凭证失败:', error);
            throw new Error(`Failed to get credential: ${error.message}`);
        }
    }
    
    /**
     * 获取所有网站列表
     */
    async listWebsites(includePasswords = false) {
        try {
            const data = this.readDataFile();
            
            if (!data.credentials) {
                return {
                    success: true,
                    websites: [],
                    total: 0,
                    credentials: {}
                };
            }
            
            const websites = Object.keys(data.credentials);
            const credentials = {};
            
            // 处理每个网站的凭证
            for (const website of websites) {
                const credential = { ...data.credentials[website] };
                
                // 根据参数决定是否包含密码
                if (!includePasswords) {
                    delete credential.password;
                }
                
                credentials[website] = credential;
            }
            
            this.logger.debug(`📋 列出网站: ${websites.length} 个`);
            
            return {
                success: true,
                websites: websites,
                total: websites.length,
                credentials: credentials
            };
            
        } catch (error) {
            this.logger.error('❌ 列出网站失败:', error);
            throw new Error(`Failed to list websites: ${error.message}`);
        }
    }
    
    /**
     * 删除凭证
     */
    async deleteCredential(website) {
        try {
            const validWebsite = this.validateWebsite(website);
            
            // 读取当前数据
            const data = this.readDataFile();
            
            if (!data.credentials || !data.credentials[validWebsite]) {
                return {
                    success: false,
                    message: 'Credential not found',
                    website: validWebsite
                };
            }
            
            // 获取要删除的凭证信息
            const deletedCredential = { ...data.credentials[validWebsite] };
            delete deletedCredential.password; // 不在日志中显示密码
            
            // 删除凭证
            delete data.credentials[validWebsite];
            
            // 保存数据
            this.writeDataFile(data);
            
            this.logger.info(`✅ 删除凭证: ${deletedCredential.username}@${validWebsite}`);
            
            return {
                success: true,
                deleted_credential: deletedCredential,
                website: validWebsite,
                remaining_websites: Object.keys(data.credentials).length
            };
            
        } catch (error) {
            this.logger.error('❌ 删除凭证失败:', error);
            throw new Error(`Failed to delete credential: ${error.message}`);
        }
    }
    
    /**
     * 更新凭证
     */
    async updateCredential(website, updates = {}) {
        try {
            const validWebsite = this.validateWebsite(website);
            
            // 读取当前数据
            const data = this.readDataFile();
            
            if (!data.credentials || !data.credentials[validWebsite]) {
                throw new Error('Credential not found');
            }
            
            const credential = data.credentials[validWebsite];
            
            // 验证和应用更新
            if (updates.username !== undefined) {
                credential.username = this.validateUsername(updates.username);
            }
            
            if (updates.password !== undefined) {
                credential.password = this.validatePassword(updates.password);
            }
            
            if (updates.description !== undefined) {
                credential.description = updates.description;
            }
            
            if (updates.tags !== undefined) {
                credential.tags = Array.isArray(updates.tags) ? updates.tags : [];
            }
            
            // 更新时间戳
            credential.updated_at = new Date().toISOString();
            
            // 保存数据
            this.writeDataFile(data);
            
            this.logger.info(`✅ 更新凭证: ${credential.username}@${validWebsite}`);
            
            // 返回结果时不包含密码
            const safeCredential = { ...credential };
            delete safeCredential.password;
            
            return {
                success: true,
                credential: safeCredential,
                website: validWebsite
            };
            
        } catch (error) {
            this.logger.error('❌ 更新凭证失败:', error);
            throw new Error(`Failed to update credential: ${error.message}`);
        }
    }
    
    /**
     * 记录凭证使用
     */
    async recordUsage(website) {
        try {
            const validWebsite = this.validateWebsite(website);
            
            // 读取当前数据
            const data = this.readDataFile();
            
            if (!data.credentials || !data.credentials[validWebsite]) {
                return {
                    success: false,
                    message: 'Credential not found'
                };
            }
            
            const credential = data.credentials[validWebsite];
            
            // 更新使用记录
            credential.use_count = (credential.use_count || 0) + 1;
            credential.last_used = new Date().toISOString();
            
            // 保存数据
            this.writeDataFile(data);
            
            this.logger.debug(`📊 记录使用: ${credential.username}@${validWebsite} (使用次数: ${credential.use_count})`);
            
            return {
                success: true,
                website: validWebsite,
                use_count: credential.use_count,
                last_used: credential.last_used
            };
            
        } catch (error) {
            this.logger.error('❌ 记录使用失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 搜索凭证
     */
    async searchCredentials(query, options = {}) {
        try {
            if (!query || typeof query !== 'string') {
                throw new Error('Search query must be a non-empty string');
            }
            
            const data = this.readDataFile();
            const results = [];
            const searchQuery = query.toLowerCase();
            
            // 搜索选项
            const {
                searchInWebsite = true,
                searchInUsername = true,
                searchInDescription = true,
                searchInTags = true,
                includePasswords = false,
                limit = 20
            } = options;
            
            if (!data.credentials) {
                return {
                    success: true,
                    query: query,
                    results: [],
                    total: 0
                };
            }
            
            // 执行搜索
            for (const [website, credential] of Object.entries(data.credentials)) {
                let matches = false;
                const matchDetails = [];
                
                // 在网站域名中搜索
                if (searchInWebsite && website.toLowerCase().includes(searchQuery)) {
                    matches = true;
                    matchDetails.push('website');
                }
                
                // 在用户名中搜索
                if (searchInUsername && credential.username.toLowerCase().includes(searchQuery)) {
                    matches = true;
                    matchDetails.push('username');
                }
                
                // 在描述中搜索
                if (searchInDescription && credential.description && 
                    credential.description.toLowerCase().includes(searchQuery)) {
                    matches = true;
                    matchDetails.push('description');
                }
                
                // 在标签中搜索
                if (searchInTags && credential.tags && 
                    credential.tags.some(tag => tag.toLowerCase().includes(searchQuery))) {
                    matches = true;
                    matchDetails.push('tags');
                }
                
                if (matches) {
                    const result = { ...credential };
                    
                    // 根据参数决定是否包含密码
                    if (!includePasswords) {
                        delete result.password;
                    }
                    
                    results.push({
                        ...result,
                        website: website,
                        match_fields: matchDetails
                    });
                    
                    // 限制结果数量
                    if (results.length >= limit) {
                        break;
                    }
                }
            }
            
            // 按相关性排序（匹配字段数量）
            results.sort((a, b) => b.match_fields.length - a.match_fields.length);
            
            this.logger.debug(`🔍 搜索凭证: "${query}" - 找到 ${results.length} 个结果`);
            
            return {
                success: true,
                query: query,
                results: results,
                total: results.length,
                limited: results.length >= limit
            };
            
        } catch (error) {
            this.logger.error('❌ 搜索凭证失败:', error);
            throw new Error(`Failed to search credentials: ${error.message}`);
        }
    }
    
    /**
     * 获取统计信息
     */
    async getStatistics() {
        try {
            const data = this.readDataFile();
            
            const stats = {
                total_websites: 0,
                total_usage: 0,
                most_used: null,
                recently_added: null,
                recently_used: null,
                websites_by_usage: []
            };
            
            if (!data.credentials) {
                return { success: true, statistics: stats };
            }
            
            const credentials = Object.entries(data.credentials);
            stats.total_websites = credentials.length;
            
            let mostUsedCredential = null;
            let mostRecentCredential = null;
            let mostRecentlyUsedCredential = null;
            
            // 统计信息
            for (const [website, credential] of credentials) {
                const useCount = credential.use_count || 0;
                stats.total_usage += useCount;
                
                // 查找使用最多的凭证
                if (!mostUsedCredential || useCount > (mostUsedCredential.use_count || 0)) {
                    mostUsedCredential = { ...credential, website };
                    delete mostUsedCredential.password;
                }
                
                // 查找最新添加的凭证
                if (!mostRecentCredential || 
                    new Date(credential.created_at) > new Date(mostRecentCredential.created_at)) {
                    mostRecentCredential = { ...credential, website };
                    delete mostRecentCredential.password;
                }
                
                // 查找最近使用的凭证
                if (credential.last_used && 
                    (!mostRecentlyUsedCredential || 
                     new Date(credential.last_used) > new Date(mostRecentlyUsedCredential.last_used))) {
                    mostRecentlyUsedCredential = { ...credential, website };
                    delete mostRecentlyUsedCredential.password;
                }
                
                // 按使用次数排序的网站列表
                stats.websites_by_usage.push({
                    website: website,
                    username: credential.username,
                    use_count: useCount,
                    last_used: credential.last_used,
                    created_at: credential.created_at
                });
            }
            
            // 按使用次数降序排列
            stats.websites_by_usage.sort((a, b) => (b.use_count || 0) - (a.use_count || 0));
            
            stats.most_used = mostUsedCredential;
            stats.recently_added = mostRecentCredential;
            stats.recently_used = mostRecentlyUsedCredential;
            
            this.logger.debug(`📊 统计信息: ${stats.total_websites} 个网站，${stats.total_usage} 次使用`);
            
            return {
                success: true,
                statistics: stats
            };
            
        } catch (error) {
            this.logger.error('❌ 获取统计信息失败:', error);
            throw new Error(`Failed to get statistics: ${error.message}`);
        }
    }
    
    /**
     * 导出凭证（不包含密码）
     */
    async exportCredentials(includePasswords = false) {
        try {
            const data = this.readDataFile();
            
            if (!data.credentials) {
                return {
                    success: true,
                    export_data: {},
                    total: 0,
                    exported_at: new Date().toISOString()
                };
            }
            
            const exportData = {};
            
            for (const [website, credential] of Object.entries(data.credentials)) {
                const exportCredential = { ...credential };
                
                if (!includePasswords) {
                    delete exportCredential.password;
                }
                
                exportData[website] = exportCredential;
            }
            
            this.logger.info(`📤 导出凭证: ${Object.keys(exportData).length} 个网站`);
            
            return {
                success: true,
                total: Object.keys(exportData).length,
                includes_passwords: includePasswords,
                exported_at: new Date().toISOString()
            };
            
        } catch (error) {
            this.logger.error('❌ 导出凭证失败:', error);
            throw new Error(`Failed to export credentials: ${error.message}`);
        }
    }
}

module.exports = CredentialManager;
