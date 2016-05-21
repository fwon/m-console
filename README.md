# m-console
remote mobile console tool, console log in pc browser.

###install
```
npm install -g m-console
```

###use
```
mcon server
```
default port is 3000
（开启调试服务器，默认调试器端口为3000）
```
mcon server -p 9000
```
use `-p` to set port by yourself
（可通过`-p`设置调试器端口号）
```
mcon server -i 192.168.*.*
```
Must set IP of your local computer，using for socket connect, so mobile can connect to PC and console log. default value is `10.249.*.*` or `192.168.*.*`.
（必须设置本地电脑的IP地址，用于socket链接，这样手机就可以在电脑控制台打log了。默认的电脑IP地址为10.249.*.*或192.168.*。*）
###demo
![roadmap.path](https://raw.githubusercontent.com/fwon/blog/master/assets/m-console-demo.gif)