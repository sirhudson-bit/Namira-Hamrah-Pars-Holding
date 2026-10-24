#!/usr/bin/env bash
# Namira Holding — push new code to a server that was already bootstrapped.
#
#   bash deploy/redeploy.sh
#
# Pulls the branch, reinstalls deps, backs up SQLite, syncs the schema,
# rebuilds and reloads pm2 with zero downtime for in-flight requests.

set -euo pipefail

APP_NAME="${APP_NAME:-namira}"
APP_DIR="${APP_DIR:-/var/www/namira}"
BRANCH="${BRANCH:-main}"

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!! %s\033[0m\n' "$*"; }
die() { printf '\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

cd "$APP_DIR" 2>/dev/null || die "$APP_DIR not found — run deploy/bootstrap.sh first."
[[ -f .env ]] || die ".env missing in $APP_DIR"

log "Pulling $BRANCH"
git fetch --prune origin
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

log "Backing up the SQLite database"
db_url="$(grep -E '^DATABASE_URL=' .env | tail -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
db_path="${db_url#file:}"
if [[ -n "$db_path" && -f "$db_path" ]]; then
  mkdir -p prisma/backups
  cp "$db_path" "prisma/backups/prod-$(date +%Y%m%d-%H%M%S).db"
  # keep the ten most recent backups
  ls -1t prisma/backups/*.db 2>/dev/null | tail -n +11 | xargs -r rm --
  echo "    saved: $db_path -> prisma/backups/"
else
  warn "Could not locate the database file from DATABASE_URL ($db_url) — skipping backup"
fi

log "Installing dependencies"
npm ci

log "Syncing database schema"
npx prisma generate
# No --accept-data-loss on purpose: if a migration would drop data, this fails
# loudly and you decide, instead of silently wiping the production table.
if ! npx prisma db push --skip-generate; then
  die "prisma db push refused to run. Inspect 'npx prisma db push --dry-run' and resolve the destructive change manually."
fi

log "Building"
npm run build

log "Reloading pm2"
APP_DIR="$APP_DIR" PORT="${PORT:-3000}" pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save

log "Deployed"
pm2 status "$APP_NAME"
printf '\nHealth check: curl -sS -o /dev/null -w "%%{http_code}\\n" http://127.0.0.1:%s/\n' "${PORT:-3000}"
