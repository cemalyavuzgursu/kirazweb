#!/bin/sh
set -e

# The upload directory may be a mounted volume (e.g. Railway mounts it owned by
# root). Make sure it exists and is writable by the unprivileged app user before
# we drop privileges. UPLOAD_DIR must match src/lib/upload.ts.
UPLOAD_DIR="${UPLOAD_DIR:-/app/public/uploads}"
mkdir -p "$UPLOAD_DIR"
chown -R nextjs:nodejs "$UPLOAD_DIR"

npx prisma migrate deploy
npx prisma db seed &

# Run the Next.js server as the unprivileged user.
exec su-exec nextjs:nodejs npm run start
