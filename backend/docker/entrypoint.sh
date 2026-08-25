#!/bin/sh
set -e

# RailwayはPORT環境変数を動的に渡してくるため、コンテナ起動時にnginx設定へ反映する
export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

php artisan config:clear
php artisan storage:link --force || true
# 起動のたびに実行するが、Laravelのmigrateは未適用分だけ実行するため冪等
php artisan migrate --force

# RailwayのVolumeはstorage/app/publicにマウントされ、起動のたびに所有者がリセットされるため再適用する
chown -R www-data:www-data /var/www/html/storage/app/public || true

exec supervisord -c /etc/supervisor/supervisord.conf
