---
category: 服务端
tags:
  - 部署
date: 2021-02-17
title: 从0到1实现简单部署
vssue-title: 从0到1实现简单部署
---

对于目前的个人开发者而言，使用云服务器是十分方便快捷的，在兴冲冲地写好了项目代码后，会有一种想要快速部署到服务器上的冲动，今天我们就来实践一下 0 到 1 的简单服务器部署。

<!-- more -->

首先你需要有一台云服务器，这里以我的阿里云服务器为例，系统是`CentOS 7.3`

## 1.远程连接
### 1.1 登录远程服务器

想要在服务器上进行部署，首先得连接上服务器，可以通过阿里云官网控制的 **浏览器远程连接** 登录服务器，但是比较麻烦，每隔一段时间都需要重新登录。除此之外，还可以利用 ssh 通过账号密码或者密钥进行连接，如下：

```sh
# 通过账号密码进行连接，一般为 root，连接成功后需要输入密码
ssh root@yourIp

# 通过密钥进行连接，yourKey 为密钥的本地路径
ssh root@yourIp -i yourKey
```

### 1.2 ssh 配置
另外近期试用了下腾讯云，发现配置密钥之后居然默认不允许通过密码进行 ssh 登录了，不太方便，需要手动修改相关配置以支持 root 账号密码登录：

- 首先通过配置好的密钥登录远程服务器
- 然后编辑 `/etc/ssh/sshd_config` 文件，将 `PermitRootLogin` 和 `PasswordAuthentication` 配置更改为 `yes`
- 最后重启 ssh 服务 `systemctl restart sshd`



## 2.nginx 配置
现在的服务器部署，基本上离不开 `nginx`，配置简单易用，对于个人开发者十分友好。

### 2.1 nginx 安装

```sh
yum install -y nginx
```

安装成功后可以使用 -v 查看版本，我这里是 1.16.1
```sh
nginx -v
```

### 2.2 nginx 命令

#### 启动 nginx

可以使用 `Linux` 的系统工具 `Systemd` 来启动 `nginx`，也可以使用 `nginx` 自带的命令：
```sh
systemctl start nginx
# 或
nginx

# 设置开机自动启动
systemctl enable nginx
```

#### 停止 nginx
当你想停止 `nginx` 时，可以使用 stop 命令：
```sh
systemctl stop nginx
# 或
nginx -s stop
```

#### 重启 nginx
当你更改了 nginx 的配置时，这个时候往往需要重启 `nginx` 服务配置才能生效：
```sh
systemctl restart nginx
# 或
nginx -s reload
```

### 2.3 配置 nginx

`nginx` 安装好了之后，默认路径一般是 `/etc/nginx/`，如果在该路径下没有找到，可以使用 `nginx -t` 命令查看安装路径：
```sh
nginx -t
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

这里验证的 `nginx.conf` 就是 `nginx` 的主配置文件，默认内容如下：

```nginx
# 部分配置已省略
server {
    listen       80 default_server;
    listen       [::]:80 default_server;
    server_name  _;
    root         /usr/share/nginx/html;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    location / {
    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
}
```

这里我们主要关注一下 server 的配置，以 http 协议的 server 为例，逐行解析一下：
- listen：表示监听 IPV4 & IPV6 的 80 端口，且将该端口设置为默认服务
- server_name：表示当前的服务对应的名称（IP 或者 URL）
- root：表示根路径
- include：表示引用该路径下的配置，这里可以忽略
- location：表示域名后的路径对应的规则
- error_page：表示出现错误之后的重定向规则

#### 前端项目
对于前端项目，本质上打包之后是一堆静态文件，配置对应的 server_name 和 root 就可以了，这里以配置域名为 `www.example.com`，打包后 dist 下的文件存放服务器目录为 `/home/admin/www` 为例：
```nginx
# 部分配置已省略
server {
    listen       80 default_server;
    listen       [::]:80 default_server;
    server_name  www.example.com;
    root         /home/admin/www;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    location / {
    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
}
```

#### 服务端项目
对于服务端项目，会在本地监听一个端口来运行相关的服务，可以利用 `nginx` 配置反向代理，使被访问服务反向代理到对应的端口，这里以 3000 端口为例：

```nginx
# 部分配置已省略
server {
    listen       80 default_server;
    listen       [::]:80 default_server;
    server_name  www.example.com;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    location / {
      proxy_pass http://127.0.0.1:3000;
    }
}
```

> 配置更改之后需要重启一下 `nginx` 服务才能生效

## 3.上传文件
上传文件的方式也比较多，这里主要介绍 `scp` 命令，以远程服务器用户为 `root@192.168.0.1` 为例：
```sh
# 将远程服务器的 /remote/index.html 文件，下载到本地 /local 目录下
scp root@192.168.0.1:/remote/index.html /local

# 将远程服务器的整个 remote 目录，下载到本地 /local 目录下
scp -r root@192.168.0.1:/remote/ /local

# 将本地 /local/index.html 文件，上传到远程服务器的 /remote 目录下
scp /local/index.html root@192.168.0.1:/remote

# 将本地的整个 /local 目录，上传到远程服务器的 /remote 目录下
scp -r /local root@192.168.0.1:/remote
```

对于前端项目而言，若是想上传 dist 目录下的所有文件，但又不想上传 dist 目录，这个时候可以使用 **通配符** 来上传所有文件：
```sh
# 将本地的整个 /local 目录下的所有文件，上传到远程服务器的 /remote 目录下
scp -r /local/* root@192.168.0.1:/remote
```

在上传前需要确保服务器的目录具有正确的读写权限，否则会出现 `SCP Permission denied` 错误，具体的文件权限可以通过 `ls -l` 查看：
```sh
ls -l
# -rw-r--r-- 1 root root  2376 Feb 17 20:37 404.html
# drwxr-xr-x 2 root root  4096 Feb 17 00:43 about
# drwxr-xr-x 4 root root  4096 Feb 17 00:43 assets
# drwxr-xr-x 2 root root  4096 Feb 17 00:43 atlas
# -rw-r--r-- 1 root root 51022 Feb 17 20:37 head.png
# -rw-r--r-- 1 root root 13927 Feb 17 20:37 index.html
# drwxr-xr-x 8 root root  4096 Feb 17 00:43 posts
```

其中第二列表示文件权限，首字母为文件类型，`d` 表示目录文件，`-` 表示普通文件，后面的 rwx 表示 读/写/执行 权限，每三个一组，分别对应 拥有者/群组/其他组

如若没有权限，可以通过下面的命令来设置所有人可读写以及执行：
```sh
chmod 777 yourDir
```

## 4.https 配置

将你的站点配置为 https 需要下面几个步骤：

1. 申请证书并下载。例如在阿里云的 **SSL证书** 模块中可以申请免费证书，期限一年
2. 将证书文件上传到服务器的对应目录
3. 更改 nginx 配置

`ssl_certificate` 和 `ssl_certificate_key` 分别表示证书文件和私钥的存放路径，示例如下：

```nginx
# 部分配置已省略
server {
    listen       443 ssl http2 default_server;
    listen       [::]:443 ssl http2 default_server;
    server_name  www.example.com;
    root         /home/admin/www;

    ssl_certificate "/etc/pki/nginx/www.example.com.pem";
    ssl_certificate_key "/etc/pki/nginx/private/www.example.com.key";
    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout  10m;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    location / {
    }

    error_page 404 /404.html;
    location = /404.html {
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
    }
}
```

当部署 https 站点时，常见的需求是将 http 站点自动跳转到 https，`nginx` 配置如下：
```sh
server {
    listen      80;
    server_name example.com www.example.com;
    return 301  https://$server_name$request_uri;
}
```


以上就是本篇的全部内容，如有错误，欢迎指正~