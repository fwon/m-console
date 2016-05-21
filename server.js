var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var colors = require('colors');

var socketHostname = null;
var iprule = /((10.249.*.*)|(192.168.*.*))/;
var port = '3000';

//get ip address
//from fis https://github.com/fex-team/fis3-command-release/blob/master/lib/livereload.js
function hostname() {
    var ip = false;
    var net = require('os').networkInterfaces();

    if(iprule && typeof(iprule) === 'string'){
        iprule = new RegExp('^' + iprule.replace(/\.|\*/g, function(v){
            return v === '.'? '\\\.' : '\\\d+'
        }) + '$');
    }else if(!(iprule instanceof RegExp)){
        iprule = /^\d+(?:\.\d+){3}$/;
    }
    Object.keys(net).every(function(key) {
        var detail = net[key];
        Object.keys(detail).every(function(i) {
            var address = String(detail[i].address).trim();
            if (address && iprule.test(address)) {
                ip = address;
            }
            return !ip;
        })
        return !ip;
    });

    return ip || '127.0.0.1';
}

function combine(pathnames, callback) {
    var output = [];

    (function next(i, len) {
        if (i < len) {
            fs.readFile(__dirname + pathnames[i], 'utf8', function(err, data) {
                if (err) {
                    callback(err);
                } else {
                    //替换文件IP和port
                    var host = 'http://' + (socketHostname ? socketHostname : (hostname() + ':' + port));
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
    socketHostname = socket.handshake.headers.host || null;
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


server.start = function(a_port, ip) {
    port = a_port;
    iprule = ip || iprule;
    server.listen(port, function() {
        var host = 'http://' + (socketHostname ? socketHostname : (hostname() + ':' + port));
        console.log('******************************************************'.yellow);
        console.log(('<script type="text/javascript" src="'+ host +'/m-console.js"></script>').yellow);
        console.log('******************************************************'.yellow);
        console.log('复制以上内容到调试页面，不要关闭此窗口！'.green);
    });
}

module.exports = server;


