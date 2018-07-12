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

function NewButton({ sizes: { width, outerHeight, demo1Height, demo2Height, demo3Height } }) {
  const createNewWindow = () => {
    console.log('create new window:', width, outerHeight);
    store.stores.multiWinStore.createWin('/', null, { 
      width, height: outerHeight, useContentSize: true,
    });
  }
  const createDemo1 = () => {
    console.log('create demo1:', width, outerHeight - demo2Height - demo3Height);
    store.stores.multiWinStore.createWin('/demo1', null, { 
      width, height: outerHeight - demo2Height - demo3Height, useContentSize: true,
    });
  }
  const createDemo2 = () => {
    store.stores.multiWinStore.createWin('/demo2', null, {
      width: width, height: outerHeight - demo1Height - demo3Height, useContentSize: true,
    });
  }
  const createDemo3 = () => {
    store.stores.multiWinStore.createWin('/demo3', null, {
      width: width, height: outerHeight - demo1Height - demo2Height, useContentSize: true,
    });
  }
  return (
    <div>
      <Button onClick={createNewWindow}>Create New Window</Button>
      <Button onClick={createDemo1}>Create Demo1</Button>
      <Button onClick={createDemo2}>Create Demo2</Button>
      <Button onClick={createDemo3}>Create Demo3</Button>
    </div>
  );
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
            <OneDemoView ref={this.divGetter('demo1Height')} {...TodoCountDemo} store={store} state={state}/>
            <OneDemoView ref={this.divGetter('demo2Height')} {...Todo2CountDemo} store={store} state={state}/>
            <OneDemoView ref={this.divGetter('demo3Height')} {...Todo3CountDemo} store={store} state={state}/>
            <NewButton sizes={sizes}/>
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