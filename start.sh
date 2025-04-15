#!/bin/sh
echo "Environment variables:"
env | grep -v "PASSWORD\|KEY\|SECRET" | sort

# Use the PORT environment variable or default to 3001
PORT="${PORT:-3001}"
echo "Using PORT: $PORT"

echo "Waiting for database to be ready..."
sleep 10

echo "Starting backend..."
cd /app/backend
PORT=$PORT node main.js > /var/log/backend.log 2>&1 &
BACKEND_PID=$!

echo "Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Wait until backend is ready - use the actual port the app is listening on
echo "Waiting for backend to be available on localhost:$PORT..."
for i in $(seq 1 30); do
  if nc -z localhost $PORT; then
    echo "Backend is ready!"
    break
  fi
  
  # Check if the process is still running
  if ! ps -p $BACKEND_PID > /dev/null; then
    echo "ERROR: Backend process died. Check the logs:"
    cat /var/log/backend.log
    exit 1
  fi
  
  echo "Waiting... ($i)"
  sleep 2
done

# Check the health endpoint directly
echo "Testing health endpoint..."
curl -v http://localhost:$PORT/api/health

# Keep the container alive as long as Nginx is running
wait $NGINX_PID