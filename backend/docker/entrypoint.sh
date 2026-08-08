#!/bin/sh
set -e

# RailwayはPORT環境変数を動的に渡してくるため、コンテナ起動時にnginx設定へ反映する
export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

php artisan config:clear
php artisan storage:link --force || true

exec supervisord -c /etc/supervisor/supervisord.conf
