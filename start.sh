#!/bin/sh
echo "Environment variables:"
env | grep -v "PASSWORD\|KEY\|SECRET" | sort

echo "Waiting for database to be ready..."
sleep 10

echo "Starting backend..."
cd /app/backend
node main.js > /var/log/backend.log 2>&1 &
BACKEND_PID=$!

echo "Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Wait until backend is ready
echo "Waiting for backend to be available on localhost:3001..."
for i in $(seq 1 30); do
  if nc -z localhost 3001; then
    echo "Backend is ready!"
    break
  fi
  echo "Waiting... ($i)"
  sleep 2
done

# Keep the container alive as long as Nginx is running
wait $NGINX_PID