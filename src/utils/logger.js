/**
 * MCP Web Automation Tool - 简单日志工具
 * 
 * @author hahaha8459812
 * @version 1.0.0
 */

class Logger {
    constructor(prefix = '') {
        this.prefix = prefix;
    }

    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' ');
        
        const fullMessage = formattedArgs ? `${message} ${formattedArgs}` : message;
        return `[${timestamp}] [${level}]${this.prefix ? ` [${this.prefix}]` : ''} ${fullMessage}`;
    }

    error(message, ...args) {
        console.error(this.formatMessage('ERROR', message, ...args));
    }

    warn(message, ...args) {
        console.warn(this.formatMessage('WARN', message, ...args));
    }

    info(message, ...args) {
        console.log(this.formatMessage('INFO', message, ...args));
    }

    debug(message, ...args) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(this.formatMessage('DEBUG', message, ...args));
        }
    }

    child(prefix) {
        return new Logger(this.prefix ? `${this.prefix}:${prefix}` : prefix);
    }
}

// 创建默认日志器实例
const defaultLogger = new Logger();

module.exports = defaultLogger;
module.exports.Logger = Logger;
