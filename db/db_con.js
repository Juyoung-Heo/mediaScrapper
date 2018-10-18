const mysql = require('mysql');
const config = require('../db/db_info').local;
module.exports = function () {
    return {
        init: function () {
            return mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database
            })
        },
        test_open: function (con) {
            con.connect(function (err) {
                if (err) {
                    console.error('mysql connection error :' + err);
                } else {
                    console.info('mysql is connected successfully.');
                }
            })
        }
    }
};