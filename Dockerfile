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
# Install dependencies
RUN npm install
RUN npm install -g @nestjs/cli
# Add linux-musl-openssl-3.0.x to binaryTargets in schema.prisma
RUN sed -i 's/provider *= *"prisma-client-js"/provider = "prisma-client-js"\n  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]/' prisma/schema.prisma
# Skip Prisma operations during build - we'll do these at runtime
RUN npm run build

# Step 3: Final image
FROM node:20-alpine

# Install Nginx and other utilities
RUN apk add --no-cache nginx curl

WORKDIR /app

# Copy frontend (React build) to Nginx public folder
COPY --from=frontend /app/client/dist /usr/share/nginx/html

# Copy backend (NestJS dist + node_modules)
COPY --from=backend /app/backend/dist /app/backend
COPY --from=backend /app/backend/node_modules /app/backend/node_modules
COPY --from=backend /app/backend/prisma /app/backend/prisma

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Define environment variables
ENV PORT=8080

CMD ["/app/start.sh"]