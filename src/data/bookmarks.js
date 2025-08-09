/**
 * MCP Web Automation Tool - 收藏夹管理器
 * 管理网站收藏夹的增删改查操作
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class BookmarkManager {
    constructor() {
        this.dataFile = path.join(process.cwd(), 'data', 'user-data.json');
        this.logger = logger.child('BookmarkManager');
        
        // 确保数据文件存在
        this.initializeDataFile();
        
        this.logger.info('🔖 收藏夹管理器初始化完成');
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
     * 验证URL格式
     */
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('URL must be a non-empty string');
        }
        
        try {
            new URL(url);
            return url;
        } catch (error) {
            throw new Error('Invalid URL format');
        }
    }
    
    /**
     * 添加收藏夹
     */
    async addBookmark(website, url, title, options = {}) {
        try {
            // 验证参数
            const validWebsite = this.validateWebsite(website);
            const validUrl = this.validateUrl(url);
            
            if (!title || typeof title !== 'string') {
                throw new Error('Title must be a non-empty string');
            }
            
            // 读取当前数据
            const data = this.readDataFile();
            
            // 确保 bookmarks 对象存在
            if (!data.bookmarks) {
                data.bookmarks = {};
            }
            
            // 确保网站的收藏夹数组存在
            if (!data.bookmarks[validWebsite]) {
                data.bookmarks[validWebsite] = [];
            }
            
            // 检查URL是否已存在
            const existingBookmark = data.bookmarks[validWebsite].find(
                bookmark => bookmark.url === validUrl
            );
            
            if (existingBookmark && !options.allowDuplicates) {
                throw new Error('URL already bookmarked for this website');
            }
            
            // 创建新收藏夹项
            const newBookmark = {
                id: uuidv4(),
                url: validUrl,
                title: title.trim(),
                description: options.description || '',
                tags: options.tags || [],
                added_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                visit_count: 0,
                last_visited: null
            };
            
            // 添加到收藏夹
            data.bookmarks[validWebsite].push(newBookmark);
            
            // 按添加时间排序（最新的在前）
            data.bookmarks[validWebsite].sort((a, b) => 
                new Date(b.added_at) - new Date(a.added_at)
            );
            
            // 保存数据
            this.writeDataFile(data);
            
            this.logger.info(`✅ 添加收藏夹: ${title} (${validWebsite})`);
            
            return {
                success: true,
                bookmark: newBookmark,
                website: validWebsite,
                total_bookmarks: data.bookmarks[validWebsite].length
            };
            
        } catch (error) {
            this.logger.error('❌ 添加收藏夹失败:', error);
            throw new Error(`Failed to add bookmark: ${error.message}`);
        }
    }
    
    /**
     * 获取收藏夹列表
     */
    async getBookmarks(website = null) {
        try {
            const data = this.readDataFile();
            
            if (!data.bookmarks) {
                return { success: true, bookmarks: {}, total: 0 };
            }
            
            if (website) {
                // 获取特定网站的收藏夹
                const validWebsite = this.validateWebsite(website);
                const websiteBookmarks = data.bookmarks[validWebsite] || [];
                
                return {
                    success: true,
                    website: validWebsite,
                    bookmarks: websiteBookmarks,
                    total: websiteBookmarks.length
                };
            } else {
                // 获取所有收藏夹，按网站分组
                const result = {
                    success: true,
                    bookmarks: data.bookmarks,
                    total: 0,
                    websites: Object.keys(data.bookmarks),
                    summary: {}
                };
                
                // 计算统计信息
                for (const [site, bookmarks] of Object.entries(data.bookmarks)) {
                    result.total += bookmarks.length;
                    result.summary[site] = {
                        count: bookmarks.length,
                        last_added: bookmarks.length > 0 ? bookmarks[0].added_at : null
                    };
                }
                
                return result;
            }
            
        } catch (error) {
            this.logger.error('❌ 获取收藏夹失败:', error);
            throw new Error(`Failed to get bookmarks: ${error.message}`);
        }
    }
    
    /**
     * 更新收藏夹
     */
    async updateBookmark(website, bookmarkId, updates = {}) {
        try {
            const validWebsite = this.validateWebsite(website);
            
            if (!bookmarkId || typeof bookmarkId !== 'string') {
                throw new Error('Bookmark ID must be a non-empty string');
            }
            
            // 读取当前数据
            const data = this.readDataFile();
            
            if (!data.bookmarks || !data.bookmarks[validWebsite]) {
                throw new Error('Website not found in bookmarks');
            }
            
            // 查找要更新的收藏夹
            const bookmarkIndex = data.bookmarks[validWebsite].findIndex(
                bookmark => bookmark.id === bookmarkId
            );
            
            if (bookmarkIndex === -1) {
                throw new Error('Bookmark not found');
            }
            
            const bookmark = data.bookmarks[validWebsite][bookmarkIndex];
            
            // 验证和应用更新
            if (updates.url) {
                bookmark.url = this.validateUrl(updates.url);
            }
            
            if (updates.title) {
                bookmark.title = updates.title.trim();
            }
            
            if (updates.description !== undefined) {
                bookmark.description = updates.description;
            }
            
            if (updates.tags) {
                bookmark.tags = Array.isArray(updates.tags) ? updates.tags : [];
            }
            
            // 更新时间戳
            bookmark.updated_at = new Date().toISOString();
            
            // 保存数据
            this.writeDataFile(data);
            
            this.logger.info(`✅ 更新收藏夹: ${bookmark.title} (${bookmarkId})`);
            
            return {
                success: true,
                bookmark: bookmark,
                website: validWebsite
            };
            
        } catch (error) {
            this.logger.error('❌ 更新收藏夹失败:', error);
            throw new Error(`Failed to update bookmark: ${error.message}`);
        }
    }
    
    /**
     * 删除收藏夹
     */
    async deleteBookmark(website, bookmarkId) {
        try {
            const validWebsite = this.validateWebsite(website);
            
            if (!bookmarkId || typeof bookmarkId !== 'string') {
                throw new Error('Bookmark ID must be a non-empty string');
            }
            
            // 读取当前数据
            const data = this.readDataFile();
            
            if (!data.bookmarks || !data.bookmarks[validWebsite]) {
                throw new Error('Website not found in bookmarks');
            }
            
            // 查找要删除的收藏夹
            const bookmarkIndex = data.bookmarks[validWebsite].findIndex(
                bookmark => bookmark.id === bookmarkId
            );
            
            if (bookmarkIndex === -1) {
                throw new Error('Bookmark not found');
            }
            
            // 获取要删除的收藏夹信息
            const deletedBookmark = data.bookmarks[validWebsite][bookmarkIndex];
            
            // 删除收藏夹
            data.bookmarks[validWebsite].splice(bookmarkIndex, 1);
            
            // 如果该网站没有收藏夹了，删除网站条目
            if (data.bookmarks[validWebsite].length === 0) {
                delete data.bookmarks[validWebsite];
            }
            
            // 保存数据
            this.writeDataFile(data);
            
            this.logger.info(`✅ 删除收藏夹: ${deletedBookmark.title} (${bookmarkId})`);
            
            return {
                success: true,
                deleted_bookmark: deletedBookmark,
                website: validWebsite,
                remaining_bookmarks: data.bookmarks[validWebsite]?.length || 0
            };
            
        } catch (error) {
            this.logger.error('❌ 删除收藏夹失败:', error);
            throw new Error(`Failed to delete bookmark: ${error.message}`);
        }
    }
    
    /**
     * 搜索收藏夹
     */
    async searchBookmarks(query, options = {}) {
        try {
            if (!query || typeof query !== 'string') {
                throw new Error('Search query must be a non-empty string');
            }
            
            const data = this.readDataFile();
            const results = [];
            const searchQuery = query.toLowerCase();
            
            // 搜索选项
            const {
                website = null,
                searchInTitle = true,
                searchInUrl = true,
                searchInDescription = true,
                searchInTags = true,
                limit = 50
            } = options;
            
            // 确定搜索范围
            const websitesToSearch = website ? 
                [this.validateWebsite(website)] : 
                Object.keys(data.bookmarks || {});
            
            // 执行搜索
            for (const site of websitesToSearch) {
                if (!data.bookmarks[site]) continue;
                
                for (const bookmark of data.bookmarks[site]) {
                    let matches = false;
                    const matchDetails = [];
                    
                    // 在标题中搜索
                    if (searchInTitle && bookmark.title.toLowerCase().includes(searchQuery)) {
                        matches = true;
                        matchDetails.push('title');
                    }
                    
                    // 在URL中搜索
                    if (searchInUrl && bookmark.url.toLowerCase().includes(searchQuery)) {
                        matches = true;
                        matchDetails.push('url');
                    }
                    
                    // 在描述中搜索
                    if (searchInDescription && bookmark.description && 
                        bookmark.description.toLowerCase().includes(searchQuery)) {
                        matches = true;
                        matchDetails.push('description');
                    }
                    
                    // 在标签中搜索
                    if (searchInTags && bookmark.tags && 
                        bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery))) {
                        matches = true;
                        matchDetails.push('tags');
                    }
                    
                    if (matches) {
                        results.push({
                            ...bookmark,
                            website: site,
                            match_fields: matchDetails
                        });
                        
                        // 限制结果数量
                        if (results.length >= limit) {
                            break;
                        }
                    }
                }
                
                if (results.length >= limit) {
                    break;
                }
            }
            
            // 按相关性排序（匹配字段数量）
            results.sort((a, b) => b.match_fields.length - a.match_fields.length);
            
            this.logger.debug(`🔍 搜索收藏夹: "${query}" - 找到 ${results.length} 个结果`);
            
            return {
                success: true,
                query: query,
                results: results,
                total: results.length,
                limited: results.length >= limit
            };
            
        } catch (error) {
            this.logger.error('❌ 搜索收藏夹失败:', error);
            throw new Error(`Failed to search bookmarks: ${error.message}`);
        }
    }
    
    /**
     * 记录访问
     */
    async recordVisit(website, bookmarkId) {
        try {
            const validWebsite = this.validateWebsite(website);
            
            // 读取当前数据
            const data = this.readDataFile();
            
            if (!data.bookmarks || !data.bookmarks[validWebsite]) {
                return { success: false, message: 'Website not found' };
            }
            
            // 查找收藏夹
            const bookmark = data.bookmarks[validWebsite].find(
                b => b.id === bookmarkId
            );
            
            if (!bookmark) {
                return { success: false, message: 'Bookmark not found' };
            }
            
            // 更新访问记录
            bookmark.visit_count = (bookmark.visit_count || 0) + 1;
            bookmark.last_visited = new Date().toISOString();
            
            // 保存数据
            this.writeDataFile(data);
            
            this.logger.debug(`📊 记录访问: ${bookmark.title} (访问次数: ${bookmark.visit_count})`);
            
            return {
                success: true,
                bookmark: bookmark,
                visit_count: bookmark.visit_count
            };
            
        } catch (error) {
            this.logger.error('❌ 记录访问失败:', error);
            return { success: false, error: error.message };
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
                total_bookmarks: 0,
                total_visits: 0,
                most_visited: null,
                recently_added: null,
                websites: {}
            };
            
            if (!data.bookmarks) {
                return { success: true, statistics: stats };
            }
            
            let mostVisitedBookmark = null;
            let mostRecentBookmark = null;
            
            // 统计每个网站的信息
            for (const [website, bookmarks] of Object.entries(data.bookmarks)) {
                stats.total_websites++;
                stats.total_bookmarks += bookmarks.length;
                
                const websiteStats = {
                    bookmark_count: bookmarks.length,
                    total_visits: 0,
                    last_added: null,
                    most_visited: null
                };
                
                for (const bookmark of bookmarks) {
                    const visitCount = bookmark.visit_count || 0;
                    websiteStats.total_visits += visitCount;
                    stats.total_visits += visitCount;
                    
                    // 查找访问最多的收藏夹
                    if (!mostVisitedBookmark || visitCount > (mostVisitedBookmark.visit_count || 0)) {
                        mostVisitedBookmark = { ...bookmark, website };
                    }
                    
                    if (!websiteStats.most_visited || visitCount > (websiteStats.most_visited.visit_count || 0)) {
                        websiteStats.most_visited = bookmark;
                    }
                    
                    // 查找最新添加的收藏夹
                    if (!mostRecentBookmark || new Date(bookmark.added_at) > new Date(mostRecentBookmark.added_at)) {
                        mostRecentBookmark = { ...bookmark, website };
                    }
                    
                    if (!websiteStats.last_added || new Date(bookmark.added_at) > new Date(websiteStats.last_added.added_at)) {
                        websiteStats.last_added = bookmark;
                    }
                }
                
                stats.websites[website] = websiteStats;
            }
            
            stats.most_visited = mostVisitedBookmark;
            stats.recently_added = mostRecentBookmark;
            
            this.logger.debug(`📊 统计信息: ${stats.total_bookmarks} 个收藏夹，${stats.total_visits} 次访问`);
            
            return {
                success: true,
                statistics: stats
            };
            
        } catch (error) {
            this.logger.error('❌ 获取统计信息失败:', error);
            throw new Error(`Failed to get statistics: ${error.message}`);
        }
    }
}

module.exports = BookmarkManager;
