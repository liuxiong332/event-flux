import ReeventApp from '../../../lib/ReeventApp';
import TodoStore from './TodoStore';

export default class AppStore extends ReeventApp {
  loadInClient() {
    this.todoStore = new TodoStore('reevent-todos');
    return this;
  }
}
