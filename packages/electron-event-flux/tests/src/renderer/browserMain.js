import TodoStore from '../main/store';
import MultiWinStore from 'electron-event-flux/lib/MultiWinStore';
import buildMultiWinAppStore from 'electron-event-flux/lib/MainAppStore';
import query from './parseQuery';

if (!query.isSlave) {
  const appStore = buildMultiWinAppStore({ todo: TodoStore, multiWin: MultiWinStore }, { winTodo: TodoStore });
}

require('./index');