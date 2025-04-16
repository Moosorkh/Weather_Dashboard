# Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/ ./
RUN npm install && npm run build

# Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app/server/backend
COPY server/backend/ ./
RUN npm install && \
    npm install -g @nestjs/cli && \
    npx prisma generate && \
    npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

# Copy built frontend (to be served as static files)
COPY --from=frontend-build /app/client/dist /app/public

# Copy built backend
COPY --from=backend-build /app/server/backend/dist /app/dist
COPY --from=backend-build /app/server/backend/node_modules /app/node_modules
COPY --from=backend-build /app/server/backend/prisma /app/prisma
COPY --from=backend-build /app/server/backend/package.json /app/package.json

# Create start script
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
echo "Starting application..."\n\
node dist/main.js' > /app/start.sh && chmod +x /app/start.sh

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD ["/app/start.sh"]