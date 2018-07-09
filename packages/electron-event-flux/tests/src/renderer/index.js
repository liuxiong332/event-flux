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
let startDate = new Date();

function getQuery() {
  let query = {};
  location.search.slice(1).split('&').forEach(item => {
    let [key, val] = item.split('=');
    query[key] = val;
  });
  return query;
}

window.clientId = getQuery().clientId;

const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

function createNewWindow() {
  // let createMainWindow = remote.getGlobal('createMainWindow');
  store.stores.multiWinStore.createWin();
}

function MyView({ state }) {
  return (
    <div>
      <OneDemoView {...TodoCountDemo} store={store} state={state}/>
      <OneDemoView {...Todo2CountDemo} store={store} state={state}/>
      <OneDemoView {...Todo3CountDemo} store={store} state={state}/>
      <Button onClick={createNewWindow}>Create New Window</Button>
    </div>
  );
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