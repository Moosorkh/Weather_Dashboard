#!/bin/sh

echo "🚀 Starting NestJS application setup..."

# Check critical environment variable
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set. Exiting!"
  exit 1
else
  echo "✅ DATABASE_URL is set: ${DATABASE_URL:0:25}..."
fi

# Debug other safe environment variables (optional, can remove later)
echo "📌 Environment variables (safe):"
env | grep -v "PASSWORD\|KEY\|SECRET" | sort

# Run Prisma database migrations
echo "🗃️ Running database migrations..."
npx prisma migrate deploy || (echo "❌ Migration failed! Exiting..." && exit 1)

# Start the application
echo "🚦 Starting the NestJS server..."
node dist/main.js
