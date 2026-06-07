FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql \
    && rm -f /etc/apache2/mods-enabled/mpm_event.load \
        /etc/apache2/mods-enabled/mpm_event.conf \
        /etc/apache2/mods-enabled/mpm_worker.load \
        /etc/apache2/mods-enabled/mpm_worker.conf \
    && (a2dismod mpm_event mpm_worker || true) \
    && a2enmod mpm_prefork rewrite headers

COPY docker/apache-site.conf /etc/apache2/sites-available/000-default.conf
COPY docker/railway-entrypoint.sh /usr/local/bin/railway-entrypoint

COPY --from=frontend-build /app/frontend/dist/ /var/www/html/
COPY docker/root.htaccess /var/www/html/.htaccess
COPY backend/api/ /var/www/html/api/
COPY backend/config/ /var/www/html/config/
COPY backend/helpers/ /var/www/html/helpers/
COPY backend/storage/ /var/www/html/storage/
COPY backend/uploads/ /var/www/html/uploads/

RUN mkdir -p /var/www/html/storage/sessions /var/www/html/uploads/topups \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/uploads \
    && chmod +x /usr/local/bin/railway-entrypoint \
    && apache2ctl configtest

EXPOSE 80

ENTRYPOINT ["railway-entrypoint"]
