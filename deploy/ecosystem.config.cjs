// pm2 process definition for Namira Holding.
//
//   pm2 startOrReload deploy/ecosystem.config.cjs --update-env
//
// Single instance on purpose: the database is SQLite (one writer) and uploads
// live on local disk. Do NOT switch to cluster mode / instances > 1.
const appDir = process.env.APP_DIR || "/var/www/namira";
const port = process.env.PORT || "3001";
const appName = process.env.APP_NAME || "namira";

module.exports = {
  apps: [
    {
      name: appName,
      cwd: appDir,
      // Call next directly instead of going through `npm start`, so pm2 can
      // signal the real Node process and reload without an orphan `npm` parent.
      script: `${appDir}/node_modules/next/dist/bin/next`,
      args: `start --port ${port}`,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "768M",
      min_uptime: "20s",
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: String(port),
      },
      out_file: `/var/log/${appName}/out.log`,
      error_file: `/var/log/${appName}/error.log`,
      merge_logs: true,
      time: true,
    },
  ],
};
