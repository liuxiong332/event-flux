import TodoStore from '../main/store';
import MultiWinStore from 'electron-event-flux/lib/MultiWinStore';
import buildMultiWinAppStore from 'electron-event-flux/lib/MainAppStore';
import query from './parseQuery';

class MyMultiWinStore extends MultiWinStore {
  createBrowserWin(url) {
    return window.open(url, "newwindow", "height=400, width=400, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no")
  }
}

if (!query.isSlave) {
  const appStore = buildMultiWinAppStore({ todo: TodoStore, multiWin: MyMultiWinStore }, { winTodo: TodoStore });
}

require('./index');