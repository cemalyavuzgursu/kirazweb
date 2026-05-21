#!/bin/sh
set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Veritabanı yedekleniyor..."
pg_dump --clean --if-exists --no-owner --no-privileges | gzip > "$BACKUP_DIR/db-$TIMESTAMP.sql.gz"
echo "[$(date)] DB yedeği: $BACKUP_DIR/db-$TIMESTAMP.sql.gz"

echo "[$(date)] Görseller yedekleniyor..."
tar -czf "$BACKUP_DIR/uploads-$TIMESTAMP.tar.gz" -C / uploads
echo "[$(date)] Uploads yedeği: $BACKUP_DIR/uploads-$TIMESTAMP.tar.gz"

echo "[$(date)] Yedekleme tamamlandı."
