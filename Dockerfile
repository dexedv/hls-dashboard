# Stage 1: Build frontend assets
FROM node:20-alpine AS node-builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY resources ./resources
COPY vite.config.js ./
COPY postcss.config.js* tailwind.config.js* ./

RUN npm run build

# Stage 2: PHP application
FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    linux-headers \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        pgsql \
        bcmath \
        gd \
        zip \
        intl \
        mbstring \
        opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Cleanup build dependencies
RUN apk del $PHPIZE_DEPS linux-headers

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application code
COPY . .

# Complete composer install with autoloader
RUN composer install --no-dev --optimize-autoloader --prefer-dist

# Copy frontend build from node stage
COPY --from=node-builder /app/public/build ./public/build

# Save a copy of public dir so entrypoint can sync into the volume
RUN cp -a public /tmp/public-build

# Prepare storage and cache directories
RUN mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/backups \
    bootstrap/cache

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# PHP-FPM tuning (keep default zz-docker.conf with daemonize=no)
RUN echo '[www]' > /usr/local/etc/php-fpm.d/zy-tuning.conf \
    && echo 'pm = dynamic' >> /usr/local/etc/php-fpm.d/zy-tuning.conf \
    && echo 'pm.max_children = 20' >> /usr/local/etc/php-fpm.d/zy-tuning.conf \
    && echo 'pm.start_servers = 5' >> /usr/local/etc/php-fpm.d/zy-tuning.conf \
    && echo 'pm.min_spare_servers = 3' >> /usr/local/etc/php-fpm.d/zy-tuning.conf \
    && echo 'pm.max_spare_servers = 10' >> /usr/local/etc/php-fpm.d/zy-tuning.conf

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
