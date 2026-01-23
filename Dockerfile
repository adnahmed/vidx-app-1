# ─── Build Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install pnpm for better performance
RUN corepack enable pnpm

# Copy package manifest(s) first for better layer caching
COPY package*.json yarn.lock* ./

# Install dependencies with best practices
RUN if [ -f pnpm-lock.yaml ]; then \
    pnpm install --frozen-lockfile --prefer-offline; \
    elif [ -f yarn.lock ]; then \
    corepack prepare yarn@stable --activate; \
    yarn install --non-interactive; \
    elif [ -f package-lock.json ]; then \
    npm ci --prefer-offline; \
    else \
    npm install; \
    fi

# Copy source code
COPY . .

# Build-time environment variables
ARG REACT_APP_API_URL=https://api.example.com
ARG NODE_ENV=production

ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV NODE_ENV=${NODE_ENV}

# Build the application
RUN npm run build

# Verify build
RUN test -d build && echo "Build successful" || (echo "Build failed" && exit 1)

# ─── Runtime Stage ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS prod

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for nginx
RUN addgroup -g 1000 webapp && \
    adduser -D -u 1000 -G webapp webapp && \
    mkdir -p /var/cache/nginx /var/run/nginx && \
    chown -R webapp:webapp /var/cache/nginx /var/run/nginx /etc/nginx/conf.d

# Copy built application from build stage
COPY --from=build --chown=webapp:webapp /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><body>OK</body></html>' > /usr/share/nginx/html/health.html

# Health check
HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=5s \
    CMD curl -f http://localhost/health.html || exit 1

# NOTE: Nginx master process must bind to port 80; run as root and rely on nginx worker process user dropping privileges via config
USER root

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
