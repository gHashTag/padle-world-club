# Multi-stage Dockerfile for Padel World Club API
# Optimized for production with security and performance considerations

# ================================
# Stage 1: Dependencies
# ================================
FROM oven/bun:1-alpine AS deps
LABEL stage=deps

# Install system dependencies for native modules
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# ================================
# Stage 2: Builder
# ================================
FROM oven/bun:1-alpine AS builder
LABEL stage=builder

# Install build dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install all dependencies (including dev dependencies)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# ================================
# Stage 3: Runtime
# ================================
FROM oven/bun:1-alpine AS runtime
LABEL stage=runtime

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S padel -u 1001

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=padel:nodejs /app/dist ./dist
COPY --from=deps --chown=padel:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=padel:nodejs /app/package.json ./package.json

# Copy database migrations and configuration
COPY --from=builder --chown=padel:nodejs /app/src/db/migrations ./src/db/migrations
COPY --from=builder --chown=padel:nodejs /app/src/db/seeds ./src/db/seeds
COPY --from=builder --chown=padel:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Copy API documentation
COPY --from=builder --chown=padel:nodejs /app/src/api/docs ./src/api/docs

# Create necessary directories
RUN mkdir -p /app/logs && chown padel:nodejs /app/logs

# Switch to non-root user
USER padel

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["bun", "run", "start"]
