# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 Chrome/Chromium 依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# 设置 Puppeteer 使用系统安装的 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install --only=production && npm cache clean --force

# 创建必要的目录
RUN mkdir -p config data logs

# 复制源代码
COPY . .

# 创建非 root 用户来运行应用
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置目录权限
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 29527

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:29527/health || exit 1

# 启动应用
CMD ["npm", "start"]
