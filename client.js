/**
 * 手机端调试利器
 * 手机端的log会直接输出到PC端浏览器的控制面板
 *
 * auther: fwon
 * 2016.5.20
 */

!(function(){
    'use strict';

    function detect(arr, val) {
        return arr.some(function(v) {
            return val.match(v);
        })
    }

    var devices = ["android", "webos", "iphone", "ipad", "ipod", "blackberry", "windows phone", "mobile"];
    var agent = navigator.userAgent.toLowerCase();

    var isMobile = detect(devices, agent);
    var slice = [].slice;
    var socket = io && io("G_HOST_PORT");
    var consoleTypes = ['log', 'info', 'warn', 'error', 'debug'];

    if (socket && window.console) {
        consoleTypes.forEach(function(item) {
            var oldLog = window.console[item]
            if (oldLog) {
                socket.on(item, function(msg) {
                    oldLog.apply(window.console, msg);
                });
                if (isMobile) {
                    window.console[item] = function() {
                        var args = slice.call(arguments);
                        socket.emit(item, args);
                    }
                }
            }
        });
    }
})();