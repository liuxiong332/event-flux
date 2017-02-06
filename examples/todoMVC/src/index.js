import React from 'react';
import ReactDOM from 'react-dom';
import AppStore from './AppStore';
import { ReeventProvider } from '../../../';
import TodoApp from './TodoApp';

const reeventApp = new AppStore().loadInClient();

ReactDOM.render(
  <ReeventProvider reeventApp={reeventApp}>
    <TodoApp />
  </ReeventProvider>,
  document.getElementsByClassName('todoapp')[0]
);
