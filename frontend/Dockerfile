# =================================================================
# Stage 1: Build static assets
# =================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Reproducible installation of dependencies
COPY package*.json ./
RUN npm ci

# Copy application source and build production bundle
COPY . .
RUN npm run build

# =================================================================
# Stage 2: Serve static files with unprivileged NGINX runtime
# =================================================================
FROM nginx:1.27-alpine

# Configure directories and permissions for unprivileged user
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
