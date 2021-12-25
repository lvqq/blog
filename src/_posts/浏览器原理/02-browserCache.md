---
category: 浏览器原理
tags:
  - 浏览器
  - 缓存
date: 2020-01-20
title: 浏览器缓存策略
vssue-title: 浏览器缓存策略
---

![](https://img.chlorine.site/2020-01-20.01png)

最近在对项目做 IE 11 兼容，由 IE 的缓存问题，引发我对于浏览器缓存策略的思考。

<!-- more -->

## 缓存类型

web缓存主要可以分为下面几类：
- 客户端缓存
- 服务端缓存
- 数据库缓存

这里我们主要关注客户端，也就是**浏览器缓存**。

浏览器和服务器通信是通过 HTTP 协议，浏览器向服务器发起 HTTP 请求，服务器作出响应。当再次发起请求的时候，可以直接读取缓存中的数据，减少网络带宽的消耗，提升页面的访问速度。

根据是否重新发起 HTTP 请求，可以将浏览器缓存分为两种：**强制缓存**和**协商缓存**。

### 1.强制缓存

与强制缓存有关的 HTTP 头部有 **Expires** 和 **Cache-Control**

#### Expires

Expires 响应头包含一个 HTTP 日期(GMT 时间，非本地时间)，表示资源过期的时间。

当设置无效值，例如 0，表示资源立即过期，即不使用缓存。

```javascript
//...
const getGMT = () => `${moment().utc().add(1, 'm').format('ddd, DD MMM YYYY HH:mm:ss')} GMT`

app.get('/expries', (req, res) => {
  res.setHeader('Expires', getGMT());
  res.end('ok')
});
```

这里使用 express 创建了一个 web 服务，在 header 中添加了 Expires 响应头，利用 moment 转化为相应的 GMT 格式，设置为 10s 后过期，可以看到首次请求时向服务端发起了 HTTP 请求，第二次则使用了缓存（**disk cache**），超过 10s 之后再请求时（第三次）缓存过期，重新向服务端发起 HTTP 请求。

![](https://img.chlorine.site/2020-01-20/04.jpg)

请求时带上 Expries 请求头：

![](https://img.chlorine.site/2020-01-20/03.jpg)

#### Cache-Control

Cache-Control 是一个通用首部，既可以设置在请求头中，也可以设置在响应头中，常用的取值包括以下几种：

| Cache-Control 取值 | 含义 |
| ----------------- | ---  |
| no-store          | 绝对禁止缓存  |
| no-cache          | 会被缓存，但是立刻过期，要求将请求提交给原始服务器进行验证，相当于 `max-age=0` |
| private           | 只有浏览器可以缓存，禁止代理服务器、CDN等中间人缓存   |
| public            | 资源可以被任何对象缓存    | 
| max-age           | 表示资源被缓存的最大时间，单位秒；当设置该值时，Expries 头部会被忽略    |

其中`private`、`public`只能用于响应头部中

![](https://img.chlorine.site/2020-01-20/05.jpg)

### 2.协商缓存

在强制缓存中，我们根据时间来判断资源是否过期，这会存在一定弊端，当过期时间到了，即使服务端资源未改动，也会重新获取。由此我们引进了协商缓存的概念，协商缓存需要浏览器和服务器共同实现，与协商缓存有关的**响应头部**字段主要为以下两组：
- `Last-Modified` 和 `If-Modified-Since`
- `ETag` 和 `If-None-Match`

#### Last-Modified

`Last-Modified` 表示资源最后的修改时间（GMT 格式），具体过程如下：

1. 首次请求，服务端返回 `Last-Modified` 响应头部，告诉浏览器该资源的最后修改时间
2. 再次请求，如果浏览器缓存未过期，直接读取缓存中的资源（**disk cache**）
3. 当浏览器的缓存资源过期，此时再发起 HTTP 请求时，会自动带上 `If-Modified-Since` 这个请求头部，它的值即为上一次请求响应的 `Last-Modified`，服务端比较两个字段的值，如果一致，说明资源未改动，返回 304，否则返回更改后的资源。

![](https://img.chlorine.site/2020-01-20/06.jpg)

可以看到再次请求时自动加上 `If-Modified-Since` 请求头部：

![](https://img.chlorine.site/2020-01-20/07.png)

服务端实现如下：

```javascript
const filePath = path.join(__dirname, '../static/index.html')

app.get('/lastModified', (req, res) => {
  const stat = fs.statSync(filePath);
  const file = fs.readFileSync(filePath);
  const lastModified = stat.mtime.toUTCString();

  res.setHeader('Cache-Control', 'public,max-age=10');

  if (lastModified === req.headers['if-modified-since']) {
    res.writeHead(304, 'Not Modified');
    res.end();
  } else {
    res.setHeader('Last-Modified', lastModified);
    res.writeHead(200, 'OK');
    res.end(file);
  }
});
```

#### ETag

当资源发生多次改动，但是资源内容未改变时，此时服务器仍需要重新返回资源。为了提升判断的精确度，引入 ETag 响应头部，表示资源特定版本的标识符，当文件内容未发生变化时，该标识符的值不会改变。具体过程如下：

1. 首次请求，服务端返回 `ETag` 响应头部，告诉浏览器该资源的特殊标识
2. 再次请求，如果浏览器缓存未过期，直接读取缓存中的资源（**disk cache**）
3. 当浏览器的缓存资源过期，此时再发起 HTTP 请求时，会自动带上 `If-None-Match` 这个请求头部，它的值即为上一次请求响应的 `ETag`，服务端比较两个字段的值，如果一致，说明资源未改动，返回 304，否则返回更改后的资源。

![](https://img.chlorine.site/2020-01-20/08.jpg)

当文件发生变化时，响应头部的 `ETag` 和请求头部的 `If-None-Match` 不一致：

![](https://img.chlorine.site/2020-01-20/09.jpeg)

服务端实现如下：

```javascript
const filePath = path.join(__dirname, '../static/index.html')

// 创建 md5 加密
const cryptoFile = (file) => {
  const md5 = crypto.createHash('md5');
  return md5.update(file).digest('hex');
}

app.get('/eTag', (req, res) => {
  const file = fs.readFileSync(filePath);
  const eTag = cryptoFile(file)

  res.setHeader('Cache-Control', 'public,max-age=10');

  if (eTag === req.headers['if-none-match']) {
    res.writeHead(304, 'Not Modified');
    res.end();
  } else {
    res.setHeader('ETag', eTag);
    res.writeHead(200, 'OK');
    res.end(file);
  }
})
```

### 3.其他

#### Pragma

在 HTTP/1.0 时期存在一个通用首部 `Pragma` ，当它的值为 `no-cache` 时，与 `Cache-Control: no-cache` 的行为一致。它在“请求-响应”链中可能会有不同的效果，现在一般用于向后兼容只支持 HTTP/1.0 的客户端。

**Chrome** 下测试，在请求头部/响应头部中设置 `Pragma: 'no-cache'` 均可以实现禁用缓存：

![](https://img.chlorine.site/2020-01-20/10.png)

但在 IE 11 下，当 `Pragma` 置于响应头部时并未生效，可以在 IE 11 下运行[测试代码](https://github.com/lvqq/Demos/tree/master/browserCache)进行验证。

#### cache

在 chrome 下控制台可以看到浏览器本地缓存分为两类：`memory cache` 和 `disk cache`，即**内存缓存**和**磁盘缓存**。

- 内存缓存主要包含当前页面已经加载的资源，例如图片、脚本等，当关闭TAB页时，内存中的缓存将被释放。
- 磁盘缓存读取较内存缓存慢，但是胜在时效性和存储容量上，页面关闭后缓存依然存在。

那么浏览器是如何区分哪些资源存放在内存中，哪些又存在磁盘中呢？

其实这个问题没有一个标准答案，普遍认为和系统当前内存的使用情况有关，如果当前系统内存使用率高，那么会优先存储在磁盘中；另外一个就是对于大文件，一般存储在磁盘中。

## 缓存优先级

关于优先级，强制缓存的优先级总是大于协商缓存，只有在强制缓存失效后才会发起请求进行协商缓存；

而在协商缓存中，`Last-Modified`表示的是一个 GMT 格式的时间，只能精确到秒，因此 `ETag` 的精确度要高于 `Last-Modified`，但同时每次进行 hash 运算生成标识也会带来额外的开销。二者都存在时，服务端应以 `ETag` 为准。

总的优先级如下：

`Pragma > Cache-Control > Expries > ETag > Last-Modified`

在**Chrome**下验证，当 `Pragma`为 **no-cache**，`Cache-Control` 设置 **1000s** 缓存时，浏览器会禁用缓存：

![](https://img.chlorine.site/2020-01-20/11.png)

同样，设置响应头为 `Cache-Control: 'no-cache'` 和 `Expries` 为 **1000s** 后过期，浏览器依然禁用缓存：

![](https://img.chlorine.site/2020-01-20/12.png)

## 缓存过程

整体的缓存过程如下：

![](https://img.chlorine.site/2020-01-20/13.png)

## IE 下的缓存

兼容 IE 11 的过程中踩过一些坑，在实际项目中遇到的印象比较深刻的问题是下面这个：

::: tip
由于 IE 对 GET 接口的缓存，当用户首次进入系统时，因为未登录跳转至sso，登录成功之后仍然返回的是缓存中的未登录，导致登录之后出现闪屏，在原系统和sso之间不停来回跳转。 
:::

另外，由于 IE 浏览器打开控制台之后默认开启**始终从服务端刷新**，在 debug 阶段着实给我造成了不小的困扰，后来放弃使用控制台，通过抓包工具[Charles](https://www.charlesproxy.com/)进行截取、分析，这才定位到问题。

![](https://img.chlorine.site/2020-01-20/02.png)

### IE 缓存问题

究其原因，是 IE 对于 GET 请求的缓存策略问题：
- 对于首次请求，会对服务器发起请求
- 对于非首次请求，会直接从缓存中读取数据

多次发起 GET 请求时，若 url 未发生变化，IE 则认为这是非首次请求，直接读取缓存。

### 解决方法

#### 1. 在 url 中加入随机标识

通过在 get 请求的 url 中加入随机标识，例如时间戳、随机数等，来达到变更 url 的目的，此时浏览器不会从缓存中读取数据

#### 2. 设置 header 响应头部

服务端设置响应头部禁止浏览器缓存

```javascript
{
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Expires': -1,
}
```

#### 3. 设置 header 请求头部

在实际项目中我采用的是这种解决方案

```javascript
{
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
}
```

#### 4. 更改为 post 请求（不推荐）

### 参考

- [MDN/HTTP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview)
- [How to prevent caching in Internet Explorer](https://support.microsoft.com/en-us/help/234067/how-to-prevent-caching-in-internet-explorer)
- [How do we control web page caching, across all browsers](https://stackoverflow.com/questions/49547/how-do-we-control-web-page-caching-across-all-browsers)
- [测试代码](https://github.com/lvqq/Demos/tree/master/browserCache)
