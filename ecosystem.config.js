// PM2 process definition for the GRAVY Orchestrator (port 8088).
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 logs gravy-orchestrator
//
// This keeps the orchestrator alive with auto-restart if it ever crashes
// (e.g. uncaught exception / unhandled rejection) and persists stdout/stderr
// to rotating log files instead of a console window that disappears.
module.exports = {
  apps: [
    {
      name: 'gravy-orchestrator',
      script: 'hub/orchestrator.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      // Backoff a bit between restarts so a fast crash-loop doesn't hammer the CPU.
      min_uptime: '10s',
      max_restarts: 50,
      restart_delay: 2000,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      out_file: 'logs/pm2/orchestrator-out.log',
      error_file: 'logs/pm2/orchestrator-error.log',
      merge_logs: true,
      time: true
    }
  ]
};
