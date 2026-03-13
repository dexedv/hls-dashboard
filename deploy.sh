#!/bin/bash
export COMPOSER_ALLOW_SUPERUSER=1

cd /var/www/vhosts/hls-services.de/dashboard.hls-services.de

# Create storage directories if they don't exist
mkdir -p storage/app/public
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs

# Set permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Remove cached files that might cause issues
rm -f bootstrap/cache/*.php

composer install --optimize-autoloader --no-dev

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
