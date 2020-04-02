---
category: JavaScript
date: 2020-04-01
title: 如何实现一个 promise
vssue-title: 11-promise
---
![](https://img.nicksonlvqq.cn/2020-04-01/01.png)

promise 是 ES6 中新增的一种异步解决方案，在日常开发中也经常能看见它的身影，例如原生的 fetch API 就是基于 promise 实现的。那么 promise 有哪些特性，如何实现一个具有 promise/A+ 规范的 promise 呢？

<!-- more -->

## promise 特性
首先我们整理一下 promise 的一些基本特性和 API，完整的 promise/A+ 规范可以参考 [【翻译】Promises/A+规范](https://www.ituring.com.cn/article/66566)
- 状态机
    - 具有 pending、fulfilled、rejected 三个状态
    - 只能由 pending -> fulfilled 和 pending -> rejected 这两种状态变化，且一经改变之后状态不可再变
    - 成功时必须有一个不可改变的值 value，失败时必须有一个不可改变的拒因 reason
- 构造函数
    - Promise 接受一个函数作为参数，函数拥有两个参数 fulfill 和 reject 
    - fulfill 将 promise 状态从 pending 置为 fulfilled，返回操作的结果
    - reject 将 promise 状态从 pending 置为 rejected，返回产生的错误
- then 方法
    - 接受两个参数 onFulfilled 和 onRejected，分别表示 promise 成功和失败的回调
    - 返回值会作为参数传递到下一个 then 方法的参数中
- 异步处理
- 链式调用
- 其他 API
    - catch、finally
    - resolve、reject、race、all 等

## 实现
接下来我们逐步实现一个具有 promise/A+ 规范的 promise

### 基本实现
先定义一个常量，表示 promise 的三个状态
```javascript
const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}
```

然后在 promise 中初始化两个参数 value 和 reason，分别表示状态为 fulfill 和 reject 时的值，接着定义两个函数，函数内部更新状态以及相应的字段值，分别在成功和失败的时候执行，然后将这两个函数传入构造函数的函数参数中，如下：

```javascript
class MyPromise {
  constructor(fn) {
    // 初始化
    this.state = STATE.PENDING
    this.value = null
    this.reason = null

    // 成功
    const fulfill = (value) => {
      // 只有 state 为 pending 时，才可以更改状态
      if (this.state === STATE.PENDING) {
        this.state = STATE.FULFILLED
        this.value = value
      }
    }

    // 失败
    const reject = (reason) => {
      if (this.state === STATE.PENDING) {
        this.state = STATE.REJECTED
        this.reason = reason
      }
    }
    // 执行函数出错时调用 reject
    try {
      fn(fulfill, reject)
    } catch (e) {
      reject(e)
    }
  }
}
```

接下来初步实现一个 then 方法，当当前状态是 fulfulled 时，执行成功回调，当前状态为 rejected 时，执行失败回调：

```javascript
class MyPromise {
  constructor(fn) {
    //...
  }

  then(onFulfilled, onRejected) {
    if (this.state === STATE.FULFILLED) {
      onFulfilled(this.value)
    }
    if (this.state === STATE.REJECTED) {
      onRejected(this.reason)
    }
  }
}

```

这个时候一个简单的 MyPromise 就实现了，但是此时它还只能处理同步任务，对于异步操作却无能为力

### 异步处理
要想处理异步操作，可以利用队列的特性，将回调函数先缓存起来，等到异步操作的结果返回之后，再去执行相应的回调函数。

具体实现来看，在 then 方法中增加判断，若为 pending 状态，将传入的函数写入对应的回调函数队列；在初始化 promise 时利用两个数组分别保存成功和失败的回调函数队列，并在 fulfill 和 reject 回调中增加它们。如下：
```javascript
class MyPromise {
  constructor(fn) {
    // 初始化
    this.state = STATE.PENDING
    this.value = null
    this.reason = null
    // 保存数组
    this.fulfilledCallbacks = []
    this.rejectedCallbacks = []
    // 成功
    const fulfill = (value) => {
      // 只有 state 为 pending 时，才可以更改状态
      if (this.state === STATE.PENDING) {
        this.state = STATE.FULFILLED
        this.value = value
        this.fulfilledCallbacks.forEach(cb => cb())
      }
    }

    // 失败
    const reject = (reason) => {
      if (this.state === STATE.PENDING) {
        this.state = STATE.REJECTED
        this.reason = reason
        this.rejectedCallbacks.forEach(cb => cb())
      }
    }
    // 执行函数出错时调用 reject
    try {
      fn(fulfill, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === STATE.FULFILLED) {
      onFulfilled(this.value)
    }
    if (this.state === STATE.REJECTED) {
      onRejected(this.reason)
    }
    // 当 then 是 pending 时，将这两个状态写入数组中
    if (this.state === STATE.PENDING) {
      this.fulfilledCallbacks.push(() => {
        onFulfilled(this.value)
      })
      this.rejectedCallbacks.push(() => {
        onRejected(this.reason)
      })
    }
  }
}
```

### 链式调用
接下来对 MyPromise 进行进一步改造，使其能够支持链式调用，使用过 jquery 等库应该对于链式调用非常熟悉，它的原理就是调用者返回它本身，在这里的话就是要让 then 方法返回一个 promise 即可，还有一点就是对于返回值的传递：

```javascript
class MyPromise {
  constructor(fn) {
    //...
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((fulfill, reject) => {
      if (this.state === STATE.FULFILLED) {
        // 将返回值传入下一个 fulfill 中
        fulfill(onFulfilled(this.value))
      }
      if (this.state === STATE.REJECTED) {
        // 将返回值传入下一个 reject 中
        reject(onRejected(this.reason))
      }
      // 当 then 是 pending 时，将这两个状态写入数组中
      if (this.state === STATE.PENDING) {
        this.fulfilledCallbacks.push(() => {
          fulfill(onFulfilled(this.value))
        })
        this.rejectedCallbacks.push(() => {
          reject(onRejected(this.reason))
        })
      }
    })
  }
}
```

实现到这一步的 MyPromise 已经可以支持异步操作、链式调用、传递返回值，算是一个简易版的 promise，一般来说面试时需要手写一个 promise 时，到这个程度就足够了，完整实现 promise/A+ 规范在面试这样一个较短的时间内也不太现实。

到这一步的完整代码可以参考 [promise3.js](https://github.com/lvqq/Demos/blob/master/promise/src/promise3.js)

### promise/A+ 规范

promise/A+ 规范中规定，onFulfilled/onRejected 返回一个值 x，对 x 需要作以下处理：
- 如果 x 与 then 方法返回的 promise 相等，抛出一个 `TypeError` 错误
- 如果 x 是一个 `Promise` ，则保持 then 方法返回的 promise 的值与 x 的值一致
- 如果 x 是对象或函数，则将 `x.then` 赋值给 `then` 并调用
    - 如果 `then` 是一个函数，则将 x 作为作用域 `this` 调用，并传递两个参数 `resolvePromise` 和 `rejectPromise`，如果 `resolvePromise` 和 `rejectPromise` 均被调用或者被调用多次，则采用首次调用并忽略剩余调用
    - 如果调用 `then` 方法出错，则以抛出的错误 e 为拒因拒绝 promise
    - 如果 `then` 不是函数，则以 x 为参数执行 promise
- 如果 x 是其他值，则以 x 为参数执行 promise

接下来对上一步实现的 MyPromise 进行进一步优化，使其符合 promise/A+ 规范：

```javascript
class MyPromise {
  constructor(fn) {
    //...
  }

  then(onFulfilled, onRejected) {
    const promise2 = new MyPromise((fulfill, reject) => {
      if (this.state === STATE.FULFILLED) {
        try {
          const x = onFulfilled(this.value)
          generatePromise(promise2, x, fulfill, reject)
        } catch (e) {
          reject(e)
        }
      }
      if (this.state === STATE.REJECTED) {
        try {
          const x = onRejected(this.reason)
          generatePromise(promise2, x, fulfill, reject)
        } catch (e) {
          reject(e)
        }
      }
      // 当 then 是 pending 时，将这两个状态写入数组中
      if (this.state === STATE.PENDING) {
        this.fulfilledCallbacks.push(() => {
          try {
            const x = onFulfilled(this.value)
            generatePromise(promise2, x, fulfill, reject)
          } catch(e) {
            reject(e)
          }
        })
        this.rejectedCallbacks.push(() => {
          try {
            const x = onRejected(this.reason)
            generatePromise(promise2, x, fulfill, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    })
    return promise2
  }
}
```

这里将处理返回值 x 的行为封装成为了一个函数 `generatePromise`，实现如下：
```javascript
const generatePromise = (promise2, x, fulfill, reject) => {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  // 如果 x 是 promise，调用它的 then 方法继续遍历
  if (x instanceof MyPromise) {
    x.then((value) => {
      generatePromise(promise2, value, fulfill, reject)
    }, (e) => {
      reject(e)
    })
  } else if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    // 防止重复调用，成功和失败只能调用一次
    let called;
    // 如果 x 是对象或函数
    try {
      const then = x.then
      if (typeof then === 'function') {
        then.call(x, (y) => {
          if (called) return;
          called = true;
          // 说明 y是 promise，继续遍历
          generatePromise(promise2, y, fulfill, reject)
        }, (r) => {
          if (called) return;
          called = true;
          reject(r)
        })
      } else {
        fulfill(x)
      }
    } catch(e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    fulfill(x)
  }
}
```

promise/A+ 规范中还规定，对于 `promise2 = promise1.then(onFulfilled, onRejected)`
- onFulfilled/onRejected 必须异步调用，不能同步
- 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
- 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的拒因

对于 then 方法做最后的完善，增加 setTimeout 模拟异步调用，增加对于 onFulfilled 和 onRejected 方法的判断：

```javascript
class MyPromise {
  constructor(fn) {
    //...
  }

  then(onFulfilled, onRejected) {
    // 处理 onFulfilled 和 onRejected
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }
    const promise2 = new MyPromise((fulfill, reject) => {
      // setTimeout 宏任务，确保onFulfilled 和 onRejected 异步执行
      if (this.state === STATE.FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            generatePromise(promise2, x, fulfill, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === STATE.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            generatePromise(promise2, x, fulfill, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      // 当 then 是 pending 时，将这两个状态写入数组中
      if (this.state === STATE.PENDING) {
        this.fulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value)
              generatePromise(promise2, x, fulfill, reject)
            } catch(e) {
              reject(e)
            }
          }, 0)
        })
        this.rejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason)
              generatePromise(promise2, x, fulfill, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return promise2
  }
}
```

实现 promise/A+ 规范的 promise 完整代码可以参考 [promise4.js](https://github.com/lvqq/Demos/blob/master/promise/src/promise4.js)


如何知道你实现的 promise 是否遵循 promise/A+ 规范呢？可以利用 [promises-aplus-tests](https://github.com/promises-aplus/promises-tests) 这样一个 npm 包来进行相应测试

### 其他 API
这里对其他常用的 promise API 进行了实现

#### catch、finally
```javascript
class MyPromise {
  constructor(fn) {
    //...
  }
  then(onFulfilled, onRejected) {
    //...
  }
  catch(onRejected) {
    return this.then(null, onRejected)
  }
  finally(callback) {
    return this.then(callback, callback)
  }
}
```

#### Promise.resolve
返回一个 resolved 状态的 Promise 对象

```javascript
MyPromise.resolve = (value) => {
  // 传入 promise 类型直接返回
  if (value instanceof MyPromise) return value
  // 传入 thenable 对象时，立即执行 then 方法
  if (value !== null && typeof value === 'object') {
    const then = value.then
    if (then && typeof then === 'function') return new MyPromise(value.then)
  }
  return new MyPromise((resolve) => {
    resolve(value)
  })
}
```

#### Promise.reject
返回一个 rejected 状态的 Promise 对象

```javascript
MyPromise.reject = (reason) => {
  // 传入 promise 类型直接返回
  if (reason instanceof MyPromise) return reason
  return new MyPromise((resolve, reject) => {
    reject(reason)
  })
}
```

#### Promise.race
返回一个 promise，一旦迭代器中的某个 promise 状态改变，返回的 promise 状态随之改变
```javascript
MyPromise.race = (promises) => {
  return new MyPromise((resolve, reject) => {
    // promises 可以不是数组，但必须存在 Iterator 接口，因此采用 for...of 遍历
    for(let promise of promises) {
      // 如果当前值不是 Promise，通过 resolve 方法转为 promise
      if (promise instanceof MyPromise) {
        promise.then(resolve, reject)
      } else {
        MyPromise.resolve(promise).then(resolve, reject)
      }
    }
  })
}
```

#### Promise.all
返回一个 promise，只有迭代器中的所有的 promise 均变为 fulfilled，返回的 promise 才变为 fulfilled，迭代器中出现一个 rejected，返回的 promise 变为 rejected

```javascript
MyPromise.all = (promises) => {
  return new MyPromise((resolve, reject) => {
    const arr = []
    // 已返回数
    let count = 0
    // 当前索引
    let index = 0
    // promises 可以不是数组，但必须存在 Iterator 接口，因此采用 for...of 遍历
    for(let promise of promises) {
      // 如果当前值不是 Promise，通过 resolve 方法转为 promise
      if (!(promise instanceof MyPromise)) {
        promise = MyPromise.resolve(promise)
      }
      // 使用闭包保证异步返回数组顺序
      ((i) => {
        promise.then((value) => {
          arr[i] = value
          count += 1
          if (count === promises.length || count === promises.size) {
            resolve(arr)
          }
        }, reject)
      })(index)
      // index 递增
      index += 1
    }
  })
}
```

#### Promise.allSettled
只有等到迭代器中所有的 promise 都返回，才会返回一个 fulfilled 状态的 promise，并且返回的 promise 状态总是 fulfilled，不会返回 rejected 状态
```javascript
MyPromise.allSettled = (promises) => {
  return new MyPromise((resolve, reject) => {
    const arr = []
    // 已返回数
    let count = 0
    // 当前索引
    let index = 0
    // promises 可以不是数组，但必须存在 Iterator 接口，因此采用 for...of 遍历
    for(let promise of promises) {
      // 如果当前值不是 Promise，通过 resolve 方法转为 promise
      if (!(promise instanceof MyPromise)) {
        promise = MyPromise.resolve(promise)
      }
      // 使用闭包保证异步返回数组顺序
      ((i) => {
        promise.then((value) => {
          arr[i] = value
          count += 1
          if (count === promises.length || count === promises.size) {
            resolve(arr)
          }
        }, (err) => {
          arr[i] = err
          count += 1
          if (count === promises.length || count === promises.size) {
            resolve(arr)
          }
        })
      })(index)
      // index 递增
      index += 1
    }
  })
}
```

本文如有错误，欢迎批评指正~

**参考**
- [MDN-Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [ECMAScript 6 入门-Promise 对象](https://es6.ruanyifeng.com/#docs/promise)
- [【翻译】Promises/A+规范](https://www.ituring.com.cn/article/66566)
- 完整的示例和测试代码：[github/lvqq/promise](https://github.com/lvqq/Demos/tree/master/promise)


