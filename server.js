var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var colors = require('colors');
var util = require('./lib/util.js');

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
    util.combine(pathnames, function(err, data) {
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
        console.log('连接设备' + deviceId + " " + (socketAgent).grey);
        deviceId++;
    }
    //接收消息
    socket.on('LOG', function(msg) {
        io.emit('LOG', msg);
    });
    socket.on('INFO', function(msg) {
        io.emit('INFO', msg);
    });
    socket.on('WARN', function(msg) {
        io.emit('WARN', msg);
    });
    socket.on('ERROR', function(msg) {
        io.emit('ERROR', msg);
    });
    if (_index > -1) {
        devicesAgent.splice(_index, 1);
        socket.on('disconnect', function() {
            deviceId--;
            console.log('断开设备' + deviceId + " " + socketAgent);
        });
    }
});

server.start = function(a_port) {
    port = a_port;
    server.listen(port, function() {
        var host = 'http://' + util.hostname + ':' + port;
        console.log('******************************************************'.yellow);
        console.log(('<script type="text/javascript" src="'+ host +'/m-console.js"></script>').yellow);
        console.log('******************************************************'.yellow);
        console.log('复制以上内容到调试页面，不要关闭此窗口！'.green);
    });
}

module.exports = server;


