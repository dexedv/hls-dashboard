#!/bin/sh
set -e

echo "=== HLS Dashboard - Starting up ==="

# Sync fresh public assets from image into the volume
echo "Syncing public assets..."
cp -a /tmp/public-build/* /var/www/html/public/ 2>/dev/null || true

# Clear any stale cached config from build time
php artisan config:clear 2>/dev/null || true

# Wait for PostgreSQL to be ready
if [ "$DB_CONNECTION" = "pgsql" ]; then
    echo "Waiting for PostgreSQL..."
    MAX_RETRIES=30
    RETRY=0
    until php -r "
        \$host = getenv('DB_HOST') ?: 'postgres';
        \$port = getenv('DB_PORT') ?: '5432';
        \$db   = getenv('DB_DATABASE') ?: 'hls_dashboard';
        \$user = getenv('DB_USERNAME') ?: 'hls';
        \$pass = getenv('DB_PASSWORD') ?: 'secret';
        try {
            new PDO(\"pgsql:host=\$host;port=\$port;dbname=\$db\", \$user, \$pass);
            exit(0);
        } catch (Exception \$e) {
            exit(1);
        }
    " 2>/dev/null; do
        RETRY=$((RETRY + 1))
        if [ $RETRY -ge $MAX_RETRIES ]; then
            echo "ERROR: PostgreSQL not ready after ${MAX_RETRIES} attempts"
            exit 1
        fi
        echo "  Attempt $RETRY/$MAX_RETRIES - PostgreSQL not ready, waiting..."
        sleep 2
    done
    echo "PostgreSQL is ready!"
fi

# Cache configuration (now with correct env vars)
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Create storage link (ignore if exists)
php artisan storage:link 2>/dev/null || true

echo "=== HLS Dashboard - Ready ==="

# Execute the main command (php-fpm)
exec "$@"
