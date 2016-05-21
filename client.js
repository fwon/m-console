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

    if (socket && window.console) {
        
        if (window.console.log) {
            var oldLog = window.console.log;
            //当浏览器开启模拟器模式，也需要监听log
            socket.on('LOG', function(msg) {
                oldLog.apply(window.console, msg);
            })
            //手机中console要触发事件，屏蔽默认输出，避免输出两次
            if (isMobile) {
                window.console.log = function() {
                    var args = slice.call(arguments);
                    socket.emit('LOG', args);
                }
            }
        }

        if (window.console.info) {
            var oldInfo = window.console.info;
            socket.on('INFO', function(msg) {
                oldInfo.apply(window.console, msg);
            })
            if (isMobile) {
                window.console.info = function() {
                    var args = slice.call(arguments);
                    socket.emit('INFO', args);
                }
            }
        }

        if (window.console.warn) {
            var oldWarn = window.console.warn;
            socket.on('WARN', function(msg) {
                oldWarn.apply(window.console, msg);
            })
            if (isMobile) {
                window.console.warn = function() {
                    var args = slice.call(arguments);
                    socket.emit('WARN', args);
                }
            }
        }

        if (window.console.error) {
            var oldError = window.console.error;
            socket.on('ERROR', function(msg) {
                oldError.apply(window.console, msg);
            })
            if (isMobile) {
                window.console.error = function() {
                    var args = slice.call(arguments);
                    socket.emit('ERROR', args);
                }
            }
        }
    }
})();