import StoreBase from 'event-flux/lib/StoreBase';
import { declareStore, declareStoreMap, declareStoreList } from '../../../src/StoreDeclarer';

class Todo3Store extends StoreBase {
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

class Todo2Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0, todo3List: [], todo3Map: {} };
  }

  addSize() {
    this.setState({ size: this.state.size + 1 });
  }

  decreaseSize() {
    this.setState({ size: this.state.size - 1 });
  }
}
Todo2Store.innerStores = {
  todo3: declareStore(Todo3Store),
  todo3List: declareStoreList(Todo3Store, { storeKey: 'todo3StoreList', size: 1 }),
  todo3Map: declareStoreMap(Todo3Store, { storeKey: 'todo3StoreMap', keys: ['myKey'] }),
};

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
    console.log('set complete:', isComplete)
    this.setState({ isComplete });
  }
}
TodoStore.innerStores = { todo2: declareStore(Todo2Store) };

export default TodoStore;