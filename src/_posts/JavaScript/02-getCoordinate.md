---
draft: true
category: JavaScript
date: 2017-12-09
title: 浅谈JS中的坐标获取
vssue-title: 浅谈JS中的坐标获取
---

![](https://img.chlorine.site/2017-12-09/00.png)

在编写JavaScript代码时，经常会需要获得鼠标或者某个盒子的相对坐标，这里我们就简要介绍一下几种获取方法的不同

<!-- more -->

## 关于鼠标坐标

鼠标坐标一般是用event事件获取，其中有以下几个方法：

- pageX , pageY
- *screenX , *screenY
- *clientX , *clientY

其中以 `pageX`  , `pageY` 方法使用得较多，其他的方法则不太常使用（*标明）。

一张图说明三者的区别：

![](https://img.chlorine.site/2017-12-09/01.png)

如图☝

- `pageX` 是指光标相对于该网页的水平位置（网页实际大小），以当前文档的左上角为基准点。
- `screenX` 是指光标相对于该屏幕的水平位置（电脑屏幕），当前屏幕的左上角为基准点。
- `clientX` 是指光标相对于浏览器的水平位置 （当前可见区域），当前窗口的左上角为基准点。

 所以我们如何获取鼠标坐标？根据自己的需求来调用这些方法就行了~

```javascript
//...
var x = event.pageX;
var y = event.pageY;
//...
```

### 兼容性

说到兼容性，有两点要注意的是：

- 普通浏览器支持 `event` （任意参数）

ie 678 支持 `window.event` （内置，无参）

- pageX , pageY 在ie 6、7、8中不支持。

关于第一点，要想在ie和其他浏览器中都支持 `event` 事件，就要使用兼容性写法。代码如下：
          

```javascript
document.onclick() = function (event) {
    event = event || window.event;
}
```

关于第二点，ie 6、7、8中不支持 `pageX` ，那么可以用以下方法代替 `pageX` 获取鼠标坐标

首先要获得 `scrollLeft`

- 有DTD时<br />使用 `document.documentElement.scrollLeft` 获取
- 无DTD时<br />使用 `document.body.scrollLeft` 获取
- Safari <br />Safari比较特别，有自己获取scrollLeft的属性： `window.pageXOffset` 

其中DTD是文档类型声明，用 ` !DOCTYPE` 在文件中进行声明，对于html文件一般位于文件首部,用于声明该文档是html文档，如下：

```html
<!DOCTYPE html>
<html>
<!- ->
</html>
```

因此`scrollLeft` 兼容性写法如下，然后将页面卷曲的距离和鼠标距离浏览器的距离相加即可：

```javascript
var scrollLeft = document.documentElement.scrollLeft || window.pageXOffset || document.body.scrollLeft;
var pageX = scrollLeft + event.clientX;
```

总的兼容性写法：
          

```javascript
document.onclick = function(event) {
  var event = event || window.event;
  var scrollLeft = document.documentElement.scrollLeft || window.pageXOffset || document.body.scrollLeft;
  var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
  var pageX = event.pageX || scrollLeft + event.clientX;
  var pageY = event.pageY || screenTop + event.clientY;
}
```

## 关于盒子坐标

这里介绍两种常用的获取盒子坐标的方法：

- `offsetLeft` 
- `style.left` 

看起来它们都是获取当前盒子的 `left`  值，但是却有很大不同：

1. `offsetLeft` 可以返回没有定位盒子的距离左侧的位置，而 `style.left`  不可以
2. `offsetTop` 返回的是数字，而 `style.top` 返回的是字符串，除了数字外还带有单位：px
3. `offsetTop`  只读，而 `style.top`  可读写（只读是获取值，可写是赋值）
4. 如果没有给 HTML 元素指定过 top 样式，则 `style.top` 返回的是空字符串
5. 对于 `offsetLeft`  ，是从父盒子的 `padding`  开始算， `border` 不算，父亲没有定位则以 `body` 为准
