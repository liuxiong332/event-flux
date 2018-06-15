import StoreBase from '../../../../event-flux/src/StoreBase';
import MainAppStore from '../../../src/MainAppStore';

class Todo2Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0 };
  }

  addSize() {
    this.setState({ size: this.state.size + 1 });
  }

  decreaseSize() {
    this.setState({ size: this.state.size - 1 });
  }
}
Todo2Store.stateKey = 'todo2';

class TodoStore extends StoreBase {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  init() {
    this.todo2Store = this.buildStore(Todo2Store);
    this.todo2Store.observe((state) => {
      this.setState({ todo2: state });
    });
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
TodoStore.innerStores = { todo2Store: Todo2Store };

const appStore = new MainAppStore([TodoStore]);
appStore.init();
export default appStore;