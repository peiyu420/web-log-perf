var async = require("async"),
    redis = require("redis"), comb = require("comb"), db = require("../DB.js")
client = redis.createClient(6379, '192.168.8.44'), mysql = require('mysql');
var print = function (data) {
}

exports.index = function (req, res) {
    res.render('nginxSupervisory');
}
exports.data = function (req, res) {
    var key = 'nginxSupervisory';
    client.zrevrangebyscore([key, 99999, 0, 'LIMIT', 0, 99999],
        function (err, data) {
            async.map(data, function (t, cb) {
                client.hgetall('nginxSupervisory' + t, function (err, d) {
                    cb(err, d);
                });
            }, function (err, results) {
                res.send(200, {  d: data, l: results});
            });
        }
    )
}
exports.chart = function (req, res) {
    var keys = req.query.keys.split(",");
    var sql = "select `avg`,`max`,`call`,`date` from perf.`perf-nginxSupervisory` where `key`=? order by `date` desc limit 90;";
    async.map(keys, function (t, cb) {
        db.query(sql, [t], function (err, data) {
            cb(err, {k: t, d: data});
        });
    }, function (err, results) {
        var h = {};
        var d = {};
        for (var r in results) {
            var arr_max = new Array();
            var arr_avg = new Array();
            var arr_call = new Array();
            var arr_d = new Array();
            for (var o in results[r].d) {
                arr_max.push(results[r].d[o].max);
                arr_avg.push(results[r].d[o].avg);
                arr_call.push(results[r].d[o].call);
                arr_d.push(comb.date.format(results[r].d[o].date, "yyyy-MM-dd H:m:s"));
            }
            h[results[r].k.replace(" ", "")+"_max"] = arr_max.reverse();
            h[results[r].k.replace(" ", "")+"_avg"] = arr_avg.reverse();
            h[results[r].k.replace(" ", "")+"_call"] = arr_call.reverse();
            d[results[r].k.replace(" ", "")] = arr_d.reverse();
        }
        res.send(200, { l: h, d: d });
    });
}