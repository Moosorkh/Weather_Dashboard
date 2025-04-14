# Step 1: Build the React frontend
FROM node:20 AS frontend
WORKDIR /app/client
COPY client/ ./
# Set the API URL for the frontend to use the backend on the same container
ENV VITE_API_BASE_URL=/api
RUN npm install && npm run build

# Step 2: Build the NestJS backend
FROM node:20 AS backend
WORKDIR /app/backend
COPY server/backend/ ./
RUN npm install
RUN npm install -g @nestjs/cli
# Add linux-musl-openssl-3.0.x to binaryTargets in schema.prisma
RUN sed -i 's/provider *= *"prisma-client-js"/provider = "prisma-client-js"\n  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]/' prisma/schema.prisma
RUN npx prisma generate
RUN npx prisma migrate deploy || true
RUN npm run build

# Step 3: Final image (Node.js + Nginx combo)
FROM node:20-alpine

# Install Nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copy frontend (React build) to Nginx public folder
COPY --from=frontend /app/client/dist /usr/share/nginx/html

# Copy backend (NestJS dist + node_modules)
COPY --from=backend /app/backend/dist /app/backend
COPY --from=backend /app/backend/node_modules /app/backend/node_modules
COPY --from=backend /app/backend/prisma /app/backend/prisma

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Start both backend and frontend via Nginx
CMD ["sh", "-c", "cd /app/backend && node main.js & nginx -g 'daemon off;'"]