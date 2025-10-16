# Use Node.js for backend + static serving
FROM node:18-alpine

# Install bash for build script
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy package.json first for better caching
COPY src/package.json ./src/

# Install dependencies (with cache optimization)
WORKDIR /app/src
RUN npm install --omit=dev

# Copy build script and remaining source files
WORKDIR /app
COPY build.sh ./
COPY src/ ./src/

# Run build script to apply cache busting
WORKDIR /app
RUN chmod +x build.sh && ./build.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start server from src directory
WORKDIR /app/src
CMD ["node", "server.js"]
