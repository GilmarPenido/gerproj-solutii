module.exports = {
  apps : [{
    name   : "gerproj",
    script : "node_modules/next/dist/bin/next",
    args: "start",
    error_file: './logs/service_gateway.err',
    log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
  }]
}