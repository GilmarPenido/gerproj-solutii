module.exports = {
    apps: [{
        name: "gerproj-solutii",
        script: "npm",
        instances: "max",
        exec_mode: "cluster",
        autorestart: true,
        watch: true,
        env_production: {
            NODE_ENV: "production"
        }
    }]
}