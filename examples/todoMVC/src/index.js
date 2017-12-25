import React from 'react';
import ReactDOM from 'react-dom';
import AppStore from './AppStore';
import { Provider } from '../../../';
import TodoApp from './TodoApp';

const appStore = new AppStore().loadInClient();
ReactDOM.render(
  <Provider appStore={appStore}>
    <TodoApp />
  </Provider>,
  document.getElementsByClassName('todoapp')[0]
);