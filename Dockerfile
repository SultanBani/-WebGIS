FROM php:8.4-fpm-alpine

# Install system dependencies dan PHP extensions dasar untuk Laravel
RUN apk add --no-cache \
    bash \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    nodejs \
    npm

RUN docker-php-ext-install pdo_mysql bcmath

# Ambil Composer resmi versi terbaru
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Salin folder backend ke dalam container
COPY backend/ .

# Install dependensi Laravel dengan mengabaikan platform reqs biar super aman
RUN composer install --no-interaction --optimize-autoloader --ignore-platform-reqs

# Setel port server Railway
EXPOSE 8000

# Perintah untuk menyalakan Laravel
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
