import { AppStoreBase } from '../../..';
import TodoStore from './TodoStore';

export default class AppStore extends AppStoreBase {
  initInClient() {
    this.todoStore = new TodoStore(this, 'reevent-todos');
    this.todoStore.observeState((state) => this.setState({ ...state }));        
    return this;
  }
}
