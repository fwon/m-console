var server = require('./lib/server.js');
var app = {};

app.start = function(commander) {
    var port = process.env.PORT || commander.port || 3000;
    var daemon = commander.daemon || false;
    server.options({
        timeout: 30,
        port: port,
        daemon: daemon,
        root: __dirname
    });

    server.start();
}
app.stop = function() {
    server.stop();
}

module.exports = app;