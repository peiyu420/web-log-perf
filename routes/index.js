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

exports.chartMaxData = function (req, res) {
    var keys = req.query.keys.split(",");
    var sql = "select `max`,`date` from perf.perf where `key`=? order by `date` desc limit 90;";
    async.map(keys, function (t, cb) {
        query(sql, [t], function (err, data) {
            cb(err, {k: t, d: data});
        });
    }, function (err, results) {
        var h = {};
        var d = {};
        for (var r in results) {
            var arr = new Array();
            var arr_d = new Array();
            for (var o in results[r].d) {
                arr.push(results[r].d[o].max);
                arr_d.push(comb.date.format(results[r].d[o].date, "yyyy-MM-dd H:m:s"));
            }
            h[results[r].k.replace(" ", "")] = arr.reverse();
            d[results[r].k.replace(" ", "")] = arr_d.reverse();
        }
        res.send(200, { l: h, d: d });
    });
};

exports.maxCall = function (req, res) {
    var key = req.query.key;
    var date = req.query.date;

    var sql = "select `fun`,`duration` from perf.`perf-maxCall` where `key`=? and `date` = (select `date` from  perf.`perf-maxCall` where `key`=? and `date` <= ? order by `date` desc limit 1) order by `duration` desc;";
    query(sql, [key, key, date], function (err, data) {
        if (err) {
            res.send(200, err);
            return;
        }
        res.send(200, data);
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


exports.stackRT = function (req, res) {
    client.zrevrangebyscore(['stackRT', 99999, 0, 'LIMIT', 0, 99999],
        function (err, data) {
            async.map(data, function (t, cb) {
                client.hgetall('stackRT' + t, function (err, d) {
                    cb(err, d);
                });
            }, function (err, results) {
                res.render('stackRT', {  d: data, l: results });
            });
        }
    )
};