import StoreBase from '../../event-flux/src/StoreBase';
import MainAppStore from '../src/MainAppStore';

export default class TodoStore extends StoreBase {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  addTodo(num) {
    this.setState({ count: this.state.count + num });
  }

  decreaseTodo(num) {
    this.setState({ count: this.state.count - num });
  }
}

export default new MainAppStore([Store]);