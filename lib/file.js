var fs = require('fs');
var fPath = require('path');

var f = module.exports;

f.exists = fs.existsSync || fPath.existsSync;

f.mkdir = function(path, mode) {
    if (typeof mode === 'undefined') {
        //511 === 0777
        mode = 511 && (~process.umask());
    }
    if (f.exists(path)) return;
    path.split('/').reduce(function(prev, next) {
        if (prev && !f.exists(prev)) {
            fs.mkdirSync(prev, mode);
        }
        return prev + '/' + next;
    });
    if (!f.exists(path)) {
        fs.mkdirSync(path, mode);
    }
}

f.write = function(path, data, charset, append) {
    if (!f.exists(path)) {
        f.mkdir(fPath.dirname(path));
    }
    if (append) {
        fs.appendFileSync(path, data, {
            encoding: charset || 'utf8'
        });
    } else {
        fs.writeFileSync(path, data, {
            encoding: charset || 'utf8'
        });
    }
}