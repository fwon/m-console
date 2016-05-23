/**
 * server pid manager
 * 
 * modified from fis
 * by fwon
 */
var server = module.exports;
var path = require('path');
var colors = require('colors');
var cprocess = require('child_process');
var spawn = cprocess.spawn;
var _ = require('./util.js');
var fs = require('fs');
var options = server._options = {};
options.type = 'node';

server.options = function(opts) {
    if (arguments.length) {
        _.assign(options, opts);
    } else {
        return options;
    }
}

//默认开启守护进程，将进程输出写入文件，避免后台进程与标准I/O交互
function watchOnFile(filepath, callback) {
    var lastIndex = 0;
    var timer;

    function read() {
        var stat = fs.statSync(filepath);

        if (stat.size != lastIndex) {
            var fd = fs.openSync(filepath, 'r');
            var buffer = new Buffer(stat.size - lastIndex);

            try {
                fs.readSync(fd, buffer, lastIndex, stat.size - lastIndex);
                var content = buffer.toString('utf8');
                lastIndex = stat.size;

                callback(content);
            } catch(e) {
                lastIndex = 0;
            }
        }

        timer = setTimeout(read, 200);
    }

    read();
    return function() {
        clearTimeout(timer);
    }
}

var checkPid = function(pid, callback) {
    var list, msg = '';
    var isWin = _.isWin();
    var serverInfo = options;

    if (isWin) {
        list = spawn('tasklist');
    } else {
        list = spawn('ps', ['-A']);
    }

    list.stdout.on('data', function(chunk) {
        msg += chunk.toString('utf-8').toLowerCase();
    });

    list.on('exit', function() {
        var found = false;
        msg.split(/[\r\n]+/).forEach(function(item) {
            if (~item.indexOf('--type ' + serverInfo.type) || process.platform !== 'darwin') {
                var m = item.match(/\d+/);

                if (m && m[0] == pid) {
                  found = true;
                }
            }
        });
        callback(found);
    });

    list.on('error', function(e) {
        if (isWin) {
            console.error('fail to execute `tasklist` command, please add your system path (eg: C:\\Windows\\system32, you should replace `C` with your system disk) in %PATH%');
        } else {
            console.error('fail to execute `ps` command.');
        }
    })
}

function start() {
    var opt = options;
    var script = path.join(opt.root, 'server.js');

    var timeout = Math.max(opt.timeout * 1000, 5000);
    var timeoutTimer;
    var args = [
        script
    ];

    _.map(opt, function(value, key) {
        args.push('--' + key, String(value));
    });

    process.stdout.write('Starting m-console Server');
    var logFile = path.join(opt.root, 'server.log');

    var server = spawn(process.execPath, args, {
        cwd: path.dirname(script),
        detached: opt.daemon,
        stdio: [0, opt.daemon ? fs.openSync(logFile, 'w') : 'pipe', opt.daemon ? fs.openSync(logFile, 'w+') : 'pipe']
    });

    var log = '';
    var started = false;
    var stoper;
    var onData = function(chunk) {
        if (started) return;
        
        chunk = chunk.toString('utf8');
        log += chunk;

        if (~chunk.indexOf('Error')) {
            
            process.stdout.write(' fail.\n');
            
            try {
                process.kill(server.pid, 'SIGKILL');
            } catch(e) {}

            var match = chunk.match(/Error:?\s+([^\r\n]+)/i);
            var errMsg = 'unknown';

            if (~chunk.indexOf('EADDRINUSE')) {
                log = '';
                errMsg = 'Address already in use:' + opt.port;
            } else if (match) {
                errMsg = match[1];
            }

            log && console.log(log);
            if (errMsg) {
                console.log('fail to start server.\n\n %s', errMsg);
            }
        } else if (~chunk.indexOf('Listening on')) {
            started = true;
            stoper && stoper();
            clearTimeout(timeoutTimer);

            process.stdout.write(' at port [' + opt.port + ']\n');

            setTimeout(function () {
                var address = '<script type="text/javascript" src="'+ 'http://' + _.hostname + ':' + opt.port +'/m-console.js"></script>'
                console.log('----------------------------------------------------------------------------------'.yellow);
                console.log((address).yellow);
                console.log('----------------------------------------------------------------------------------'.yellow);
                console.log('请在调试页面中引入上面的脚本'.yellow + (opt.daemon ? '' : ', 不要关闭此窗口！').yellow);

                opt.daemon && process.exit(); //守护进程，可关闭窗口
            }, 200);
        }
    }

    if (opt.daemon) {
        stoper = watchOnFile(logFile, onData);
        _.pid(server.pid);
        server.unref(); //脱离父进程

        timeoutTimer = setTimeout(function() {
            process.stdout.write(' fail\n');
            if (log) console.log(log);
            console.log('timeout');
        }, timeout);
    } else {
        server.stdout.on('data', onData);
        server.stderr.on('data', onData);
        server.stdout.pipe(process.stdout);
        server.stderr.pipe(process.stderr);
    }
    
}

function stop(callback) {
    var isWin = _.isWin();
    var pid = _.pid();

    if (pid) {
        checkPid(pid, function(exists) {
            if (exists) {
                if (isWin) {
                    cprocess.exec('taskkill /PID ' + pid + ' /T /F');
                } else {
                    process.kill(pid, 'SIGTERM');
                }

                //杀不死？连环杀
                (function(done) {
                    var start = +Date.now();
                    var timer = setTimeout(function() {
                        var fn = arguments.callee;

                        checkPid(pid, function(exists) {
                            if (exists) {
                                if (+Date.now() - start > 5000) {
                                    try {
                                        isWin ? cprocess.exec('taskkill /PID ' + _pid + ' /T /F') : 
                                                process.kill(_pid, 'SIGTERM');
                                    } catch(e) {}
                                    clearTimeout(timer);
                                    done();
                                    return;
                                }
                                timer = setTimeout(fn, 500);
                            } else {
                                done();
                            }
                        });
                    }, 20);
                })(function() {
                    console.log('shutdown with pid ' + pid);
                    _.pid(0);
                    callback && callback(null, false);
                });

            } else {
                callback && callback(null, false);
            }
        });
    } else {
        //pid不存在
        callback && callback(null, false);
    }
}

server.start = function() {
    if (!options.daemon) {
        start();
    } else {
        stop(start);    
    }
}

server.stop = function() {
    stop(function(error, stoped) {
        if (!stoped) {
            console.log('This server is not runing.');
        }

        callback && callback.apply(this, arguments);
    })
}

