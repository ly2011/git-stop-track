# Git 忽略已跟踪文件的改动

> https://segmentfault.com/q/1010000000430426

> git update-index --assume-unchanged

## 安装使用

```shell
npm install -g git-stop-track

# 添加需要被忽略的文件(-f 后面的参数是需要被新加入需要被取消追踪的文件)
git-stop-track -f config/pro.env.js
```

## 默认已被添加到需要被取消追踪的文件有

```txt
'.eslintignore',
'.eslintrc.js',
'package.json',
'yarn.lock',
'config/*.*',
'build/*.*',
'api-interface/*.*'
```
