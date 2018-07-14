# event-flux


event-flux是一个用于Javascript App的状态管理框架。它是为强交互的大型应用而生。
凭借着event-flux的强大数据流，加上诸如React的声明式组件式视图库，我们能打造可沉浸的，强交互性的，令人印象深刻的阔平台App。

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

## License

MIT