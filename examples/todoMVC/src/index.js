import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, withState, StoreBase } from '../../..';
import TodoApp from './TodoApp';
import TodoStore from './TodoStore';

ReactDOM.render(
  <Provider stores={[TodoStore]}>
    <TodoApp />
  </Provider>,
  document.getElementsByClassName('todoapp')[0]
);