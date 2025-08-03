module.exports = {
  apps: [{
    name: 'weight-app-server',
    script: 'app.js',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000,
      TCP_PORT: process.env.TCP_PORT || 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000,
      TCP_PORT: process.env.TCP_PORT || 4000
    },
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    
    // Configurações de restart
    max_restarts: 10,
    min_uptime: '10s',
    
    // Aguardar aplicação estar pronta
    wait_ready: true,
    listen_timeout: 10000,
    
    // Configurações avançadas
    kill_timeout: 5000,
    restart_delay: 4000
  }]
};
