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

# Add better error handling and logging
echo "DATABASE_URL: ${DATABASE_URL:-not set}"
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set!"
  exit 1
fi

# Generate Prisma client with the correct DATABASE_URL
DATABASE_URL="$DATABASE_URL" npx prisma generate

# Try to run migrations if needed
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy || echo "Migration failed, but continuing"

# Start the backend with proper environment variables
PORT=$PORT DATABASE_URL="$DATABASE_URL" node main.js > /var/log/backend.log 2>&1 &
BACKEND_PID=$!

echo "Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Wait until backend is ready - use the PORT that the app is actually listening on
echo "Waiting for backend to be available on localhost:$PORT..."
for i in $(seq 1 30); do
  # Check if the process is still running (using BusyBox ps)
  if ! ps | grep -v grep | grep $BACKEND_PID > /dev/null; then
    echo "ERROR: Backend process died. Check the logs:"
    cat /var/log/backend.log
    exit 1
  fi
  
  if nc -z localhost $PORT; then
    echo "Backend is ready!"
    break
  fi
  
  echo "Waiting... ($i)"
  sleep 2
done

# If we've waited 30 times and the backend still isn't ready, show the logs
if [ $i -eq 30 ]; then
  echo "Backend did not become ready in time. Check the logs:"
  cat /var/log/backend.log
fi

# Test the health endpoint
echo "Testing health endpoint directly..."
curl -v http://localhost:$PORT/api/health || echo "Failed to reach health endpoint directly"

echo "Testing health endpoint through Nginx..."
curl -v http://localhost/health || echo "Failed to reach health endpoint through Nginx"

# Keep the container alive as long as at least one of the processes is running
wait $NGINX_PID $BACKEND_PID