// Initial welcome page. Delete the following line to remove it.

// import React from 'react';
// import ReactDOM from 'react-dom';
import url from 'url';
import RendererStore from '../../../src/RendererAppStore';
import React from 'react';
import ReactDOM from 'react-dom';
import OneDemoView from './OneDemoView';
import Button from '@material-ui/core/Button';
const { ipcRenderer, remote } = require('electron');

import TodoCountDemo from './views/TodoCount';
import Todo2CountDemo from './views/Todo2Count';
let startDate = new Date();

window.rendererId = process.guestInstanceId || JSON.parse(url.parse(window.location.href, true).query.windowParams).id;

const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

const store = new RendererStore((state) => {
  console.log(state);
  ReactDOM.render(<MyView state={state}/>, rootElement);
});
store.init(); 

function createNewWindow() {
  let createMainWindow = remote.getGlobal('createMainWindow');
  createMainWindow();
}

function MyView({ state }) {
  return (
    <div>
      <OneDemoView {...TodoCountDemo} store={store} state={state}/>
      <OneDemoView {...Todo2CountDemo} store={store} state={state}/>
      <Button onClick={createNewWindow}>Create New Window</Button>
    </div>
  );
}

ReactDOM.render(<MyView state={store.state}/>, rootElement);

window.onload = () => {
  let endDate = new Date();
  console.log('elapse milliseconds ' + (endDate - startDate) + 'ms');
}