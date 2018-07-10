import StoreBase from 'event-flux/lib/StoreBase';
import { declareStore, declareStoreMap, declareStoreList } from 'electron-event-flux/lib/StoreDeclarer';

class Todo3Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0 };
  }

  init() {
    console.log('todo3Store this.parent:', this.parentStore);
  }

  addSize() {
    let newSize = this.state.size + 1;
    this.setState({ size: newSize });
    return newSize;
  }

  decreaseSize() {
    let newSize = this.state.size - 1;
    this.setState({ size: newSize });
    return newSize;
  }
}

class Todo2Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0, todo3List: [], todo3Map: {} };
  }

  init() {
    console.log('todo2Store this.parent:', this.parentStore);
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

  init() {
    console.log('todoStore this.parent:', this.parentStore);
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