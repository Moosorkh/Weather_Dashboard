#!/bin/sh
echo "All environment variables (safe):"
env | grep -v "PASSWORD\|KEY\|SECRET" | sort

echo "DATABASE_URL value (masked): ${DATABASE_URL:0:25}..."

echo "Running database migrations..."
# Skip migrations if DATABASE_URL is not set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL not set, skipping migrations"
else
  npx prisma migrate deploy || echo "Migration failed, but continuing..."
fi

echo "Starting application..."
node dist/main.js