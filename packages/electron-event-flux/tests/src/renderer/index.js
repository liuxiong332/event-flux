// Initial welcome page. Delete the following line to remove it.

// import React from 'react';
// import ReactDOM from 'react-dom';
import url from 'url';
import RendererStore from '../../../src/RendererAppStore';
import React from 'react';
import ReactDOM from 'react-dom';
import OneDemoView from './OneDemoView';

import TodoCountDemo from './views/TodoCount';

window.rendererId = process.guestInstanceId || JSON.parse(url.parse(window.location.href, true).query.windowParams).id;

const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

const store = new RendererStore(null, (state) => {
  console.log(state);
  ReactDOM.render(<MyView state={state}/>, rootElement);
});
store.init(); 

function MyView({ state }) {
  return (
    <div>
      <OneDemoView {...TodoCountDemo} store={store} state={state}/>
    </div>
  );
}

ReactDOM.render(<MyView state={store.state}/>, rootElement);