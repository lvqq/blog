---
category: JavaScript
tags:
  - react
  - 组件
  - 翻译
date: 2019-03-28
title: '[译]React函数组件和类有什么不同？'
vssue-title: 09-ReactFuncClassDiff
---

![](https://img.nicksonlvqq.cn/2019-03-28/00.png)

React函数组件和类之间有什么不同？

有一段时间，规范的答案是classes可以访问更多功能（如状态）。有了[Hooks](https://reactjs.org/docs/hooks-intro.html)，这个答案就不再那么正确了

<!-- more -->

可能你听过它们其中某个表现更好的说法。哪一个？许多对它们进行比较的基准都[存在缺陷](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f?source=your_stories_page---------------------------)，因此我会非常小心地在这二者中[得出结论](https://github.com/ryardley/hooks-perf-issues/pull/2)。性能主要取决于代码做了什么而不是你选择的是function还是class。在我们的观察中，虽然优化策略有点[不同](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render)，但性能差异可以忽略不计。

在任何情况下，除非你有其他原因，并且不介意成为一个早期使用者，否则我们[不建议](https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both)重写你现有组件。Hooks依然是新的，（就像2014年的React一样），并且一些“最佳实践”尚未进入教程。

所以这带给我们怎样的思考呢？React的functions和classes之间是否有任何根本区别？当然有，**在这篇文章中，我将看看它们之间的最大区别。** 自2015年[推出](https://reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components)函数组件以来，它一直存在，但它经常被忽视：

### 函数组件捕获已渲染的值

让我们来揭开它神秘的面纱。

**注意：这篇文章并不是对classes或者functions值的判断，我只是描述了这两种编程方式在React中的不同，关于如何广泛使用functions的这类问题，可以参考**[**Hooks FAQ**](https://reactjs.org/docs/hooks-faq.html#adoption-strategy)

看看下面这个组件：

```javascript
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };
  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };
  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

组件中使用 `setTimeout` 来模拟发起一个请求，然后提示一些消息。举个例子，如果`props.user` 是 `'Dan'`，它将在3秒后显示 `'Followed Dan'`，很简单。

(注意在这个例子中我使用箭头函数还是函数声明并不重要， `function handleClick()` 都以相同的方式执行。)

我们怎样把它改写成一个class，一种写法可能像这样：

```javascript
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };
  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

通常认为这两种写法是等效的，人们不会注意到它们的区别，常常在这两种模式之间自由地切换。

![](https://img.nicksonlvqq.cn/2019-03-28/01.gif)

**然而，这两个代码片段略有不同。** 仔细看看它们，你看到差异了吗？对于我个人而言，花了一段时间才看到这一点。

**前文有剧透，因此如果你想自己弄清楚，这是一个[**demo**](https://codesandbox.io/s/pjqnl16lm7)**。本文的其他部分解释了它们之间的差异及其重要性。

在我们继续之前，我想强调一点就是我所描述的差异和React Hooks本身无关，所举的例子甚至没有使用Hooks！

这就是React中functions和classes的区别，如果你想在React app中频繁地使用functions，那么你应该需要了解它。

**我们将通过一个在React 应用中很常见的bug来说明这一差异。**

使用当前属性下拉选择器和上面的两个`ProfilePage`打开此[**示例沙箱**](https://codesandbox.io/s/pjqnl16lm7)——每个都会渲染一个button。

使用两个按钮尝试以下操作序列：

1. **单击**其中一个“follow”按钮。
2. 在3秒之前**更改**所选的属性。
3. **阅读**alert的提示。

你会注意到一个特殊的区别：

- 使用上述`ProfilePage` **function**，单击Follow on Dan的个人资料，然后更改到Sophie's仍然会alert`'Followed Dan'`。
- 通过上面的ProfilePage **class**，它会提醒'Followed Sophie'：

![](https://img.nicksonlvqq.cn/2019-03-28/02.gif)

在此示例中，第一个操作是正确的操作。**如果我follow一个人然后切换到另一个人的个人资料，我的组件不应该对我follow的人感到困惑。** 这个class实现显然是错误的。

_（你应该总是follow Sophie）_

那么为什么我们的class示例会以这种方式运行？

让我们仔细看看class中的`showMessage`方法：

```javascript
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
}
```

这个class方法从`this.props.user`读取值。Props在React中是不可变的，因此它们永远不会改变。**但是，**`this` **可变，并且一直是可变的。**

的确，这就是`this`在class中的存在的意义。React本身会随着时间的推移而变化，因而你可以阅读`render`以及生命周期方法中的新版本。

因此，如果我们的组件在请求处于运行状态时重新render，`this.props`则会发生变化。该`showMessage`方法从“较新的”`props`中读取`user`属性。

这体现了一个关于用户界面接口的有趣现象。如果我们说UI在概念上是当前应用程序状态的一个函数，**则事件处理程序是渲染结果的一部分 —— 就像视觉输出一样**。我们的事件处理程序“属于”具有特定props和state的特定渲染。

但是，发起一个在回调中读取`this.props`的timeout会中断该联系。我们的`showMessage`回调不会与任何特定渲染“绑定”，因此它“失去”正确的props。读取`this`的值会切断这种联系。

**假设function组件不存在。** 我们如何解决这个问题？

我们想以某种方式“修复” `render`与正确的`props`和读取它们的`showMessage`回调之间的联系。一路上props迷路了。

一种方法是`this.props`在事件期间提前读取，然后将它们显式传递到timeout中：

```javascript
class ProfilePage extends React.Component {
  showMessage = (user) => {
    alert('Followed ' + user);
  };
  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };
  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

这[有效](https://codesandbox.io/s/3q737pw8lq)。但是，这种方法会使代码随着时间的推移变得更加冗长和容易出错。如果我们需要不止一个prop怎么办？如果我们还需要使用state怎么办？**如果**`showMessage`**调用另一个方法，并且该方法读取**`this.props.something`**或者**`this.state.something`，**我们将再次遇到完全相同的问题。**所以我们必须通过`showMessage`调用的每个方法将`this.props`和`this.state`作为参数传递。

这样做会通常会破坏class中的人体工程学。它也很难记住或强制执行，这就是人们经常解决bugs的原因。

同样，把`alert`内部代码内联到`handleClick`中并不能解决更大的问题。我们希望以允许将其拆分为更多方法的方式来构造代码，同时还要读取与该调用相关的渲染所对应的props和state。**这个问题甚至不是React独有的 —— 你可以在任何将数据放入可变对象的UI库中重现**`this`。

也许，我们可以在constructor中bind方法？

```javascript
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.showMessage = this.showMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  showMessage() {
    alert('Followed ' + this.props.user);
  }
  handleClick() {
    setTimeout(this.showMessage, 3000);
  }
  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

不，这不能解决任何问题。请记住，问题是我们太晚读取`this.props`的值 —— 而不是我们正在使用的语法！**但是，如果我们完全依赖JavaScript闭包，问题就会消失。**

闭包通常应该避免因为[很难](https://wsvincent.com/javascript-closure-settimeout-for-loop/)想象随着时间推移，一个值可能会发生变化。但是在React中，props和state是不可改变的！（或者我强烈建议你这样做），这会消除闭包带来的副作用。

这意味着如果你从特定的render中捕获props或者state，它们总会保持完全相同。

```javascript
class ProfilePage extends React.Component {
  render() {
    /* Capture the props! */
    const props = this.props;
    /* Note: we are *inside render*. */
    /* These aren't class methods. */
    const showMessage = () => {
      alert('Followed ' + props.user);
    };
    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };
    return <button onClick={handleClick}>Follow</button>;
  }
```

**你已经"捕获”了render时的props**：

![](https://img.nicksonlvqq.cn/2019-03-28/03.gif)

这样，它内部的任何代码（包括`showMessage`）都可以保证看到这个特定render的props。React不再“移动我们的奶酪”了。

**然后我们可以在里面添加任意数量的辅助函数，它们都会使用捕获的props和state，解放闭包**！

[上面例子](https://codesandbox.io/s/oqxy9m7om5)是正确的，但看起来很奇怪。如果你在 render 中定义functions而不是使用class方法，那么使用一个class是为了什么呢？

实际上，我们可以通过删除它周围的class “shell”来简化代码：

```javascript
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };
  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };
  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

就像上面一样，`props`仍然被捕获 - React将它们作为参数传递。**与**`this`**不同**，`props`**对象本身永远不会被React改变。**

如果你在函数定义中解构`props`，那就更明显了：

```javascript
function ProfilePage({ user }) {
  const showMessage = () => {
    alert('Followed ' + user);
  };
  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };
  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

当父组件用不同的props渲染`ProfilePage`时，React将再次调用`ProfilePage`函数。但是我们已经点击的事件处理“属于”具有自己`user`值的前一次渲染和读取它的`showMessage`回调。它们都完好无损。

这就是为什么在[本演示](https://codesandbox.io/s/pjqnl16lm7)的功能版本中，单击Follow on Sophie的个人资料，然后将选择更改为Sunil会 alert `'Followed Sophie'`：

现在我们了解React中函数和类之间的巨大差异：

**函数组件捕获已渲染的值** 

**使用Hooks，同样的规则也适用于state。** 看看这个例子：

```javascript
function MessageThread() {
  const [message, setMessage] = useState('');
  const showMessage = () => {
    alert('You said: ' + message);
  };
  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Send</button>
    </>
  )
}

```

（这是一个[demo](https://codesandbox.io/s/93m5mz9w24)。）

虽然这不是一个非常好的消息UI应用，但它说明了同样的观点：如果我发送特定消息，组件不应该对实际发送的消息感到困惑。此函数组件`message`捕获“属于”render的state，该render返回浏览器调用的点击事件。因此，当我点击“发送”时，`message`设置为输入框中的内容。

因此，默认情况下，我们知道React中functions捕获props和state。**但是，如果我们想要读取不属于这个特定渲染的最新props或state，该怎么办？**如果我们想[“从未来读取它们”](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2)怎么办？

在class中，你可以通过读取this.props或this.state因为this它本身是可变的。React改变了它。在function组件中，还存在被所有组件共享的可变值。它被称为“ref”：

```javascript
function MyComponent() {
  const ref = useRef(null);
  // You can read or write `ref.current`.
  // ...
}

```

但是，你必须自己管理它。

ref和实例字段[扮演相同的角色](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)。它是脱离可变命令的途径。你可能熟悉“DOM refs”，但它的概念更为通用。它只是一个盒子，你可以把东西放进去。

即使在视觉上，`this.something`看起来像`something.current`的一面镜子。它们代表了相同的概念。

默认情况下，React不会为函数组件中的最新的props或state创建refs。在许多情况下，你并不需要它们，分配它们将会浪费的你的时间。但是，如果您愿意，可以手动它们跟踪值：

```javascript
function MessageThread() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('');
  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };
  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    latestMessage.current = e.target.value;
  }
}

```

如果我们在`showMessage`中读取`message`的值，我们会在按下发送按钮时看到该消息。但是当我们读取`latestMessage.current`的值，我们会得到最新的值 —— 即使我们在按下发送按钮后继续输入。

你可以比较这[两个](https://codesandbox.io/s/93m5mz9w24) [demo](https://codesandbox.io/s/ox200vw8k9)，看看它们之间的差异。ref是一种“选择退出”保持渲染一致性的方法，在某些情况下很方便。

通常，您应该避免在渲染期间读取或设置引用_，_因为它们是可变的。我们希望保持渲染的可预测性。**但是，如果我们想获得特定prop或state的最新值，那么手动更新ref会让人很反感。**我们可以通过使用effect来实现它的自动化:

```javascript
function MessageThread() {
  const [message, setMessage] = useState('');
  /* Keep track of the latest value. */
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });
  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  }
}

```

（这是一个[demo](https://codesandbox.io/s/yqmnz7xy8x)。）

我们在effect中进行赋值，因此ref值仅在DOM更新后更改。这确保我们的变化不会破坏依赖于可中断渲染的 [Time Slicing and Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) 等功能。

并不是需要经常像这样来使用ref，**捕获props或state通常是更好的默认行为。**但是，在处理 intervals 和 subscriptions等[命令式API](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)时，它会显得很方便。请记住，您可以跟踪_任何这样的_值 —— prop，state 变量，整个prop对象，甚至是function。

此模式也可以方便地进行优化 —— 例如当`useCallback`身份经常更改时。但是，[使用reducer](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)通常是[更好的解决方案](https://github.com/ryardley/hooks-perf-issues/pull/3)。

在这篇文章中，我们研究了classes中常见的细微问题，以及闭包如何帮助我们解决它。但是，您可能已经注意到，当您尝试通过指定依赖关系数组来优化Hook时，你可能会遇到闭包中的bug。这是否意味着闭包是问题的根源所在？我并不这么认为。

正如我们上面所看到的，闭包实际上帮助我们解决了很难注意到的细微问题。同样，这使得编写在[并发模式下](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)正常工作的代码变得更加容易。这是可以的因为组件内部的逻辑捕获了正确的props和渲染的state。

在我到目前为止看到的所有情况中，**由于错误地假设“functions不会改变”或“props总是相同”**，所以会出现 **“闭包”问题**。事实并非如此，并且我希望这篇文章对澄清这一点有所帮助。

Functions捕获他们的props和state —— 所以他们的身份同样重要。这不是bug，而是function组件的一个功能。例如Functions不应该被useEffect或useCallback的“依赖数组”排除在外。（正确的解决方案通常是useReducer或者useRef中解决方案的一种 —— 我们很快会记录如何在它们之间进行选择。）

当我们使用functions编写大部分React代码时，我们需要提高我们关于[优化代码](https://github.com/ryardley/hooks-perf-issues/pull/3)以及[哪些值可以随时间变化](https://github.com/facebook/react/issues/14920)的敏感度。

正如 Fredrik 所说：

**到目前为止我使用hooks体会最深的就是“代码中的任何值都可以随时改变”。** 

Functions也不例外。React学习需要时间的累积，需要从class思维方式进行一些调整。但我希望这篇文章可以帮助你用全新的眼光看待它。

React functions总是捕获它们的值 —— 现在我们知道原因了。

作者：Dan Abramov

来源：[Overreacted](https://overreacted.io/)

原文：[How Are Function Components Different from Classes?](https://overreacted.io/how-are-function-components-different-from-classes/)

