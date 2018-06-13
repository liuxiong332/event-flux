// Initial welcome page. Delete the following line to remove it.
'use strict';
const styles = document.createElement('style');
styles.innerText = `@import url(https://unpkg.com/spectre.css/dist/spectre.min.css);.empty{display:flex;flex-direction:column;justify-content:center;height:100vh;position:relative}.footer{bottom:0;font-size:13px;left:50%;opacity:.9;position:absolute;transform:translateX(-50%);width:100%}`;
document.head.appendChild(styles);

// import React from 'react';
// import ReactDOM from 'react-dom';
import url from 'url';
import RendererStore from '../../../src/RendererAppStore';

window.rendererId = process.guestInstanceId || JSON.parse(url.parse(window.location.href, true).query.windowParams).id;

const button = document.createElement('button');
button.textContent = 'INCREMENT';

const store = new RendererStore(null, (state) => {
  button.textContent = `INCREMENT ${state.todo.count}`
});
store.init();

button.onclick = () => store.stores.todoStore.addTodo(2);
document.body.appendChild(button);


console.log('window.rendererId:', window.rendererId, process.guestInstanceId)
/* <div className="empty">
        <p className="empty-title h5">Welcome to your new project!</p>
        <p className="empty-subtitle">Get started now and take advantage of the great documentation at hand.</p>
        <div className="empty-action">
          <button className="btn btn-primary">Documentation</button> 
          <button className="btn btn-primary">Electron</button>
          <br/>
          <ul className="breadcrumb">
            <li className="breadcrumb-item">Electron demo</li>
            <li className="breadcrumb-item">electron </li>
          </ul>
        </div>
        <p className="footer">
          This intitial landing page can be easily removed from <code>src/renderer/index.js</code>.
        </p>
      </div> */
// ReactDOM.render(React.createElement('div'), document.body);