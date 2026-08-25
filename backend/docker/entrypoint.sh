#!/bin/sh
set -e

php artisan config:clear

# schedulerサービス(RUN_MODE=scheduler)はnginx/php-fpmを起動せず、RailwayのCron Schedule設定
# (毎分トリガー)によって都度起動されるこのコンテナの中でschedule:runを1回実行して終了する。
# routes/console.phpのSchedule::command()群(likes:expire, notifications:prune等)はここで動く
if [ "$RUN_MODE" = "scheduler" ]; then
  exec php artisan schedule:run
fi

# RailwayはPORT環境変数を動的に渡してくるため、コンテナ起動時にnginx設定へ反映する
export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

php artisan storage:link --force || true
# 起動のたびに実行するが、Laravelのmigrateは未適用分だけ実行するため冪等
php artisan migrate --force

# RailwayのVolumeはstorage/app/publicにマウントされ、起動のたびに所有者がリセットされるため再適用する
chown -R www-data:www-data /var/www/html/storage/app/public || true

exec supervisord -c /etc/supervisor/supervisord.conf
