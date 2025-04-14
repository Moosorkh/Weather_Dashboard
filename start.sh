#!/bin/sh
# Wait for database
echo "Waiting for database to be ready..."
sleep 15

# Start the backend
cd /app/backend
node main.js &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 10

# Start nginx
echo "Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Keep the container running
wait $NGINX_PID $BACKEND_PID