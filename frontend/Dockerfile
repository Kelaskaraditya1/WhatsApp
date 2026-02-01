# ================================
# Frontend Dockerfile
# Multi-stage build for Vite React
# ================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_OAUTH_URL
ARG VITE_ZEGO_APP_ID
ARG VITE_ZEGO_SERVER_SECRET

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_OAUTH_URL=$VITE_GOOGLE_OAUTH_URL
ENV VITE_ZEGO_APP_ID=$VITE_ZEGO_APP_ID
ENV VITE_ZEGO_SERVER_SECRET=$VITE_ZEGO_SERVER_SECRET

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
