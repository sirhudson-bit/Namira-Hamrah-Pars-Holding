# Deployment — namirahamra.ir

Target: Ubuntu 22.04 / 24.04 VPS, Node 22, pm2, nginx, SQLite on local disk.

## First time

```bash
ssh user@SERVER_IP
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/sirhudson-bit/Namira-Hamrah-Pars-Holding.git /tmp/namira
bash /tmp/namira/deploy/bootstrap.sh
```

Optional flags (env vars, before the command):

```bash
SEED=1 bash deploy/bootstrap.sh      # also seed the database (admin user)
PORT=3000 DOMAIN=namirahamra.ir bash deploy/bootstrap.sh
```

Then TLS:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d namirahamra.ir -d www.namirahamra.ir
```

DNS (A records → server IP) must resolve **before** certbot runs.

## Every later deploy

```bash
cd /var/www/namira && bash deploy/redeploy.sh
```

It pulls `main`, backs up SQLite to `prisma/backups/`, syncs the schema, rebuilds,
and reloads pm2. It refuses to run a destructive `prisma db push` — resolve that
by hand so data isn't silently dropped.

## Operational facts

| What | Where |
| --- | --- |
| App | `/var/www/namira` |
| Database | `/var/www/namira/prisma/prod.db` (+ `prisma/backups/`) |
| Uploads | `/var/www/namira/storage/uploads/` |
| Env | `/var/www/namira/.env` (chmod 600, gitignored) |
| Logs | `pm2 logs namira`, `/var/log/namira/` |
| Service | `pm2 status`, `pm2 restart namira` |

- **One process only.** SQLite allows a single writer; `instances: 1` in
  `ecosystem.config.cjs` is deliberate. Never switch to cluster mode.
- **Backups.** `prod.db` and `storage/uploads/` are the only stateful pieces.
  Copy both off the box regularly; a code-only redeploy does not recreate them.
- **Secrets.** `APP_SECRET` and the seeded admin password must be changed before
  the site is public. Rotating `APP_SECRET` invalidates every session cookie.
- Moving to PostgreSQL later: change the `datasource` provider in
  `prisma/schema.prisma`, point `DATABASE_URL` at the new server, and drop the
  single-instance constraint.
