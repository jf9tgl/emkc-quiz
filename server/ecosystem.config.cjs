// PM2 Ecosystem Configuration
// 使用方法: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'emkc-quiz-server',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // ログ設定
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 再起動設定
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      
      // クラッシュ時の再起動
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};
