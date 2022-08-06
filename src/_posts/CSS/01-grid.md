---
category: css
tags:
  - grid
date: 2018-10-10
title: Grid布局快速入门
vssue-title: Grid布局快速入门
---

![](https://img.chlorine.site/2018-10-10/00.png)

CSS Grid 是创建网格布局强大的工具，在2017年，已获得主流浏览器的原生支持（Chrome，Firefox，Edge，Safiri），这篇博客带你快速上手 Grid 布局

<!-- more -->

## 兼容性

在前端领域，提到某个新技术，想在实际开发中使用它，就不得不考虑兼容性问题，目前 Grid 布局在各大主流浏览器已实现支持，如下：

![](https://img.chlorine.site/2018-10-10/01.png)


## 网格布局

这里是一个网格布局，由父元素`container`和若干子元素`item`组成

```html
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

要想将其变为网格布局，需要给`container`设置`display: grid`属性，然后使用`grid-template-row`和`grid-template-column`属性来定义行和列。

```css
.container {
  display: grid;
  grid-template-columns: 150px 200px 250px;
  grid-template-rows: 150px 100px;
}
```

得到的效果如下：

![](https://img.chlorine.site/2018-10-10/02.png)

给`grid-template-columns`设置了三个值，因此得到了三列，给`grid-template-rows`设置了两个值，因此得到了两行。

这两个属性还可以取以下值：

- auto: 表示自动占满剩余空间
- fr：特殊单元，将容器中的自由空间设置为一个份数

举个栗子

```css
.container {
  display: grid;
  grid-template-columns: 150px auto 150px;
  grid-template-rows: 150px 100px;
}
```

可以看到，第二列将剩余空间全部占满。结果如下：

![](https://img.chlorine.site/2018-10-10/03.png)

再看这个

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 150px;
  grid-template-rows: 150px 100px;
}
```

第一列和第二列均为 1fr，因此他们将等分 150px 以外的宽度。

![](https://img.chlorine.site/2018-10-10/04.png)

如果有重复项，可以利用`repeat()`简化，上面的例子还可以写成这样：

```css
.container {
  display: grid;
  grid-template-columns: repeat(2, 1fr) 150px;
  grid-template-rows: 150px 100px;
}
```

要想调整 item 的大小，可以使用`grid-column`和`grid-row`来设置：

```css
.container {
  display: grid;
  grid-template-columns: 200px 150px 100px;
  grid-template-rows: 200px 150px 100px;
}
.item:nth-child(1) {
  grid-column-start: 1;
  grid-column-end: 4;
}
```

这里设置了一个 3x3 的布局，页面只显示了6个的原因是我们只有6个item来填充这个网格，假如我们再加一个item元素，那么右下角的空白将会被填满。

![](https://img.chlorine.site/2018-10-10/05.png)

这里我们让第一个 item 从第一根网格线开始，到第四根网格线结束，因此它将占据一整行。至于为什么三个网格会有四根网格线，看下图你就明白了：

![](https://img.chlorine.site/2018-10-10/06.png)

上面的代码还可以这样简写：

```css
.item:nth-child(1) {
  grid-column: 1/4;
}
```

下面我们来实践一下

```css
.item:nth-child(1) {
  grid-column: 1/3;
}
.item:nth-child(2) {
  grid-column: 3/4;
  grid-row: 1/3;
}
.item:nth-child(3) {
  grid-row: 2/4;
}
.item:nth-child(5) {
  grid-column: 2/4;
}
```

利用上面的代码，可以轻松得到如下的布局，更多的则需要发挥你的想象力：

![](https://img.chlorine.site/2018-10-10/07.png)

如果想让网格之间有一定间隙，Grid 布局提供了一个属性`grid-gap`，可以指定网格间距，而不需要我们手动添加margin属性。例如在上面的例子中将`container`属性增加如下两行：

```
.container {
    grid-column-gap: 10px;
    grid-row-gap: 10px;
  }
```

将得到这样的结果：

![](https://img.chlorine.site/2018-10-10/08.png)

如果 column 和 row 的值一样，可以简写为`grid-gap`:

```
.container {
    grid-gap: 10px;
  }
```

## 结语

Grid 很强大，它也远不只我介绍的这些，关于 Grid 更多详细的内容可以关注我后续的文章更新。<br />对于 Grid 和 Flex 哪个更好这个问题，我的答案是：**结合使用。**Grid 是二维布局，通常用于整个页面的布局规划，Flex 是一维布局，通常用于局部布局，亦或是组件的布局。二者并不冲突，结合使用将更加轻松。

## 参考

- [Learn CSS Grid in 5 Minutes](https://medium.freecodecamp.org/learn-css-grid-in-5-minutes-f582e87b1228)
- [MDN Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/grid)

<ToTop />