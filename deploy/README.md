# Deployment — namirahamrah.ir

Host: `194.56.148.100` (Ubuntu 24.04, 2 vCPU / 3.8 GB, root login with SSH key).
Node 20, pm2, nginx, SQLite on local disk.

**Port 3001, not 3000.** Another site on this box (`academyr.ir`) already proxies
to `127.0.0.1:3000`, so the defaults in these scripts are 3001. Do not change it
without checking `ss -tlnp`.

## First time

```bash
git clone https://github.com/sirhudson-bit/Namira-Hamrah-Pars-Holding.git /tmp/namira
ALLOW_ROOT=1 SEED=1 SEED_ADMIN_PASSWORD='<strong-password>' bash /tmp/namira/deploy/bootstrap.sh
```

`ALLOW_ROOT=1` is only needed because this box logs in as root; on a normal
server run it as a sudo user without that flag. `bootstrap.sh` is idempotent.

Other env vars: `DOMAIN`, `PORT`, `APP_DIR`, `BRANCH`, and `REMOVE_DEFAULT=1`
(deletes the stock nginx default vhost — off by default so other sites keep
their catch-all).

## Every later deploy

```bash
cd /var/www/namira && bash deploy/redeploy.sh
```

It pulls `main`, backs up SQLite to `prisma/backups/`, syncs the schema, rebuilds,
and restarts pm2 (single instance — a short restart, not zero-downtime). It
refuses a destructive `prisma db push` so data isn't silently dropped.

## TLS and DNS — live

Let's Encrypt certificate for `namirahamrah.ir` + `www` (certbot, `--nginx`,
auto-renew via `certbot.timer`). HTTPS only: `http://` → `301` → `https://`,
and `www` → `301` → apex, so the canonical host matches `NEXT_PUBLIC_SITE_URL`
and the sitemap.

Zone lives at the hosting's nameservers (`dns1`/`dns2.mizbanfadns.net`):

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `194.56.148.100` |
| A | `www` | `194.56.148.100` |

No other A record for `@` may exist — a parking record pointing at the shared
hosting IP silently sends half the visitors to a 404.

If TLS ever has to be re-issued: `bash deploy/namira-https.sh` on the box, or
`certbot --nginx -d namirahamrah.ir -d www.namirahamrah.ir` by hand.

## Operational facts

| What | Where |
| --- | --- |
| App | `/var/www/namira` |
| Database | `/var/www/namira/prisma/prod.db` (+ `prisma/backups/`) |
| Uploads | `/var/www/namira/storage/uploads/` |
| Env | `/var/www/namira/.env` (chmod 600, gitignored) |
| Logs | `pm2 logs namira`, `/var/log/namira/` |
| Service | `pm2 status`, `pm2 restart namira` |
| nginx site | `/etc/nginx/sites-available/namira` |

- **One process only.** SQLite allows a single writer; `instances: 1` in
  `ecosystem.config.cjs` is deliberate. Never switch to cluster mode.
- **Backups.** `prod.db` and `storage/uploads/` are the only stateful pieces.
  Copy both off the box regularly; a code-only redeploy does not recreate them.
- **Secrets.** `APP_SECRET` is generated on first boot; rotating it invalidates
  every session cookie. The seeded admin password must not stay at the
  documented default.
- Moving to PostgreSQL later: change the `datasource` provider in
  `prisma/schema.prisma`, point `DATABASE_URL` at the new server, then the
  single-instance constraint can go.
