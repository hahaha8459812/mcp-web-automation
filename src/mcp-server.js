#!/usr/bin/env node

/**
 * MCP Web Automation Tool - MCP服务器入口
 * 符合Model Context Protocol标准的AI工具服务
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

const BrowserManager = require('./browser/manager');
const BookmarkManager = require('./data/bookmarks');
const CredentialManager = require('./data/credentials');
const logger = require('./utils/logger');

// 创建MCP服务器实例
const mcpServer = new McpServer({
    name: "web-automation",
    version: "1.0.0",
});

// 初始化管理器
let browserManager, bookmarkManager, credentialManager;

async function initializeManagers() {
    browserManager = new BrowserManager();
    bookmarkManager = new BookmarkManager();
    credentialManager = new CredentialManager();
    logger.info('✅ 所有管理器初始化完成');
}

// 注册网页导航工具
mcpServer.registerTool("web_navigate", {
    description: "Navigate to a web page and return page information",
    inputSchema: {
        url: z.string().describe("The URL to navigate to"),
        client_id: z.string().optional().describe("Client identifier for session management").default("default"),
        wait_for_load: z.boolean().optional().describe("Wait for page to fully load").default(true)
    },
}, async ({ url, client_id, wait_for_load }) => {
    try {
        const result = await browserManager.navigate(client_id, url, { wait_for_load });
        
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
mcpServer.registerTool("web_extract_content", {
    description: "Extract content from the current page using CSS selectors",
    inputSchema: {
        client_id: z.string().optional().describe("Client identifier").default("default"),
        selector: z.string().optional().describe("CSS selector to target specific elements").default("body"),
        type: z.enum(["text", "html"]).optional().describe("Type of content to extract").default("text")
    },
}, async ({ client_id, selector, type }) => {
    try {
        const result = await browserManager.extractContent(client_id, selector, type);
        
        return {
            content: [
                {
                    type: "text",
                    text: `📄 Content extracted from selector "${selector}":\n\n${result.content.substring(0, 2000)}${result.content.length > 2000 ? '\n\n... (truncated, total length: ' + result.content.length + ' characters)' : ''}`
                }
            ]
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Content extraction failed: ${error.message}`
                }
            ],
            isError: true
        };
    }
});

// 注册元素点击工具
mcpServer.registerTool("web_click_element", {
    description: "Click on a web page element",
    inputSchema: {
        client_id: z.string().optional().describe("Client identifier").default("default"),
        selector: z.string().describe("CSS selector of the element to click"),
        wait_for_navigation: z.boolean().optional().describe("Wait for navigation after click").default(false)
    },
}, async ({ client_id, selector, wait_for_navigation }) => {
    try {
        const result = await browserManager.clickElement(client_id, selector, { wait_for_navigation });
        
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
mcpServer.registerTool("web_input_text", {
    description: "Input text into a form field",
    inputSchema: {
        client_id: z.string().optional().describe("Client identifier").default("default"),
        selector: z.string().describe("CSS selector of the input field"),
        text: z.string().describe("Text to input"),
        clear: z.boolean().optional().describe("Clear the field before typing").default(true)
    },
}, async ({ client_id, selector, text, clear }) => {
    try {
        const result = await browserManager.inputText(client_id, selector, text, { clear });
        
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
mcpServer.registerTool("web_screenshot", {
    description: "Take a screenshot of the current page",
    inputSchema: {
        client_id: z.string().optional().describe("Client identifier").default("default"),
        fullPage: z.boolean().optional().describe("Capture full page or viewport only").default(true),
        format: z.enum(["png", "jpeg"]).optional().describe("Image format").default("png")
    },
}, async ({ client_id, fullPage, format }) => {
    try {
        const result = await browserManager.takeScreenshot(client_id, { fullPage, format });
        
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
mcpServer.registerTool("web_manage_bookmarks", {
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
                result = await bookmarkManager.addBookmark(website, url, title);
                break;
            case "list":
                result = await bookmarkManager.getBookmarks(website);
                break;
            case "delete":
                if (!website || !bookmark_id) {
                    throw new Error("Website and bookmark_id are required for delete action");
                }
                result = await bookmarkManager.deleteBookmark(website, bookmark_id);
                break;
            case "update":
                if (!website || !bookmark_id) {
                    throw new Error("Website and bookmark_id are required for update action");
                }
                result = await bookmarkManager.updateBookmark(website, bookmark_id, { url, title });
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
mcpServer.registerTool("web_manage_credentials", {
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
                result = await credentialManager.saveCredential(website, username, password);
                break;
            case "get":
                if (!website) {
                    throw new Error("Website is required for get action");
                }
                result = await credentialManager.getCredential(website);
                break;
            case "list":
                result = await credentialManager.listWebsites();
                break;
            case "delete":
                if (!website) {
                    throw new Error("Website is required for delete action");
                }
                result = await credentialManager.deleteCredential(website);
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

// 启动MCP服务器
async function main() {
    try {
        logger.info('🔧 正在初始化MCP服务器...');
        
        // 初始化管理器
        await initializeManagers();
        
        logger.info('📡 创建stdio传输层...');
        const transport = new StdioServerTransport();
        
        logger.info('🔗 连接MCP服务器...');
        await mcpServer.connect(transport);
        
        logger.info('🎉 MCP Web Automation Server 启动完成!');
        logger.info('🔌 服务器已通过stdio连接，等待AI客户端调用...');
        
    } catch (error) {
        logger.error('❌ MCP服务器启动失败:', error);
        console.error('详细错误信息:', error);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main().catch((error) => {
        console.error('启动失败:', error);
        process.exit(1);
    });
}

module.exports = { mcpServer, main };