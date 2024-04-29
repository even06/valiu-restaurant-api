module.exports = {
  apps : [{
    name: 'valiu-api',
    script: "./dist/app.js",  // Path to the compiled JS file
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
