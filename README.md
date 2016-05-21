# m-console
remote mobile console tool, console log in pc browser.

###install
```
npm install -g m-console
```

###use
####1
```
mcon server
```
default port is 3000
（开启调试服务器，默认调试器端口为3000）
![roadmap.path](https://raw.githubusercontent.com/fwon/blog/master/assets/m-console-1.gif)
####2
copy script into html file
(复制调试脚本到html文件)
![roadmap.path](https://raw.githubusercontent.com/fwon/blog/master/assets/m-console-2.gif)
####3
刷新浏览器查看效果 **（进行本地调试时，手机需通过代理链接到电脑）**
手机上刷新页面，调试信息会出现在PC的控制面板
![roadmap.path](https://raw.githubusercontent.com/fwon/blog/master/assets/m-console-demo.gif)

###option
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
