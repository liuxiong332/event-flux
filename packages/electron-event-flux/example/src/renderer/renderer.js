// Initial welcome page. Delete the following line to remove it.

// import React from 'react';
// import ReactDOM from 'react-dom';
// import RendererStore from 'electron-event-flux/lib/RendererAppStore';
import RendererStore from '../../../src/RendererAppStore';
import React from 'react';
import ReactDOM from 'react-dom';
import OneDemoView from './OneDemoView';
import Button from '@material-ui/core/Button';

import TodoCountDemo from './views/TodoCount';
import Todo2CountDemo from './views/Todo2Count';
import Todo3CountDemo from './views/Todo3Count';
import query from './parseQuery';
import { Emitter } from 'event-kit';

let startDate = new Date();

window.clientId = query.clientId;

const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

const styleElement = document.createElement('style');
styleElement.innerHTML = 'body { margin: 0; }';
document.head.appendChild(styleElement);

function getAction() {
  if (window.process) return query.url || '/';
  return window.location.pathname;
}

window.action = getAction();

class NewButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.createNewWindow = this.createNewWindow.bind(this);
    this.createDemo1 = this.createDemo1.bind(this);
    this.createDemo2 = this.createDemo2.bind(this);
    this.createDemo3 = this.createDemo3.bind(this);
  }

  createNewWindow() {
    let { sizes: { width, outerHeight, demo1Height, demo2Height, demo3Height } } = this.props;

    store.stores.multiWinStore.createWin('/', window.clientId, { 
      width, height: outerHeight, useContentSize: true,
    });
  }
  
  mergePos(size, pos) {
    if (!pos) {
      pos = { midX: window.screenX + window.outerWidth / 2, midY: window.screenY + window.outerHeight / 2 };
    }
    return { ...size, x: pos.midX - size.width / 2, y: pos.midY - size.height / 2 };
  }

  createDemo1(pos) {
    let { sizes: { width, outerHeight, demo1Height, demo2Height, demo3Height } } = this.props;

    let params = { 
      width, height: outerHeight - demo2Height - demo3Height, useContentSize: true,
    };
    store.stores.multiWinStore.createWin('/demo1', window.clientId, this.mergePos(params, pos));
  }
  createDemo2(pos) {
    let { sizes: { width, outerHeight, demo1Height, demo2Height, demo3Height } } = this.props;

    let params = {
      width: width, height: outerHeight - demo1Height - demo3Height, useContentSize: true,
    }
    store.stores.multiWinStore.createWin('/demo2', window.clientId, this.mergePos(params, pos));
  }
  createDemo3(pos) {
    let { sizes: { width, outerHeight, demo1Height, demo2Height, demo3Height } } = this.props;

    let params = {
      width: width, height: outerHeight - demo1Height - demo2Height, useContentSize: true,
    };
    store.stores.multiWinStore.createWin('/demo3', window.clientId, this.mergePos(params, pos));
  }

  buttonGet(name) {
    return (ref) => this[name] = ref;
  }

  click(name) {
    ReactDOM.findDOMNode(this[name]).click();
  }

  render() {
    return (
      <div>
        <Button onClick={this.createNewWindow}>Create New Window</Button>
        <Button ref={this.buttonGet('demo1')} onClick={this.createDemo1}>Create Demo1</Button>
        <Button ref={this.buttonGet('demo2')} onClick={this.createDemo2}>Create Demo2</Button>
        <Button ref={this.buttonGet('demo3')} onClick={this.createDemo3}>Create Demo3</Button>
      </div>
    );
  }
}

class MyView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  divGetter(prop) {
    return (ref) => {
      if (!ref) return;
      ref = ReactDOM.findDOMNode(ref);
      console.log(prop, ' size:', ref.clientWidth, ref.clientHeight);
      this.setState({
        width: ref.clientWidth,
        [prop]: ref.clientHeight,
      });
    };
  }
 
  handleDragStart(item) {
    return (event) => {
      event.dataTransfer.setData("text/html", item);
    };
  }

  handleDragEnd(item) {
    return (event) => {
      if (!this.buttons) return;
      let pos = { midX: event.screenX, midY: event.screenY };
      if (window.process) {
        switch (item) {
          case 'demo1': this.buttons.createDemo1(pos); break;
          case 'demo2': this.buttons.createDemo2(pos); break;
          case 'demo3': this.buttons.createDemo3(pos); break;
        }
      } else {
        this.buttons.click(item);
      }
    };
  }

  render() {
    let { state } = this.props;
    let sizes = { 
      width: this.state.width, demo1Height: this.state.demo1Height, demo2Height: this.state.demo2Height, 
      demo3Height: this.state.demo3Height, outerHeight: this.state.outerHeight,
    };
    switch (window.action) {
      case '/':
        return (
          <div ref={this.divGetter('outerHeight')}>
            <OneDemoView 
              ref={this.divGetter('demo1Height')} {...TodoCountDemo} store={store} state={state}
              onDragStart={this.handleDragStart('demo1')} 
              onDragEnd={this.handleDragEnd('demo1')} 
              draggable={true}
            />
            <OneDemoView 
              ref={this.divGetter('demo2Height')} {...Todo2CountDemo} store={store} state={state}
              onDragStart={this.handleDragStart('demo2')} 
              onDragEnd={this.handleDragEnd('demo2')}
              draggable={true}
            />
            <OneDemoView 
              ref={this.divGetter('demo3Height')} {...Todo3CountDemo} store={store} state={state}
              onDragStart={this.handleDragStart('demo3')} 
              onDragEnd={this.handleDragEnd('demo3')}
              draggable={true}
            />
            <NewButton ref={(ref) => this.buttons = ref} sizes={sizes}/>
          </div>
        );
      case '/demo1': 
        return (
          <div>
            <OneDemoView {...TodoCountDemo} store={store} state={state}/>
          </div>
        );
      case '/demo2':
        return (
          <div>
            <OneDemoView {...Todo2CountDemo} store={store} state={state}/>
          </div>
        );
      case '/demo3':
        return (
          <div>
            <OneDemoView {...Todo3CountDemo} store={store} state={state}/>
          </div>
        );
    }
  }
}

class ChildWindowProxy {
  constructor(store, createPromise) {
    this.emitter = new Emitter();
    this.store = store;
    this.messages = [];
    createPromise.then(childId => {
      this.childId = childId;
      this.messages.forEach(({clientId, message}) => {
        this.send(clientId, message);
      });
    });
    this.store.onDidWinMessage(this.handleWinMessage.bind(this));
  }

  send(message) {
    if (!this.childId) {
      this.messages.push(message);
    } else {
      this.store.sendWindowMessage(this.childId, message);
    }
  }

  handleWinMessage({senderId, message}) {
    if (senderId === this.childId) {
      this.emitter.emit('message', message);
    }
  }

  onDidReceiveMsg(callback) {
    return this.emitter.on('message', callback);
  }
}

class ParentWindowProxy {
  constructor(store, parentId) {
    this.store = store;
    this.parentId = parentId;
    this.emitter = new Emitter();

    this.store.onDidWinMessage(this.handleWinMessage.bind(this));
  }

  send(message) {
    this.store.sendWindowMessage(this.parentId, message);
  }

  handleWinMessage({senderId, message}) {
    if (senderId === this.parentId) {
      this.emitter.emit('message', message);
    }
  }

  onDidReceiveMsg(callback) {
    return this.emitter.on('message', callback);
  }
}

function rendererInit(renderHandler, actionHandler) {
  window.clientId = query.clientId;
  window.parentId = query.parentId;

  function getAction() {
    if (window.process) return query.url || '/';
    return window.location.pathname;
  }
  window.action = getAction();

  const store = new RendererStore(renderHandler);

  const genProxy = (multiWinStore) => {
    return new Proxy(multiWinStore, {
      get: function(target, propName) {
        if (!propName) return;
        if (propName === 'createWin') {
          return function(url, params) {
            return new ChildWindowProxy(target[propName](url, window.clientId, params));
          }
        } else {
          return target[propName];
        }
      }
    })
  }

  store.init().then((state) => {
    store.stores.multiWinStore = genProxy(store.stores.multiWinStore);
    if (window.parentId) {
      window.parentWin = new ParentWindowProxy(store, window.parentId);
    }
    store.onDidMessage((message) => {
      console.log('message', message);
      let {action, url, parentId} = message;
      if (action === 'change-props') {
        window.action = url;
        window.parentId = parentId;
        if (!window.parentWin) {
          window.parentWin = new ParentWindowProxy(store, window.parentId);
        } else {
          window.parentWin.parentId = parentId;
        }
        actionHandler(window.action);
      }
    });
    actionHandler(window.action);
    renderHandler(state);
  });
  
  return store;
}

const store = rendererInit((state) => {
  ReactDOM.render(<MyView state={state}/>, rootElement);
}, (action) => {
  ReactDOM.render(<MyView state={window.store.state}/>, rootElement);
});

// const store = new RendererStore((state) => {
//   console.log(state);
//   ReactDOM.render(<MyView state={state}/>, rootElement);
// });

// const onGetMessage = (message) => {
//   console.log('get message:', message);
// };

// store.init(onGetMessage).then(() => {
//   ReactDOM.render(<MyView state={store.state}/>, rootElement);
// });

window.store = store;

window.onload = () => {
  let endDate = new Date();
  console.log('load elapse milliseconds ' + (endDate - startDate) + 'ms');
}