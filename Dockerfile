# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

# install deps first for better caching
# copy package manifest(s) first so layer can be cached separately from source
COPY package*.json yarn.* ./
# Use npm ci when a lockfile exists for reproducible builds; fall back to npm install otherwise.
# This prevents build failures in environments where package-lock.json is not present.
RUN if [ -f yarn.lock ]; then \
    # Ensure Corepack / Yarn are available in the lightweight node image
    corepack enable; \
    corepack prepare yarn@stable --activate; \
    # Use Yarn's immutable install for reproducibility. Newer Yarn recommends --immutable --immutable-cache --check-cache
    yarn install --immutable --immutable-cache --check-cache || yarn install --frozen-lockfile || yarn install; \
    elif [ -f package-lock.json ]; then \
    # Use npm ci when a lockfile exists for reproducible builds
    npm ci; \
    else \
    # Fallback to npm install when no lockfile is present
    npm install; \
    fi

# copy source
COPY . .

# React reads REACT_APP_* at build-time
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# build static site
RUN npm run build

# ---------- run (nginx) ----------
FROM nginx:1.27-alpine
# Serve the built React app
COPY --from=build /app/build /usr/share/nginx/html
# Use our SPA-friendly nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Nginx will also reverse-proxy /api to the backend
# We'll drop in a site config from the infra repo at runtime via a bind mount
