#!/bin/sh
# Daily database backup (run from the project folder, e.g. via cron). Keeps the 14 newest.
set -e
mkdir -p backups
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "backups/tms-$(date +%F).sql.gz"
ls -t backups/*.sql.gz | tail -n +15 | xargs -r rm --
echo "Backup done: backups/tms-$(date +%F).sql.gz"
# Restore:  gunzip -c backups/tms-YYYY-MM-DD.sql.gz | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
