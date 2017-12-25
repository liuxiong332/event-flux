import { ReeventApp } from '../../..';
import TodoStore from './TodoStore';

export default class AppStore extends ReeventApp {
  initInClient() {
    this.todoStore = new TodoStore('reevent-todos');
    this.todoStore.observeState((state) => this.setState({ ...state }));        
    return this;
  }
}
