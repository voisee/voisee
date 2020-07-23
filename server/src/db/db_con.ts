const mysql = require('mysql');
const env = process.env.NODE_ENV || 'dev';
const config = require('./db_info.json')[env];

export default function (){
    return {
        init: function () {
            return mysql.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database
            })
        },
        test_open: function (con: any) {
            con.connect(function (err: any) {
                if(err) {
                    console.error('mysql connection error :' + err);
                } else {
                    console.info('mysql is connected successfuly.');
                }
            })
        }
    }
};