var Firebird = require('node-firebird');

var options = {
    host: '127.0.0.1',
    database: 'E:\\GERPROJ\\GERPROJ_SOLUTII.GDB',
    user:  'SYSDBA',
    password: 'masterkey',
    pageSize: 4096,
    charset: 'UTF8'
};

export  { Firebird, options }  