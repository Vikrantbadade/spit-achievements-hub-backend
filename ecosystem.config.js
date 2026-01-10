module.exports = {
    apps: [{
        name: "spit-achievements-hub-backend",
        script: "./server.js",
        instances: 1, // Set to 'max' for cluster mode if scaling is needed
        exec_mode: "fork",
        env: {
            NODE_ENV: "production",
        },
        // PM2 Logs (separate from Winston)
        error_file: "./logs/pm2-error.log",
        out_file: "./logs/pm2-out.log",
        merge_logs: true,
        time: true
    }]
}
