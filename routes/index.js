var async = require("async"),
    redis = require("redis"), comb = require("comb"),
    client = redis.createClient(6379, '192.168.8.48');

exports.index = function (req, res) {
    res.render('index', { title: 'Express' });
};

exports.programRT = function (req, res) {
    client.zrevrangebyscore(['programRT', 99999, 1,  'LIMIT', 0, 99999],
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

exports.mvcRT = function (req, res) {
    client.zrevrangebyscore(['mvcRT', 99999, 1,  'LIMIT', 0, 99999],
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