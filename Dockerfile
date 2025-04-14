# Step 1: Build the React frontend
FROM node:20 AS frontend
WORKDIR /app/client
COPY client/ ./
RUN npm install && npm run build

# Step 2: Build the NestJS backend
FROM node:20 AS backend
WORKDIR /app/backend
COPY server/backend/ ./
RUN npm install
RUN npm install -g @nestjs/cli
RUN npx prisma generate
RUN npx prisma migrate deploy || true
RUN npm run build

# Step 3: Production image with Nginx + backend
FROM nginx:alpine
WORKDIR /app

# Copy frontend build
COPY --from=frontend /app/client/dist /usr/share/nginx/html

# Copy backend output
COPY --from=backend /app/backend/dist /app/backend
COPY --from=backend /app/backend/node_modules /app/backend/node_modules

# Copy env file (optional: you can use Railway's UI for env vars)
COPY .env /app/backend/.env

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start both Nginx and backend
CMD ["sh", "-c", "node /app/backend/main.js & nginx -g 'daemon off;'"]