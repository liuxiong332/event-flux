import TodoStore from '../main/store';
import MultiWinStore from 'electron-event-flux/lib/MultiWinStore';
import buildMultiWinAppStore from 'electron-event-flux/lib/MainAppStore';

const appStore = buildMultiWinAppStore({ todo: TodoStore, multiWin: MultiWinStore }, { winTodo: TodoStore });

require('./index');