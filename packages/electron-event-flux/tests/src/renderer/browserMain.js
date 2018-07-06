import TodoStore from '../main/store';
import MultiWinStore from '../../../src/MultiWinStore';
import buildMultiWinAppStore from '../../../src/MainAppStore';

const appStore = buildMultiWinAppStore({ todo: TodoStore, multiWin: MultiWinStore }, { winTodo: TodoStore });

require('./index');