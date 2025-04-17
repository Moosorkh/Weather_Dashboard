# Use Node.js 20 Alpine for lightweight build
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (with caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the port (NestJS default or your custom port)
EXPOSE 3001

# Ensure the start.sh script is executable
RUN chmod +x /app/start.sh

# Start script
CMD ["/app/start.sh"]
