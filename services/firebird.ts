var Firebird = require('node-firebird');

var options = {
    host: '127.0.0.1',
    database: 'C:\\Users\\gilma\\Projetos\\chamado solutii\\GERPROJ_SOLUTII.GDB',
    user:  'SYSDBA',
    password: 'masterkey'
};

export  { Firebird, options }  