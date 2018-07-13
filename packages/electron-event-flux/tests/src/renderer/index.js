// Initial welcome page. Delete the following line to remove it.

// import React from 'react';
// import ReactDOM from 'react-dom';
import RendererStore from 'electron-event-flux/lib/RendererAppStore';
// import RendererStore from '../../../src/RendererAppStore';
import React from 'react';
import ReactDOM from 'react-dom';
import OneDemoView from './OneDemoView';
import Button from '@material-ui/core/Button';

import TodoCountDemo from './views/TodoCount';
import Todo2CountDemo from './views/Todo2Count';
import Todo3CountDemo from './views/Todo3Count';
import query from './parseQuery';
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

    store.stores.multiWinStore.createWin('/', null, { 
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
    store.stores.multiWinStore.createWin('/demo1', null, this.mergePos(params, pos));
  }
  createDemo2(pos) {
    let { sizes: { width, outerHeight, demo1Height, demo2Height, demo3Height } } = this.props;

    let params = {
      width: width, height: outerHeight - demo1Height - demo3Height, useContentSize: true,
    }
    store.stores.multiWinStore.createWin('/demo2', null, this.mergePos(params, pos));
  }
  createDemo3(pos) {
    let { sizes: { width, outerHeight, demo1Height, demo2Height, demo3Height } } = this.props;

    let params = {
      width: width, height: outerHeight - demo1Height - demo2Height, useContentSize: true,
    };
    store.stores.multiWinStore.createWin('/demo3', null, this.mergePos(params, pos));
  }

  render() {
    return (
      <div>
        <Button onClick={this.createNewWindow}>Create New Window</Button>
        <Button onClick={this.createDemo1}>Create Demo1</Button>
        <Button onClick={this.createDemo2}>Create Demo2</Button>
        <Button onClick={this.createDemo3}>Create Demo3</Button>
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
      switch (item) {
        case 'demo1': this.buttons.createDemo1(pos); break;
        case 'demo2': this.buttons.createDemo2(pos); break;
        case 'demo3': this.buttons.createDemo3(pos); break;
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

const store = new RendererStore((state) => {
  console.log(state);
  ReactDOM.render(<MyView state={state}/>, rootElement);
});
store.init().then(() => {
  ReactDOM.render(<MyView state={store.state}/>, rootElement);
});

window.onload = () => {
  let endDate = new Date();
  console.log('elapse milliseconds ' + (endDate - startDate) + 'ms');
}