#!/usr/bin/env node

/**
 * MCP Web Automation Tool - 远程MCP服务器
 * 支持本地stdio和远程HTTP/WebSocket访问的MCP服务
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { z } = require('zod');
const express = require('express');
const cors = require('cors');

const BrowserManager = require('./browser/manager');
const BookmarkManager = require('./data/bookmarks');
const CredentialManager = require('./data/credentials');
const logger = require('./utils/logger');

class RemoteMCPServer {
    constructor() {
        this.mcpServer = new McpServer({
            name: "web-automation-remote",
            version: "1.0.0",
        });
        
        this.browserManager = null;
        this.bookmarkManager = null;
        this.credentialManager = null;
        
        this.setupMCPTools();
    }

    async initializeManagers() {
        this.browserManager = new BrowserManager();
        this.bookmarkManager = new BookmarkManager();
        this.credentialManager = new CredentialManager();
        logger.info('✅ 所有管理器初始化完成');
    }

    setupMCPTools() {
        // 注册网页导航工具
        this.mcpServer.registerTool("web_navigate", {
            description: "Navigate to a web page and return page information",
            inputSchema: {
                url: z.string().describe("The URL to navigate to"),
                client_id: z.string().optional().describe("Client identifier for session management").default("default"),
                wait_for_load: z.boolean().optional().describe("Wait for page to fully load").default(true)
            },
        }, async ({ url, client_id, wait_for_load }) => {
            try {
                const result = await this.browserManager.navigate(client_id, url, { wait_for_load });
                
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ Successfully navigated to: ${result.url}\n📄 Title: ${result.title}\n🔗 Status: ${result.status}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Navigation failed: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        });

        // 注册内容提取工具
        this.mcpServer.registerTool("web_extract_content", {
            description: "Extract content from the current page using CSS selectors with advanced options",
            inputSchema: {
                client_id: z.string().optional().describe("Client identifier").default("default"),
                selector: z.string().optional().describe("CSS selector to target specific elements").default("body"),
                type: z.enum(["text", "html", "attribute", "computed"]).optional().describe("Type of content to extract").default("text"),
                timeout: z.number().optional().describe("Timeout in milliseconds (max 60000)"),
                waitForContent: z.boolean().optional().describe("Wait for content to load dynamically").default(true),
                retryAttempts: z.number().optional().describe("Number of retry attempts (max 10)").default(3),
                minLength: z.number().optional().describe("Minimum content length to consider valid"),
                fallbackSelectors: z.array(z.string()).optional().describe("Array of fallback selectors to try")
            },
        }, async ({ client_id, selector, type, timeout, waitForContent, retryAttempts, minLength, fallbackSelectors }) => {
            try {
                // 构建选项对象
                const options = {};
                
                if (timeout !== undefined) {
                    options.timeout = Math.min(timeout, 60000);
                }
                
                if (waitForContent !== undefined) {
                    options.waitForContent = waitForContent;
                }
                
                if (retryAttempts !== undefined) {
                    options.retryAttempts = Math.min(retryAttempts, 10);
                }
                
                if (minLength !== undefined) {
                    options.minLength = minLength;
                }
                
                if (fallbackSelectors !== undefined) {
                    options.fallbackSelectors = fallbackSelectors;
                }
                
                const result = await this.browserManager.extractContent(client_id, selector, type, options);
                
                // 构建响应内容
                let responseText = `📄 Content extracted from selector "${result.selector}"\n`;
                responseText += `🔍 Extraction method: ${result.metadata?.extractionMethod || 'direct'}\n`;
                responseText += `📏 Content length: ${result.metadata?.length || 0} characters\n`;
                
                if (result.metadata?.retryCount > 0) {
                    responseText += `🔄 Retry attempts: ${result.metadata.retryCount}\n`;
                }
                
                responseText += `⏰ Timestamp: ${result.timestamp}\n\n`;
                
                // 限制显示的内容长度
                const maxDisplayLength = 2000;
                if (result.content.length > maxDisplayLength) {
                    responseText += `${result.content.substring(0, maxDisplayLength)}\n\n... (truncated, total length: ${result.content.length} characters)`;
                } else {
                    responseText += result.content;
                }
                
                return {
                    content: [
                        {
                            type: "text",
                            text: responseText
                        }
                    ]
                };
            } catch (error) {
                let errorText = `❌ Content extraction failed: ${error.message}`;
                
                // 如果是增强错误，显示详细信息
                if (error.errorInfo) {
                    errorText = `❌ Enhanced Content Extraction Error:\n\n`;
                    errorText += `🎯 Selector: ${error.errorInfo.selector}\n`;
                    errorText += `📄 Type: ${error.errorInfo.type}\n`;
                    errorText += `⏰ Timestamp: ${error.errorInfo.timestamp}\n`;
                    errorText += `💡 Suggestions:\n`;
                    error.errorInfo.suggestions.forEach((suggestion, index) => {
                        errorText += `   ${index + 1}. ${suggestion}\n`;
                    });
                    errorText += `\n🔍 Original Error: ${error.errorInfo.message}`;
                }
                
                return {
                    content: [
                        {
                            type: "text",
                            text: errorText
                        }
                    ],
                    isError: true
                };
            }
        });

        // 注册元素点击工具
        this.mcpServer.registerTool("web_click_element", {
            description: "Click on a web page element",
            inputSchema: {
                client_id: z.string().optional().describe("Client identifier").default("default"),
                selector: z.string().describe("CSS selector of the element to click"),
                wait_for_navigation: z.boolean().optional().describe("Wait for navigation after click").default(false)
            },
        }, async ({ client_id, selector, wait_for_navigation }) => {
            try {
                const result = await this.browserManager.clickElement(client_id, selector, { wait_for_navigation });
                
                return {
                    content: [
                        {
                            type: "text",
                            text: `🖱️ Successfully clicked element: ${selector}\n${result.navigated ? '🔄 Page navigation detected' : '✅ Click completed'}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Click failed: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        });

        // 注册文本输入工具
        this.mcpServer.registerTool("web_input_text", {
            description: "Input text into a form field",
            inputSchema: {
                client_id: z.string().optional().describe("Client identifier").default("default"),
                selector: z.string().describe("CSS selector of the input field"),
                text: z.string().describe("Text to input"),
                clear: z.boolean().optional().describe("Clear the field before typing").default(true)
            },
        }, async ({ client_id, selector, text, clear }) => {
            try {
                const result = await this.browserManager.inputText(client_id, selector, text, { clear });
                
                return {
                    content: [
                        {
                            type: "text",
                            text: `⌨️ Successfully input text into ${selector}\n📝 Text: "${text}"\n${clear ? '🧹 Field was cleared before input' : '➕ Text was appended'}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Text input failed: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        });

        // 注册截图工具
        this.mcpServer.registerTool("web_screenshot", {
            description: "Take a screenshot of the current page",
            inputSchema: {
                client_id: z.string().optional().describe("Client identifier").default("default"),
                fullPage: z.boolean().optional().describe("Capture full page or viewport only").default(true),
                format: z.enum(["png", "jpeg"]).optional().describe("Image format").default("png")
            },
        }, async ({ client_id, fullPage, format }) => {
            try {
                const result = await this.browserManager.takeScreenshot(client_id, { fullPage, format });
                
                // 转换为base64
                const base64Image = result.buffer.toString('base64');
                
                return {
                    content: [
                        {
                            type: "text",
                            text: `📸 Screenshot captured successfully\n🖼️ Format: ${result.format}\n📏 Size: ${result.size} bytes\n⏰ Timestamp: ${result.timestamp}`
                        },
                        {
                            type: "image",
                            data: base64Image,
                            mimeType: `image/${format}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Screenshot failed: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        });

        // 注册收藏夹管理工具
        this.mcpServer.registerTool("web_manage_bookmarks", {
            description: "Manage website bookmarks (add, list, delete, update)",
            inputSchema: {
                action: z.enum(["add", "list", "delete", "update"]).describe("Action to perform"),
                website: z.string().optional().describe("Website domain (required for most actions)"),
                url: z.string().optional().describe("URL to bookmark (required for add/update)"),
                title: z.string().optional().describe("Bookmark title (required for add/update)"),
                bookmark_id: z.string().optional().describe("Bookmark ID (required for delete/update)")
            },
        }, async ({ action, website, url, title, bookmark_id }) => {
            try {
                let result;
                
                switch (action) {
                    case "add":
                        if (!website || !url || !title) {
                            throw new Error("Website, URL and title are required for add action");
                        }
                        result = await this.bookmarkManager.addBookmark(website, url, title);
                        break;
                    case "list":
                        result = await this.bookmarkManager.getBookmarks(website);
                        break;
                    case "delete":
                        if (!website || !bookmark_id) {
                            throw new Error("Website and bookmark_id are required for delete action");
                        }
                        result = await this.bookmarkManager.deleteBookmark(website, bookmark_id);
                        break;
                    case "update":
                        if (!website || !bookmark_id) {
                            throw new Error("Website and bookmark_id are required for update action");
                        }
                        result = await this.bookmarkManager.updateBookmark(website, bookmark_id, { url, title });
                        break;
                    default:
                        throw new Error(`Invalid bookmark action: ${action}`);
                }
                
                return {
                    content: [
                        {
                            type: "text",
                            text: `🔖 Bookmark ${action} completed successfully\n📊 Result: ${JSON.stringify(result, null, 2)}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Bookmark management failed: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        });

        // 注册密码管理工具
        this.mcpServer.registerTool("web_manage_credentials", {
            description: "Manage website login credentials (save, get, list, delete)",
            inputSchema: {
                action: z.enum(["save", "get", "list", "delete"]).describe("Action to perform"),
                website: z.string().optional().describe("Website domain"),
                username: z.string().optional().describe("Username (required for save)"),
                password: z.string().optional().describe("Password (required for save)")
            },
        }, async ({ action, website, username, password }) => {
            try {
                let result;
                
                switch (action) {
                    case "save":
                        if (!website || !username || !password) {
                            throw new Error("Website, username and password are required for save action");
                        }
                        result = await this.credentialManager.saveCredential(website, username, password);
                        break;
                    case "get":
                        if (!website) {
                            throw new Error("Website is required for get action");
                        }
                        result = await this.credentialManager.getCredential(website);
                        break;
                    case "list":
                        result = await this.credentialManager.listWebsites();
                        break;
                    case "delete":
                        if (!website) {
                            throw new Error("Website is required for delete action");
                        }
                        result = await this.credentialManager.deleteCredential(website);
                        break;
                    default:
                        throw new Error(`Invalid credential action: ${action}`);
                }
                
                return {
                    content: [
                        {
                            type: "text",
                            text: `🔐 Credential ${action} completed successfully\n📊 Result: ${JSON.stringify(result, null, 2)}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Credential management failed: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        });
    }

    async startStdioServer() {
        try {
            logger.info('🔧 启动stdio MCP服务器...');
            await this.initializeManagers();
            
            const transport = new StdioServerTransport();
            await this.mcpServer.connect(transport);
            
            logger.info('✅ stdio MCP服务器启动成功');
        } catch (error) {
            logger.error('❌ stdio MCP服务器启动失败:', error);
            throw error;
        }
    }

    async startHttpServer(port = 29528) {
        try {
            logger.info('🔧 启动HTTP MCP服务器...');
            await this.initializeManagers();
            
            const app = express();
            
            // 中间件
            app.use(cors({
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization']
            }));
            app.use(express.json());
            
            // SSE端点用于MCP over HTTP
            app.get('/mcp', async (req, res) => {
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                });
                
                try {
                    const transport = new SSEServerTransport(req, res);
                    await this.mcpServer.connect(transport);
                    logger.info('✅ 新的MCP客户端通过HTTP连接');
                } catch (error) {
                    logger.error('❌ HTTP MCP连接失败:', error);
                    res.end();
                }
            });
            
            // 健康检查
            app.get('/health', (req, res) => {
                res.json({
                    status: 'ok',
                    message: 'Remote MCP Web Automation Server is running',
                    version: '1.0.0',
                    timestamp: new Date().toISOString(),
                    protocols: ['stdio', 'http-sse'],
                    tools_count: 7
                });
            });
            
            // 启动HTTP服务器
            app.listen(port, '0.0.0.0', () => {
                logger.info(`✅ HTTP MCP服务器启动成功: http://0.0.0.0:${port}`);
                logger.info(`🔗 MCP连接端点: http://0.0.0.0:${port}/mcp`);
                logger.info(`❤️  健康检查: http://0.0.0.0:${port}/health`);
            });
            
        } catch (error) {
            logger.error('❌ HTTP MCP服务器启动失败:', error);
            throw error;
        }
    }

    async start(mode = 'stdio') {
        try {
            if (mode === 'stdio') {
                await this.startStdioServer();
            } else if (mode === 'http') {
                await this.startHttpServer();
            } else if (mode === 'hybrid') {
                // 在不同进程中启动两种服务
                const { spawn } = require('child_process');
                
                // 启动HTTP服务器进程
                const httpProcess = spawn('node', [__filename, 'http'], {
                    stdio: 'inherit',
                    detached: true
                });
                
                logger.info('🚀 启动混合模式：stdio + HTTP');
                
                // 启动stdio服务器
                await this.startStdioServer();
            }
        } catch (error) {
            logger.error('❌ 服务器启动失败:', error);
            process.exit(1);
        }
    }
}

// 命令行启动逻辑
async function main() {
    const args = process.argv.slice(2);
    const mode = args[0] || 'stdio';
    
    const server = new RemoteMCPServer();
    
    logger.info('🚀 启动远程MCP Web Automation服务器');
    logger.info(`📡 模式: ${mode}`);
    
    await server.start(mode);
}

// 如果直接运行此文件
if (require.main === module) {
    main().catch((error) => {
        console.error('启动失败:', error);
        process.exit(1);
    });
}

module.exports = RemoteMCPServer;