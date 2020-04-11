---
category: 浏览器原理
tags:
  - 跨域
date: 2018-11-04
title: 常见跨域解决方案
vssue-title: 07-crossDomain
---

![](https://img.nicksonlvqq.cn/2018-11-04/00.png)

不论是开放的API接口，还是部署在不同服务器的项目，很多都绕不开跨域这个问题，那么跨域有哪些常见的解决方案呢？

<!-- more -->

## jsonp

jsonp主要依赖`script`标签的`src`属性可以实现跨域访问，在请求的url后拼上相应的回调函数字段，后端也需要对返回的数据外包一层函数名进行处理。

### 如何使用

jsonp由两部分组成：回调函数和传入的数据，很重要的一点：**jsonp 只支持
 GET 方法**，不支持POST

这里以豆瓣的API为例，实现一个跨域请求。url为：[https://api.douban.com/v2/book/search?q=JavaScript高级程序设计&count=2](https://api.douban.com/v2/book/search?q=JavaScript%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1&count=2)

url中q表示查询图书时输入的信息，count表示查询结果的条目数。这里以查询JavaScript高级程序设计为例，结果为2条。

```html
<script type="text/javascript">
  //定义自己的回调函数
  function handleResponse(data){
    console.log(data);
  }
</script>

<!-- 将自己的回调函数拼在url后的callback中 -->
<script type="text/javascript" src="https://api.douban.com/v2/book/search?q=JavaScript高级程序设计&count=2&callback=handleResponse"></script>
```

通过这样的方法，将传入数据拼在url后，将自己的回调函数拼在url的`callback`中，再在回调函数中对获取到的数据进行处理，就实现了发起跨域请求。

### 动态获取

这里设置一个button，点击后动态获取数据，代码如下：

```bash
<script type="text/javascript">
    function handleResponse(data){
        console.log(data.books[1]);
    }
</script>

<script type="text/javascript">
	window.onload = function() {
        var btn = document.getElementById('btn');
        btn.onclick = function() {
            var script = document.createElement('script');
            script.src = 'https://api.douban.com/v2/book/search?q=JavaScript高级程序设计&count=2&callback=handleResponse';
            document.body.appendChild(script);
        }
    }
</script>
```

点击后可以看到成功获取到了数据：

![](https://img.nicksonlvqq.cn/2018-11-04/01.png)

### jQuery中使用 jsonp

```javascript
$.ajax({
    type: "get",
    url: "https://api.douban.com/v2/book/search?q=JavaScript高级程序设计&count=2",
    dataType: "jsonp",  // 将返回的数据类型设置为jsonp方式
    jsonp: "callback",   //请求php的参数名
    jsonpCallback: "handleResponse",  //要执行的回调函数
    success: function(data) {
        console.log(data);
    }
});
```

这里会先调用指定的 `handleResponse` ，然后再调用 success。其中 `handleResponse` 是随着参数传入的回调函数，success是该请求成功发送成功时一定会调用的回调函数，怎么使用就看你怎么写了。

使用`$.getJSON()`调用如下：

```javascript
$.getJSON("https://api.douban.com/v2/book/search?q=JavaScript高级程序设计&count=2&callback=?", function(data){
	console.log(data);
});
```

将url作为第一个参数传入，其中令`callback=?`，将回调函数作为第二个参数传入，这样也可实现跨域，会得到和前面一样的请求结果。

### `jsonp` 的局限性

- 只支持get方法
- 请求是否失败难以判断
- 请求域的安全性问题

## CORS

`CORS`全称是“跨域资源共享”，允许向跨域服务器发送Ajax请求。对于开发者来说，和使用Ajax没有什么区别，关键在于服务器，只要服务器实现了`CORS`的支持，就能实现跨域访问。关于`CORS`的兼容性如下：

![](https://img.nicksonlvqq.cn/2018-11-04/02.png)

可以看到绝大多数浏览器都支持`CORS`，而IE则必须在`IE10`及以上。`IE10`以下的则使用的是`XDomainRequest`对象，这里就不展开了。

`CORS`请求可以分为**简单请求**和**非简单请求**两种，浏览器对这两种请求的处理方式有所不同。

### 简单请求

若请求满足以下所有条件，则该请求视为“简单请求”：

- 使用以下方法之一：
            
  - `GET`
  - `POST`
  - `HEAD`
- HTTP首部不得设置以下集合之外的字段：
            
  - `Accept`
  - `Accept-Language`
  - `Content-Language`
  - `Content-Type`
  - `DPR`
  - `Downlink`
  - `Save-Data`
  - `Viewport-Width`
  - `Width`
- Content-Type 的值仅限于下列三者之一：
            
  - `text/plain`
  - `multipart/form-data`
  - `application/x-www-form-urlencoded`

对于简单请求，浏览器会直接发送`CORS`请求，在请求报文的头部信息中自动添加一个`Origin`字段，表示发起请求的源。例如：

```
Origin: http://foo.example
```

而服务端返回的响应首部中则有`Access-Control-Allow-Origin`字段：

```
Access-Control-Allow-Origin: http://foo.example
```

表示允许域名为`http://foo.example`的外域向自己发起跨域的`CORS`请求，如果想让任意域名都能发起请求，可以将它的值设置为`*`

### 非简单请求

如果是非简单请求，那么在发起`CORS`请求前，必须使用`OPTIONS`方法发起一个**预检**请求。<br />该预检请求中也会自动添加一个`Origin`字段表示请求源，还会携带以下两个字段：

```javascript
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER
```

分别表示此次请求使用的方法和额外的自定义请求首部（若有多个则用逗号隔开）。<br />如果服务器通过了预检请求，那么返回的响应首部中会有如下几个字段：

```javascript
Access-Control-Allow-Origin: http://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
```

- `Access-Control-Allow-Origin`与简单请求中的一致。
- `Access-Control-Allow-Methods`表示服务端允许客户端发起请求时使用的所有方法。
- `Access-Control-Allow-Headers`表示客户端发起请求时允许携带的请求首部。
- `Access-Control-Max-Age`则表示预检请求过期的时间，单位为秒，这里是86400秒，也就是24小时。

关于CORS更为详细的介绍可以参考：

- [MDN-HTTP访问控制（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
- [阮一峰-跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)

## iframe

在存在`iframe`的页面中，要想发起跨域访问，可以采用`降域`或者`postMessage`的方式实现。

### iframe 降域

降域的前提是二者的主域名要一致，例如`a.example.com`和`b.example.com`。在当前页面和`iframe`源页面均需要设置`document.domain`属性才能实现降域，这样二者可以跨域访问：

```
document.domain = "example.com";

```

### postMessage

包含`iframe`的页面中还可以使用`postMessage`进行消息传递来进行跨域访问。

```javascript
<!-- index.html 父页面 -->

<h1>this is index</h1>

<iframe src="./iframe.html" id="myiframe"></iframe>

```

```javascript
<!-- iframe.html 子页面 -->

<h1>this is iframe</h1>

```

这里有两个不同源的页面`index.html`和其中包含的`iframe`的源页面`iframe.html`。

### 父页面向子页面发送消息

```javascript
//index.js

var myiframe = document.getElementById('myiframe');

myiframe.onload = function () {
  myiframe.contentWindow.postMessage('data from index', '*');
}

```

首先获取`iframe`元素，然后当它加载完成后向它发送一条消息，这里的`contentWindow`表示获取的`iframe`页面的`window`对象，`postMessage`方法挂载在`window`对象上。

`postMessage`方法接受的第一个参数是发送的数据，可以是任何原始类型的数据。第二个参数表示发送到的`url`，这里设置为`*`表示所有`url`都允许。还有更高级的第三个可选参数，这里就不展开了。

```javascript
//iframe.js

window.onmessage = function (event) {
  console.log(event.data);
}

```

然后在`iframe`页面中监听`message`事件即可，`event.data`即为发送的数据。

### 子页面向父页面发送消息

```javascript
//iframe.js

parent.postMessage('data from iframe', '*')

```

在`iframe`的源页面中，直接使用`parent`关键字即可获得父页面的`window`对象，然后调用`postMessage`发送数据。

```javascript
//index.js

window.onmessage = function (event) {
  console.log(event.data);
}

```

同样的，在父页面中监听`message`事件来捕获子页面的消息传递。

参考：

- [MDN-window.postMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)

