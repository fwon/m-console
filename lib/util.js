var _ = module.exports;

_.hostname = (function() {
  var ip = false;
  var net = require('os').networkInterfaces();

  Object.keys(net).every(function(key) {
    var detail = net[key];
    Object.keys(detail).every(function(i) {
      var address = String(detail[i].address).trim();
      if (address && /^\d+(?:\.\d+){3}$/.test(address) && address !== '127.0.0.1') {
        ip = address;
      }
      return !ip; // 找到了，则跳出循环
    });
    return !ip; // 找到了，则跳出循环
  });
  return ip || 'unknown';
})();

_.combine = function(pathnames, callback) {
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