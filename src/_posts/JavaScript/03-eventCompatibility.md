---
category: JavaScript
tags:
  - 兼容性
date: 2018-05-01
title: 注册事件的兼容性处理
vssue-title: 注册事件的兼容性处理
---

注册事件有好几种方法，每种方法或多或少都有一些不足之处，这里讲一下如何处理注册事件的兼容性问题

<!-- more -->

## 注册事件的方法

一般来说，注册事件有以下三种方法：

1. ele.on事件类型 = function
2. addEventlistener(事件类型, function, useCaptrue)
3. attachEvent(on事件类型, function)

## 方法中存在的问题

- `ele.on` 事件类型

这个注册事件的方法兼容性最好，但是无法为同一个元素绑定多个**相同的事件**，后面注册的会覆盖掉之前注册的
        

- `addEventlistener` <br />
  这个支持为同一元素绑定多个相同事件，但只有高版本的浏览器支持，对于IE来说 **IE9+** 才支持。

- `attachEvent`

它也支持为同一元素绑定多个相同事件，是早期IE浏览器的一个专有的替代性标准，用于替代 `addEventlistener` ，在**IE6 thru 10**中支持（IE11中不再支持）。<br />

## 事件的捕获和冒泡

提到事件，就离不开事件的捕获和冒泡，对于一个事件的触发，存在三个阶段：捕获、目标、冒泡：
        

1. 捕获：从外向内寻找触发事件的元素
2. 目标：找到触发事件的元素
3. 冒泡：事件从内向外冒泡

       <br />而在IE和低版本的Opera中（使用`attachEvent`来注册事件）是不支持事件捕获的，只支持事件冒泡。

一般的标准浏览器对于捕获和冒泡则都支持，使用`addEventListener`中可选的参数`useCaptrue`来控制使用哪种传递机制。

### 关于useCaptrue

`useCaptrue` 是 `addEventListener` 方法中可选的参数，是一个 `Boolean` 类型的值，MDN上对其解释如下：

         Boolean，是指在DOM树中，注册了该listener的元素，是否会先于它下方的任何事件目标，接收到该事件。沿着DOM树向上冒泡的事件不会触发被指定为use capture（也就是设为true）的listener。当一个元素嵌套了另一个元素，两个元素都对同一个事件注册了一个处理函数时，所发生的事件冒泡和事件捕获是两种不同的事件传播方式。事件传播模式决定了元素以哪个顺序接收事件。
      

简单来说，点击element2，当参数为 **true** 时，事件在**捕获阶段**触发，冒泡阶段不触发。先触发`element1.onclick`，再触发`element2.onclick`。<br />当参数为 **false**（默认值）时，事件在**冒泡阶段**触发，捕获阶段不触发。先触发`element2.onclick`，再触发`element1.onclick`。

![](https://img.nicksonlvqq.cn/2018-05-01/01.png)

## 兼容性写法

如何实现注册事件的兼容性处理？这里以一个div为例。

### 兼容性实现

```javascript
window.onload = function() {
    var div = document.getElementsByTagName('div')[0];
    if(div.addEventListener) {
        div.addEventListener('click', function() {
            alert('Hello!');
        });
    }else if(div.attachEvent) {
        div.attachEvent('onclick', function() {
            alert('Hello!');
        });
    }else{
        div['onclick'] = function () {
            alert('Hello!');
        }
    }
}
```

这样就实现了兼容性处理，但是它也存在一定的问题：复用性太差。

### 简单封装

经过改进后，可以提高代码的复用性，如下：

```javascript
//target是目标元素、type是绑定事件的类型、handler的回调函数
function registerEvent(target, type, handler) {
    if(target.addEventListener) {
        target.addEventListener(type, handler);
    }else if(target.attachEvent) {
        target.attachEvent('on' + type, handler);
    }else{
        target['on' + type] = handler;
    }
}

window.onload = function() {
    var div = document.getElementsByTagName('div')[0];
    registerEvent(div, 'click', function() {
        alert('Hello!');
    });
}
```

这里实现了封装，有了一定的复用性，但还有改进的空间：每次调用时都需要判断，可以进一步改进，使其只需要判断一次即可。

### 进一步封装

这里可以使用闭包的相关知识，返回一个注册事件的函数，这样就实现了只需判断一次，减少了代码的判断次数,如下：

```javascript
function createEventRegister() {
    if(window.addEventListener) {
        return function(target, type, handler) {
            target.addEventListener(type, handler);
        }
    }else if(window.attachEvent) {
        return function(target, type, handler) {
            target.attachEvent('on' + type, handler);
        }
    }else {
        return function(target, type, handler) {
            target['on' + type] = handler;
        }
    }
}

var registerEvent = createEventRegister();
window.onload = function() {
    var div = document.getElementsByTagName('div')[0];
    registerEvent(div, 'click', function() {
        alert('Hello!');
    });
}
```

这样写可以说是非常nice了，可还是有一点小问题：关于 this 对象和 event 对象<br />关于 this 对象，有如下代码：

```javascript
window.onload = function() {
    var div = document.getElementsByTagName('div')[0];
    registerEvent(div, 'click', function() {

        console.log(this);
        alert('Hello!');
    });
}
```

通过输出的结果可以看到，注册事件的处理函数中 this 指向不一致：

- 如果是支持 addEventListener 返回的函数，那么 this 则指向 `target`，即注册事件的目标对象；
- 如果是支持 attachEvent 返回的函数，那么 this 则指向 `window`；
- 如果是 on + 事件类型返回的函数，this 指向的是`target`。

   <br />要解决这个问题，就要使函数中 this 指向一致，可以使用`apply`或`call`方法来为回调函数指定 this，使其指向 `target`，attachEvent部分修改如下：

```javascript
//...
else if(window.attachEvent) {
    return function(target, type, handler) {
        target.attachEvent('on' + type, function() {
            handler.call(target);
        });
    }
}
 //...
```

关于event对象，回调函数中获取事件对象的方式不一致：

前面提到过标准浏览器中获取事件对象使用的是传递参数的方法，而IE中则是使用`window.event`,那么这里为了统一获取event对象的方法，将`window.event`作为参数传递进去，attachEvent 修改如下：
      

```javascript
//...
else if(window.attachEvent) {
    return function(target, type, handler) {
        target.attachEvent('on' + type, function() {
            handler.call(target, window.event);
        });
    }
}
//...
```

### 最终封装

综合以上几点，最终封装的代码如下，可以统一调用 this 对象和 event 对象：

```javascript
function createEventRegister() {
    if(window.addEventListener) {
        return function(target, type, handler) {
            target.addEventListener(type, handler);
        }
    }else if(window.attachEvent) {
        return function(target, type, handler) {
            target.attachEvent('on' + type, function() {
                handler.call(target, window.event);
            });
        }
    }else {
        return function(target, type, handler) {
            target['on' + type] = handler;
        }
    }
}
```
