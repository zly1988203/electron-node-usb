在安装node-hid及usb-detection时，一定要重新编译，即rebuild.
方法一，在网络不被墙的情况下，这个是最简单的方法：
1、 先安装npm install --save-dev electron-rebuild

# 每次运行"npm install"时或每安装一个模块后，也运行这条命令
./node_modules/.bin/electron-rebuild

# 在windows下使用如下命令：
.\node_modules\.bin\electron-rebuild.cmd

方法二，在网络被墙的情况下，可以使用手动rebuild的方式
1、先设置build环境，
WINDOWS下：
npm set npm_config_disturl=https://atom.io/download/atom-shell

#这里要改为electron相对应的版本
npm set npm_config_target=3.1.13

npm set npm_config_arch=x64

npm set npm_config_runtime=electron
其它系统使用export替换set

2 安装模块
npm install 你要安装的模块名

3 重新编译
用cd命令进入到你的模块所在的目录，
cd /path-to-module/
然后进行重新编译
node-gyp rebuild --target=3.1.13 --arch=x64 --dist-url=https://atom.io/download/atom-shell   #注意，这里的--target=2.0.18要改为你的electron相对应的版本，例如--target=x.x.x

【注意】
重新编译时一定要安装PYTHON并设置环境变量，WINDOWS要安装MSBUILD TOOL或VS20XX版本
MAC要安装XCODE。

windows:  npm install --global --production windows-build-tools


CPU   龙芯要退回electronjs的版回1.82的版本