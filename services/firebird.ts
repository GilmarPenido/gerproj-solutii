var Firebird = require('node-firebird');

var options = {
    host: 'solutii.ddns.net',
    database: 'C:\\GERPROJ\\Dropbox\\GERPROJ_SOLUTII.GDB',
    user:  'SYSDBA',
    password: 'masterkey',
    pageSize: 4096,
/*     charset: 'WIN1252' */
};

export  { Firebird, options }