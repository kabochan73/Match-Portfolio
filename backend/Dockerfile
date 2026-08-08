# composerコマンド自体はこのイメージから拝借するだけなので、PHPは含めた別ステージにしない
FROM composer:2 AS composer

# ローカル開発・Railway本番の両方で使う共通ベース(Nginx + PHP-FPM構成)
FROM php:8.4-fpm-alpine AS base

RUN apk add --no-cache \
        nginx \
        supervisor \
        postgresql-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
        libpng-dev \
        gettext \
        $PHPIZE_DEPS \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        bcmath \
        mbstring \
        zip \
        intl \
        opcache \
        gd \
    && apk del $PHPIZE_DEPS

COPY --from=composer /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 依存関係のインストールとオートローダー生成だけを行うステージ
# (ローカルはvolumeマウントでソースを上書きするため、本番用ビルドの検証にのみ使う)
FROM base AS build

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev

# Railwayへそのままデプロイする本番イメージ。ローカルのdocker-composeもこのステージを使い、
# volumeマウントでソースコードを上書きして開発する
FROM base AS final

COPY --from=build /var/www/html /var/www/html

COPY docker/nginx.conf.template /etc/nginx/http.d/default.conf.template
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && rm -f /etc/nginx/http.d/default.conf \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["entrypoint.sh"]
