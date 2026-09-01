# ==============================================================================
# Multi-Stage Dockerfile for InfraPulse React Dashboard
# Stage 1: Build Static Vite Assets with Node 20
# Stage 2: Serve via Lightweight Nginx Alpine Container with Reverse Proxy
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:1.25-alpine

# Copy built HTML/JS assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
