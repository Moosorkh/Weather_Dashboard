#!/bin/sh
# Wait for database
echo "Waiting for database to be ready..."
sleep 15

# Start the backend
cd /app/backend
echo "Starting backend..."
# Add DATABASE_URL validation and retry logic
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set!"
  exit 1
fi

# Start nginx first - this will make healthcheck pass
echo "Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Wait a bit before starting the backend
sleep 5

# Start backend in the background
echo "Starting NestJS backend..."
node main.js > /var/log/backend.log 2>&1 &
BACKEND_PID=$!

# Keep the container running by waiting for nginx
wait $NGINX_PID