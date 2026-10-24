#!/usr/bin/env bash
# Namira Holding — first-time server bootstrap (Ubuntu 22.04 / 24.04)
# Installs runtime deps, clones the repo, builds it and keeps it alive with pm2.
#
#   bash deploy/bootstrap.sh
#
# Idempotent: safe to re-run. Run as a normal user with sudo rights, NOT as root.

set -euo pipefail

APP_NAME="${APP_NAME:-namira}"
APP_DIR="${APP_DIR:-/var/www/namira}"
DOMAIN="${DOMAIN:-namirahamra.ir}"
PORT="${PORT:-3000}"
REPO="${REPO:-https://github.com/sirhudson-bit/Namira-Hamrah-Pars-Holding.git}"
BRANCH="${BRANCH:-main}"
NODE_MAJOR="${NODE_MAJOR:-22}"
SEED="${SEED:-0}"

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!! %s\033[0m\n' "$*"; }
die() { printf '\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] && die "Do not run as root. Use a regular user with sudo."
command -v sudo >/dev/null 2>&1 || die "sudo is required."
command -v apt-get >/dev/null 2>&1 || die "This script targets Ubuntu/Debian."

# ── 1. System packages ──────────────────────────────────────────────────────
log "Installing system packages"
sudo apt-get update -qq
sudo apt-get install -y -qq curl git ca-certificates ufw nginx

# ── 2. Node.js ──────────────────────────────────────────────────────────────
need_node=1
if command -v node >/dev/null 2>&1; then
  current="$(node -p 'process.versions.node.split(".")[0]')"
  if [[ "$current" -ge 18 ]]; then
    log "Node $(node -v) already installed"
    need_node=0
  fi
fi
if [[ "$need_node" -eq 1 ]]; then
  log "Installing Node.js ${NODE_MAJOR}.x"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y -qq nodejs
fi

# ── 3. pm2 ──────────────────────────────────────────────────────────────────
if ! command -v pm2 >/dev/null 2>&1; then
  log "Installing pm2"
  sudo npm install -g pm2
fi

# ── 4. Source code ──────────────────────────────────────────────────────────
if [[ -d "$APP_DIR/.git" ]]; then
  log "Updating existing checkout in $APP_DIR"
  git -C "$APP_DIR" fetch --prune origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  log "Cloning into $APP_DIR"
  sudo mkdir -p "$(dirname "$APP_DIR")"
  sudo chown "$(id -u):$(id -g)" "$(dirname "$APP_DIR")"
  git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# ── 5. Environment file ─────────────────────────────────────────────────────
if [[ ! -f .env ]]; then
  log "Creating .env (edit it later if you need to)"
  secret="$(node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))')"
  cat > .env <<EOF
DATABASE_URL="file:${APP_DIR}/prisma/prod.db"
APP_SECRET="${secret}"
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"
NEXT_PUBLIC_GA_ID=""
RATE_LIMIT_DISABLED=""
EOF
  chmod 600 .env
else
  log ".env already exists — leaving it untouched"
  warn "Check DATABASE_URL points outside .next (e.g. file:${APP_DIR}/prisma/prod.db)"
fi

# ── 6. Build ────────────────────────────────────────────────────────────────
log "Installing dependencies"
npm ci

log "Syncing database schema"
npx prisma generate
npx prisma db push

if [[ "$SEED" == "1" ]]; then
  log "Seeding database (override the admin password with SEED_ADMIN_PASSWORD)"
  npm run db:seed
else
  warn "Skipped seeding. Run 'npm run db:seed' before the first login, or re-run with SEED=1."
fi

mkdir -p storage/uploads
log "Building production bundle"
npm run build

# ── 7. Run under pm2 ────────────────────────────────────────────────────────
log "Starting pm2 process"
sudo mkdir -p /var/log/"$APP_NAME"
sudo chown -R "$(id -u):$(id -g)" /var/log/"$APP_NAME"
APP_DIR="$APP_DIR" PORT="$PORT" pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$(id -un)" --hp "$HOME" >/dev/null || true

# ── 8. nginx ────────────────────────────────────────────────────────────────
log "Writing nginx site for ${DOMAIN}"
sed "s/__DOMAIN__/${DOMAIN}/g; s/__PORT__/${PORT}/g" deploy/nginx.conf \
  | sudo tee /etc/nginx/sites-available/"$APP_NAME" >/dev/null
sudo ln -sf /etc/nginx/sites-available/"$APP_NAME" /etc/nginx/sites-enabled/"$APP_NAME"
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# ── 9. Firewall ─────────────────────────────────────────────────────────────
log "Configuring ufw"
sudo ufw allow OpenSSH >/dev/null 2>&1 || true
sudo ufw allow 'Nginx Full' >/dev/null 2>&1 || true
sudo ufw --force enable >/dev/null 2>&1 || true

log "Done"
printf '  App dir : %s\n  Logs    : pm2 logs %s  |  /var/log/%s/\n' "$APP_DIR" "$APP_NAME" "$APP_NAME"
printf '  HTTP    : http://%s  (DNS must already point here)\n\n' "$DOMAIN"
printf 'Next step — issue the TLS certificate:\n'
printf '  sudo apt-get install -y certbot python3-certbot-nginx\n'
printf '  sudo certbot --nginx -d %s -d www.%s\n\n' "$DOMAIN" "$DOMAIN"
