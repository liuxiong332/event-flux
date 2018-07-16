# event-flux


event-flux是一个用于Javascript App的状态管理框架。它是为强交互的大型应用而生。
凭借着event-flux的强大数据流，加上诸如React的声明式组件式视图库，我们能打造可沉浸的，强交互性的，令人印象深刻的阔平台App。

electron-event-flux针对

## 为什么选择event-flux

* 基于Flux的状态管理

  event-flux遵循Flux的单向数据流，保证数据合UI的一致性。

* 基于事件的模块化的状态管理器

  event-flux中每个模块都是一个Store，Store维持着自己的生命周期和管理自己状态。例如用户登录管理，Todo List等都可以做成独立的Store。不同的Store之间通过事件机制来进行通信和交互。Store之间可以形成嵌套形式，从而构成一颗Store树。每个Store维护着自己的State，所有的的State构成一棵状态树。
  
  当UI Dispatch一个动作时，会发送到对应的Store，然后Store会改变自己的状态，通过相应的事件从而改变其他Store的状态。顶层Store会收集改变的State，然后通知UI更新。

* 支持多窗口可交互

  event-flux通过运行在一个窗口中运行主模块，然后其他窗口通过代理发送消息到主窗口模块来支持多窗口可交互的应用。event-flux支持在Electron和浏览器环境下运行。

* 简单强大，开箱即用的状态管理器

  无需像Redux一样需要那么多启动代码，event-flux通过简单高效的API来极大提高了开发效率。event-flux封装了状态管理的方方面面，用户只需要很少的初始化来启动应用，从而专注我们自己的业务。

  Enjoy coding!
 
## 安装

安装稳定版通过:

```
npm install --save electron-event-flux
```

## 多窗口实现原理

electron-event-flux提供了简单方便的解决方案。主进程的Store变成了真正的逻辑处理中心，渲染进程的Store只是一个Proxy。当Renderer进程调用Action时，系统会将请求转发给主进程。开发者可以像之前一样调用Store的Action，但是Action的真正处理单元还是主进程。

当主进程的State树改变时，主进程会将state的diff发送给所有的Renderer进程，然后Renderer进程可以在已有的state上合并这些diff，然后通知所有的UI组件。

electron-event-flux提供了一个简单的中间层来进行透明的转发。我们还是可以像之前写单页面来实现多窗口交互，从而实现了无缝的透明的开发体验。

![交互示意图](https://cloud.githubusercontent.com/assets/307162/20675737/385ce59e-b585-11e6-947e-3867e77c783d.png)

同时我们的多屏方案也适用于浏览器，我们会把第一个窗口当作主窗口，将Electron的主进程逻辑实现在主窗口中。其他的子窗口通过`PostMessage`来与主窗口通信，通过实现跟Electron相似的逻辑来实现我们的透明转发层，进而实现我们的多窗口方案。

## Gist

初始化Main Process：

···js
import TodoStore from '../main/store';
import MultiWinStore from 'electron-event-flux/lib/MultiWinStore';
import buildMultiWinAppStore from 'electron-event-flux/lib/MainAppStore';
import query from './parseQuery';

class MyMultiWinStore extends MultiWinStore {
  createBrowserWin(url) {
    return window.open(url, "newwindow", "height=400, width=400, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no")
  }
}

if (!query.isSlave) {
  const appStore = buildMultiWinAppStore({ todo: TodoStore, multiWin: MyMultiWinStore }, { winTodo: TodoStore });
}

require('./renderer');
```

初始化RendererAppStore，然后开始专注于我们自己的业务吧：

```js
import RendererStore from 'electron-event-flux/lib/RendererAppStore';

const store = new RendererStore((state) => {
  console.log(state);
  ReactDOM.render(<MyView state={state}/>, rootElement);
});
store.init().then(() => {
  ReactDOM.render(<MyView state={store.state}/>, rootElement);
});

```

## License

MIT