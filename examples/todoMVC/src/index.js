import React from 'react';
import ReactDOM from 'react-dom';
import AppStore from './AppStore';
import { Provider } from '../../../';
import TodoApp from './TodoApp';
import TodoStore from './TodoStore';

ReactDOM.render(
  <Provider stores={TodoStore}>
    <TodoApp />
  </Provider>,
  document.getElementsByClassName('todoapp')[0]
);