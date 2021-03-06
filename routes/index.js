var async = require("async"),
    redis = require("redis"), comb = require("comb"),
    client = redis.createClient(6379, '192.168.8.44'), mysql = require('mysql');

var pool = mysql.createPool({
    host: '192.168.8.44',
    user: 'root',
    password: 'club'
});

var query = function (sql, param, cb) {
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

exports.index = function (req, res) {
    res.render('index', { title: 'Express' });
};

exports.programRT = function (req, res) {
    res.render('programRT');
};

exports.mainData = function (req, res) {
    var k = req.query.k;
    var s = req.query.s;
    client.zrevrangebyscore([k, 99999, 0, 'LIMIT', 0, 99999],
        function (err, data) {
            async.map(data, function (t, cb) {
                client.hgetall(k + t, function (err, d) {

                    d["key"] = t;
                    cb(err, d);
                });
            }, function (err, results) {
                if (s == "max") {
                    results = comb.array.sort(results, function (a, b) {
                        return a.max - b.max;
                    })
                }
                if (s == "min") {
                    results = comb.array.sort(results, function (a, b) {
                        return a.min - b.min;
                    })
                }
                if (s == "call") {
                    results = comb.array.sort(results, function (a, b) {
                        return a.call - b.call;
                    })
                }
                if (s == "key") {
                    results = comb.array.sort(results, function (a, b) {
                        return a.key.length - b.key.length;
                    })
                }
                if (s == "avg") {
                    results = comb.array.sort(results, function (a, b) {
                        return a.avg - b.avg;
                    })
                }
                res.send(200, {  l: results.reverse() });
            });
        }
    )
}

exports.chartData = function (req, res) {
    var keys = req.query.keys.split(",");
    var sql = "select `avg`,`date` from perf.perf where `key`=? order by `date` desc limit 90;";
    async.map(keys, function (t, cb) {
        query(sql, [t], function (err, data) {
            cb(err, {k: t, d: data});
        });
    }, function (err, results) {
        var h = {};
        var d = {};
        for (var r in results) {
            var arr = new Array();
            for (var o in results[r].d) {
                arr.push(results[r].d[o].avg);
            }
            h[results[r].k.replace(" ", "")] = arr.reverse();
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

exports.groupIP = function (req, res) {
    client.zrevrangebyscore(['group:nginx:ip', 99999, 0, 'LIMIT', 0, 99999, 'WITHSCORES'],
        function (err, data) {
            res.render('groupIP', { d: data });
        }
    )
}
exports.groupUA = function (req, res) {
    client.zrevrangebyscore(['group:nginx:ua', 99999, 0, 'LIMIT', 0, 99999, 'WITHSCORES'],
        function (err, data) {
            res.render('groupUA', { d: data });
        }
    )
}

exports.groupReferer = function (req, res) {
    client.zrevrangebyscore(['group:nginx:referer', 99999, 0, 'LIMIT', 0, 99999, 'WITHSCORES'],
        function (err, data) {
            res.render('groupReferer', { d: data });
        }
    )
}
