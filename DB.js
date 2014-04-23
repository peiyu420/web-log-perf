var async = require("async"),
    redis = require("redis"), comb = require("comb"),
    client = redis.createClient(6379, '192.168.8.44'), mysql = require('mysql');

var pool = mysql.createPool({
    host: '192.168.8.44',
    user: 'root',
    password: 'club'
});

exports.query = function (sql, param, cb) {
    pool.getConnection(function (err, connection) {
        var q = connection.query(sql, param, function (err, rows) {
            if (cb != undefined) {
                cb(err, rows);
            }
            connection.release();
        });
        //console.log(q.sql);
    });
}
