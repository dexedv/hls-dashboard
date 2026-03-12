#!/bin/bash
cd /var/www/vhosts/hls-services.de/dashboard.hls-services.de/httpdocs
composer install --optimize-autoloader --no-dev --no-interaction
/opt/plesk/php/8.3/bin/php artisan config:cache
/opt/plesk/php/8.3/bin/php artisan route:cache
/opt/plesk/php/8.3/bin/php artisan view:cache
/opt/plesk/php/8.3/bin/php artisan migrate --force
