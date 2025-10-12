# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

# install deps first for better caching
COPY package*.json ./
RUN npm ci

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

# Nginx will also reverse-proxy /api to the backend
# We'll drop in a site config from the infra repo at runtime via a bind mount
