var _ = module.exports;
var path = require('path');
var fs = require('fs');
var lodash = require('lodash');
var file = require('./file.js');

lodash.assign(_, lodash);
lodash.assign(_, file);

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

_.root = (function() {
    return path.join(__dirname, '../');
})();

_.isWin = function() {
    return process.platform.indexOf('win') === 0;
}

_.getPidFile = function() {
    return path.join(__dirname, '../pid');
}

_.pid = function(value) {
    var pidFile = _.getPidFile();

    if (arguments.length) {
        return value ? _.write(pidFile, value) : fs.unlinkSync(pidFile);
    } else {
        if (_.exists(pidFile)) {
            return fs.readFileSync(pidFile, 'utf8').trim();
        }

        return 0;
    }
}