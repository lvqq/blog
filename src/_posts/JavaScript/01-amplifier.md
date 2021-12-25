---
category: JavaScript
tags:
  - 放大器
date: 2017-12-06
title: 放大器
vssue-title: 放大器
---

![](https://img.chlorine.site/2017-12-06/02.png)

经常逛某宝可以发现，查看商品时都有如下的放大功能，鼠标放到图片上可以看到图片的细节，那么它是如何实现的呢？是真的将图片放大了吗？这篇文章就是讲述这个放大器是如何实现的

<!-- more -->

## 原理

放大器其实并不是真的将图片放大了。

假如是原图片放大，那么放大后势必会出现一定程度的模糊，而我们平时所看到的，放大后反而更清晰了。所以这两张图并不相同，一个是缩略图，另一个则是前者的高清放大版。

当鼠标放在左侧盒子上时，使遮罩和右侧“放大“图片显示，鼠标移动，带着遮罩随之移动，并使右侧图片等比例进行相应移动，显示出对应的放大后的 局部位置。

当遮罩层向下移动的时候，这个时候大图等比例向上移动，就会显示对应的局部放大区域。然后把溢出的部分隐藏即可达到放大效果。

demo:

- [放大器](https://lvqq.github.io/Demos/enlarge/)

## 实现

要实现上面demo中的放大器，首先你得准备两张图，一张正常大小，另一张高清放大版。<br />html结构比较简单：

```html
<div class="box1">
    <img src="./Images/small.jpg">
    <div class="mask"></div>
</div>
<div class="box2">
    <img src="./Images/big.jpg">
</div>
```

css部分就不给出了，无非是给盒子设宽高，调一下边距什么的，这里只注意一点：

- 左侧盒子宽高和右侧一定是成比例的

         <br />什么意思呢？<br />要使放大的区域与左侧遮盖的区域一样，那么左右宽高需要保持相同的比例，相信这一点不难理解。
      

![](https://img.chlorine.site/2017-12-06/03.png)

在这里，遮罩宽高为200px，缩略图为400px，显示区域为450px，原图为900px(上图所画原图大小仅做参考)

以宽为例：<br />遮盖的宽 / 缩略图的宽 = 显示区域的宽 / 原图的宽。<br />样式设置好了，宽高也就位了，怎么让图片动起来呢？

### 第一步：先让遮罩动起来

代码如下：
      

```javascript
box1.onmousemove = function(event) {
    //...
    var x = event.pageX - box1.offsetLeft - mask.offsetWidth/2;
    var y = event.pageY - box1.offsetTop - mask.offsetHeight/2;
    //...
}
```

用 event.pageX减去box1.offsetLeft再减去遮罩的半宽，就得到遮罩的左侧与盒子间的距离，如下图：<br />（坐标相关可以参考：[JS坐标获取](http://www.nicksonlvqq.cn/blog/8/)）

![](https://img.chlorine.site/2017-12-06/04.png)

再对x进行约束，使遮罩无法移出边框，最后将x赋值给left:

```javascript
//..
mask.style.left = x + "px";
mask.style.top = y + "px";
//...
```

 这样每次鼠标移动就会更新遮罩的left、top值，使得遮罩移动起来。

### 第二步：等比例移动右侧大图

先求得小图和大图的比例关系，再乘上x就是大图要移动的距离。
      

```javascript
//...
var scale = box2.offsetHeight/mask.offsetHeight;
var xx = x*scale;
var yy = y*scale;
img.style.marginLeft = -xx + "px";
img.style.marginTop = -yy + "px";
```

这样这个放大器就基本实现了，当鼠标移动时，遮罩跟随移动，同时右侧大图等比例移动，达到放大的效果。

## 关于

- [demo源码](https://github.com/lvqq/Demos/tree/master/enlarge)
