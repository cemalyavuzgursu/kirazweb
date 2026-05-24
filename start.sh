#!/bin/sh
set -e
npx prisma migrate deploy
npm run seed &
npm run start
