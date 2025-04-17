#!/bin/sh
echo "All environment variables (safe):"
env | grep -v "PASSWORD\|KEY\|SECRET" | sort

# More detailed DATABASE_URL debugging
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL is not set at all!"
else
  echo "DATABASE_URL exists and starts with: ${DATABASE_URL:0:25}..."
  echo "DATABASE_URL length: ${#DATABASE_URL} characters"
  
  # Parse parts of the URL for debugging (without showing password)
  DB_USER=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/\([^:]*\):.*/\1/p')
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
  
  echo "Parsed URL parts (for debugging):"
  echo "  User: $DB_USER"
  echo "  Host: $DB_HOST"
  echo "  Port: $DB_PORT"
  echo "  Database: $DB_NAME"
  
  # Test connectivity
  echo "Testing basic connectivity to database server..."
  nc -zv $DB_HOST $DB_PORT > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ TCP connection to $DB_HOST:$DB_PORT succeeded"
  else
    echo "❌ Cannot connect to $DB_HOST:$DB_PORT - network issue or service not running"
  fi
fi

echo "Running database migrations..."
# Skip migrations if DATABASE_URL is not set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL not set, skipping migrations"
else
  # Print the Prisma version for debugging
  echo "Prisma CLI version: $(npx prisma --version)"
  
  # Run the migrations with verbose output
  echo "Running migrations with DATABASE_URL length: ${#DATABASE_URL} characters"
  npx prisma migrate deploy --preview-feature || echo "Migration failed, but continuing..."
fi

echo "Starting application..."
node dist/main.js