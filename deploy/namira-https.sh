#!/usr/bin/env bash
# Executor: issue the certificate for namirahamrah.ir and force HTTPS.
# Invoked over SSH once DNS actually resolves (the caller does the DNS gate,
# because outbound DNS from this host is filtered and unreliable).
# Idempotent; exits 0 everywhere so it can be called repeatedly.
set -uo pipefail

DOMAIN="namirahamrah.ir"
LOG="/var/log/namira/https-setup.log"
DONE="/var/lib/namira/https.done"
EMAIL="admin@${DOMAIN}"
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

mkdir -p "$(dirname "$LOG")" "$(dirname "$DONE")"
exec >>"$LOG" 2>&1
echo "=== $(date -Is) invoked ==="

[[ -f "$DONE" ]] && { echo "already done"; exit 0; }

code="$(curl -s -o /dev/null -m 15 --resolve "${DOMAIN}:443:127.0.0.1" -w "%{http_code}" "https://${DOMAIN}/")"
echo "local https check -> ${code:-none}"
if [[ "$code" != "200" ]]; then
  echo "abort: vhost is not answering over the domain yet"
  exit 0
fi

if ! command -v certbot >/dev/null 2>&1; then
  echo "installing certbot"
  DEBIAN_FRONTEND=noninteractive apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq certbot python3-certbot-nginx || exit 0
fi

backup="/root/namira-nginx.$(date +%Y%m%d-%H%M%S).bak"
cp /etc/nginx/sites-available/namira "$backup"
echo "nginx backup: $backup"

if ! certbot --nginx -n --agree-tos --no-eff-email -m "$EMAIL" --redirect \
      -d "$DOMAIN" -d "www.${DOMAIN}"; then
  echo "certbot failed"
  exit 0
fi

https="$(curl -s -o /dev/null -m 20 -w '%{http_code}' "https://${DOMAIN}/")"
redir="$(curl -s -o /dev/null -m 20 --resolve "${DOMAIN}:80:127.0.0.1" -w '%{http_code}' "http://${DOMAIN}/")"
www="$(curl -s -o /dev/null -m 20 -w '%{http_code}' --resolve "www.${DOMAIN}:443:127.0.0.1" "https://www.${DOMAIN}/")"
expiry="$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/${DOMAIN}/cert.pem" 2>/dev/null)"
echo "verify: https=${https} http=${redir} www=${www} ${expiry}"

if [[ "$https" == "200" && "$redir" == "301" && "$www" == "200" ]]; then
  date -Is >"$DONE"
  echo "HTTPS READY"
else
  echo "verify failed"
fi
exit 0
