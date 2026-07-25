#!/bin/sh
set -e

echo "[entrypoint] Attente de MySQL sur ${DB_HOST}:${DB_PORT}..."
until php -r "new PDO('mysql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));" 2>/dev/null; do
  sleep 2
done
echo "[entrypoint] MySQL est pret."

php artisan config:clear
php artisan migrate --force

echo "[entrypoint] Demarrage du serveur sur le port 8000"
exec php artisan serve --host=0.0.0.0 --port=8000
