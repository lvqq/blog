---
category: css
tags:
  - 布局
date: 2018-10-26
title: 七种方法实现左侧固定右侧自适应布局
vssue-title: 七种方法实现左侧固定右侧自适应布局
---

左侧固定宽度，右侧自适应的布局在网页中比较常见，像一些文档或者是后台管理系统都是这样的布局，那么实现它的方法有哪些呢？这里我归纳总结了以下七种方法实现这一布局

<!-- more -->

页面dom结构如下：

```html
<div class="box">
  <div class="aside"></div>
	<div class="main"></div>
</div>
```

基础的css样式：

```css
body {
  padding: 0;
  margin: 0;
}
.aside {
  width: 300px;
  height: 200px;
}
.main {
  height: 200px;
}
```

那么要实现左侧定宽（300px）右侧自适应的布局效果，有以下七种方法：

## ① float + margin-left

```css
.aside {
  float: left;
}
.main {
  margin-left: 300px;
}
```

方法很简单，但确实实现了这个效果。

## ② float + overflow

```css
.aside {
  float: left;
}
.main {
  overflow: auto;
}
```

左侧盒子浮动，右侧利用`overflow: auto`形成了BFC,因此右侧盒子不会与左侧盒子重叠。

## ③ absolute + margin-left

```css
.box {
  position: relative;
}
.aside {
  position: absolute;
  left: 0;
}
.main {
  margin-left: 300px;
}
```

常见的方法之一。

## ④ float + calc

```css
.aside {
  float: left;
}
.main {
  float: left;
  width: calc(100% - 300px);
}
```

让左右两个盒子都浮动，然后给通过动态计算宽度使右侧自适应。

## ⑤ inline-block + calc

```css
.aside {
  display: inline-block;
}
.main {
  display: inline-block;
  width: calc(100% - 300px);
}
```

设置两个盒子为行内块元素，同样通过动态计算宽度使右侧自适应。

## ⑥ flex

```css
.box {
  display: flex;
}
.main {
  flex: 1;
}
```

设置父盒子为`flex`布局，然后让右侧自动占满剩余宽度。

## ⑦ grid

```css
.box {
  display: grid;
  grid-template-columns: 300px 1fr;
}
```

设置父元素为`grid`，第二个网格的自动占满剩余宽度。
