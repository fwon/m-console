var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var colors = require('colors');
var util = require('./lib/util.js');
var args = process.argv.join('|');
var port = /\-\-port\|(\d+)(?:\||$)/.test(args) ? ~~RegExp.$1 : 3000;

function combine(pathnames, callback) {
    var output = [];

    (function next(i, len) {
        if (i < len) {
            fs.readFile(__dirname + pathnames[i], 'utf8', function(err, data) {
                if (err) {
                    callback(err);
                } else {
                    //替换文件IP和port
                    var host = 'http://' + util.hostname + ':' + port;
                    if (pathnames[i] == '/client.js') {
                        data = data.replace(/G_HOST_PORT/g, host);
                    }

                    output.push(data);
                    next(++i, len);
                }
            });
        } else {
            callback(null, output.join(';\n'));
        }
    })(0, pathnames.length);
}

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin ? req.headers.origin : '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,HEAD,GET,OPTIONS,PATCH');
    next();
})

app.get('/m-console.js', function(req, res) {
    var pathnames = [
        '/socket.io.js',
        '/client.js'
    ];
    combine(pathnames, function(err, data) {
        if (err) {
            res.writeHead(404);
            res.end(err.message);
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/javascript; charset=utf-8'
            });
            res.end(data);
        }
    });
});

var deviceId = 1;
var devicesAgent = [];

io.on('connection', function(socket) {
    var socketAgent = socket.handshake.headers['user-agent'];
    var _index = devicesAgent.indexOf(socketAgent);
    if (_index < 0) {
        devicesAgent.push(socketAgent);
        console.log('连接设备' + deviceId + " " + (socketAgent).gray);
        deviceId++;
    }

    ['log', 'info', 'warn', 'error', 'debug'].forEach(function(item) {
        socket.on(item, function(msg) {
            io.emit(item, msg);
        });
    });

    if (_index > -1) {
        devicesAgent.splice(_index, 1);
        socket.on('disconnect', function() {
            deviceId--;
            console.log('断开设备' + deviceId + " " + (socketAgent).gray);
        });
    }
});

server.listen(port, function() {
    console.log('Listening on port ' + port);
});
