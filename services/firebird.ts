var Firebird = require('node-firebird');

var options = {
    host: '127.0.0.1',
    database: 'C:\\firebird\\GERPROJ_SOLUTII.GDB',
    user:  'SYSDBA',
    password: 'masterkey'
};

export  { Firebird, options }  