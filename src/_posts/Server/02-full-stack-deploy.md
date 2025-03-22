---
category: Server
tags:
  - Nginx
  - MySQL
  - PM2
date: 2024-12-21
title: 全栈项目全流程上线、部署、运维实践
vssue-title: 全栈项目全流程上线、部署、运维实践
---

本文主要记录了笔者个人全栈项目上线、部署、运维的整个流程实践，仅供参考。话不多说，先上一个效果图：

![](https://img.chlorine.site/2024-12-21/01.png)

<!-- more -->

## 基本信息
服务器购自阿里云 ECS，操作系统为 Debain 10，项目的技术栈采用的是前端 `React`，后端 `NestJS`，数据库 `MySQL`，搭建的监控告警系统则是选用的 `Prometheus` 和 `Grafana` 的系列工具

## 环境准备
如果你的服务器中已准备好了相关的镜像或者环境，可以跳过这部分

### Git
安装 git：
```bash
sudo apt update
sudo apt install git
```

生成 ssh key 后配置到 Github 中：
```bash
ssh-keygen -t ed25519 -C "youremail@email.com"
```

已生成的 ssh key 位于目录 `~/.ssh/` 下

### MySQL
#### 安装
由于 Debain 的 apt 包中没有 `mysql-server`，仅支持 `mariadb-server`，这里选择手动安装的方式。下载 MySQL 5.7，或者前往[官网](https://downloads.mysql.com/archives/community/)寻找合适的版本：
```bash
curl -OL https://downloads.mysql.com/archives/get/p/23/file/mysql-5.7.44-linux-glibc2.12-x86_64.tar.gz
```

然后解压缩:
```bash
sudo tar -xzf mysql-5.7.44-linux-glibc2.12-x86_64.tar.gz -C /usr/local
```

重命名目录：
```bash
cd /user/local
sudo mv mysql-5.7.44-linux-glibc2.12-x86_64 mysql
```

创建 MySQL 用户和组：
```bash
sudo groupadd mysql
sudo useradd -r -g mysql -s /bin/false mysql
```

初始化数据库：
```bash
cd /usr/local/mysql
sudo mkdir mysql-files
sudo chmod 750 mysql-files
sudo chown -R mysql:mysql ./
sudo bin/mysqld --initialize --user=mysql
```

此时终端中会显示随机生成的密码：
```
[Note] A temporary password is generated for root@localhost: %sqwtmz5p(Xe
```

设置权限和目录：
```bash
sudo chown -R root .
sudo chown -R mysql data mysql-files
```

安装启动脚本：
```bash
sudo cp support-files/mysql.server /etc/init.d/mysql
sudo chmod +x /etc/init.d/mysql
sudo update-rc.d mysql defaults
```

启动 MySQL 服务：
```bash
sudo systemctl start mysql
```

查询 MySQL 服务状态：
```bash
sudo systemctl status mysql
```

修改密码：
```bash
# 登录 root
mysql -u root -p

# 执行 SQL
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
```

#### 远程连接
创建一个新的用户用于远程连接：
```bash
# % 表示任意地址，也可以指定具体的 ip
CREATE USER 'remote'@'%' IDENTIFIED BY 'newpassword'
```

授予权限：
```bash
# 所有数据库：
GRANT ALL PRIVILEGES ON *.* TO 'newuser'@'%';

# 特定数据库
GRANT ALL PRIVILEGES ON exampledb.* TO 'newuser'@'%';
```

刷新权限：
```bash
FLUSH PRIVILEGES;
```

配置 MySQL 允许远程连接，编辑或新建 `/etc/mysql/my.cnf` 或 `/etc/my.cnf`：
```bash
[mysqld]
bind-address = 0.0.0.0
```

然后重启 MySQL 服务：
```bash
sudo systemctl restart mysql
```

### NodeJS
安装 nvm 来管理 NodeJS 版本，官方的安装方式对于网络连通性有要求，采用下面的方法：
```bash
git clone https://github.com/nvm-sh/nvm.git
bash nvm/install.sh
```

安装 NodeJS 20：
```bash
nvm install 20
```

设置 npm 镜像：
```bash
echo 'registry=https://registry.npmmirror.com/' > ~/.npmrc
```

### Nginx
安装 Nginx：
```bash
sudo apt install nginx
```

## 服务部署
### NodeJS 服务
使用 `pm2` 来启动 NodeJS 服务：
```bash
pm2 start ecosystem.config.js --env production
```

配置文件示例：
```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'my-app',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

pm2 默认使用用户级别的配置和进程管理，如果期望多用户共享 PM2 的状态和实例，可以设置 `PM2_HOME` 环境变量以实现共享：
```bash
export PM2_HOME=/home/your_user/.pm2
```

### Nginx
配置 Nginx 转发服务端接口：
```bash
cd /etc/nginx/sites-available/
vi api.myhost.com
```

配置文件中添加：
```nginx
server {
    listen 80;
    server_name api.myhost.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
新建软连接以启动对应配置：
```bash
sudo ln -s /etc/nginx/sites-available/api.myhost.com /etc/nginx/sites-enabled/
```

重启 Nginx 应用配置：
```bash
sudo systemctl restart nginx
```

配置 Nginx 转发前端静态资源，流程和前面一致，仅 Nginx 配置略有不同：
```nginx
server {
    listen 80;
    server_name www.myhost.com;

    root /root/projects/myhost/dist;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### HTTPS 配置
通过 certbot 申请 SSL 证书，安装对应 pkg：
```bash
sudo apt install certbot python3-certbot-nginx
```

根据提示完成配置，将自动下载证书，完成 nginx 配置并重启：
```bash
sudo certbot --nginx -d *.myhost.com
```

证书有效期只有 3 个月，可以通过脚本实现自动续签，参考 [certbot-dns-aliyun](https://github.com/justjavac/certbot-dns-aliyun)：
```bash
# 安装 certbot-dns-aliyun
wget https://cdn.jsdelivr.net/gh/justjavac/certbot-dns-aliyun@main/alidns.sh
sudo cp alidns.sh /usr/local/bin
sudo chmod +x /usr/local/bin/alidns.sh
sudo ln -s /usr/local/bin/alidns.sh /usr/local/bin/alidns
rm alidns.sh
```

测试证书续期：
```bash
certbot renew --manual --preferred-challenges dns --manual-auth-hook "alidns" --manual-cleanup-hook "alidns clean" --dry-run
```

正式续期时去掉 `--dry-run`：
```bash
certbot renew --manual --preferred-challenges dns --manual-auth-hook "alidns" --manual-cleanup-hook "alidns clean"
```

设置定时任务：
```bash
crontab -e
```

设置每天凌晨 1 点 1 分执行：
```bash
1 1 */1 * * certbot renew --manual --preferred-challenges dns --manual-auth-hook "alidns" --manual-cleanup-hook "alidns clean" --deploy-hook "nginx -s reload"
```

查询 crontab 执行记录：
```bash
grep CRON /var/log/syslog
```

查询证书过期时间：
```bash
sudo certbot certificates
```

新增一级域名可直接复用已申请的泛域名证书，以新增 `admin.myhost.com` 为例：
```nginx
server {
    server_name admin.myhost.com;

    root /root/projects/admin/dist;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 配置泛域名证书，需要替换为对应的地址
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/myhost.com-0001/fullchain.pem; 
    ssl_certificate_key /etc/letsencrypt/live/myhost.com-0001/privkey.pem; 
    include /etc/letsencrypt/options-ssl-nginx.conf; 
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; 
}

# http 跳转 https
server {
    if ($host = h5.myhost.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name admin.myhost.com;
    return 404;
}
```


### CD
以 `Github Workflow` 为例，实现自动化部署。新建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up SSH
      uses: webfactory/ssh-agent@v0.5.3
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

    - name: Run deployment script
      run: |
        ssh -o StrictHostKeyChecking=no user@your-server-ip << 'EOF'
        cd /path/to/your/repo
        git pull origin main
        pnpm install
        pnpm run build
        pm2 restart your-app-name
        EOF
```

新建一个用户用于托管 CD 流程：
```bash
sudo adduser deploy
```

给用户设置某个目录的所有权：
```bash
sudo chown -R deploy:deploy /var/www/html
```

切换至对应用户：
```bash
sudo su - deploy
```

在 Github Repo -> Setting -> Sercets and variables -> Actions 中配置你的 SSH 私钥即可实现自动化部署。部分命令需要手动 export 才可以访问到：
```bash
export PATH="$PATH:/home/deploy/.nvm/versions/node/v20.18.1/bin"
```

## 服务运维
### 监控
#### 数据采集
在 `NestJS` 中通过 `Prometheus` 中间件来收集服务级别的监控指标数据，一个收集 request 请求数的例子：
```js
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Counter, register } from 'prom-client';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly requestCounter: Counter<string>;

  constructor() {
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of requests',
      labelNames: ['method', 'route', 'status_code'],
    });
    register.registerMetric(this.requestCounter);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    res.on('finish', () => {
      const labels = {
        method: req.method,
        route: req.path,
        status_code: res.statusCode.toString(),
      };

      this.requestCounter.inc(labels);
    });

    next();
  }
}
```

通过 [pm2-metrics](https://github.com/saikatharryc/pm2-prometheus-exporter) 来收集 pm2 的进程级别的监控指标数据，默认会在 9209 端口启动：
```bash
pm2 install pm2-metrics
```

通过 [mysqld-exporter](https://github.com/prometheus/mysqld_exporter) 来收集 MySQL 的数据库级别的监控指标数据：
```bash
wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.16.0/mysqld_exporter-0.16.0.linux-amd64.tar.gz
tar xzvf mysqld_exporter-0.16.0.linux-amd64.tar.gz
cd mysqld_exporter-0.16.0.linux-amd64.tar.gz
sudo mv mysqld_exporter /usr/local/bin/
```

首先登录 MySQL：
```bash
mysql -u root -p
```

然后创建一个新的 MySQL 用户用于收集指标数据：
```bash
CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'your_password' WITH MAX_USER_CONNECTIONS 3;
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
```

通过 `systemctl` 的方式来管理 `mysqld_exporter` 服务，创建 `mysqld_exporter` 用户和相关文件：
```bash
sudo useradd --no-create-home --shell /bin/false mysqld_exporter
sudo chown mysqld_exporter:mysqld_exporter /usr/local/bin/mysqld_exporter
sudo mkdir /etc/mysqld_exporter
sudo chown mysqld_exporter:mysqld_exporter /etc/mysqld_exporter
```

创建配置文件 `/etc/mysqld_exporter/.my.cnf`：
```ini
[client]
user=exporter
password=your_password
host=localhost
```

设置文件权限：
```bash
sudo chown mysqld_exporter:mysqld_exporter /etc/mysqld_exporter/.my.cnf
sudo chmod 600 /etc/mysqld_exporter/.my.cnf
```

创建 `systemd` 服务文件，新建 `/etc/systemd/system/mysqld_exporter.service` 文件：
```ini
[Unit]
Description=mysql_exporter
Wants=network-online.target
After=network-online.target

[Service]
User=mysqld_exporter
Group=mysqld_exporter
Type=simple
ExecStart=/usr/local/bin/mysqld_exporter \
  --config.my-cnf /etc/mysqld_exporter/.my.cnf
Restart = on-failure
RestartSec = 5

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
# 启用服务关联（设置 WantedBy 用于开机自启）
sudo systemctl enable mysqld_exporter.service

sudo systemctl start mysqld_exporter
```



#### 数据拉取 & 存储
利用 [Prometheus](https://github.com/prometheus/prometheus) 来收集、处理指标数据。从[官网](https://prometheus.io/download/)下载对应操作系统的版本：
```bash
wget https://github.com/prometheus/prometheus/releases/download/v3.0.1/prometheus-3.0.1.linux-amd64.tar.gz
```

解压缩：
```bash
tar xvfz prometheus-3.0.1.linux-amd64.tar.gz

cd prometheus-3.0.1.linux-amd64
```

编辑 `prometheus.yml` 配置文件：
```yaml
scrape_configs:
  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']

  - job_name: 'pm2'
    static_configs:
      - targets: ['localhost:9209']

  - job_name: 'app'
    static_configs:
      - targets: ['localhost:4000']
```

启动 prometheus 服务：
```bash
./prometheus --config.file=prometheus.yml
```

如果服务有如下报错：
> Failed to determine correct type of scrape target." component="scrape manager" scrape_pool=pm2 target="http://localhost:9209/metrics?fallback_scrape_protocol=Prometheus" content_type="" fallback_media_type="" err="non-compliant scrape target sending blank Content-Type and no fallback_scrape_protocol specified for target

参考 [issue](https://github.com/saikatharryc/pm2-prometheus-exporter/issues/94#issuecomment-2499899266) 来给 `exporter.js` 添加 header，然后重启：
```bash
pm2 restart pm2-metrics
```

在 `http://{your_ip}:9090` 端口的可视化页面 `Status -> Target Health` 中看到 pm2 的 State 为 UP 则表示配置成功，可以在 `Query -> Graph` 中查询进行验证：
```
pm2_cpu
```

通过 `systemctl` 来管理 prometheus 服务，先将二进制文件移动至目录中：
```bash
sudo mv prometheus /usr/local/bin/
sudo mv promtool /usr/local/bin/
```

创建数据目录和配置目录：
```bash
sudo mkdir /etc/prometheus
sudo mkdir /var/lib/prometheus
sudo cp prometheus.yml /etc/prometheus/prometheus.yml
```

创建 `prometheus` 用户：
```bash
sudo useradd --no-create-home --shell /bin/false prometheus
sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
sudo chown prometheus:prometheus /usr/local/bin/prometheus
sudo chown prometheus:prometheus /usr/local/bin/promtool
```

创建 `systemd` 服务文件，新建 `/etc/systemd/system/prometheus.service` 文件，设置数据保存时间 7d：
```ini
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus/ \
  --storage.tsdb.retention.time=7d
Restart = on-failure
RestartSec = 5

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl enable prometheus.service

sudo systemctl start prometheus
```

#### 数据可视化
通过 `Grafana` 消费 `Prometheus` 的监控数据，搭建可视化监控看板。安装 `Grafana`：
```bash
sudo apt-get install -y apt-transport-https software-properties-common
sudo mkdir -p /etc/apt/keyrings/
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get install grafana
```

服务默认端口是 3000，如果想要修改，需要编辑配置文件：
```bash
sudo vi /etc/grafana/grafana.ini
```

启动服务：
```bash
sudo systemctl start grafana-server
```

访问 `Grafana `站点进行 `Dashboard` 配置，在 `DataSource` 中导入 `Prometheus` 数据源即可开始使用。

### 日志

#### 日志轮转
`pm2` 默认日志单文件存储，通过 `pm2-logrotate` 来轮转 pm2 中的 NestJS 日志，减少磁盘消耗
```bash
# 安装 pm2-logrotate
pm2 install pm2-logrotate
```

使日志按每小时划分：
```bash
# 设置日志文件名
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-00-00
pm2 set pm2-logrotate:rotateInterval "0 * * * *"
```

使用自定义的 logger 来实现 ORM 日志按小时划分：
```ts
class CustomLogger implements Logger {
  private getLogFileName(): string {
    const now = dayjs().set('minute', 0).set('second', 0);
    return path.join(LOG_DIR, `ormlogs-${now.format('YYYY-MM-DD_HH-mm-ss')}.log`);
  }

  // ...
}
```

#### 日志收集 & 分析
通过 `Loki` 来收集、聚合日志：
```bash
sudo apt-get install loki promtail
```

编辑配置文件 `/etc/promtail/config.yml`:
```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
- url: http://localhost:3100/loki/api/v1/push

scrape_configs:
- job_name: myjob
  static_configs:
  - targets:
      - localhost
    labels:
      job: myapp
      __path__: /my/log/path/*.log
```

重启服务：
```bash
sudo systemctl restart promtail
```

检查服务状态：
```bash
sudo systemctl status promtail
sudo systemctl status loki
```

#### 可视化查询
在 `Grafana` 的 `DataSource` 中导入 `Loki` 数据源，即可在 `Logs` 中进行可视化查询。一个示例：

![](https://img.chlorine.site/2024-12-21/02.png)

### 告警
在 `Grafana` 看板中可以方便地配置告警规则，并支持多种通知方式：
- 邮件
- Webhook
- DingDing
- Discord
- Slark 等

这里以配置网易邮箱的 `SMTP` 服务进行邮件转发为例，首先访问邮箱在线地址，进入邮箱设置，开启 `SMTP` 并获得授权码，然后编辑服务器中的 `/etc/grafana/grafana.ini`：
```ini
[smtp]
enabled = true
host = smtp.163.com:587
user = your_163_email@163.com
password = your_authorization_code
skip_verify = false
from_address = your_163_email@163.com
from_name = Grafana
ehlo_identity =
```

然后重启 Grafana 服务即可：
```bash
sudo systemctl restart grafana-server
```

测试邮件能否收到：
![](https://img.chlorine.site/2024-12-21/03.png)

## 总结
随着环境和服务配置的完成，我们还通过引入的持续交付（CD）流程来实现了自动化部署，提高了开发和运维的效率。进一步地，我们通过监控、日志和告警的有效管理，能够实时掌握服务的运行状况并及时处理潜在问题。至此，已经搭建了一套相对完整的服务器环境和服务运维体系。
