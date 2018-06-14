import StoreBase from '../../../../event-flux/src/StoreBase';
import MainAppStore from '../../../src/MainAppStore';

class TodoStore extends StoreBase {
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

  setComplete(isComplete) {
    this.setState({ isComplete });
  }
}
TodoStore.stateKey = 'todo';

const appStore = new MainAppStore([TodoStore]);
appStore.init();
export default appStore;