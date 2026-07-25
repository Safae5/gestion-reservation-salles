FROM php:8.3-fpm

# Seules les dependances reellement utilisees par l'application :
# - pdo_mysql : connexion MySQL
# - mbstring  : requis par Laravel
# - unzip     : utilise par Composer pour extraire les paquets "dist"
RUN apt-get update && apt-get install -y --no-install-recommends \
    unzip libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Dependances d'abord : couche mise en cache tant que composer.json/lock ne changent pas
COPY composer.json composer.lock ./
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts --prefer-dist

COPY . .
RUN composer dump-autoload --optimize \
    && chmod -R 777 storage bootstrap/cache \
    && chmod +x docker-entrypoint.sh

EXPOSE 8000
CMD ["./docker-entrypoint.sh"]
