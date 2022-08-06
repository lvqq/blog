---
category: JavaScript
tags:
  - nodejs
  - vm
date: 2021-09-21
title: 如何安全地执行用户的自定义 nodejs 脚本
vssue-title: 如何安全地执行用户的自定义 nodejs 脚本
---

![](https://img.chlorine.site/2021-09-21/01.png)

最近在业务开发过程中，遇到需要执行用户自定义 nodejs 脚本的场景，那么该如何安全地执行用户的神秘代码呢？

<!-- more -->

# 用户脚本
用户脚本具有不可预测性的特点。
- 在浏览器端，用户脚本可以直接获取到 cookie，localStorage 等信息；
- 在 Node 端则可以执行退出进程、删除文件等危险操作，会有潜在的安全问题。

因此我们默认认为用户提供的脚本内容是不可信任的。那么应该如何执行这样一段无法信任的脚本呢？

# 如何执行
以 node 环境为例，在不考虑安全的情况下，我们简单执行一段脚本一般有两种方式：

```javascript
// node v14.16.0
eval('process.exit()');
console.log('process has exit by eval')

new Function('process.exit()')()
console.log('process has exit by new Function')
```

在这里 `eval` 和 `new Function` 函数都会在当前上下文执行，并能执行一些危险操作进而影响到当前运行环境。因此需要将用户脚本执行的环境与当前环境隔离开，使用 sandbox 沙盒去执行用户脚本，这样可以避免用户脚本对当前执行上下文造成影响。

这里我们仅从执行环境的角度来考虑，脚本的语法分析与过滤则不在本文的讨论范围内。

## 使用 web worker
提到沙盒，我最先想到的就是 worker，那么在 worker 中去执行用户代码是否可行呢？看下面这个示例：

```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  console.log('in main thread');
  const worker = new Worker(__filename);
  // user script
  const script = `
  const fs = require('fs');
  fs.unlink('./test.txt', (e) => {
    if (e) throw e;
    console.log('file was deleted')
  })
  `;
  worker.postMessage(script);
} else {
  console.log('in worker thread');
  parentPort.on('message', (message) => {
    eval(message);
  })
}

// 执行结果：
// file was deleted
```

在上面的例子中，可以看到虽然将用户代码的安全风险转嫁给了 worker 线程，但是在 node 端也无法阻止用户脚本调用 fs 模块进行文件相关的危险操作

浏览器中也可以使用 web worker，虽然在 worker 线程中无法直接获取到 cookie, localStorage, DOM 等数据，但由于 postMessage 能够接收任务来源的信息，这会成为 XSS 攻击的潜在风险点。因此在浏览器端使用时需要在服务端对信息进行相应的输入过滤和清洗

## 使用 child_process
`child_process` 是 Nodejs 中创建的子进程，能够直接执行 shell 命令，使用 `child_process` 遇到的问题与 web worker 类似，就不展开了

## 使用 vm 模块
vm 是 Node 中的一个模块，可以在 v8 的虚拟机中运行你的代码，是一个沙箱隔离的环境，并且默认屏蔽了process, console, fs 等全局对象，有一定的安全性保障：
```javascript
const vm = require('vm');

// ReferenceError: process is not defined
vm.runInNewContext('process.exit()');


vm 中还可以选择脚本的执行上下文环境：
vm.runInThisContext  // 在当前上下文执行
vm.runInContext  // 在指定的上下文中运行脚本，上下文是 vm.createContext 中返回的结果
vm.runInNewContext  // 创建一个新的上下文执行，会默认执行 vm.createContext 方法


vm.runInNewContext 和 vm.createContext 中还支持为上下文传入一些全局对象供脚本使用
const vm = require('vm');

// 将当前上下文的 process 传入新的上下文中，此时进程退出成功
vm.runInNewContext('process.exit()', {
  process,
});
```

表面上看比较完美，但其实 vm 模块存在一些已知的安全问题，正如 Node 的官方文档中写道：
> The vm module is not a security mechanism. Do not use it to run untrusted code.

以下面的代码为例，通过访问上层的构造函数，则可以逃逸 vm 构造的沙盒环境，“呼吸到沙盒外的空气”：
```javascript
const vm = require('vm');
// sandbox 的 constructor 是外层的 Object 类
// Object 类的 constructor 是外层的 Function 类
// func = this.constructor.constructor
// 于是, 利用外层的 Function 构造一个函数就可以得到外层的全局环境的上下文
// process = (func('return this;'))().process;
vm.runInNewContext('this.constructor.constructor("return process")().exit()');
console.log('Never gets executed.');
```

## vm2
在社区中有许多解决方案用于隔离运行用户脚本，如 sandbox、 vm2、 jailed 等。相比较而言 vm2 在安全方面做了更多的工作，相对可靠些。vm2 主要利用 Proxy 进行了上下文同步，防止代码逃逸，实现了对于全局对象、内置模块的访问限制，并重写了 require 方法实现对于模块的访问管理。

上面逃逸的例子在 vm2 中则被拦截了：
```javascript
const { VM } = require('vm2');
new VM().run('this.constructor.constructor("return process")().exit()');
// Throws ReferenceError: process is not defined
```

在 vm2中还新增了 NodeVM 类来实现 node 中的模块化调用，因此你可以方便的在脚本中去 exports 一些内容：
```javascript
const { NodeVM } = require('vm2');
const script = `
module.exports = async () => {
  return 1
}
`;

const fn = new NodeVM().run(script);
fn(); 
// Result: 1
// fn 就是 module.exports 返回的函数
```

但 vm2 也没有解决 vm 中已知的一些问题：
- 对于 `NodeVM` 模块，不支持 timeout 配置，无法处理例如 `while(true){}` 等死循环从而导致进程卡住，无法退出
- 对于 `VM` 模块，timeout 超时只能针对同步代码生效，无法处理异步超时

处理同步代码不支持 timeout 的情况，可以利用 vm2 的 VM 模块或者原生的 vm 模块来手动实现，支持 timeout 参数处理同步场景下的超时配置，伪代码如下：
```javascript
// vm2
function fnSyncTimeout(fn, timeout) {
  // ...
  return new VM({
    timeout,
    sandbox: { fn }
  }).run('fn()')
}
```

处理线程不阻塞时，类似接口调用场景下的异步超时的处理，我们可以通过 Promise.race 来实现：
```javascript
function fnAsyncTimeout(fn, timeout) {
  let timer;
  return Promise.race([fn(), new Promise((res, rej) => {
    timer = setTimeout(() => {
      rej('script timeout error')
    }, timeout)
  })]).finally(() => {
    clearTimeout(timer);
  });;
}
```

上面的方法虽然可以解决单个场景，但是介于 nodejs 单线程的特性，对于无法返回的异步脚本的处理无能为力。例如异步脚本中包含死循环，会使当前线程受到阻塞，即使有异步回调也无法继续执行。而且 vm 模块在创建后无法手动关闭，自带的超时配置仅支持同步脚本。

基于以上问题，我想到结合 web worker 来优化处理，主要思路是将用户脚本放在 worker 线程中执行，避免阻塞主线程，并且通过在主线程中配置定时器，超过超时时间则手动退出 worker 线程。主要实现如下：

```javascript
const { isMainThread, Worker, parentPort } = require("worker_threads");

// 超时时间
const timeout = 60000;

if (isMainThread) {
    const w = new Worker(__filename);
    let checkEndTimer;
    
    w.on("online", () => {
        checkEndTimer = setTimeout(() => {
            w.terminate();
        }, timeout);
        console.log('script start')
    });
    
    w.on("exit", () => {
        clearTimeout(checkEndTimer);
        console.log('script end');
    });


    w.on('message', (msg) => {
      // handle script result
    });

} else {
    const { NodeVM, VMScript } = require("vm2");
    const vm = new NodeVM();
    // 用户脚本
    const code = `
        module.exports = async () => {
          await new Promise(res => setTimeout(res, 2000))
          // 死循环
          while(true) {}
          return 1;
        }
    `;
    try {
      new VMScript(code).compile();
    } catch (err) {
      console.error('Failed to compile script.', err);
    }

    const fn = vm.run(code);
    (async () => {
        const data = await fn();
        parentPort.postMessage(data);
    })()
}
```

# 总结
目前采用 worker 线程 + vm2 作为执行用户脚本的方案并加以优化，相较于其他方式来说似乎提供了一个更坚固的沙箱，但也不排除有未发现的新的安全隐患。总之，代码安全无小事，考虑再多也不为过~


# 参考
- [vm2](https://github.com/patriksimek/vm2)
- [https://github.com/patriksimek/vm2/issues/180](https://github.com/patriksimek/vm2/issues/180)
- [NodeJs - vm](https://nodejs.org/api/vm.html)
- [Sandboxing NodeJS is hard, here is why](https://pwnisher.gitlab.io/nodejs/sandbox/2019/02/21/sandboxing-nodejs-is-hard.html)