var async = require("async"),
    redis = require("redis"), comb = require("comb"),
    client = redis.createClient(6379, '192.168.8.48'), mysql = require('mysql');

var pool = mysql.createPool({
    host: '192.168.8.44',
    user: 'root',
    password: 'club'
});
var query = function (sql, param, cb) {
    pool.getConnection(function (err, connection) {
        console.log(connection);
        var q = connection.query(sql, param, function (err, rows) {
            if (cb != undefined) {
                cb(err, rows);
            }
            connection.release();
        });
        //console.log(q.sql);
    });
}


exports.index = function (req, res) {
    res.render('index', { title: 'Express' });
};

exports.programRT = function (req, res) {
    client.zrevrangebyscore(['programRT', 99999, 0, 'LIMIT', 0, 99999],
        function (err, data) {
            async.map(data, function (t, cb) {
                client.hgetall('programRT' + t, function (err, d) {
                    cb(err, d);
                });
            }, function (err, results) {
                res.render('programRT', {  d: data, l: results });
            });
        }
    )
};
exports.chartData = function (req, res) {
    var keys = req.query.keys.split(",");
    var sql = "select `avg` from perf.perf where `key`=? order by `date` desc limit 90;";
    async.map(keys, function (t, cb) {
        query(sql, [t], function (err, data) {
            cb(err, {k: t, d: data});
        });
    }, function (err, results) {
        var h = {};
        for (var r in results) {
            var arr = new Array();

            for (var o in results[r].d) {
                arr.push(results[r].d[o].avg);
            }
            h[results[r].k.replace(" ","")] = arr.reverse();

        }
        res.send(200, { l: h });
    });
};

exports.mvcRT = function (req, res) {
    client.zrevrangebyscore(['mvcRT', 99999, 0, 'LIMIT', 0, 99999],
        function (err, data) {
            async.map(data, function (t, cb) {
                client.hgetall('mvcRT' + t, function (err, d) {
                    cb(err, d);
                });
            }, function (err, results) {
                res.render('mvcRT', {  d: data, l: results });
            });
        }
    )
};